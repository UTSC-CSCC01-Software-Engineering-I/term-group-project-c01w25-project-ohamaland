"use client";

import { useState } from "react";
import { getAccessToken } from "@/utils/auth";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Button, Container, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import Image from "next/image";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <Box sx={outerBoxStyle}>
      {/* Already have an account? */}
      <Box sx={headerStyle}>
        <Typography
          variant="body2"
          sx={{ textAlign: 'right' }}
        >
          Already have an account? <a href="/login" style={{ color: '#1E90FF' }}>Sign in &rarr;</a>
        </Typography>
      </Box>

      {/* Register form */}
      <Container
        maxWidth='sm'
      >
        <Image src="/catalog.png" width={90} height={90} alt={""} />
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold' }}>
          Sign up on Catalog
        </Typography>
        <Typography
          sx={{ color: 'text.secondary' }}>
          Create a free account to get started.
        </Typography>
        <TextField
          label="Username"
          fullWidth
          required
          size="small"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={textFieldStyle}
        />
        
        {/* First Name and Last Name */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            width: '100%'
          }}
        >
          <TextField
            label="First Name"
            required
            size="small"
            margin="normal"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            sx={nameFieldStyle}
          />
          <TextField
            label="Last Name"
            required
            size="small"
            margin="normal"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            sx={nameFieldStyle}
          />
        </Box>
        <TextField
          label="Email Address"
          fullWidth
          required
          size="small"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={textFieldStyle}
        />
        <TextField
          label="Password"
          fullWidth
          required
          helperText="Passwords must be at least 8 characters long."
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
        <TextField
          label="Confirm Password"
          fullWidth
          required
          size="small"
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          Continue
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            width="16"
            height="16"
          >
            <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path>
          </svg>
        </Button>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', marginTop: 2 }}>
          By creating an account, you agree to the <a href="/policy" style={{ textDecoration: 'underline', color: '#1E90FF' }}>Terms of Service</a>. For more information about Catalog's privacy practices, see the <a href="/privacy" style={{ textDecoration: 'underline', color: '#1E90FF' }}>Catalog Privacy Statement</a>. We'll occasionally send you account-related emails.
        </Typography>
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

const nameFieldStyle = {
  flex: 1,
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
  boxShadow: 'none', // Remove the shadow
  '&:hover': {
    backgroundColor: '#F5D21A',
  }
}