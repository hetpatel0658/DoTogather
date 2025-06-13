import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, loginWithGoogle, register } = useAppContext();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await register(email, password);
        toast({
          title: "Success",
          description: "Your account has been created successfully!",
        });
      } else {
        await login(email, password);
        toast({
          title: "Success",
          description: "You have been logged in successfully!",
        });
      }
    } catch (error: any) {
      console.error(isRegistering ? 'Registration failed:' : 'Login failed:', error);
      toast({
        title: isRegistering ? "Registration failed" : "Login failed",
        description: error.message || "Please check your credentials and try again",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: "Success",
        description: "You have been logged in with Google successfully!",
      });
    } catch (error: any) {
      console.error('Google login failed:', error);
      toast({
        title: "Google login failed",
        description: error.message || "An error occurred during Google login",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center login-gradient p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-app-lightblue rounded-lg flex items-center justify-center mx-auto mb-6">
            <div className="flex flex-col">
              <span className="h-2 w-12 bg-blue-400 rounded-full mb-1"></span>
              <span className="h-2 w-12 bg-blue-400 rounded-full mb-1"></span>
              <span className="h-2 w-8 bg-pink-400 rounded-full"></span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Daily Micro-</h1>
          <h1 className="text-4xl font-bold text-white">Task Planner</h1>
        </div>
        
        <div className="flex w-full mb-6">
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2 text-center font-medium ${!isRegistering ? 'text-app-teal border-b-2 border-app-teal' : 'text-white border-b-2 border-transparent'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2 text-center font-medium ${isRegistering ? 'text-app-teal border-b-2 border-app-teal' : 'text-white border-b-2 border-transparent'}`}
          >
            Register
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 rounded-lg bg-app-lightblue text-white border-none shadow-lg"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 rounded-lg bg-app-lightblue text-white border-none shadow-lg"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-14 bg-app-teal hover:bg-app-teal/90 text-black text-lg font-bold rounded-lg shadow-lg"
          >
            {isRegistering ? 'Create Account' : 'Log in'}
          </Button>
        </form>

        <div className="my-6 flex items-center justify-center w-full">
          <div className="border-t border-gray-300/30 flex-grow"></div>
          <span className="px-4 text-white">Or</span>
          <div className="border-t border-gray-300/30 flex-grow"></div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          className="w-full h-14 bg-app-lightblue hover:bg-app-lightblue/90 text-white flex items-center justify-center gap-3 rounded-lg shadow-lg"
        >
          <svg viewBox="0 0 48 48" className="w-6 h-6">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
