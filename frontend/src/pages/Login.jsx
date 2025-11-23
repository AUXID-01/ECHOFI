import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_API } from "../api/backend";


import {
  Mic,
  ArrowLeft,
  Shield,
  CheckCircle,
  Mail,
  Smartphone,
  User,
} from 'lucide-react';

// const API = "http://localhost:8000/api/v1";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phoneForOtp, setPhoneForOtp] = useState("");   // <-- IMPORTANT FIX
  const [code, setCode] = useState("");
  const [stage, setStage] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Utility: detect phone-like identifier
  const extractPhone = (value) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    return cleaned.length >= 10 ? cleaned : null;
  };

  // ---------------------------------------
  // STEP 1 — SEND OTP
  // ---------------------------------------
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_API}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to send OTP");
      } else {
        // ------------------------------
        // STORE PHONE USED BY BACKEND
        // ------------------------------
        const phone = extractPhone(identifier);
        if (!phone) {
          setError("Identifier must be a valid phone for OTP verification.");
          setIsLoading(false);
          return;
        }
        setPhoneForOtp(phone);
        setStage("otp");
      }
    } catch (err) {
      setError("Network error");
    }

    setIsLoading(false);
  };

  // ---------------------------------------
  // STEP 2 — VERIFY OTP → LOGIN
  // ---------------------------------------
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (code.length < 4) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneForOtp,   // <-- FIXED
          code: code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Invalid OTP");
      } else {
        localStorage.setItem("token", data.access_token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Network error");
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    if (stage === "otp") {
      setStage("user");
      setCode("");
      return;
    }
    navigate("/");
  };

  const goToRegister = () => navigate("/register");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Back */}
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl mb-4">
              <Mic className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {stage === "user" ? "Welcome Back" : "Verify Identity"}
            </h1>

            <p className="text-gray-600">
              {stage === "user"
                ? "Enter your login details"
                : `OTP sent to ${phoneForOtp}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-center font-semibold">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {stage === "user" && (
            <form onSubmit={handleUserSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username, Email or Phone
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-xl"
                    placeholder="Enter email / username / phone"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl"
              >
                {isLoading ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {stage === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  One-Time Password
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-xl text-center text-2xl tracking-widest"
                    placeholder="••••"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length < 4}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl"
              >
                {isLoading ? "Verifying..." : "Verify & Log In"}
              </button>
            </form>
          )}

          <div className="mt-6 flex flex-col items-center">
            <span className="text-sm text-gray-600 mb-2">New here?</span>
            <button
              type="button"
              onClick={goToRegister}
              className="w-full py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-semibold shadow"
            >
              Create an account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
