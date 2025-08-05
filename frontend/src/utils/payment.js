import api from "./api";

export const initialize_payment = async (id) => {
  try {
    const res = await api.post("/transactions/initialize-payment", { id });
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
