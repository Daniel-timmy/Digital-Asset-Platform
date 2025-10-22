import React, { useState, useCallback } from "react";
import LoadingIndicator from "../components/LoadingIndicator";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER } from "../utils/constants";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const VerifyCode = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateCode = (code) => {
    const codeRegex = /^[a-zA-Z0-9]{6}$/;
    if (!code) return "Verification code is required";
    if (!codeRegex.test(code))
      return "Code must be exactly 6 letters or numbers";
    return "";
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCode(value);
    setErrors({ code: validateCode(value) });
    setApiError("");
    setSuccessMessage("");
  };

  const verify = async () => {
    const validationError = validateCode(code);
    if (validationError) {
      setErrors({ code: validationError });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/verify", { code });
      if (res.data.success) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        localStorage.setItem(USER, JSON.stringify(res.data.user));
        setSuccessMessage("Verification successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setApiError("Invalid verification code");
        setErrors({ code: "Invalid verification code" });
      }
    } catch (err) {
      console.error("Verification error:", err);
      setApiError(
        err.response?.data?.message ||
          "Failed to verify code. Please try again."
      );
      setErrors({ code: "Verification failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setIsLoading(true);
    try {
      await api.post("/auth/resend-code");
      setSuccessMessage("New code sent successfully!");
      setApiError("");
      setCode("");
      setErrors({});
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Resend code error:", err);
      setApiError(
        err.response?.data?.message ||
          "Failed to resend code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verify();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 relative z-10">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            Verify Your Account
          </h2>
          <p className="text-gray-600">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Messages */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm font-medium">{apiError}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {isLoading && (
          <div className="mb-6">
            <LoadingIndicator />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={handleInputChange}
              className={`w-full px-6 py-4 border-2 rounded-xl text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                errors.code
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 focus:border-transparent"
              }`}
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
              aria-invalid={errors.code ? "true" : "false"}
              aria-describedby={errors.code ? "code-error" : undefined}
            />
            {errors.code && (
              <p id="code-error" className="text-red-500 text-sm mt-2 font-medium">
                {errors.code}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading || !!errors.code}
          >
            {isLoading ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button
              onClick={resendCode}
              disabled={isLoading}
              className="text-black font-bold hover:underline disabled:opacity-50"
            >
              Resend Code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
