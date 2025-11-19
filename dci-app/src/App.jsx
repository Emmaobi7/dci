import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { CourseProvider } from './contexts/CourseContext';
import Router from './components/Router';
import Dashboard, { DashboardHome, CatalogPage, CreateCoursePage } from './components/Dashboard';
import { CourseLearningRoute, CourseManagementRoute } from './components/CourseRoutes';

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto mb-4"></div>
      <p className="text-teal-400 text-lg font-mono tracking-wider">INITIALIZING DCIAFRICA...</p>
    </div>
  </div>
);

const ProtectedApp = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth/login" replace />;

  return (
    <UserProvider>
      <CourseProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<Dashboard />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/create-course" element={<CreateCoursePage />} />
          </Route>
          <Route path="/courses/:courseId/manage" element={<CourseManagementRoute />} />
          <Route path="/courses/:courseId/learn" element={<CourseLearningRoute />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </CourseProvider>
    </UserProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="font-mono">
          <Routes>
            <Route path="/auth/*" element={<Router />} />
            <Route path="/*" element={<ProtectedApp />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;