/**
 * Currency utility helper for GhostFireHub.
 * Standard Rate: $1 USD = 1,500 NGN (Nigerian Naira)
 */

export const USD_TO_NGN_RATE = 1500;

export function formatPrice(usdAmount: number, country?: string): string {
  const cleanCountry = (country || '').trim().toLowerCase();
  
  if (cleanCountry === 'nigeria') {
    const nairaAmount = Math.round(usdAmount * USD_TO_NGN_RATE);
    // Format nicely e.g., ₦15,000 or ₦10,500
    return `₦${nairaAmount.toLocaleString('en-NG')}`;
  }
  
  // Default to US Dollars
  return `$${usdAmount.toFixed(2)}`;
}
