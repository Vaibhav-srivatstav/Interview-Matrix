'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '/src/lib/authContext';
import toast from 'react-hot-toast';
import { LoginForm } from '@/components/auth/login_form.js'

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-balance">Welcome back</h1>
          <p className="text-muted-foreground text-lg">Sign in to your Interview Matrix account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
