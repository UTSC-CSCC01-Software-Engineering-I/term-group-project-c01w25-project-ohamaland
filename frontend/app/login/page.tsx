"use client";

import { getAccessToken } from "@/utils/auth";
import { getActiveElement } from "@mui/x-date-pickers/internals";
import { useState } from "react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginData = {
      identifier,
      password,
    };

    try {
      const token = getAccessToken();
      const response = await fetch("http://127.0.0.1:8000/api/user/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      const data = await response.json();
      console.log("Login successful:", data);

      // Store tokens in local storage
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      // Redirect to dashboard or another page
      window.location.href = "/receipts";
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Login</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          placeholder="Email or Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
    </div>
  );
}

const containerStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundColor: "#f0f0f0",
};

const headingStyle = {
  marginBottom: "20px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column" as const,
  width: "300px",
};

const inputStyle = {
  marginBottom: "10px",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const buttonStyle = {
  padding: "10px",
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const buttonHoverStyle = {
  backgroundColor: "#005bb5",
};