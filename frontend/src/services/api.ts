export const fetchFromBackend = async (endpoint: string) => {
  const response = await fetch(`http://localhost:8000/${endpoint}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};