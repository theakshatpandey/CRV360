import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Shield, Lock, Mail, ArrowRight, Eye, EyeOff, Info, AlertCircle } from 'lucide-react';
import dsecureLogo from 'figma:asset/36f4d64fa4c9b3aebc52e3eabe544460f52ff23c.png';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email.trim().toLowerCase(),
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || 'Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      // Save to localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      localStorage.setItem('email', email.trim().toLowerCase());

      // Update AuthContext
      login({
        name: data.name,
        email: email.trim().toLowerCase(),
        role: data.role,
        isAuthenticated: true,
      });

      // FORCE redirect to dashboard (your context + state-based routing needs this)
      window.location.reload();
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please check if backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async (demoEmail: string, demoPassword: string, demoRole: string, demoName: string) => {
    setError('');
    setIsLoading(true);
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: demoEmail,
          password: demoPassword,
        }),
      });

      let data;
      if (response.ok) {
        data = await response.json();
      } else {
        // Fallback to demo mode if backend unreachable
        data = { access_token: 'demo-token', role: demoRole, name: demoName };
      }

      // Save to localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      localStorage.setItem('email', demoEmail);

      // Update AuthContext
      login({
        name: data.name,
        email: demoEmail,
        role: data.role,
        isAuthenticated: true,
      });

      // Force dashboard to appear
      window.location.reload();
    } catch (err) {
      // Even if backend is down, allow demo login
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('role', demoRole);
      localStorage.setItem('name', demoName);
      localStorage.setItem('email', demoEmail);

      login({
        name: demoName,
        email: demoEmail,
        role: demoRole,
        isAuthenticated: true,
      });

      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Password reset requested');
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT COLUMN - Brand Identity Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col w-full p-12 pt-16">
          <div className="mb-12">
            <img src={dsecureLogo} alt="DSecure" className="h-[75px] w-auto mb-1" />
            <p className="text-xs text-[#999999]">Powered by DSecure</p>
          </div>

          <div className="space-y-6 max-w-lg">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold text-[#0066FF] leading-tight">CRV 360</h1>
              <p className="text-lg font-bold text-[#0066FF]">Enterprise Cybersecurity Command Center</p>
            </div>

            <p className="text-sm text-[#666666] leading-relaxed">
              Gain a 360° vision into your organization's cyber risk posture — powered by AI-driven analytics and DSecure intelligence.
            </p>

            <div className="space-y-2.5">
              {[
                'Real-time threat detection & response',
                'Comprehensive compliance tracking',
                'AI-powered risk analytics'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#0066FF]"></div>
                  <span className="text-sm text-[#666666]">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Login Form Panel */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          <div className="lg:hidden flex flex-col items-center space-y-1 mb-8">
            <img src={dsecureLogo} alt="DSecure" className="h-10 w-auto" />
            <p className="text-xs text-[#999999]">Powered by DSecure</p>
          </div>

          <div className="space-y-1 text-center">
            <h2 className="text-3xl font-bold text-[#0066FF]">Welcome Back</h2>
            <p className="text-sm font-bold text-[#666666]">Sign in to your CRV 360 account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-[#333333]">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-12 bg-white border-gray-300 focus:border-[#0066FF] focus:ring-[#0066FF] text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-[#333333]">Password</Label>
                <button type="button" onClick={handleForgotPassword} className="text-sm text-[#0066FF] hover:text-[#0052CC]">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-10 h-12 bg-white border-gray-300 focus:border-[#0066FF] focus:ring-[#0066FF] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#666666]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-50 border border-red-200 rounded-lg py-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <AlertDescription className="text-sm text-red-800">{error}</AlertDescription>
                </div>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white transition-all duration-300 shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="flex items-start space-x-2 px-1">
              <Info className="h-4 w-4 text-[#0066FF] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#666666] leading-relaxed">
                Your dashboard and module access will adjust automatically based on your assigned role (Admin, CISO, Analyst).
              </p>
            </div>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-[#999999]">OR</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-[#F8FBFF] to-white space-y-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-[#0066FF]" />
              <h4 className="text-sm text-[#333333]">Demo Access</h4>
            </div>

            <div className="space-y-3">
              <div
                className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:border-[#0066FF] transition-colors cursor-pointer group"
                onClick={() => handleDemoAccess('admin@crv360.dsecure', 'admin@123', 'Admin', 'Admin User')}
              >
                <div className="flex items-center space-x-3">
                  <div className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-md">Admin</div>
                  <div className="text-sm">
                    <span className="text-[#333333]">admin@crv360.dsecure</span>
                    <span className="text-[#999999] mx-1.5">/</span>
                    <span className="text-[#666666]">admin@123</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#999999] group-hover:text-[#0066FF] transition-colors" />
              </div>

              <div
                className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:border-[#0066FF] transition-colors cursor-pointer group"
                onClick={() => handleDemoAccess('ciso@crv360.dsecure', 'admin@123', 'CISO', 'CISO User')}
              >
                <div className="flex items-center space-x-3">
                  <div className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">CISO</div>
                  <div className="text-sm">
                    <span className="text-[#333333]">ciso@crv360.dsecure</span>
                    <span className="text-[#999999] mx-1.5">/</span>
                    <span className="text-[#666666]">admin@123</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#999999] group-hover:text-[#0066FF] transition-colors" />
              </div>

              <div
                className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:border-[#0066FF] transition-colors cursor-pointer group"
                onClick={() => handleDemoAccess('analyst@crv360.dsecure', 'admin@123', 'Analyst', 'Analyst User')}
              >
                <div className="flex items-center space-x-3">
                  <div className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-md">Analyst</div>
                  <div className="text-sm">
                    <span className="text-[#333333]">analyst@crv360.dsecure</span>
                    <span className="text-[#999999] mx-1.5">/</span>
                    <span className="text-[#666666]">admin@123</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#999999] group-hover:text-[#0066FF] transition-colors" />
              </div>
            </div>

            <p className="text-xs text-[#999999] text-center pt-2">
              Click any credential to auto-login
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-[#999999] pt-2">
            <Shield className="h-3 w-3" />
            <span>Secured by DSecure</span>
            <div className="w-1 h-1 bg-[#999999] rounded-full"></div>
            <span>ISO 27001 Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
}