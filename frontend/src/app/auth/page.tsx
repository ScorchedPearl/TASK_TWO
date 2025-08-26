"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Mail, 
  ShoppingBag,
  UserIcon,
  LockIcon,
  MailIcon,
  Users,
  Store,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@/providers/userprovider";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { GridBackground } from "../_components/bg";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [emailSentFor, setEmailSentFor] = useState<'registration' | 'reset' | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>('buyer');
  
  const [showGoogleRoleModal, setShowGoogleRoleModal] = useState(false);
  const [googleToken, setGoogleToken] = useState<string>("");
  const [googleRoleSelection, setGoogleRoleSelection] = useState<'buyer' | 'seller'>('buyer');
  
  const router = useRouter();
  const navigate = router.push;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const { 
    currentUser, 
    googleAuth, 
    completeGoogleRegistration, 
    signUp, 
    signIn, 
    forgotPassword,
    resendVerification 
  } = useUser();

  useEffect(() => {
    if (currentUser) {
      navigate('/flow');
    }
  }, [currentUser, navigate]);

  const onSubmit = async (data: { 
    email?: string; 
    password?: string; 
    name?: string; 
    confirmPassword?: string 
  }) => {
    setIsLoading(true);
    clearErrors();

    try {
      if (isForgotPassword) {
        const email = data.email as string;
        await forgotPassword(email);
        setUserEmail(email);
        setEmailSentFor('reset');
        setShowEmailSent(true);
      } else if (isSignUp) {
        const email = data.email as string;
        const password = data.password as string;
        const name = data.name as string;

        if (password !== data.confirmPassword) {
          setError("confirmPassword", {
            type: "manual",
            message: "Passwords don't match",
          });
          return;
        }

        await signUp(email, password, name, selectedRole);
        setUserEmail(email);
        setEmailSentFor('registration');
        setShowEmailSent(true);
      } else {
        const email = data.email as string;
        const password = data.password as string;
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message?.includes('email')) {
        setError("email", {
          type: "manual",
          message: error.message
        });
      } else if (error.message?.includes('password')) {
        setError("password", {
          type: "manual",
          message: error.message
        });
      } else if(error.message?.includes('exists')) {
         setError("email", {  
          type: "manual",
          message: "Email already exists. Please sign in or use a different email."
        });
      } else {
        setError("root", {
          type: "manual",
          message: error.message || "An error occurred. Please try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googlelogin = useGoogleLogin({
    onSuccess: async (cred: any) => {
      console.log('Google login success, credential:', cred);
      setIsLoading(true);
      try {
        const result = await googleAuth(cred.access_token);
        console.log('GoogleAuth result:', result);
        if (typeof result === 'object' && result.requiresRoleSelection) {
          console.log('Role selection required, showing modal');
          setGoogleToken(result.googleToken || cred.access_token);
          setShowGoogleRoleModal(true);
        } else {
          console.log('Google authentication successful');
        }
      } catch (error: any) {
        console.error("Google login failed:", error);
        setError("root", {
          type: "manual",
          message: error.message || "Google authentication failed. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError("root", {
        type: "manual",
        message: "Google authentication failed. Please try again."
      });
    },
    scope: "openid profile email"
  });

  const handleGoogleRoleSelection = async (role: 'buyer' | 'seller') => {
    console.log('Completing Google registration with role:', role);
    setIsLoading(true);
    try {
      await completeGoogleRegistration(googleToken, role);
      console.log('Google registration completed successfully');
      setShowGoogleRoleModal(false);
    } catch (error: any) {
      console.error("Google role selection failed:", error);
      setError("root", {
        type: "manual",
        message: error.message || "Failed to complete Google registration."
      });
      setShowGoogleRoleModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      if (emailSentFor === 'registration') {
        await resendVerification(userEmail);
      } else if (emailSentFor === 'reset') {
        await forgotPassword(userEmail);
      }
    } catch (error: any) {
      setError("root", {
        type: "manual",
        message: error.message || "Failed to resend email"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowEmailSent(false);
    setEmailSentFor(null);
    setUserEmail("");
    setIsForgotPassword(false);
    setIsSignUp(false);
    setSelectedRole('buyer');
    setShowGoogleRoleModal(false);
    setGoogleToken("");
    setGoogleRoleSelection('buyer');
    reset();
    clearErrors();
  };

  const GoogleRoleModal = () => (
    <AnimatePresence>
      {showGoogleRoleModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-[400px] max-w-[90vw]"
          >
            <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-glow border border-gray-300 dark:border-emerald-900">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Choose Your Account Type
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowGoogleRoleModal(false);
                      setGoogleToken("");
                    }}
                    className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300">
                  To complete your Google registration, please select your account type:
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => setGoogleRoleSelection('buyer')}
                    variant={googleRoleSelection === 'buyer' ? 'default' : 'outline'}
                    className={`flex items-center justify-start gap-3 p-4 h-auto ${
                      googleRoleSelection === 'buyer' 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-black dark:text-white'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Buyer Account</div>
                      <div className="text-xs opacity-80">Shop fresh products from local sellers</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setGoogleRoleSelection('seller')}
                    variant={googleRoleSelection === 'seller' ? 'default' : 'outline'}
                    className={`flex items-center justify-start gap-3 p-4 h-auto ${
                      googleRoleSelection === 'seller' 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-black dark:text-white'
                    }`}
                  >
                    <Store className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Seller Account</div>
                      <div className="text-xs opacity-80">Sell your products to local buyers</div>
                    </div>
                  </Button>
                </div>

                <Button
                  onClick={() => handleGoogleRoleSelection(googleRoleSelection)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-3 shadow-glow hover:shadow-soft transition-all duration-300 rounded-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    `Create ${googleRoleSelection === 'buyer' ? 'Buyer' : 'Seller'} Account`
                  )}
                </Button>

                {errors.root && (
                  <p className="text-sm text-red-500 dark:text-red-400 text-center">
                    {errors.root.message}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (showEmailSent) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black text-black dark:text-white">
        <GridBackground />

        <Card className="w-[400px] bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-glow rounded-lg border border-gray-300 dark:border-emerald-900">
          <div className="p-6 space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-emerald-500/20 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                Email Sent
              </h2>
              
              <p className="text-sm text-gray-700 dark:text-gray-300">
                We've sent you a {emailSentFor === 'registration' ? 'verification' : 'password reset'} email to{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{userEmail}</span>
              </p>
              
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {emailSentFor === 'registration' 
                  ? "Please check your email and click the verification link to complete your registration."
                  : "Please check your email and follow the instructions to reset your password."
                }
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isLoading}
                variant="outline"
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-black dark:text-white hover:shadow-soft transition-shadow"
              >
                {isLoading ? "Sending..." : "Resend Email"}
              </Button>
              
              <Button
                onClick={resetForm}
                variant="link"
                className="w-full text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Back to Login
              </Button>
            </div>

            {errors.root && (
              <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                {errors.root.message}
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black text-black dark:text-white">
        <GridBackground />

        <Card className="w-[400px] bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-glow border border-gray-300 dark:border-emerald-900">
          <div className="p-6 space-y-6">
            <div className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 p-2 rounded-full">
                  <ShoppingBag className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                {isForgotPassword
                  ? "Reset Password"
                  : isSignUp
                  ? "Join FreshMart"
                  : "Welcome Back"}
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {isForgotPassword
                  ? "Enter your email to receive a password reset link"
                  : isSignUp
                  ? "Create your account and start shopping fresh groceries"
                  : "Sign in to continue shopping fresh produce and groceries"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!isForgotPassword && !isSignUp && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 hover:shadow-soft text-black dark:text-white py-3 rounded-lg border border-gray-300 dark:border-emerald-900 transition-shadow"
                    onClick={() => googlelogin()}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" className="text-gray-800 dark:text-white" d="M12 10.2V14h5.6c-.3 1.3-1 2.4-2 3.1v2.6h3.2c1.9-1.8 3-4.3 3-7.1 0-.7-.1-1.3-.2-1.9H12z" />
                      <path fill="currentColor" className="text-emerald-600 dark:text-emerald-500" d="M6.8 14.6l-.9.7-2.5 1.9C5.1 20.8 8.4 23 12 23c3 0 5.5-1 7.4-2.6l-3.2-2.5c-.9.6-2.1 1-3.4 1-2.7 0-5-1.8-5.9-4.3z" />
                      <path fill="currentColor" className="text-emerald-600 dark:text-emerald-500" d="M3.4 6.7C2.5 8.4 2 10.2 2 12c0 1.8.5 3.6 1.4 5.3l3.4-2.6c-.4-1.1-.6-2.2-.6-2.7 0-.6.2-1.6.6-2.7L3.4 6.7z" />
                      <path fill="currentColor" className="text-gray-800 dark:text-white" d="M12 4.8c1.7 0 3.2.6 4.4 1.7L19.5 4C17.5 2.2 14.9 1 12 1 8.4 1 5.1 3.2 3.4 6.7l3.4 2.6C7 6.8 9.3 4.8 12 4.8z" />
                    </svg>
                    <span className="font-medium">
                      {isLoading ? 'Authenticating...' : 'Continue with Google'}
                    </span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {!isForgotPassword && !isSignUp && (
              <div className="text-center text-gray-600 dark:text-gray-400 text-sm flex items-center">
                <div className="flex-1 h-px bg-gray-300 dark:bg-emerald-900"></div>
                <span className="px-3">or continue with email</span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-emerald-900"></div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    <Label className="text-sm text-gray-700 dark:text-gray-300">Account Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={selectedRole === 'buyer' ? 'default' : 'outline'}
                        className={`flex items-center justify-center gap-2 py-3 ${
                          selectedRole === 'buyer' 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-black dark:text-white'
                        }`}
                        onClick={() => setSelectedRole('buyer')}
                      >
                        <Users className="w-4 h-4" />
                        Buyer
                      </Button>
                      <Button
                        type="button"
                        variant={selectedRole === 'seller' ? 'default' : 'outline'}
                        className={`flex items-center justify-center gap-2 py-3 ${
                          selectedRole === 'seller' 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-black dark:text-white'
                        }`}
                        onClick={() => setSelectedRole('seller')}
                      >
                        <Store className="w-4 h-4" />
                        Seller
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedRole === 'buyer' 
                        ? 'Shop fresh products from local sellers' 
                        : 'Sell your products to local buyers'
                      }
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name" className="text-sm text-gray-700 dark:text-gray-300">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
                      <Input
                        id="name"
                        {...register("name")}
                        className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white py-3 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    {errors.name && typeof errors.name.message === "string" && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.name.message}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-300">Email Address</Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
                  <Input
                    id="email"
                    {...register("email")}
                    type="email"
                    className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white py-3 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {errors.email && typeof errors.email.message === "string" && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-gray-700 dark:text-gray-300">Password</Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
                    <Input
                      id="password"
                      {...register("password")}
                      type="password"
                      className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white py-3 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
                      required
                    />
                  </div>
                  {errors.password && typeof errors.password.message === "string" && (
                    <p className="text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>
                  )}
                </div>
              )}

              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword" className="text-sm text-gray-700 dark:text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
                      <Input
                        id="confirmPassword"
                        {...register("confirmPassword")}
                        type="password"
                        className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white py-3 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                    {errors.confirmPassword && typeof errors.confirmPassword.message === "string" && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-3 text-lg flex items-center justify-center shadow-glow hover:shadow-soft transition-all duration-300 rounded-lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    {isForgotPassword
                      ? "Send Reset Link"
                      : isSignUp
                      ? `Create ${selectedRole === 'buyer' ? 'Buyer' : 'Seller'} Account` 
                      : "Sign In"}
                  </>
                )}
              </Button>

              {errors.root && (
                <p className="text-sm text-red-500 dark:text-red-400 text-center">
                  {errors.root.message}
                </p>
              )}
            </form>

            <div className="flex flex-col gap-2">
              <Button
                variant="link"
                className="w-full text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsSignUp(!isSignUp);
                  setSelectedRole('buyer');
                  clearErrors();
                }}
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </Button>

              {!isSignUp && (
                <Button
                  variant="link"
                  className="w-full text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  onClick={() => {
                    setIsForgotPassword(!isForgotPassword);
                    clearErrors();
                  }}
                >
                  {isForgotPassword ? "Back to sign in" : "Forgot your password?"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      <GoogleRoleModal />
    </>
  );
}