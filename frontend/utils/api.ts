import { getAccessToken, removeAccessToken } from "./auth";

export const BASE_URL = "127.0.0.1:8000/api";

export const API_BASE_URL = "http://" + BASE_URL;

export async function handleApiResponse(response: Response) {
  if (response.status === 401) {
    // Clear auth tokens
    removeAccessToken();
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

export const receiptsApi = API_BASE_URL + "/receipts/";
export const receiptsUploadApi = API_BASE_URL + "/receipts/upload/";
export const receiptsDetailApi = (id: number) =>
  API_BASE_URL + `/receipts/${id}/`;

export const groupsApi = API_BASE_URL + "/groups/";
export const groupsDetailApi = (id: number) => API_BASE_URL + `/groups/${id}/`;
export const groupsDeleteApi = (id: number) =>
  API_BASE_URL + `/groups/${id}/delete/`;
export const groupsMembersApi = (id: number) =>
  API_BASE_URL + `/groups/${id}/members/`;
export const groupsMembersDetailApi = (groupId: number, memberId: number) =>
  API_BASE_URL + `/groups/${groupId}/members/${memberId}/`;
export const groupsMembersLeaveApi = (groupId: number, memberId: number) =>
  API_BASE_URL + `/groups/${groupId}/members/${memberId}/leave/`;

export const userApi = API_BASE_URL + "/user/";
export const userLoginApi = API_BASE_URL + "/user/login/";
export const userLogoutApi = API_BASE_URL + "/user/logout/";
export const userRegisterApi = API_BASE_URL + "/user/register/";
export const userMeApi = API_BASE_URL + "/user/me/";
export const subscriptionsApi = API_BASE_URL + "/subscriptions/";
export const subscriptionsDetailApi = (id: number) =>
  API_BASE_URL + `/subscriptions/${id}/`;
export const insightsApi = API_BASE_URL + "/analytics/insights/";
export const insightsDetailApi = (period: string) =>
  API_BASE_URL + `/analytics/insights/${period}/`;
export const notificationsWS = (token: string) =>
  `ws://${BASE_URL}/ws/notifications/?token=${token}`;
export const notificationsDetailApi = (id: number) =>
  API_BASE_URL + `/notifications/${id}/`;
export const dashboardApi = API_BASE_URL + "/dashboard/";
export const costSplittingApi = (groupId: number, receiptId: number) => 
  `${API_BASE_URL}/groups/${groupId}/receipts/${receiptId}/cost-splits/`;
export const costSplittingDetailApi = (groupId: number, receiptId: number, splitId: number) => 
  `${API_BASE_URL}/groups/${groupId}/receipts/${receiptId}/cost-splits/${splitId}/`;
export const deleteGroupReceiptApi = (groupId: number, receiptId: number) =>
  `${API_BASE_URL}/groups/${groupId}/receipts/${receiptId}/delete/`;