import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '@/api/auth';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google login failed — no credential received');
      return;
    }

    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      setAuth(data.access_token, data.user);
      toast.success(`Welcome, ${data.user.name || data.user.email}!`);
      navigate('/upload');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center">
          <FileText className="w-6 h-6 text-white dark:text-zinc-900" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          DocuMind
        </h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-[400px] bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
        <h2 className="text-xl font-semibold text-center text-zinc-900 dark:text-white mb-2">
          Welcome back
        </h2>
        <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 mb-8">
          Sign in to access your documents, chats, and quizzes.
        </p>

        {/* Google Sign-In */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error('Google Sign-In failed')}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="320"
          />
        </div>

        <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 mt-8">
          By signing in, you agree to DocuMind's Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default Login;
