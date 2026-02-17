import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Add your authentication logic here

    // Simulate API call

    await axios.post(`${apiBaseUrl}/api/auth/login`, { email: email, password: password })
      .then(response => {
        console.log("Login successful:", response.data);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          navigate('/dashboard');
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Login failed:", error);
        if (error.response?.data?.error?.code === "EMAIL_NOT_VERIFIED") {
          setError("Your email is not verified. Please check your inbox for the verification email.");
          setShowResendVerification(true);
        } else if (error.response?.data?.error?.message) {
          setError(error.response.data.error.message);
        } else {
          setError("Login failed. Please check your credentials and try again.");
        }
        setIsLoading(false);
      });

  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center px-4 py-2 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000"></div>
        <div className="absolute w-64 h-64 bg-blue-300/30 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 relative z-10 border border-blue-200/30">
        {/* Logo/Header */}
        <div className="text-center mb-5">
          <div className="relative inline-block mb-2">
            <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-50"></div>
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">PrintHub</h1>
          <p className="text-gray-600 text-sm font-medium">Student Xerox Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-blue-300"
                placeholder="student@pccoepune.org"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-blue-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
              <span className="ml-2 text-sm text-gray-600 group-hover:text-blue-600 transition">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline transition">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-blue-500/30"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : "Sign In"}
          </button>

          {/* Resend Verification Link */}
          {showResendVerification && (
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2 font-medium">
                Didn't receive the email?
              </p>
              <Link
                to="/resend-verification"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Resend Verification Email
              </Link>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white/95 text-gray-500 font-medium">New to PrintHub?</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <a href="/register" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline transition">
            <span>Create a student account</span>
            <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

        {/* Xerox Shop Link */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-600">
            Are you a xerox shop owner?{" "}
            <a href="/xeroxLogin" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition">
              Login to Shop Portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;