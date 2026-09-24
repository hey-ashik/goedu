const env = require('../config/env');

/**
 * SSLCommerz hosted checkout (v4 API).
 * Docs: https://developer.sslcommerz.com/doc/v4/
 *
 *  1. initPayment()  -> returns GatewayPageURL, the customer is redirected there
 *  2. SSLCommerz POSTs to success_url / fail_url / cancel_url (and ipn_url)
 *  3. validate(val_id) -> confirms the transaction server-side before fulfilment
 */
const baseUrl = () => (env.sslcommerz.sandbox ? 'https://sandbox.sslcommerz.com' : 'https://securepay.sslcommerz.com');

async function initPayment({ order, user, siteUrl, apiUrl, productName }) {
  const form = new URLSearchParams({
    store_id: env.sslcommerz.storeId,
    store_passwd: env.sslcommerz.storePassword,
    total_amount: Number(order.total).toFixed(2),
    currency: 'BDT',
    tran_id: order.order_number,
    success_url: `${apiUrl}/payments/sslcommerz/success`,
    fail_url: `${apiUrl}/payments/sslcommerz/fail`,
    cancel_url: `${apiUrl}/payments/sslcommerz/cancel`,
    ipn_url: `${apiUrl}/payments/sslcommerz/ipn`,
    shipping_method: 'NO',
    product_name: (productName || 'GoEdu course').slice(0, 250),
    product_category: 'Online Course',
    product_profile: 'non-physical-goods',
    cus_name: (user.name || 'GoEdu Learner').slice(0, 50),
    cus_email: user.email,
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    cus_phone: user.phone || '01700000000',
    value_a: String(order.id),
    value_b: siteUrl,
  });
  const resp = await fetch(`${baseUrl()}/gwprocess/v4/api.php`, { method: 'POST', body: form });
  const data = await resp.json().catch(() => ({}));
  if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
    throw new Error(data.failedreason || 'SSLCommerz could not start the payment session');
  }
  return { gatewayUrl: data.GatewayPageURL, sessionKey: data.sessionkey };
}

async function validate(valId) {
  const url = `${baseUrl()}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(env.sslcommerz.storeId)}&store_passwd=${encodeURIComponent(env.sslcommerz.storePassword)}&format=json`;
  const resp = await fetch(url);
  const data = await resp.json().catch(() => ({}));
  return { valid: data.status === 'VALID' || data.status === 'VALIDATED', data };
}

module.exports = { initPayment, validate, enabled: () => env.sslcommerz.enabled };
