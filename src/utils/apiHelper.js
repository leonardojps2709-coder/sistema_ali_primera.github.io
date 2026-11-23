// src/utils/apiHelper.js
/**
 * Helper module for performing HTTP requests using the Fetch API.
 * Provides a consistent interface for GET, POST, PUT and DELETE operations.
 * All calls return a promise that resolves with the parsed JSON response
 * (or raw text if JSON parsing fails) and will reject on network errors.
 */

export async function request(url, method = 'GET', data = null, headers = {}) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'same-origin', // include cookies for session auth
  };

  if (data !== null) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  const contentType = response.headers.get('content-type') || '';
  let result;
  if (contentType.includes('application/json')) {
    result = await response.json();
  } else {
    result = await response.text();
  }
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.response = response;
    error.data = result;
    throw error;
  }
  return result;
}

export const get = (url, params = {}, headers = {}) => {
  const query = new URLSearchParams(params).toString();
  const finalUrl = query ? `${url}?${query}` : url;
  return request(finalUrl, 'GET', null, headers);
};

export const post = (url, body, headers = {}) => request(url, 'POST', body, headers);
export const put = (url, body, headers = {}) => request(url, 'PUT', body, headers);
export const del = (url, params = {}, headers = {}) => {
  const query = new URLSearchParams(params).toString();
  const finalUrl = query ? `${url}?${query}` : url;
  return request(finalUrl, 'DELETE', null, headers);
};
