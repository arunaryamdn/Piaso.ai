export const fetchFromBackend = async (endpoint: string) => {
  // Only call backend if portfolio is uploaded or endpoint is upload-portfolio
  if (!window.sessionStorage.getItem('portfolioUploaded') && endpoint !== 'api/upload-portfolio') {
    console.debug('Skipping backend call for', endpoint, 'because portfolio is not uploaded');
    return null;
  }
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