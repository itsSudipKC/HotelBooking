import crypto from 'crypto';

// eSewa ePay v2 — UAT (sandbox) and live hosts differ only by subdomain.
// https://developer.esewa.com.np
const isProd = process.env.NODE_ENV === 'production';
const FORM_URL = isProd
  ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
  : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const STATUS_URL = isProd
  ? 'https://epay.esewa.com.np/api/epay/transaction/status/'
  : 'https://rc.esewa.com.np/api/epay/transaction/status/';

export const isEsewaConfigured = () => Boolean(process.env.ESEWA_MERCHANT_CODE && process.env.ESEWA_SECRET);

const sign = (message) => crypto.createHmac('sha256', process.env.ESEWA_SECRET).update(message).digest('base64');

// Builds the field set the frontend auto-submits as a form POST to eSewa's
// payment page. eSewa redirects the browser back to success_url/failure_url
// with the outcome appended — see decodeCallbackData below.
export const buildPaymentForm = ({ amount, transactionUuid, successUrl, failureUrl }) => {
  const productCode = process.env.ESEWA_MERCHANT_CODE;
  const signedFieldNames = 'total_amount,transaction_uuid,product_code';
  const signature = sign(`total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${productCode}`);

  return {
    formUrl: FORM_URL,
    fields: {
      amount: String(amount),
      tax_amount: '0',
      total_amount: String(amount),
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: signedFieldNames,
      signature,
    },
  };
};

// eSewa appends `?data=<base64 JSON>` to success_url on completion.
export const decodeCallbackData = (data) => {
  try {
    return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
};

// Server-to-server re-verification — never trust the redirect's data param alone.
export const verifyTransaction = async ({ transactionUuid, totalAmount }) => {
  const productCode = process.env.ESEWA_MERCHANT_CODE;
  const url = `${STATUS_URL}?product_code=${encodeURIComponent(productCode)}&total_amount=${encodeURIComponent(
    totalAmount
  )}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;

  const response = await fetch(url);
  const raw = await response.json();
  return { success: raw?.status === 'COMPLETE', raw };
};
