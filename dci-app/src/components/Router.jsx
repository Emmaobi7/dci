import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Login, Signup, ForgotPassword } from './auth';
import { PrivacyPolicy, TermsOfService } from './legal';

const Router = () => {
  const navigate = useNavigate();

  const goTo = (path) => navigate(path);

  return (
    <Routes>
      <Route
        path="login"
        element={(
          <Login
            onSwitchToSignup={() => goTo('/auth/signup')}
            onForgotPassword={() => goTo('/auth/forgot-password')}
            onShowPrivacy={() => goTo('/auth/privacy')}
            onShowTerms={() => goTo('/auth/terms')}
          />
        )}
      />
      <Route
        path="signup"
        element={(
          <Signup
            onSwitchToLogin={() => goTo('/auth/login')}
            onShowPrivacy={() => goTo('/auth/privacy')}
            onShowTerms={() => goTo('/auth/terms')}
          />
        )}
      />
      <Route
        path="forgot-password"
        element={<ForgotPassword onBackToLogin={() => goTo('/auth/login')} />}
      />
      <Route
        path="privacy"
        element={<PrivacyPolicy onBack={() => goTo('/auth/login')} />}
      />
      <Route
        path="terms"
        element={<TermsOfService onBack={() => goTo('/auth/login')} />}
      />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};

export default Router;
