import { useState } from "react";
import { Box, GlobalStyles, Typography } from "@mui/material";
import LOGO_SRC from "../assets/Xcmg logo.jpg";

export const BRAND = "#003366";
export const BRAND_DARK = "#00264d";
export const BRAND_LIGHT = "#e4ecf5";

/* Card (paper) style shared by login + other pages */
export const cardSx = {
  overflow: "hidden",
  borderRadius: 2,
  bgcolor: "rgba(255,255,255,0.78)",
  border: "1px solid #cfdae6",
  boxShadow: "0 6px 24px rgba(0,51,102,.15)",
};

/* Input styling: big touch targets, 16px text (no iOS zoom) */
const inputRootSx = {
  bgcolor: "#fff",
  borderRadius: 1.5,
  minHeight: { xs: 50, sm: 46 },
  "& fieldset": { borderColor: "#9db0c4" },
  "&:hover fieldset": { borderColor: BRAND },
  "&.Mui-focused fieldset": { borderColor: BRAND, borderWidth: 2 },
  "&.Mui-disabled": { bgcolor: "#eef2f7" },
};
export const fieldSx = {
  "& .MuiOutlinedInput-root": inputRootSx,
  "& .MuiInputBase-input": { fontSize: 16 },
};

export const primaryButtonSx = {
  minHeight: 54,
  fontWeight: 700,
  textTransform: "none",
  fontSize: 17,
  borderRadius: 1.5,
  bgcolor: BRAND,
  "&:hover": { bgcolor: BRAND_DARK },
};

export function Logo({ height = 40, sx }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <Typography sx={{ fontWeight: 900, color: BRAND, fontSize: 24, ...sx }}>
      XCMG
    </Typography>
  ) : (
    <Box
      component="img"
      src={LOGO_SRC}
      alt="XCMG"
      onError={() => setFailed(true)}
      sx={{
        height,
        width: "auto",
        maxWidth: "100%",
        display: "block",
        flexShrink: 0,
        ...sx,
      }}
    />
  );
}

function PageBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Logo
        height="min(80dvh, 90vw)"
        sx={{ filter: "blur(10px)", opacity: 0.3, mixBlendMode: "multiply" }}
      />
    </Box>
  );
}

/* Removes default Vite page padding/centering that breaks mobile layouts */
export const globalStyles = (
  <GlobalStyles
    styles={{
      ":root": { colorScheme: "light" },
      "*, *::before, *::after": { boxSizing: "border-box" },
      "html, body": {
        margin: 0,
        padding: 0,
        width: "100%",
        overflowX: "hidden",
        WebkitTextSizeAdjust: "100%",
      },
      body: {
        display: "block",
        placeItems: "initial",
        minWidth: 0,
        minHeight: "100dvh",
        background: BRAND_LIGHT,
      },
      "#root": {
        maxWidth: "none",
        width: "100%",
        margin: 0,
        padding: 0,
        textAlign: "left",
      },
    }}
  />
);

/* Full page: top bar (logo left, `right` slot on the right), content, footer */
export function PageShell({
  right = null,
  maxWidth = 640,
  center = false,
  children,
}) {
  return (
    <>
      {globalStyles}
      <Box
        sx={{
          position: "relative",
          minHeight: "100dvh",
          width: "100%",
          bgcolor: BRAND_LIGHT,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PageBackground />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            bgcolor: "#fff",
            borderBottom: `3px solid ${BRAND}`,
            pt: "calc(9px + env(safe-area-inset-top))",
            pb: "9px",
            pl: "max(12px, env(safe-area-inset-left))",
            pr: "max(12px, env(safe-area-inset-right))",
          }}
        >
          <Box
            sx={{
              maxWidth,
              mx: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 1.5 },
                flexShrink: 0,
              }}
            >
              <Logo height={{ xs: 34, sm: 40 }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 18, sm: 22 },
                  color: BRAND,
                  letterSpacing: 1,
                }}
              >
                XCMG
              </Typography>
            </Box>
            {right}
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            width: "100%",
            maxWidth,
            mx: "auto",
            px: { xs: 1.25, sm: 2 },
            py: { xs: 1.5, sm: 4 },
            display: "flex",
            flexDirection: "column",
            justifyContent: center ? "center" : "flex-start",
          }}
        >
          {children}
        </Box>

        <Box
          component="footer"
          sx={{
            position: "relative",
            zIndex: 1,
            bgcolor: "#fff",
            borderTop: `3px solid ${BRAND}`,
            pt: 2.5,
            pb: "calc(20px + env(safe-area-inset-bottom))",
            px: 2,
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Logo height={34} />
          </Box>
          <Typography sx={{ fontSize: 13, color: "#555" }}>
            © {new Date().getFullYear()} XCMG. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </>
  );
}
