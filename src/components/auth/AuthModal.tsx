import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, Mail, Lock, Building, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signup' }) => {
  const { users, addCustomer, addToast, setCurrentUser } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  // Scene 1 password requirements:
  // "more than eight characters, with an uppercase letter, a lowercase letter and a special character."
  const hasMinLength = password.length > 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar;

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      addToast('error', 'Weak Password', 'Password must satisfy all security rules.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      addToast('error', 'Account Exists', 'Each email can belong to only one account. Try logging in.');
      return;
    }

    const newCust = addCustomer({
      name,
      company: company || name,
      email,
      phone: '+1 (555) 000-0000',
      address: 'Main Office',
    });

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: 'customer' as const,
      customerId: newCust.id,
      department: 'Customer Representative',
    };

    setCurrentUser(newUser);
    addToast('success', 'Account Created', `Welcome to Brightloop, ${name}! Logged into Customer Portal.`);
    onClose();
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      addToast('success', 'Signed In', `Welcome back, ${existing.name}!`);
      onClose();
    } else {
      addToast('error', 'Login Failed', 'No account found with this email.');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('error', 'Email Required', 'Please enter your registered email address.');
      return;
    }
    setResetSent(true);
    addToast('success', 'Password Reset Link Sent', `A reset token has been dispatched to ${email}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#ffffff] rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] max-w-md w-full border border-[#ececec] overflow-hidden relative text-[#17191c]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#777b86] hover:text-[#17191c] p-1.5 rounded-full hover:bg-[#f2f2f3] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-wider text-[#777b86]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Scene 1 · Authentication & RBAC</span>
          </div>

          <h2 className="font-serif text-2xl font-normal text-[#17191c] mb-1">
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'signin' && 'Sign in to Brightloop'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-[#777b86] mb-6">
            {mode === 'signup' && 'Register your company to manage subscriptions and invoices.'}
            {mode === 'signin' && 'Access your business subscription management portal.'}
            {mode === 'forgot' && 'Enter your email to receive a secure recovery reset link.'}
          </p>

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#777b86] mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#979799] absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] placeholder:text-[#979799] focus:outline-none focus:border-[#17191c] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#777b86] mb-1">Company / Organization</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#979799] absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corporation"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] placeholder:text-[#979799] focus:outline-none focus:border-[#17191c] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#777b86] mb-1">Business Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#979799] absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="john@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] placeholder:text-[#979799] focus:outline-none focus:border-[#17191c] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#777b86] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#979799] absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] placeholder:text-[#979799] focus:outline-none focus:border-[#17191c] transition"
                  />
                </div>

                {/* Password Policy Tracker */}
                <div className="mt-3 p-3 bg-[#fafafb] rounded-[16px] border border-[#ececec] space-y-1.5">
                  <div className="text-[11px] font-medium text-[#17191c] mb-1">Brightloop Security Requirements:</div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#17191c] font-medium' : 'text-[#979799]'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>&gt; 8 chars ({password.length})</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-[#17191c] font-medium' : 'text-[#979799]'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-[#17191c] font-medium' : 'text-[#979799]'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-[#17191c] font-medium' : 'text-[#979799]'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Special char (!@#$)</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isPasswordValid}
                className="w-full mt-2 py-2.5 px-4 bg-[#17191c] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-[#ffffff] font-medium text-xs rounded-full transition shadow-sm"
              >
                Create Account & Go to Portal
              </button>

              <div className="text-center text-xs text-[#777b86] pt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-[#17191c] hover:underline font-medium"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#777b86] mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#979799] absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="your-email@brightloop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] placeholder:text-[#979799] focus:outline-none focus:border-[#17191c] transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-[#777b86]">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#777b86] hover:text-[#17191c] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#979799] absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] placeholder:text-[#979799] focus:outline-none focus:border-[#17191c] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-[#17191c] hover:bg-black text-[#ffffff] font-medium text-xs rounded-full transition shadow-sm"
              >
                Sign In
              </button>

              <div className="text-center text-xs text-[#777b86] pt-2">
                Need an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#17191c] hover:underline font-medium"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {resetSent ? (
                <div className="p-5 bg-[#fafafb] rounded-[16px] border border-[#ececec] text-center space-y-2">
                  <CheckCircle2 className="w-7 h-7 text-[#17191c] mx-auto" />
                  <h4 className="font-serif text-base font-normal text-[#17191c]">Reset Email Dispatched</h4>
                  <p className="text-xs text-[#777b86] leading-relaxed">
                    We sent a secure password reset link to <strong className="text-[#17191c]">{email}</strong>. Check your inbox to choose a new password.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSent(false);
                      setMode('signin');
                    }}
                    className="mt-3 text-xs font-medium text-[#17191c] underline underline-offset-2 block mx-auto hover:text-black"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#777b86] mb-1">Registered Account Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#979799] absolute left-3.5 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="your-email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] placeholder:text-[#979799] focus:outline-none focus:border-[#17191c] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#17191c] hover:bg-black text-[#ffffff] font-medium text-xs rounded-full transition shadow-sm"
                  >
                    Send Reset Link
                  </button>

                  <div className="text-center text-xs text-[#777b86] pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-[#17191c] hover:underline font-medium"
                    >
                      Back to sign in
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
