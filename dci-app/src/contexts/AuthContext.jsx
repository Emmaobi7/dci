import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  linkWithCredential,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebase.js';
import { GithubAuthProvider } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const linkGithub = async () => {
    try {
      setError(null);
      setLoading(true);

      console.log('AuthContext: Opening single GitHub popup...');
      // Step 1: Always open exactly ONE popup (directly from user gesture - browser safe)
      const signInResult = await signInWithPopup(auth, githubProvider);
      const credential = GithubAuthProvider.credentialFromResult(signInResult);
      const token = credential.accessToken;
      const githubUser = signInResult.user;

      console.log('AuthContext: Got GitHub token. Attempting silent link...');

      // Step 2: If we have a "real" current user (email/pass) and a different GitHub user,
      // try to link the credential to the currently-logged-in user silently.
      // This may fail if accounts conflict - that's OK, we already have the token.
      if (auth.currentUser && auth.currentUser.uid !== githubUser.uid) {
        try {
          await linkWithCredential(auth.currentUser, credential);
          console.log('AuthContext: Accounts linked successfully.');
        } catch (linkErr) {
          // Linking failed (email conflict etc.) but we still have the token - that's fine
          console.warn(`AuthContext: Silent link failed (${linkErr.code}) - proceeding with token only.`);
        }
      }

      return { user: githubUser, token };
    } catch (error) {
      console.error('AuthContext: GitHub sign-in error:', error);

      // Firebase attaches the credential to this error.
      // We can extract the GitHub token directly from the error without a second popup.
      if (error.code === 'auth/account-exists-with-different-credential') {
        console.warn('AuthContext: Account exists with different credential. Extracting token from error...');
        const errorCredential = GithubAuthProvider.credentialFromError(error);
        if (errorCredential?.accessToken) {
          console.log('AuthContext: Successfully extracted GitHub token from error credential.');
          return { user: auth.currentUser, token: errorCredential.accessToken, isFallback: true };
        }
      }

      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      localStorage.clear();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    linkGithub,
    signOut,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
