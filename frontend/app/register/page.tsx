"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/utils/auth";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const registrationData = {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      password,
    };

    try {
      const token = getAccessToken();
      const response = await fetch("http://127.0.0.1:8000/api/user/register/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      const data = await response.json();
      console.log("Registration successful:", data);
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={headingStyle}>Register</h1>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>Register</button>
        </form>
      </div>
      <div style={loginContainerStyle}>
        <h2 style={loginHeadingStyle}>Already have an account?</h2>
        <button onClick={() => router.push('/login')} style={loginButtonStyle}>Login</button>
      </div>
    </div>
  );
}

const containerStyle = {
  display: "flex",
  height: "100vh",
  backgroundColor: "#f7f7f7",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const formContainerStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};

const headingStyle = {
  marginBottom: "20px",
  fontSize: "2rem",
  color: "#333",
};

const formStyle = {
  display: "flex",
  flexDirection: "column" as const,
  width: "100%",
  maxWidth: "400px",
  padding: "20px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  borderRadius: "8px",
};

const inputStyle = {
  marginBottom: "15px",
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "1rem",
  backgroundColor: "#f9f9f9",
};

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#333",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background-color 0.3s ease",
};

const loginContainerStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  backgroundColor: "#e0e0e0",
};

const loginHeadingStyle = {
  marginBottom: "20px",
  fontSize: "1.5rem",
  color: "#333",
};

const loginButtonStyle = {
  padding: "12px",
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background-color 0.3s ease",
};