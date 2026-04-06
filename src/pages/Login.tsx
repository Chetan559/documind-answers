import { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { loginWithGoogle } from '@/api/auth';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { FileText, Mail, Lock, User, Loader2, ArrowRight, MessageSquare, BookOpen, Highlighter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  {
    icon: MessageSquare,
    title: 'Chat with your PDFs',
    description: 'Ask questions and get source-cited answers from any document.',
  },
  {
    icon: BookOpen,
    title: 'Auto-generated quizzes',
    description: 'Test your understanding with AI-powered questions.',
  },
  {
    icon: Highlighter,
    title: 'Annotations & highlights',
    description: 'Mark up documents and organize notes into collections.',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google login failed — no credential received');
      toast.error('Google login failed — no credential received');
      return;
    }

    setIsGoogleLoading(true);
    setError('');
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      setAuth(data.access_token, data.user);
      toast.success(`Welcome, ${data.user.name || data.user.email}!`);
      navigate('/upload');
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsEmailLoading(true);

    try {
      // Placeholder for email/password auth — business logic unchanged
      toast.info('Email authentication coming soon. Please use Google Sign-In for now.');
    } catch (err: any) {
      const msg = err.message || 'Authentication failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const isSignUp = mode === 'signup';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — feature preview (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border/30 flex-col justify-center px-16 xl:px-24 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
              <FileText className="w-5 h-5 text-background" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground font-[var(--font-display)]">
              DocuMind
            </span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight mb-4 font-[var(--font-display)]">
            Your documents,<br />understood.
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-md">
            Upload any PDF and start asking questions. Get cited answers, generate quizzes, and annotate — all in one place.
          </p>

          <div className="space-y-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-0.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
              <FileText className="w-5 h-5 text-background" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              DocuMind
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {isSignUp
              ? 'Get started with DocuMind in seconds.'
              : 'Sign in to access your documents, chats, and quizzes.'}
          </p>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign-In */}
          <div className="relative">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError('Google Sign-In failed. Please try again.');
                  toast.error('Google Sign-In failed');
                }}
                theme="outline"
                size="large"
                text={isSignUp ? 'signup_with' : 'signin_with'}
                shape="rectangular"
                width="320"
              />
            </div>
            {/* Loading overlay */}
            {isGoogleLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isEmailLoading}
            >
              {isEmailLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create account' : 'Sign in'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle sign-in / sign-up */}
          <p className="text-sm text-center text-muted-foreground mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setMode(isSignUp ? 'signin' : 'signup'); setError(''); }}
              className="text-foreground font-medium hover:underline underline-offset-4"
            >
              {isSignUp ? 'Sign in' : 'Create account'}
            </button>
          </p>

          {/* Legal links */}
          <p className="text-xs text-center text-muted-foreground mt-6">
            By continuing, you agree to DocuMind's{' '}
            <Link to="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
