"use client";

import { background, brand, error as errorColors } from "@/styles/colors";
import { userLoginApi } from "@/utils/api";
import { getAccessToken, setAccessToken } from "@/utils/auth";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from "@mui/material";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface LoginError {
  message: string;
  type: "auth" | "network" | "server";
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If already authenticated, redirect to receipts
    if (getAccessToken()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const loginData = {
      identifier,
      password
    };

    try {
      const response = await fetch(userLoginApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          setError({
            message: "Incorrect username or password. Please try again.",
            type: "auth"
          });
        } else if (response.status === 400) {
          setError({
            message: "Please check your input and try again.",
            type: "auth"
          });
        } else {
          setError({
            message: "An error occurred. Please try again later.",
            type: "server"
          });
        }
        return;
      }

      // Store access token in cookie
      setAccessToken(data.access);

      // Redirect to the original requested page or receipts
      const from = searchParams.get("from") || "/dashboard";
      router.push(from);
    } catch (error) {
      setError({
        message:
          "Unable to connect to the server. Please check your internet connection.",
        type: "network"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorColor = (type: LoginError["type"]) => {
    switch (type) {
      case "auth":
        return errorColors.dark;
      case "network":
        return errorColors.warning;
      case "server":
        return errorColors.dark;
      default:
        return errorColors.dark;
    }
  };

  const getErrorBackground = (type: LoginError["type"]) => {
    switch (type) {
      case "auth":
        return errorColors.light;
      case "network":
        return errorColors.warningLight;
      case "server":
        return errorColors.light;
      default:
        return errorColors.light;
    }
  };

  return (
    <Box sx={outerBoxStyle}>
      {/* Create an account */}
      <Box sx={headerStyle}>
        <Typography variant="body2" sx={{ textAlign: "right" }}>
          New to Catalog?{" "}
          <a href="/register" style={{ color: brand.secondary }}>
            Create an account
          </a>
        </Typography>
      </Box>

      {/* Register form */}
      <Container
        maxWidth="xs"
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Image src="/catalog.png" width={90} height={90} alt={""} />
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Sign in to{" "}
          <span
            style={{ color: brand.primary }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = brand.primaryHover)
            }
            onMouseLeave={(e) => (e.currentTarget.style.color = brand.primary)}
          >
            Catalog
          </span>
        </Typography>

        {error && (
          <Box
            sx={{
              bgcolor: getErrorBackground(error.type),
              height: "auto",
              minHeight: "50px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              padding: "12px 20px",
              borderRadius: 2,
              marginTop: 2,
              marginBottom: 1
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: getErrorColor(error.type) }}
            >
              {error.message}
            </Typography>
            <IconButton
              size="small"
              sx={{
                marginLeft: "auto",
                color: getErrorColor(error.type),
                padding: "2px",
                "& .MuiSvgIcon-root": {
                  fontSize: "19px"
                }
              }}
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <TextField
          label="Username"
          fullWidth
          size="small"
          margin="normal"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={isLoading}
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
          disabled={isLoading}
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
            )
          }}
        />
        <Button
          variant="contained"
          fullWidth
          color="primary"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={continueButtonStyle}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Sign in"
          )}
        </Button>
      </Container>
    </Box>
  );
}

const outerBoxStyle = {
  bgcolor: background.white,
  display: "flex",
  flexDirection: "column"
};

const headerStyle = {
  padding: 3,
  paddingRight: 5
};

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: brand.primary
    }
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: brand.primary
  }
};

const continueButtonStyle = {
  marginTop: 2,
  borderRadius: 2,
  height: 50,
  textTransform: "none",
  fontWeight: "bold",
  fontSize: 18,
  backgroundColor: brand.primary,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: brand.primaryHover
  },
  "&.Mui-disabled": {
    backgroundColor: brand.primary,
    opacity: 0.7
  }
};
