import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import { useAuth } from './contexts/AuthContext';
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
import { BillingPage } from './pages/BillingPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { AdminWithdrawalsPage } from './pages/AdminWithdrawalsPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { TalentPage } from './pages/TalentPage';
import { AIToolsPage } from './pages/AIToolsPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

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
    const { isAuthenticated } = (context as RouterContext).auth;
    if (isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
  beforeLoad: ({ context }) => {
    const { isAuthenticated } = (context as RouterContext).auth;
    if (isAuthenticated) {
      throw redirect({ to: '/' });
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
interface RouterContext {
  auth: ReturnType<typeof useAuth>;
}

const requireAuth = ({ context }: { context: unknown }) => {
  const { isAuthenticated, isLoading } = (context as RouterContext).auth;
  if (isLoading) return;
  if (!isAuthenticated) {
    throw redirect({ to: '/login', search: { redirect: window.location.pathname } });
  }
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
    const ctx = context as RouterContext;
    requireAuth({ context: ctx });
    const { hasRole } = ctx.auth;
    if (!hasRole(['client', 'admin'])) {
      throw redirect({ to: '/projects' });
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

// Public pages
const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/categories',
  component: CategoriesPage,
});

const talentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/talent',
  component: TalentPage,
});

const aiToolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ai-tools',
  component: AIToolsPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: PrivacyPage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsPage,
});

// Admin routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
  beforeLoad: ({ context }) => {
    const ctx = context as RouterContext;
    requireAuth({ context: ctx });
    const { hasRole } = ctx.auth;
    if (!hasRole(['admin'])) {
      throw redirect({ to: '/' });
    }
  },
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/users',
  component: AdminUsersPage,
  beforeLoad: ({ context }) => {
    const ctx = context as RouterContext;
    requireAuth({ context: ctx });
    const { hasRole } = ctx.auth;
    if (!hasRole(['admin'])) {
      throw redirect({ to: '/' });
    }
  },
});

const adminProjectsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/projects',
  component: AdminProjectsPage,
  beforeLoad: ({ context }) => {
    const ctx = context as RouterContext;
    requireAuth({ context: ctx });
    const { hasRole } = ctx.auth;
    if (!hasRole(['admin'])) {
      throw redirect({ to: '/' });
    }
  },
});

const adminWithdrawalsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/withdrawals',
  component: AdminWithdrawalsPage,
  beforeLoad: ({ context }) => {
    const ctx = context as RouterContext;
    requireAuth({ context: ctx });
    const { hasRole } = ctx.auth;
    if (!hasRole(['admin'])) {
      throw redirect({ to: '/' });
    }
  },
});

const adminTransactionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/transactions',
  component: AdminTransactionsPage,
  beforeLoad: ({ context }) => {
    const ctx = context as RouterContext;
    requireAuth({ context: ctx });
    const { hasRole } = ctx.auth;
    if (!hasRole(['admin'])) {
      throw redirect({ to: '/' });
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
  categoriesRoute,
  talentRoute,
  aiToolsRoute,
  contactRoute,
  privacyRoute,
  termsRoute,
  adminRoute.addChildren([adminUsersRoute, adminProjectsRoute, adminWithdrawalsRoute, adminTransactionsRoute]),
  notFoundRoute,
]);

export const router = createRouter({ routeTree, context: { auth: { isAuthenticated: false, isLoading: true, hasRole: () => false } } });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}