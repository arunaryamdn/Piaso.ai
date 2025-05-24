export const fetchFromBackend = async (endpoint: string) => {
  // Always allow backend calls. Do not block based on sessionStorage flag.
  // The 'portfolioUploaded' flag can still be used for UI hints elsewhere if needed.
  console.debug('Fetching from backend:', endpoint);
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    console.error('Network response was not ok:', response.status, response.statusText);
    throw new Error('Network response was not ok');
  }
  const json = await response.json();
  console.debug('Received data:', json);
  return json;
};