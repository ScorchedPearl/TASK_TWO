import { Router, Request, Response } from 'express';
import AuthService from '../services/authservice';
import AuthMiddleware from '../middleware/auth';
import { JWTError } from '../errors/jwterror';
import type { CreateCredentialsTokenType, VerifyCredentialsTokenType } from '../user_interface';

const authRouter = Router();
const authService = AuthService.getInstance();
const authMiddleware = AuthMiddleware.getInstance();

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    const payload: CreateCredentialsTokenType = {
      email: email.trim(),
      password,
      name: name.trim()
    };

    const result = await authService.registerWithCredentials(payload);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Registration initiated. Please check your email to verify your account.'
    });

  } catch (error) {
    if (error instanceof JWTError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.type
      });
    }
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

authRouter.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const result = await authService.verifyEmailAndCompleteRegistration(token);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens
      },
      message: 'Email verified successfully. Account created!'
    });

  } catch (error) {
    if (error instanceof JWTError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.type
      });
    }
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

authRouter.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    const result = await authService.resendVerificationEmail(email.trim());

    res.status(200).json({
      success: true,
      data: result,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    if (error instanceof JWTError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.type
      });
    }
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    const payload: VerifyCredentialsTokenType = {
      email: email.trim(),
      password
    };

    const result = await authService.signInWithCredentials(payload);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens
      },
      message: 'Login successful'
    });

  } catch (error) {
    if (error instanceof JWTError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.type
      });
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

authRouter.post('/google', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Google token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const result = await authService.signInWithGoogle(token);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens
      },
      message: 'Google authentication successful'
    });

  } catch (error) {
    if (error instanceof JWTError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.type
      });
    }

    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    const tokens = await authService.refreshTokens(refreshToken);

    res.status(200).json({
      success: true,
      data: { tokens },
      message: 'Tokens refreshed successfully'
    });

  } catch (error) {
    if (error instanceof JWTError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.type
      });
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

authRouter.get('/me', authMiddleware.authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
      message: 'User profile retrieved successfully'
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

authRouter.post('/change-password', authMiddleware.authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    const success = await authService.changePassword(userId, currentPassword, newPassword);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to change password',
        code: 'PASSWORD_CHANGE_FAILED'
      });
    }

  } catch (error) {
    if (error instanceof JWTError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.type
      });
    }

    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    await authService.generatePasswordResetToken(email.trim());


    res.status(200).json({
      success: true,
      message: 'If this email exists, you will receive a reset link'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Reset token and new password are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    const success = await authService.resetPassword(resetToken, newPassword);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to reset password',
        code: 'PASSWORD_RESET_FAILED'
      });
    }

  } catch (error) {
    if (error instanceof JWTError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.type
      });
    }

    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

export default authRouter;