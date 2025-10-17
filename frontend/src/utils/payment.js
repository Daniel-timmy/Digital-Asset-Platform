import api from "./api";

export const initialize_payment = async (assetIds) => {
  try {
    const res = await api.post("/transactions/initialize-payment", {
      assetIds,
    });
    const authorizationUrl = res.data.authorization_url;
    if (authorizationUrl) {
      window.location.href = authorizationUrl;
    } else {
      console.error("No authorization URL returned from API");
      alert("Failed to initialize payment: No authorization URL provided.");
    }
  } catch (error) {
    console.error("Error initializing payment:", error);
    alert("Failed to initialize payment. Please try again.");
  }
};

export const verify_payment = async (ref) => {
  console.log("verifying");
  try {
    const response = await api.get(`/transactions/verify/${ref}`);
    console.log("Response from verification:", response);
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
