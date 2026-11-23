import { createRouter, createRootRoute, createRoute, Outlet, Link } from '@tanstack/react-router';
import { useAuth } from './contexts/AuthContext';
import { Navigate } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage';
import { CreateProjectPage } from './pages/projects/CreateProjectPage';
import { EditProjectPage } from './pages/projects/EditProjectPage';
import { MyProjectsPage } from './pages/projects/MyProjectsPage';
import { MyBidsPage } from './pages/bids/MyBidsPage';
import { ChatPage } from './pages/chat/ChatPage';
import { BalancePage } from './pages/balance/BalancePage';
import { WithdrawalPage } from './pages/balance/WithdrawalPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { BillingPage } from './pages/billing/BillingPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminWithdrawalsPage } from './pages/admin/AdminWithdrawalsPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const rootRoute = createRootRoute({
  component: () => <Layout />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

// Auth routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: ({ context }) => {
    const { isAuthenticated } = context.auth;
    if (isAuthenticated) {
      throw new Navigate({ to: '/' });
    }
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
  beforeLoad: ({ context }) => {
    const { isAuthenticated } = context.auth;
    if (isAuthenticated) {
      throw new Navigate({ to: '/' });
    }
  },
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordPage,
});

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  component: VerifyEmailPage,
});

// Protected routes
const requireAuth = ({ context }: { context: { auth: ReturnType<typeof useAuth> } }) => {
  const { isAuthenticated, isLoading } = context.auth;
  if (isLoading) return;
  if (!isAuthenticated) {
    throw new Navigate({ to: '/login', search: { redirect: window.location.pathname } });
  }
};

const requireRole = (roles: string[]) => {
  return ({ context }: { context: { auth: ReturnType<typeof useAuth> } }) => {
    const { isAuthenticated, isLoading, hasRole } = context.auth;
    if (isLoading) return;
    if (!isAuthenticated || !hasRole(roles)) {
      throw new Navigate({ to: '/' });
    }
  };
};

// Projects routes
const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
  beforeLoad: requireAuth,
});

const createProjectRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: '/create',
  component: CreateProjectPage,
  beforeLoad: ({ context }) => {
    requireAuth({ context });
    const { hasRole } = context.auth;
    if (!hasRole(['client', 'admin'])) {
      throw new Navigate({ to: '/projects' });
    }
  },
});

const myProjectsRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: '/my',
  component: MyProjectsPage,
  beforeLoad: requireAuth,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: '/$projectId',
  component: ProjectDetailPage,
  beforeLoad: requireAuth,
  validateSearch: (search) => ({
    tab: search.tab || 'details',
  }),
});

const editProjectRoute = createRoute({
  getParentRoute: () => projectDetailRoute,
  path: '/edit',
  component: EditProjectPage,
  beforeLoad: requireAuth,
});

// Bids routes
const myBidsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my/bids',
  component: MyBidsPage,
  beforeLoad: requireAuth,
});

// Chat routes
const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat/$projectId',
  component: ChatPage,
  beforeLoad: requireAuth,
});

// Balance routes
const balanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/balance',
  component: BalancePage,
  beforeLoad: requireAuth,
});

const withdrawalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/withdrawal',
  component: WithdrawalPage,
  beforeLoad: requireAuth,
});

// Settings routes
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
  beforeLoad: requireAuth,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$userId',
  component: ProfilePage,
  beforeLoad: requireAuth,
});

// Billing routes
const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/billing',
  component: BillingPage,
  beforeLoad: requireAuth,
});

// Admin routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
  beforeLoad: ({ context }) => {
    requireAuth({ context });
    const { hasRole } = context.auth;
    if (!hasRole(['admin'])) {
      throw new Navigate({ to: '/' });
    }
  },
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/users',
  component: AdminUsersPage,
  beforeLoad: ({ context }) => {
    requireAuth({ context });
    const { hasRole } = context.auth;
    if (!hasRole(['admin'])) {
      throw new Navigate({ to: '/' });
    }
  },
});

const adminProjectsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/projects',
  component: AdminProjectsPage,
  beforeLoad: ({ context }) => {
    requireAuth({ context });
    const { hasRole } = context.auth;
    if (!hasRole(['admin'])) {
      throw new Navigate({ to: '/' });
    }
  },
});

const adminWithdrawalsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/withdrawals',
  component: AdminWithdrawalsPage,
  beforeLoad: ({ context }) => {
    requireAuth({ context });
    const { hasRole } = context.auth;
    if (!hasRole(['admin'])) {
      throw new Navigate({ to: '/' });
    }
  },
});

const adminTransactionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/transactions',
  component: AdminTransactionsPage,
  beforeLoad: ({ context }) => {
    requireAuth({ context });
    const { hasRole } = context.auth;
    if (!hasRole(['admin'])) {
      throw new Navigate({ to: '/' });
    }
  },
});

// Not found route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$',
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  verifyEmailRoute,
  projectsRoute.addChildren([createProjectRoute, myProjectsRoute, projectDetailRoute.addChildren([editProjectRoute])]),
  myBidsRoute,
  chatRoute,
  balanceRoute,
  withdrawalRoute,
  settingsRoute,
  profileRoute,
  billingRoute,
  adminRoute.addChildren([adminUsersRoute, adminProjectsRoute, adminWithdrawalsRoute, adminTransactionsRoute]),
  notFoundRoute,
]);

export const router = createRouter({ routeTree, context: { auth: { isAuthenticated: false, isLoading: true, hasRole: () => false } } });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}