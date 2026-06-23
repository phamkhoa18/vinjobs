import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { ProtectedRoute, RoleRoute, GuestRoute, VerifiedEmployerRoute } from './components/auth/RouteGuards';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { getImageUrl } from './lib/api';

// ─── Public Pages ────────────────────────────────────────────────────────────
import HomePage from './pages/public/HomePage';
import JobsPage from './pages/public/JobsPage';
import JobDetailPage from './pages/public/JobDetailPage';
import CompaniesPage from './pages/public/CompaniesPage';
import BlogPage from './pages/public/BlogPage';
import BlogDetailPage from './pages/public/BlogDetailPage';
import NotFoundPage from './pages/public/NotFoundPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import TermsPage from './pages/public/TermsPage';
import PrivacyPage from './pages/public/PrivacyPage';
import FAQPage from './pages/public/FAQPage';

// ─── User Utility Pages ─────────────────────────────────────────────────────
import SavedPostsPage from './pages/user/SavedPostsPage';
import SavedSearchesPage from './pages/user/SavedSearchesPage';
import ViewHistoryPage from './pages/user/ViewHistoryPage';
import MyReviewsPage from './pages/user/MyReviewsPage';

// ─── Service Pages ───────────────────────────────────────────────────────────
import ProPackagePage from './pages/services/ProPackagePage';
import PartnerChannelPage from './pages/services/PartnerChannelPage';

// ─── Auth Pages ──────────────────────────────────────────────────────────────
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import EmployerRegisterPage from './pages/auth/EmployerRegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// ─── Candidate Dashboard ────────────────────────────────────────────────────
import CandidateDashboard from './pages/candidate/Dashboard';
import CandidateProfile from './pages/candidate/ProfilePage';
import CandidateCVs from './pages/candidate/CVManagementPage';
import CandidateApplications from './pages/candidate/ApplicationsPage';
import CandidateSavedJobs from './pages/candidate/SavedJobsPage';

// ─── Employer Dashboard ─────────────────────────────────────────────────────
import EmployerDashboard from './pages/employer/Dashboard';
import EmployerCompany from './pages/employer/CompanyProfilePage';
import EmployerJobs from './pages/employer/ManageJobsPage';
import EmployerPostJob from './pages/employer/PostJobPage';
import EmployerEditJob from './pages/employer/EditJobPage';
import EmployerApplicants from './pages/employer/ManageApplicantsPage';
import EmployerSubscription from './pages/employer/SubscriptionPage';
import EmployerVerificationPage from './pages/employer/VerificationPage';

// ─── Admin Dashboard ────────────────────────────────────────────────────────
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/ManageUsersPage';
import AdminCompanies from './pages/admin/ManageCompaniesPage';
import AdminJobs from './pages/admin/ManageJobsPage';
import AdminSubscriptions from './pages/admin/ManageSubscriptionsPage';
import AdminCategories from './pages/admin/ManageCategoriesPage';
import AdminAppearance from './pages/admin/ManageAppearancePage';
import AdminSettings from './pages/admin/SettingsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageJobsPage from './pages/admin/ManageJobsPage';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage';
import ManageBlogsPage from './pages/admin/ManageBlogsPage';
import SettingsPage from './pages/admin/SettingsPage';

// ─── Content Manager Dashboard ──────────────────────────────────────────────
import ContentPosts from './pages/content/ManagePostsPage';
import ContentCategories from './pages/content/ManageCategoriesPage';

// ─── Utilities ───────────────────────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const isAuthPage = ['/login', '/register', '/employer-register', '/forgot-password', '/reset-password', '/admin/login'].some(p => pathname.startsWith(p));
  const isDashboardPage = ['/candidate', '/employer', '/admin', '/content'].some(p => pathname.startsWith(p) && pathname !== '/employer-register' && pathname !== '/admin/login');

  // ── Auth pages (no header/footer, redirect if already logged in) ──
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={
          <GuestRoute><LoginPage /></GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute><RegisterPage /></GuestRoute>
        } />
        <Route path="/employer-register" element={
          <GuestRoute><EmployerRegisterPage /></GuestRoute>
        } />
        <Route path="/forgot-password" element={
          <GuestRoute><ForgotPasswordPage /></GuestRoute>
        } />
        <Route path="/reset-password/:token" element={
          <GuestRoute><ResetPasswordPage /></GuestRoute>
        } />
        <Route path="/admin/login" element={
          <GuestRoute><AdminLoginPage /></GuestRoute>
        } />
      </Routes>
    );
  }

  // ── Dashboard pages (no public header/footer, role-protected) ──
  if (isDashboardPage) {
    return (
      <Routes>
        {/* Candidate — role: CANDIDATE */}
        <Route path="/candidate" element={
          <RoleRoute allowedRoles={['CANDIDATE']}><CandidateDashboard /></RoleRoute>
        } />
        <Route path="/candidate/profile" element={
          <RoleRoute allowedRoles={['CANDIDATE']}><CandidateProfile /></RoleRoute>
        } />
        <Route path="/candidate/cv" element={
          <RoleRoute allowedRoles={['CANDIDATE']}><CandidateCVs /></RoleRoute>
        } />
        <Route path="/candidate/applications" element={
          <RoleRoute allowedRoles={['CANDIDATE']}><CandidateApplications /></RoleRoute>
        } />
        <Route path="/candidate/saved" element={
          <RoleRoute allowedRoles={['CANDIDATE']}><CandidateSavedJobs /></RoleRoute>
        } />

        {/* Employer — role: EMPLOYER */}
        <Route path="/employer" element={
          <VerifiedEmployerRoute><EmployerDashboard /></VerifiedEmployerRoute>
        } />
        <Route path="/employer/company" element={
          <RoleRoute allowedRoles={['EMPLOYER']}><EmployerCompany /></RoleRoute>
        } />
        <Route path="/employer/verification" element={
          <RoleRoute allowedRoles={['EMPLOYER']}><EmployerVerificationPage /></RoleRoute>
        } />
        <Route path="/employer/jobs" element={
          <VerifiedEmployerRoute><EmployerJobs /></VerifiedEmployerRoute>
        } />
        <Route path="/employer/post-job" element={
          <VerifiedEmployerRoute><EmployerPostJob /></VerifiedEmployerRoute>
        } />
        <Route path="/employer/edit-job/:id" element={
          <VerifiedEmployerRoute><EmployerEditJob /></VerifiedEmployerRoute>
        } />
        <Route path="/employer/applicants" element={
          <VerifiedEmployerRoute><EmployerApplicants /></VerifiedEmployerRoute>
        } />
        <Route path="/employer/subscription" element={
          <VerifiedEmployerRoute><EmployerSubscription /></VerifiedEmployerRoute>
        } />

        {/* Admin — role: ADMIN */}
        <Route path="/admin" element={
          <RoleRoute allowedRoles={['ADMIN']}><AdminDashboard /></RoleRoute>
        } />
        <Route path="/admin/users" element={
          <RoleRoute allowedRoles={['ADMIN']}><AdminUsers /></RoleRoute>
        } />
        <Route path="/admin/companies" element={
          <RoleRoute allowedRoles={['ADMIN']}><AdminCompanies /></RoleRoute>
        } />
        <Route path="/admin/jobs" element={
          <RoleRoute allowedRoles={['ADMIN']}><AdminJobs /></RoleRoute>
        } />
        <Route path="/admin/subscriptions" element={
          <RoleRoute allowedRoles={['ADMIN']}><AdminSubscriptions /></RoleRoute>
        } />
        <Route path="/admin/categories" element={
          <RoleRoute allowedRoles={['ADMIN']}><AdminCategories /></RoleRoute>
        } />
        <Route path="/admin/blogs" element={
          <RoleRoute allowedRoles={['ADMIN']}><ManageBlogsPage /></RoleRoute>
        } />
        <Route path="/admin/appearance" element={
          <RoleRoute allowedRoles={['ADMIN']}><AdminAppearance /></RoleRoute>
        } />
        <Route path="/admin/settings" element={
          <RoleRoute allowedRoles={['ADMIN']}><AdminSettings /></RoleRoute>
        } />
        <Route path="/admin/profile" element={
          <RoleRoute allowedRoles={['ADMIN']}><AdminProfilePage /></RoleRoute>
        } />

        {/* Content Manager */}
        <Route path="/content/posts" element={
          <RoleRoute allowedRoles={['ADMIN']}><ContentPosts /></RoleRoute>
        } />
        <Route path="/content/categories" element={
          <RoleRoute allowedRoles={['ADMIN']}><ContentCategories /></RoleRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  // ── Public pages (with header/footer) ──
  return (
    <>
      <Header />
      <main style={{ paddingTop: pathname === '/' ? 0 : 'var(--spacing-header-height)' }}>
        <Routes>
          {/* Core */}
          {/* Core */}
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompaniesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />

          {/* User utility */}
          <Route path="/saved-posts" element={<SavedPostsPage />} />
          <Route path="/saved-searches" element={<SavedSearchesPage />} />
          <Route path="/view-history" element={<ViewHistoryPage />} />
          <Route path="/my-reviews" element={<MyReviewsPage />} />

          {/* Services */}
          <Route path="/pro" element={<ProPackagePage />} />
          <Route path="/partner" element={<PartnerChannelPage />} />

          {/* Info & Legal */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function GlobalSEO() {
  const { settings } = useSettings();
  if (!settings) return null;

  return (
    <Helmet>
      <title>{settings.seo_title || settings.site_name}</title>
      <meta name="description" content={settings.seo_description} />
      <meta name="keywords" content={settings.seo_keywords} />
      {settings.favicon && <link rel="icon" type="image/x-icon" href={getImageUrl(settings.favicon)} />}
    </Helmet>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <SettingsProvider>
        <BrowserRouter>
          <GlobalSEO />
          <ScrollToTop />
          <AppLayout />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </BrowserRouter>
      </SettingsProvider>
    </HelmetProvider>
  );
}
