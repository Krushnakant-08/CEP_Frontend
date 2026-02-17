import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      // Prevent double execution in StrictMode
      if (hasVerified.current) return;
      hasVerified.current = true;

      if (!token) {
        setStatus("error");
        setError("No verification token provided");
        return;
      }

      try {
        const response = await axios.get(
          `${apiBaseUrl}/api/auth/verify-email?token=${token}`
        );

        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);
          // Redirect to login after 1 second
          setTimeout(() => {
            navigate("/login");
          }, 1000);
        }
      } catch (err) {
        setStatus("error");
        if (err.response?.data?.error) {
          setError(err.response.data.error.message);
        } else {
          setError("Failed to verify email. Please try again.");
        }
      }
    };

    verifyToken();
  }, [searchParams, apiBaseUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {/* Icon */}
          {status === "verifying" && (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
              <svg
                className="w-8 h-8 text-blue-600 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}

          {status === "success" && (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}

          {status === "error" && (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}

          {/* Messages */}
          {status === "verifying" && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600 mb-6">
                {message || "Your email has been successfully verified."}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to login page...
              </p>
              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h1>
              <p className="text-red-600 mb-6">
                {error || "Unable to verify your email address."}
              </p>
              <div className="space-y-3">
                <Link
                  to="/resend-verification"
                  className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Resend Verification Email
                </Link>
                <Link
                  to="/login"
                  className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
