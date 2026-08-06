// Khalti ePayment v2 — https://docs.khalti.com
const isProd = process.env.NODE_ENV === 'production';
const BASE_URL = isProd ? 'https://khalti.com/api/v2' : 'https://dev.khalti.com/api/v2';

export const isKhaltiConfigured = () => Boolean(process.env.KHALTI_SECRET_KEY);

const authHeaders = () => ({
  Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
  'Content-Type': 'application/json',
});

export const initiate = async ({ amount, purchaseOrderId, purchaseOrderName, customerInfo, returnUrl, websiteUrl }) => {
  const response = await fetch(`${BASE_URL}/epayment/initiate/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      return_url: returnUrl,
      website_url: websiteUrl,
      amount: Math.round(amount * 100), // Khalti expects paisa, not rupees
      purchase_order_id: purchaseOrderId,
      purchase_order_name: purchaseOrderName,
      customer_info: customerInfo,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || data?.error_key || 'Khalti payment initiation failed');
  }
  return data; // { pidx, payment_url, expires_at, expires_in }
};

// Server-to-server re-verification — never trust the redirect's query params alone.
export const lookup = async ({ pidx }) => {
  const response = await fetch(`${BASE_URL}/epayment/lookup/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ pidx }),
  });

  const raw = await response.json();
  return { success: raw?.status === 'Completed', raw };
};
