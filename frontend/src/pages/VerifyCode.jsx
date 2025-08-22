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
    <div className="p-6 flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Verify Your Account
        </h2>
        {apiError && <p className="text-red-500 text-sm mb-4">{apiError}</p>}
        {successMessage && (
          <p className="text-green-500 text-sm mb-4">{successMessage}</p>
        )}
        {isLoading && <LoadingIndicator />}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                errors.code ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter 6-digit code"
              maxLength={6}
              disabled={isLoading}
              aria-invalid={errors.code ? "true" : "false"}
              aria-describedby={errors.code ? "code-error" : undefined}
            />
            {errors.code && (
              <p id="code-error" className="text-red-500 text-sm mt-1">
                {errors.code}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition disabled:bg-gray-400"
              disabled={isLoading || !!errors.code}
            >
              Verify
            </button>
            {/* <button
              type="button"
              onClick={resendCode}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition disabled:bg-gray-400"
              disabled={isLoading}
            >
              Resend Code
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyCode;
