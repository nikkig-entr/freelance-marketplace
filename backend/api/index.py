from mangum import Mangum
from app.main import app

handler = Mangum(app, lifespan="auto", api_gateway_base_path="/")