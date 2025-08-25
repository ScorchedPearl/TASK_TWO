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
  ChefHat, 
  Sparkles, 
  Star,
  Utensils,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useSearchParams } from 'next/navigation';

export default function PasswordResetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router=useRouter();
  const navigate=router.push;
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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="absolute top-20 left-20 opacity-80">
          <ChefHat className="w-10 h-10" />
        </div>
        <div className="absolute top-40 right-32 opacity-70">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute bottom-32 left-32 opacity-60">
          <Star className="w-12 h-12" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-50">
          <Utensils className="w-6 h-6" />
        </div>

        <Card className="w-[400px] bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-xl shadow-xl rounded-lg border border-slate-700">
          <div className="p-6 space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-red-500/20 p-3 rounded-full">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent">
                Invalid Reset Link
              </h2>
              
              <p className="text-sm text-slate-300 dark:text-slate-400">
                This password reset link is invalid or has expired.
              </p>
            </div>

            <Button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-400 text-slate-200 px-8 py-3 text-lg flex items-center justify-center hover:opacity-90 transition-opacity rounded-lg"
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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="absolute top-20 left-20 opacity-80">
          <ChefHat className="w-10 h-10" />
        </div>
        <div className="absolute top-40 right-32 opacity-70">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute bottom-32 left-32 opacity-60">
          <Star className="w-12 h-12" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-50">
          <Utensils className="w-6 h-6" />
        </div>

        <Card className="w-[400px] bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-xl shadow-xl rounded-lg border border-slate-700">
          <div className="p-6 space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-500/20 p-3 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent">
                Password Reset Successfully!
              </h2>
              
              <p className="text-sm text-slate-300 dark:text-slate-400">
                Your password has been updated. You can now sign in with your new password.
              </p>
              
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Redirecting you to login in 3 seconds...
              </p>
            </div>

            <Button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-400 text-slate-200 px-8 py-3 text-lg flex items-center justify-center hover:opacity-90 transition-opacity rounded-lg"
            >
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="absolute top-20 left-20 opacity-80">
        <ChefHat className="w-10 h-10" />
      </div>
      <div className="absolute top-40 right-32 opacity-70">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="absolute bottom-32 left-32 opacity-60">
        <Star className="w-12 h-12" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-50">
        <Utensils className="w-6 h-6" />
      </div>

      <Card className="w-[400px] bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-xl shadow-xl rounded-lg border border-slate-700">
        <div className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/20 p-2 rounded-full">
                <LockIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
              Reset Your Password
            </h2>
            <p className="text-sm text-slate-300 dark:text-slate-400">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-slate-300 dark:text-slate-400">
                New Password
              </Label>
              <div className="relative">
                <LockIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
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
                  className="pl-10 bg-slate-800/50 dark:bg-slate-900/50 border border-slate-700 dark:border-slate-600 text-white py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Enter your new password"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-slate-300 dark:text-slate-400">
                Confirm New Password
              </Label>
              <div className="relative">
                <LockIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Input
                  id="confirmPassword"
                  {...register("confirmPassword", { 
                    required: "Please confirm your password" 
                  })}
                  type="password"
                  className="pl-10 bg-slate-800/50 dark:bg-slate-900/50 border border-slate-700 dark:border-slate-600 text-white py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Confirm your new password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-400 text-slate-200 px-8 py-3 text-lg flex items-center justify-center hover:opacity-90 transition-opacity rounded-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Resetting...
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>

            {errors.root && (
              <p className="text-sm text-red-400 text-center">
                {errors.root.message}
              </p>
            )}
          </form>

          <Button
            variant="link"
            className="w-full text-slate-400 dark:text-slate-500 hover:text-primary transition-colors"
            onClick={handleGoToLogin}
            disabled={isLoading}
          >
            Back to Login
          </Button>
        </div>
      </Card>
    </div>
  );
}