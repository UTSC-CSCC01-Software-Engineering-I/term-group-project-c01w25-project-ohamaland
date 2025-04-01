import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  user_id: number;
  username: string;
  exp: number; // expiration timestamp
}

export function getCurrentUser(): { user_id: number; username: string } | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      user_id: decoded.user_id,
      username: decoded.username
    };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

export function getAccessToken() {
  return Cookies.get("accessToken");
}

export function setAccessToken(token: string) {
  Cookies.set("accessToken", token, {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
}

export function getRefreshToken() {
  return Cookies.get("refreshToken");
}

export function setRefreshToken(token: string) {
  Cookies.set("refreshToken", token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
}

export function removeAccessToken() {
  Cookies.remove("accessToken");
}

export function removeRefreshToken() {
  Cookies.remove("refreshToken");
}

export function isAuthenticated() {
  const token = getAccessToken();
  return !!token;
}

export function logout() {
  removeAccessToken();
  removeRefreshToken();
  window.location.href = "/login";
}
