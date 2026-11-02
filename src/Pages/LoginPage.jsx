import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Fade,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  keyframes,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";
import {
  BRAND,
  BRAND_DARK,
  Logo,
  globalStyles,
} from "../Components/BrandShell";
import { ROLE_HOME, useAuth } from "../Auth/authContext";
import { loginRequest, requestPassword } from "../Api/authApi";

const ACCOUNT_TYPES = [
  { value: "dealer", title: "Dealer" },
  { value: "oem", title: "OEM" },
  { value: "frontdesk", title: "Front Desk" },
];

/* What the user sees in "Opening …" for each account type */
const DESTINATION_LABEL = {
  dealer: "Service Ticket",
  oem: "Service Ticket",
  frontdesk: "Front Desk",
};

const RESEND_SECONDS = 30;
const REDIRECT_MS = 2400; // how long the welcome animation plays before opening the page
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const maskEmail = (email) => {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "#fff",
    "& fieldset": { borderColor: "#d7e0ea" },
    "&:hover fieldset": { borderColor: "#9fb2c5" },
    "&.Mui-focused fieldset": { borderColor: BRAND, borderWidth: 2 },
    "&.Mui-disabled": { bgcolor: "#f4f7fa" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: BRAND },
  "& .MuiInputBase-input": { fontSize: 16, py: 1.2 }, // 16px stops iPhones zooming in on focus
};

/* ---------- Welcome / redirect animation ---------- */
const ripple = keyframes`0% { transform: scale(1); opacity: .45; } 100% { transform: scale(2.2); opacity: 0; }`;
const spinKf = keyframes`to { transform: rotate(360deg); }`;
const fadeUp = keyframes`from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; }`;
const popIn = keyframes`0% { opacity: 0; transform: scale(.7); } 70% { transform: scale(1.06); } 100% { opacity: 1; transform: scale(1); }`;
const fillBar = keyframes`from { transform: scaleX(0); } to { transform: scaleX(1); }`;

function RedirectOverlay({ name, destination, duration }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), duration * 0.5);
    return () => clearTimeout(t);
  }, [duration]);

  const size = { xs: 112, sm: 136 };
  return (
    <Fade in appear timeout={350}>
      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: (t) => t.zIndex.modal + 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#fff",
          px: 3,
          pt: "env(safe-area-inset-top)",
          pb: "env(safe-area-inset-bottom)",
          background: `radial-gradient(circle at 50% 38%, #0b4f8f 0%, ${BRAND} 45%, ${BRAND_DARK} 100%)`,
          "@media (prefers-reduced-motion: reduce)": {
            "& *": { animation: "none !important" },
          },
        }}
      >
        {/* Logo with ripple rings and a spinning arc */}
        <Box
          sx={{
            position: "relative",
            width: size,
            height: size,
            display: "grid",
            placeItems: "center",
            mb: { xs: 3.5, sm: 4.5 },
          }}
        >
          {[0, 0.9].map((delay) => (
            <Box
              key={delay}
              aria-hidden
              sx={{
                position: "absolute",
                inset: "18%",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,.7)",
                animation: `${ripple} 2.2s ${delay}s ease-out infinite`,
              }}
            />
          ))}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,.16)",
              borderTopColor: "#fff",
              animation: `${spinKf} 1.1s linear infinite`,
            }}
          />
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 3,
              p: 0.9,
              lineHeight: 0,
              boxShadow: "0 10px 30px rgba(0,0,0,.3)",
              animation: `${popIn} .6s ease both`,
            }}
          >
            <Logo height={{ xs: 50, sm: 62 }} sx={{ borderRadius: 1.5 }} />
          </Box>
        </Box>

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: 24, sm: 30 },
            lineHeight: 1.2,
            animation: `${fadeUp} .6s .15s ease both`,
            maxWidth: 420,
            overflowWrap: "anywhere",
          }}
        >
          Welcome, {name}
        </Typography>
        <Typography
          key={phase}
          sx={{
            mt: 1,
            fontSize: { xs: 14.5, sm: 16.5 },
            opacity: 0.85,
            animation: `${fadeUp} .45s ease both`,
          }}
        >
          {phase === 0 ? "Signing you in securely…" : `Opening ${destination}…`}
        </Typography>

        <Box
          sx={{
            mt: 4,
            width: "min(280px, 70vw)",
            height: 5,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,.2)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              bgcolor: "#fff",
              borderRadius: 3,
              transformOrigin: "left",
              animation: `${fillBar} ${duration}ms cubic-bezier(.4,0,.2,1) forwards`,
            }}
          />
        </Box>
      </Box>
    </Fade>
  );
}

function AccountSwitch({ value, disabled, onChange, error }) {
  return (
    <Box>
      <Typography
        component="label"
        sx={{
          display: "block",
          fontSize: 13.5,
          fontWeight: 700,
          color: "#3b4b5c",
          mb: 1,
        }}
      >
        Account type
      </Typography>
      <Box
        role="radiogroup"
        aria-label="Account type"
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0.5,
          p: 0.4,
          bgcolor: "#eef3f8",
          borderRadius: 2,
          border: error ? "1px solid #d32f2f" : "1px solid transparent",
        }}
      >
        {ACCOUNT_TYPES.map((option) => {
          const selected = value === option.value;
          return (
            <Box
              key={option.value}
              component="label"
              sx={{
                position: "relative",
                textAlign: "center",
                py: { xs: 1.25, sm: 1 },
                px: 0.5,
                borderRadius: 1.5,
                fontWeight: 700,
                fontSize: { xs: 13, sm: 13.5 },
                lineHeight: 1.2,
                cursor: disabled ? "default" : "pointer",
                userSelect: "none",
                transition: "all .18s ease",
                color: selected ? "#fff" : "#5b6b7c",
                bgcolor: selected ? BRAND : "transparent",
                opacity: disabled && !selected ? 0.55 : 1,
                "&:hover": { bgcolor: selected ? BRAND_DARK : "#e2ebf3" },
                "&:focus-within": {
                  outline: `3px solid ${BRAND}55`,
                  outlineOffset: 1,
                },
              }}
            >
              <input
                type="radio"
                name="accountType"
                value={option.value}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  margin: 0,
                  cursor: "inherit",
                }}
              />
              {option.title}
            </Box>
          );
        })}
      </Box>
      {error && (
        <Typography sx={{ color: "#d32f2f", fontSize: 12.5, mt: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [stage, setStage] = useState("details"); // details | password
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [redirecting, setRedirecting] = useState(null); // { name, destination } while the welcome animation plays

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (user) return <Navigate to={ROLE_HOME[user.accountType] || "/"} replace />;

  const locked = stage === "password";

  const clearError = (key) => {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setApiError("");
  };

  const payload = {
    accountType,
    username: username.trim(),
    email: email.trim(),
  };

  const validateDetails = () => {
    const next = {};
    if (!accountType) next.accountType = "Please select your account type";
    if (username.trim().length < 3) next.username = "Enter your username";
    if (!EMAIL_RE.test(email.trim()))
      next.email = "Enter a valid email address";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const sendPassword = async () => {
    setBusy(true);
    setApiError("");

    try {
      const response = await requestPassword(payload);

      const existing =
        response?.exisiting === true || response?.data?.exisiting === true;

      if (existing) {
        await doLoginWithoutPassword();
        return;
      }

      // New user: show password field
      setStage("password");
      setPassword("");
      setCooldown(RESEND_SECONDS);
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to send password. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const doLoginWithoutPassword = async () => {
    setBusy(true);
    setApiError("");

    try {
      const response = await requestPassword({
        ...payload,
        password: "",
        existing: true,
      });

      if (response?.success !== true) {
        setApiError(
          response?.message || "Unable to sign in. Please try again.",
        );
        setBusy(false);
        return;
      }

      // Use the account type selected by the user
      const selectedType = accountType;

      const session = {
        user: {
          name: username || response?.data?.email,
          username: username,
          email: response?.data?.email || email,
          accountType: selectedType,
        },
        ...response,
      };

      setRedirecting({
        name: session.user.name || session.user.username,
        destination: DESTINATION_LABEL[selectedType] || "your dashboard",
      });

      await sleep(REDIRECT_MS);

      login(session);

      navigate(ROLE_HOME[selectedType] || "/", { replace: true });
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to sign in. Please try again.",
      );
      setBusy(false);
    }
  };
  const doLogin = async () => {
    if (!password.trim()) {
      setErrors({ password: "Enter the password sent to your email" });
      return;
    }

    setBusy(true);
    setApiError("");

    try {
      const session = await loginRequest({
        ...payload,
        password: password.trim(),
      });

      const type = session?.user?.accountType;

      if (!type) {
        setApiError("Login succeeded, but the account type is missing.");
        setBusy(false);
        return;
      }

      setRedirecting({
        name: session?.user?.name || session?.user?.username || username,
        destination: DESTINATION_LABEL[type] || "your dashboard",
      });

      await sleep(REDIRECT_MS);

      login(session);
      navigate(ROLE_HOME[type] || "/", { replace: true });
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to sign in. Please try again.",
      );
      setBusy(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (busy) return;
    if (stage === "details") {
      if (validateDetails()) sendPassword();
      return;
    }
    doLogin();
  };

  const changeDetails = () => {
    setStage("details");
    setPassword("");
    setErrors({});
    setApiError("");
  };

  return (
    <>
      {globalStyles}

      {redirecting && (
        <RedirectOverlay
          name={redirecting.name}
          destination={redirecting.destination}
          duration={REDIRECT_MS}
        />
      )}

      <Box sx={{ minHeight: "100dvh", display: "flex", bgcolor: "#f4f7fb" }}>
        {/* Left brand panel (desktop / tablet landscape) */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            color: "#fff",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            width: "42%",
            p: { md: 4, lg: 5 },
            background: `linear-gradient(150deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              width: 420,
              height: 420,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,.06)",
              top: -150,
              right: -150,
            }}
          />
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ position: "relative" }}
          >
            <Box
              sx={{
                bgcolor: "#fff",
                p: 0.75,
                borderRadius: 2,
                lineHeight: 0,
                boxShadow: "0 8px 22px rgba(0,0,0,.18)",
              }}
            >
              <Logo height={48} sx={{ borderRadius: 1 }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 30,
                lineHeight: 1,
                m: 0,
                alignSelf: "center",
                transform: "translateY(2px)",
              }}
            >
              XCMG
            </Typography>
          </Stack>
          <Box sx={{ position: "relative" }}>
            <Typography
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { md: 30, lg: 36 },
                lineHeight: 1.15,
              }}
            >
              Service Ticket Portal
            </Typography>
          </Box>
          <Typography
            sx={{ position: "relative", fontSize: 12.5, opacity: 0.75 }}
          >
            © {new Date().getFullYear()} XCMG. All rights reserved.
          </Typography>
        </Box>

        {/* Right login panel */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 2, sm: 4 },
            pt: { xs: "calc(16px + env(safe-area-inset-top))", md: 3 },
            pb: { xs: "calc(16px + env(safe-area-inset-bottom))", md: 3 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 430,
              bgcolor: "#fff",
              borderRadius: 4,
              p: { xs: 2.5, sm: 3.5 },
              boxShadow: "0 18px 50px rgba(20,38,58,.10)",
              border: "1px solid #e6edf4",
            }}
          >
            {/* Mobile logo + XCMG */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1.25}
              sx={{
                display: { xs: "flex", md: "none" },
                width: "100%",
                mb: 2.5,
              }}
            >
              <Box
                sx={{
                  bgcolor: BRAND,
                  borderRadius: 1.5,
                  lineHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Logo height={45} sx={{ borderRadius: 1 }} />
              </Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 25,
                  color: BRAND,
                  lineHeight: 1,
                  m: 0,
                  alignSelf: "center",
                  transform: "translateY(2px)",
                }}
              >
                XCMG
              </Typography>
            </Stack>

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 23, sm: 26 },
                fontWeight: 800,
                color: "#14263a",
                lineHeight: 1.2,
              }}
            >
              {locked ? "Check your email" : "Welcome"}
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                mb: 2,
                color: "#5b6b7c",
                fontSize: 14,
                lineHeight: 1.45,
              }}
            >
              {locked
                ? `We sent a password to ${maskEmail(email.trim())}.`
                : "Select your account type and sign in to continue."}
            </Typography>

            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <AccountSwitch
                value={accountType}
                disabled={locked}
                error={errors.accountType}
                onChange={(value) => {
                  setAccountType(value);
                  clearError("accountType");
                }}
              />

              <TextField
                label="Username"
                value={username}
                disabled={locked}
                fullWidth
                autoComplete="off"
                error={Boolean(errors.username)}
                helperText={errors.username}
                sx={fieldSx}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearError("username");
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon
                        sx={{ color: "#8296a8", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  autoComplete: "username",
                  autoCapitalize: "none",
                  autoCorrect: "off",
                  spellCheck: false,
                }}
              />

              <TextField
                label="Email address"
                type="email"
                value={email}
                disabled={locked}
                autoComplete="off"
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email}
                sx={fieldSx}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRoundedIcon
                        sx={{ color: "#8296a8", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  autoComplete: "email",
                  inputMode: "email",
                  autoCapitalize: "none",
                  autoCorrect: "off",
                  spellCheck: false,
                }}
              />

              <Collapse in={locked} unmountOnExit>
                <TextField
                  label="Password"
                  value={password}
                  fullWidth
                  autoFocus
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  sx={fieldSx}
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlineRoundedIcon
                          sx={{ color: "#8296a8", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((p) => !p)}
                          edge="end"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    autoComplete: "one-time-code",
                    autoCapitalize: "none",
                    autoCorrect: "off",
                    spellCheck: false,
                  }}
                />
              </Collapse>

              {/* Error alert for any API problem (wrong password, user not found, server down, …) */}
              <Collapse in={Boolean(apiError)} unmountOnExit>
                <Alert
                  severity="error"
                  onClose={() => setApiError("")}
                  sx={{ borderRadius: 2 }}
                >
                  {apiError}
                </Alert>
              </Collapse>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={busy}
                sx={{
                  position: "relative",
                  minHeight: { xs: 54, sm: 52 },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: { xs: 15.5, sm: 16 },
                  bgcolor: BRAND,
                  boxShadow: "0 8px 20px rgba(0,51,102,.22)",
                  overflow: "hidden",
                  "&:hover": {
                    bgcolor: BRAND_DARK,
                  },
                  "&.Mui-disabled": {
                    bgcolor: BRAND,
                    color: "#fff",
                    opacity: 0.9,
                  },
                }}
              >
                {busy && (
                  <Box
                    aria-hidden
                    sx={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 4,
                      bgcolor: "rgba(255,255,255,.25)",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: "40%",
                        bgcolor: "#fff",
                        borderRadius: 4,
                        animation: "buttonLoading 1.1s ease-in-out infinite",
                        "@keyframes buttonLoading": {
                          "0%": {
                            transform: "translateX(-100%)",
                          },
                          "100%": {
                            transform: "translateX(280%)",
                          },
                        },
                      }}
                    />
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.25,
                  }}
                >
                  {busy && (
                    <CircularProgress
                      size={22}
                      thickness={5}
                      color="inherit"
                      sx={{
                        color: "#fff",
                      }}
                    />
                  )}

                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 800,
                      fontSize: "inherit",
                      color: "#fff",
                    }}
                  >
                    {busy
                      ? locked
                        ? "Signing in…"
                        : "Checking account…"
                      : locked
                        ? "Sign in"
                        : "Send password"}
                  </Typography>
                </Box>
              </Button>

              {locked && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Button
                    onClick={changeDetails}
                    disabled={busy}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#5b6b7c",
                      minHeight: 40,
                    }}
                  >
                    Change details
                  </Button>
                  <Button
                    onClick={sendPassword}
                    disabled={busy || cooldown > 0}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      color: BRAND,
                      minHeight: 40,
                    }}
                  >
                    {cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : "Resend password"}
                  </Button>
                </Stack>
              )}
            </Box>

            {/* Copyright inside the card on phones (the brand panel is hidden there) */}
            <Typography
              sx={{
                display: { xs: "block", md: "none" },
                mt: 2.5,
                textAlign: "center",
                fontSize: 12,
                color: "#7a8896",
              }}
            >
              © {new Date().getFullYear()} XCMG. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
