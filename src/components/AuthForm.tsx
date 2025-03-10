import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export function AuthForm() {
  
  // 状态管理
  const [isLogin, setIsLogin] = useState(true); // 控制当前是登录还是注册模式
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  // 表单验证
  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email' || err.path[0] === 'password') {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Logged in successfully!');
      } else {
        await signUp(email, password);
        toast.success('Account created successfully! You can now log in.');
        setIsLogin(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error(errorMessage);
      if (errorMessage.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else if (errorMessage.includes('User already registered')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.email 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'}`}
              disabled={isSubmitting}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.password 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'}`}
              disabled={isSubmitting}
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors"
            disabled={isSubmitting}
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}