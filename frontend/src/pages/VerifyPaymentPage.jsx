import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";

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
    <div className="flex items-center justify-center h-[100vh] w-[100vw] text-4xl">
      Verifying Payment... Do not close page.
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
};

export default VerifyPaymentPage;
// http://http//localhost:5173/verify-payment?trxref=707d65d0-3e64-4601-b703-0d5f6fbd7840&reference=707d65d0-3e64-4601-b703-0d5f6fbd7840
