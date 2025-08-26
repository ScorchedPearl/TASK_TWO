"use client"
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from '@/providers/userprovider';
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { GridBackground } from "../_components/bg";

export default function EmailVerificationPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const navigate = router.push;
  const { verifyEmail } = useUser();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const handleVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully! You can now access your account.');
        
        setTimeout(() => {
          navigate('/flow');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Email verification failed. Please try again.');
      }
    };

    handleVerification();
  }, []);

  const handleGoToLogin = () => {
    navigate('/auth');
  };

  const handleGoToDashboard = () => {
    navigate('/flow');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black text-black dark:text-white">
      <GridBackground></GridBackground>

      <Card className="w-[400px] bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-glow rounded-lg border border-gray-300 dark:border-emerald-900">
        <div className="p-6 space-y-6 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`w-12 h-12 p-3 rounded-full ${
                status === 'loading' 
                  ? 'bg-emerald-500/20' 
                  : status === 'success' 
                  ? 'bg-emerald-500/20' 
                  : 'bg-red-500/20'
              }`}>
                {status === 'loading' && (
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                )}
                {status === 'success' && (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                )}
                {status === 'error' && (
                  <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
                )}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h2>
            
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {message}
            </p>
            
            {status === 'success' && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Redirecting you to the dashboard in 3 seconds...
              </p>
            )}
          </div>

          <div className="space-y-3">
            {status === 'success' && (
              <Button
                onClick={handleGoToDashboard}
                className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-semibold shadow-glow hover:shadow-soft transition-all duration-300 rounded-lg py-2"
              >
                Go to Dashboard
              </Button>
            )}
            
            {status === 'error' && (
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-semibold shadow-glow hover:shadow-soft transition-all duration-300 rounded-lg py-2"
              >
                Back to Login
              </Button>
            )}
            {status !== 'loading' && (
              <Button
                onClick={handleGoToLogin}
                variant="link"
                className="w-full text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Back to Login Page
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}