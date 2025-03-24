import { getAccessToken, removeAccessToken } from "./auth";

export async function handleApiResponse(response: Response) {
  if (response.status === 401) {
    // Clear auth tokens
    removeAccessToken();
    // Redirect to login
    window.location.href = "/login";
    return null;
  }
  return response;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`
  };

  const response = await fetch(url, { ...options, headers });
  return handleApiResponse(response);
}
