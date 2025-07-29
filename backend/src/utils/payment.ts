import axios from 'axios'
import { PAYSTACK_SECRET_KEY } from "../config/env";

// Function to verify payment
export async function verifyPayment(reference: String) {
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Error verifying payment');
  }
}