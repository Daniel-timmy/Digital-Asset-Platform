import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";
import LoadingIndicator from "../components/LoadingIndicator";

const VerifyPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying payment...");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    const ref = searchParams.get("reference");
    const trxref = searchParams.get("trxref");

    if (!ref) {
      setStatus("Error: No reference provided.");
      setError("Missing payment reference.");
      return;
    }

    // Verify payment with backend
    const verifyPayment = async () => {
      try {
        const response = await api.get(`/transactions/verify/${ref}`);
        const { status, message } = response.data;

        if (status === "success") {
          navigate("/dashboard");
          setStatus("Payment verified successfully!");
        } else {
          setStatus("Payment verification failed.");
          setError(message || "Unknown error.");
        }
      } catch (err) {
        setStatus("Error verifying payment.");
        setError("Failed to verify payment. Please try again.");
        setToast({
          show: true,
          message: "Failed to verify payment. Please try again.",
          type: "error",
        });
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}

      <div className="relative z-10 text-center px-6 max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-black to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        {/* Status Message */}
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          {error ? "Payment Failed" : "Verifying Payment"}
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          {error || "Please wait while we confirm your transaction..."}
        </p>

        {/* Loading Indicator */}
        {!error && (
          <div className="mb-8">
            <LoadingIndicator />
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-left">
              <p className="font-bold text-yellow-900 mb-1">Important</p>
              <p className="text-sm text-yellow-800">
                Please do not close this page or refresh your browser while we verify your payment.
              </p>
            </div>
          </div>
        </div>

        {/* Error Actions */}
        {error && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/stock")}
              className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold border-2 border-gray-200 hover:border-black transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPaymentPage;