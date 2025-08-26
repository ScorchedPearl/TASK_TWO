"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { Label } from "@radix-ui/react-label";
import { useUser } from '@/providers/userprovider';
import { 
  LockIcon, 
  CheckCircle, 
  XCircle, 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useSearchParams } from 'next/navigation';
import { GridBackground } from "../_components/bg";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const navigate = router.push;
  const searchParams = useSearchParams();
  const { resetPassword } = useUser();

  type PasswordResetForm = {
    password: string;
    confirmPassword: string;
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PasswordResetForm>();

  const token = searchParams.get('token');

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (!token) {
      setError('root', {
        type: 'manual',
        message: 'Invalid reset link. No token provided.'
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }

    if (data.password.length < 6) {
      setError('password', {
        type: 'manual',
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, data.password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Password reset failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/auth');
  };

  if (!token) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black text-black dark:text-white">
        <GridBackground />

        <Card className="w-[400px] bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-glow rounded-lg border border-gray-300 dark:border-emerald-900">
          <div className="p-6 space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-red-500/20 p-3 rounded-full">
                  <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                Invalid Reset Link
              </h2>
              
              <p className="text-sm text-gray-700 dark:text-gray-300">
                This password reset link is invalid or has expired. Please request a new password reset.
              </p>
            </div>

            <Button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-3 text-lg flex items-center justify-center shadow-glow hover:shadow-soft transition-all duration-300 rounded-lg"
            >
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black text-black dark:text-white">
        <GridBackground />

        <Card className="w-[400px] bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-glow rounded-lg border border-gray-300 dark:border-emerald-900">
          <div className="p-6 space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-emerald-500/20 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                Password Reset Successfully!
              </h2>
              
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Redirecting you to login in 3 seconds...
              </p>
            </div>

            <Button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-3 text-lg flex items-center justify-center shadow-glow hover:shadow-soft transition-all duration-300 rounded-lg"
            >
              Go to Login Now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black text-black dark:text-white">
      <GridBackground />

      <Card className="w-[400px] bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-glow rounded-lg border border-gray-300 dark:border-emerald-900">
        <div className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 p-2 rounded-full">
                <LockIcon className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
              Reset Your Password
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Enter your new password below to complete the reset process.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-gray-700 dark:text-gray-300">
                New Password
              </Label>
              <div className="relative">
                <LockIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  size={18}
                />
                <Input
                  id="password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  type="password"
                  className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white py-3 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="Enter your new password"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-gray-700 dark:text-gray-300">
                Confirm New Password
              </Label>
              <div className="relative">
                <LockIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  size={18}
                />
                <Input
                  id="confirmPassword"
                  {...register("confirmPassword", { 
                    required: "Please confirm your password" 
                  })}
                  type="password"
                  className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white py-3 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="Confirm your new password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-3 text-lg flex items-center justify-center shadow-glow hover:shadow-soft transition-all duration-300 rounded-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>

            {errors.root && (
              <p className="text-sm text-red-500 dark:text-red-400 text-center">
                {errors.root.message}
              </p>
            )}
          </form>

          <div className="text-center">
            <Button
              variant="link"
              className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={handleGoToLogin}
              disabled={isLoading}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}