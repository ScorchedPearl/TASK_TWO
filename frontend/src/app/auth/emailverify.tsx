import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from '@/providers/userprovider';
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
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
    <div>
      <section className="relative min-h-screen bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="flex justify-center items-center h-screen">
          <Card className="w-[400px] bg-black/50 backdrop-blur-xl border border-white/10 shadow-xl rounded-lg">
            <div className="p-6 space-y-6 text-center">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className={`p-3 rounded-full ${
                    status === 'loading' 
                      ? 'bg-blue-500/20' 
                      : status === 'success' 
                      ? 'bg-green-500/20' 
                      : 'bg-red-500/20'
                  }`}>
                    {status === 'loading' && (
                      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    )}
                    {status === 'success' && (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    )}
                    {status === 'error' && (
                      <XCircle className="w-8 h-8 text-red-400" />
                    )}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                  {status === 'loading' && 'Verifying Email...'}
                  {status === 'success' && 'Email Verified!'}
                  {status === 'error' && 'Verification Failed'}
                </h2>
                
                <p className="text-sm text-gray-400">
                  {message}
                </p>
                
                {status === 'success' && (
                  <p className="text-xs text-gray-500">
                    Redirecting you to the dashboard in 3 seconds...
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {status === 'success' && (
                  <Button
                    onClick={handleGoToDashboard}
                    className="w-full bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 text-black font-semibold hover:opacity-90 transition-opacity rounded-lg py-2"
                  >
                    Go to Dashboard
                  </Button>
                )}
                
                {status === 'error' && (
                  <Button
                    onClick={handleGoToLogin}
                    className="w-full bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 text-black font-semibold hover:opacity-90 transition-opacity rounded-lg py-2"
                  >
                    Back to Login
                  </Button>
                )}
                {status !== 'loading' && (
                  <Button
                    onClick={handleGoToLogin}
                    variant="link"
                    className="w-full text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Login Page
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}