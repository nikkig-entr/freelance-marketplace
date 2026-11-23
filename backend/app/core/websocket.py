import json
from typing import Any
from uuid import uuid4

from fastapi import WebSocket, WebSocketDisconnect
from redis.asyncio import Redis

from app.core.redis import get_redis, publish, subscribe


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[int, dict[str, WebSocket]] = {}
        self.user_rooms: dict[int, set[str]] = {}
        self._pubsub: Redis | None = None
        self._listener_task = None

    async def connect(self, websocket: WebSocket, user_id: int, connection_id: str | None = None) -> str:
        await websocket.accept()
        conn_id = connection_id or str(uuid4())
        if user_id not in self.active_connections:
            self.active_connections[user_id] = {}
        self.active_connections[user_id][conn_id] = websocket
        return conn_id

    def disconnect(self, user_id: int, connection_id: str) -> None:
        if user_id in self.active_connections:
            self.active_connections[user_id].pop(connection_id, None)
            if not self.active_connections[user_id]:
                self.active_connections.pop(user_id, None)
                self.user_rooms.pop(user_id, None)

    async def send_personal_message(self, user_id: int, message: dict[str, Any]) -> bool:
        if user_id not in self.active_connections:
            return False
        disconnected = []
        for conn_id, ws in self.active_connections[user_id].items():
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(conn_id)
        for conn_id in disconnected:
            self.disconnect(user_id, conn_id)
        return True

    async def broadcast_to_room(self, room: str, message: dict[str, Any], exclude_user: int | None = None) -> None:
        message["room"] = room
        await publish(f"ws:room:{room}", message)

    async def join_room(self, user_id: int, room: str) -> None:
        if user_id not in self.user_rooms:
            self.user_rooms[user_id] = set()
        self.user_rooms[user_id].add(room)

    async def leave_room(self, user_id: int, room: str) -> None:
        if user_id in self.user_rooms:
            self.user_rooms[user_id].discard(room)
            if not self.user_rooms[user_id]:
                self.user_rooms.pop(user_id, None)

    async def start_listener(self) -> None:
        if self._listener_task is None:
            import asyncio
            self._pubsub = await subscribe("ws:room:")
            self._listener_task = asyncio.create_task(self._listen())

    async def _listen(self) -> None:
        if not self._pubsub:
            return
        try:
            async for message in self._pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    room = data.pop("room", None)
                    if room:
                        await self._deliver_to_room(room, data)
        except Exception:
            pass

    async def _deliver_to_room(self, room: str, message: dict[str, Any]) -> None:
        for user_id, rooms in self.user_rooms.items():
            if room in rooms:
                await self.send_personal_message(user_id, message)

    async def shutdown(self) -> None:
        if self._listener_task:
            self._listener_task.cancel()
            try:
                await self._listener_task
            except Exception:
                pass
        if self._pubsub:
            await self._pubsub.unsubscribe("ws:room:")
            await self._pubsub.close()


manager = ConnectionManager()


async def get_ws_manager() -> ConnectionManager:
    return manager