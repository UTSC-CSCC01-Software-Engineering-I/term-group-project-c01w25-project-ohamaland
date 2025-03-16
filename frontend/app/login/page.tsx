"use client";

import { getAccessToken } from "@/utils/auth";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Button, Container, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import Image from "next/image";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <Box sx={outerBoxStyle}>
      {/* Create an account */}
      <Box sx={headerStyle}>
        <Typography
          variant="body2"
          sx={{ textAlign: 'right' }}
        >
          New to Catalog? <a href="/login" style={{ color: '#1E90FF' }}>Create an account</a>
        </Typography>
      </Box>

      {/* Register form */}
      <Container
        maxWidth='xs'
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Image src="/catalog.png" width={90} height={90} alt={""} />
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold' }}
        >
          Sign in to <span style={{color: "#E2C00A"}}>Catalog</span>
        </Typography>
        <TextField
          label="Username"
          fullWidth
          size="small"
          margin="normal"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          sx={textFieldStyle}
        />
        <TextField
          label="Password"
          fullWidth
          size="small"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
          sx={textFieldStyle}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          fullWidth
          color="primary"
          onClick={handleSubmit}
          sx={continueButtonStyle}
        >
          Sign in
        </Button>
      </Container>
    </Box>
  );
}

const outerBoxStyle = {
  bgcolor: 'white',
  display: 'flex',
  flexDirection: 'column',
}

const headerStyle = {
  padding: 3,
  paddingRight: 5,
}

const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E2C00A',
    }
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#E2C00A',
  }
}

const continueButtonStyle = {
  marginTop: 2,
  borderRadius: 2,
  height: 50,
  textTransform: 'none',
  fontWeight: 'bold',
  fontSize: 18,
  backgroundColor: '#E2C00A',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#F5D21A',
  }
}