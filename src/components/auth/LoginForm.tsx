'use client';

import { useState } from 'react';
import { login, register, loginWithGoogle } from '@/lib/auth';

type LoginMode = 'email' | 'register';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<LoginMode>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = mode === 'email'
      ? await login(email, password)
      : await register(email, password);

    if (result?.error) {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    const result = await loginWithGoogle();
    if (result.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          type="button"
          onClick={() => setMode('email')}
          className={`px-4 py-2 rounded-t-lg ${mode === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Email Login
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`px-4 py-2 rounded-t-lg ${mode === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : mode === 'email' ? 'Login' : 'Register'}
        </button>

        {mode === 'email' && (
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mt-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
          >
            Login with Google
          </button>
        )}
      </form>
    </div>
  );
} 