import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { Role } from '../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    
    if (!cleanEmail || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      // Pass password to auth service
      await login(cleanEmail, password);
      
      // Role-Based Redirection logic is handled by looking at the user *after* login
      // But since `login` is async and updates context, we can check the returned user in a real app.
      // Here we rely on the component re-rendering or manual navigation if AuthContext provided the user back.
      // For simplicity in this structure, we manually fetch user role from local storage or wait for context.
      // However, the best UX is to navigate based on the assumed success.
      
      // We'll read the user directly from storage since context updates might be slightly async
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.role === Role.DOCTOR || storedUser.role === Role.ADMIN) {
        navigate('/dashboard');
      } else {
        navigate('/ai-assistant');
      }

    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string) => {
      setEmail(demoEmail);
      setPassword('password123'); // Demo password
      setError('');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side - Brand / Info */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 flex-col justify-between relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Activity size={400} className="-ml-20 -mt-20" />
         </div>
         
         <div className="z-10">
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                 <Activity size={32} />
               </div>
               <span className="text-2xl font-bold tracking-tight">MediCore AI</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-6">
               Healthcare Reimagined <br/> with Artificial Intelligence.
            </h1>
            <p className="text-blue-100 text-lg max-w-md">
               Join thousands of patients and doctors using our secure platform for diagnosis, telemedicine, and practice management.
            </p>
         </div>

         <div className="z-10 text-sm text-blue-200">
            © 2024 MediCore Health Systems. HIPAA Compliant.
         </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-500">Please enter your secure credentials.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className={`p-4 rounded-lg text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${error.includes('Pending') ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {error.includes('Pending') ? <AlertTriangle className="shrink-0" size={18} /> : <AlertCircleIcon />}
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="name@company.com"
                    />
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
               </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign in'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center">
             <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
                   Create an account
                </Link>
             </p>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
             <p className="text-xs text-center text-slate-400 mb-4 uppercase tracking-widest">Demo Credentials</p>
             <div className="flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => fillCredentials('patient@medicore.com')} className="text-xs bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200 transition-colors">Patient</button>
                <button type="button" onClick={() => fillCredentials('doctor@medicore.com')} className="text-xs bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200 transition-colors">Doctor</button>
                <button type="button" onClick={() => fillCredentials('admin@medicore.com')} className="text-xs bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200 transition-colors">Admin</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
)

export default Login;