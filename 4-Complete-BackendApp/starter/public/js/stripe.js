/* eslint-disable no-undef */
import axios from 'axios';
import { showAlert } from './alerts.js';
const stripe = Stripe('publishable_api_key_placeholder');

export const bookTour = async (tourId) => {
  try {
    // 1. Get checkout session from API endpoint
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2. Create checkout form & charge credit card form
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
