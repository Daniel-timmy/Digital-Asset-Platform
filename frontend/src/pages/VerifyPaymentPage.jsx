import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const VerifyPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying payment...");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      console.log("verifying");
      try {
        const response = await api.get(`/transactions/verify/${ref}`);
        const { status, message } = response.data;

        if (status === "success") {
          setStatus("Payment verified successfully!");
        } else {
          setStatus("Payment verification failed.");
          setError(message || "Unknown error.");
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setStatus("Error verifying payment.");
        setError("Failed to verify payment. Please try again.");
      }
    };

    verifyPayment();
    navigate("/dashboard");
  }, [searchParams]);
  return <div>Verifying...</div>;
};

export default VerifyPaymentPage;
// http://http//localhost:5173/verify-payment?trxref=707d65d0-3e64-4601-b703-0d5f6fbd7840&reference=707d65d0-3e64-4601-b703-0d5f6fbd7840
