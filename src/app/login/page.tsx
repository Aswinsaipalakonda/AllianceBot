"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to dashboard on success
        router.replace('/');
        // Force refresh to reload layouts and sidebar routes
        router.refresh();
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-alliance-dark relative overflow-hidden px-4">
      {/* Decorative backdrop shapes */}
      <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-alliance-green/5 blur-3xl" />
      <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="w-full max-w-md bg-alliance-card border border-alliance-border rounded-2xl shadow-xl p-8 relative z-10 transition-all duration-300 hover:shadow-2xl">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-alliance-dark flex items-center justify-center overflow-hidden border border-alliance-border relative mb-4 shadow-sm">
            <Image 
              src="/logo.jpg" 
              alt="Alliance College Logo" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Shield className="h-4.5 w-4.5 text-alliance-green" />
            <span className="text-[10px] font-black tracking-widest text-alliance-green uppercase">Authorized Access Only</span>
          </div>
          <h1 className="text-2xl font-black text-alliance-text tracking-tight">
            Admissions <span className="text-alliance-green">Console</span>
          </h1>
          <p className="text-alliance-muted mt-1 text-sm font-medium">
            Sign in to manage real-time WhatsApp registrations.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-alliance-text/80 uppercase tracking-wide flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-alliance-muted" />
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="Enter Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-3 bg-alliance-dark border border-alliance-border rounded-xl text-sm text-alliance-text placeholder-alliance-muted focus:outline-none focus:border-alliance-green focus:ring-1 focus:ring-alliance-green transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-alliance-text/80 uppercase tracking-wide flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-alliance-muted" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="block w-full pl-4 pr-12 py-3 bg-alliance-dark border border-alliance-border rounded-xl text-sm text-alliance-text placeholder-alliance-muted focus:outline-none focus:border-alliance-green focus:ring-1 focus:ring-alliance-green transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-alliance-muted hover:text-alliance-text focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-alliance-green text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold shadow-[0_4px_12px_rgba(0,128,105,0.15)] hover:bg-[#00a884] disabled:bg-alliance-muted transition-all cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <span>Secure Sign In</span>
                <Sparkles className="h-4 w-4 animate-pulse" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center mt-8 pt-6 border-t border-alliance-border">
          <p className="text-[10px] text-alliance-muted font-medium">
            Alliance College admissions console is proprietary.<br />
            IP logs and access timestamps are registered for audits.
          </p>
        </div>
      </div>
    </div>
  );
}
