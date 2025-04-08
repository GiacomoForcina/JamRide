
export const stripeConfig = {
  publishableKey: "pk_test_51R93Z62LYJkUx1HaL7xPoEvvRQ61lFkMfaUYTtRiysZEIzKxFZxQLlSDgXf24HOCNgFmVBh36woROUd5uYBO5IAk00rR6jVPqh",
  priceId: "prod_S3A2Lo1mF0NTkI"
};

export const initializeStripePayment = async (priceId) => {
  const stripe = await loadStripe(stripeConfig.publishableKey);
  
  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    successUrl: `${window.location.origin}/payment-success`,
    cancelUrl: `${window.location.origin}/payment-cancelled`,
  });

  if (error) {
    console.error('Error:', error);
    throw new Error(error.message);
  }
};
