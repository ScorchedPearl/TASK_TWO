'use client';

import { createContext, useContext, useState } from 'react';
import { useCurrentUser } from '@/hooks/useUser'
import axios from 'axios';
import type { User } from '@/types/auth_interface';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}
interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
  googleAccessToken: string | null;
  googleAuth: (token: string) => Promise<string>;
  sendOTP: (email: string) => Promise<boolean>;
  changePassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  isLoading: true,
  googleAccessToken: null,
  googleAuth: () => Promise.resolve(""),
  sendOTP: () => Promise.resolve(false),
  changePassword: async () => Promise.resolve(),
  signUp: async () => Promise.resolve(),
  signIn: async () => Promise.resolve(),
  verifyEmail: async () => Promise.resolve(),
  resendVerification: async () => Promise.resolve(),
  forgotPassword: async () => Promise.resolve(),
  resetPassword: async () => Promise.resolve(),
  logout: () => {
    localStorage.removeItem('__Pearl_Token');
    localStorage.removeItem('__Pearl_Refresh_Token');
    window.location.reload();
  },
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
 try{
  const { currentUser, isLoading } = useCurrentUser();
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

 
  const storeTokens = (tokens: TokenPair) => {
    localStorage.setItem('__Pearl_Token', tokens.accessToken);
    localStorage.setItem('__Pearl_Refresh_Token', tokens.refreshToken);
  };

  async function googleAuth(token: string) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/google`, {
        token
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data?.success && response.data?.data?.tokens) {
        const { tokens }: { tokens: TokenPair } = response.data.data;
        console.log(tokens);
        storeTokens(tokens);
        localStorage.setItem('__Google_Access_Token__', token);
        setGoogleAccessToken(token);
        return tokens.accessToken;
      } else {
        throw new Error(response.data?.error || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to authenticate with Google';
      throw new Error(errorMessage);
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        name,
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Registration failed');
      }

      console.log('Registration successful. Please check your email for verification.');
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed';
      throw new Error(errorMessage);
    }
  }

  async function verifyEmail(token: string) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/verify-email`, {
        token
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data?.success && response.data?.data?.tokens) {
        const { tokens }: { tokens: TokenPair } = response.data.data;
        storeTokens(tokens);
        console.log('Email verified successfully!');
      } else {
        throw new Error(response.data?.error || 'Email verification failed');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      const errorMessage = error.response?.data?.error || 'Email verification failed';
      throw new Error(errorMessage);
    }
  }

  async function resendVerification(email: string) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/resend-verification`, {
        email
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to resend verification email');
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to resend verification email';
      throw new Error(errorMessage);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data?.success && response.data?.data?.tokens) {
        const { tokens }: { tokens: TokenPair } = response.data.data;
        storeTokens(tokens);
      } else {
        throw new Error(response.data?.error || 'Sign in failed');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.response?.data?.error || 'Sign in failed';
      throw new Error(errorMessage);
    }
  }

  async function forgotPassword(email: string) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, {
        email
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to send reset email');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send reset email';
      throw new Error(errorMessage);
    }
  }

  async function resetPassword(resetToken: string, newPassword: string) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/reset-password`, {
        resetToken,
        newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Password reset failed');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.error || 'Password reset failed';
      throw new Error(errorMessage);
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    try {
      const token = localStorage.getItem('__Pearl_Token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${BACKEND_URL}/api/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Password change failed');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.error || 'Password change failed';
      throw new Error(errorMessage);
    }
  }


  async function sendOTP(email: string): Promise<boolean> {
    try {
      await forgotPassword(email);
      return true;
    } catch (error) {
      console.error('Send OTP error:', error);
      return false;
    }
  }

  const logout = () => {
    localStorage.removeItem('__Pearl_Token');
    localStorage.removeItem('__Pearl_Refresh_Token');
    localStorage.removeItem('__Google_Access_Token__');
    setGoogleAccessToken(null);
    window.location.reload();
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        googleAccessToken,
        googleAuth,
        sendOTP,
        changePassword,
        signUp,
        signIn,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
  } catch (error) {
    console.error("Error in UserProvider:", error);
    return <div>Something went wrong in UserProvider</div>;
  }
};

export const useUser = () => useContext(UserContext);