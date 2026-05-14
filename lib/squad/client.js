const SQUAD_BASE_URL = process.env.NEXT_PUBLIC_SQUAD_ENV === 'production' 
  ? 'https://api-d.squadco.com' 
  : 'https://sandbox-api-d.squadco.com';

const getSquadHeaders = () => {
  const apiKey = process.env.SQUAD_SECRET_KEY;
  if (!apiKey) {
    throw new Error('SQUAD_SECRET_KEY is not defined in environment variables');
  }

  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Base method to make requests to the Squad API.
 * @param {string} endpoint - The API endpoint (e.g., '/transaction/initiate')
 * @param {object} options - Fetch options including method, body, etc.
 * @returns {Promise<any>} The JSON response from the API
 */
export async function squadFetch(endpoint, options = {}) {
  const url = `${SQUAD_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getSquadHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Squad API Error:', data);
    throw new Error(data.message || 'An error occurred with the Squad API');
  }

  return data;
}
