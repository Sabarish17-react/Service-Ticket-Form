import { useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Fade,
  Grow,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { BRAND, PageShell, cardSx } from "../Components/BrandShell";
import { useAuth } from "../Auth/authContext";

const REPLY_URL = "http://10.229.210.91:8825/api/service-Tk/reply";

export default function FrontDeskPage() {
  const { user, logout } = useAuth();

  const [ticketId, setTicketId] = useState("");
  const [serviceTicketNo, setServiceTicketNo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const right = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <Typography
        noWrap
        sx={{
          fontWeight: 700,
          fontSize: { xs: 13.5, sm: 15 },
          color: "#1b1b1b",
        }}
      >
        {user?.name}
      </Typography>

      <Button
        onClick={logout}
        variant="outlined"
        size="small"
        sx={{
          textTransform: "none",
          fontWeight: 700,
          color: BRAND,
          borderColor: BRAND,
          minHeight: 36,
          flexShrink: 0,
        }}
      >
        Logout
      </Button>
    </Box>
  );

  function handleTicketIdChange(event) {
    const value = event.target.value;

    // Allow digits only
    if (/^\d*$/.test(value)) {
      setTicketId(value);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!ticketId.trim()) {
      setError("Please enter a valid Ticket ID.");
      return;
    }

    if (!serviceTicketNo.trim()) {
      setError("Please enter the Service Order No.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(REPLY_URL, {
        ticketId: Number(ticketId),
        serviceTicketNo: serviceTicketNo.trim(),
        repliedBy: user?.name || "Nirvik",
      });

      if (response.data?.success === true) {
        setSuccessMessage(
          response.data?.message ||
            "Service order no saved and mail sent to the submitter.",
        );
        setSuccess(true);
      } else {
        setError(
          response.data?.message || "Submission failed. Please try again.",
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit. Please check the API connection.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell right={right}>
      <Paper elevation={0} sx={cardSx}>
        <Box sx={{ height: 10, bgcolor: BRAND }} />

        <Box
          sx={{
            p: { xs: 2.5, sm: 4, md: 5 },
            width: "100%",
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 23, sm: 28, md: 32 },
              fontWeight: 800,
              color: BRAND,
              lineHeight: 1.2,
            }}
          >
            Front Desk
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#444",
              fontSize: { xs: 14, sm: 15 },
              maxWidth: 640,
            }}
          >
            Welcome, {user?.name}. Enter the ticket details and submit the
            service order reply.
          </Typography>

          <Box
            sx={{
              mt: { xs: 3.5, sm: 4.5 },
              width: "100%",
              maxWidth: 560,
              mx: "auto",
            }}
          >
            <Collapse in={!success}>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: "grid",
                  gap: { xs: 2, sm: 2.5 },
                }}
              >
                <TextField
                  label="Ticket ID"
                  placeholder="Enter ticket ID"
                  value={ticketId}
                  onChange={handleTicketIdChange}
                  fullWidth
                  required
                  disabled={submitting}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fafafa",
                      "& fieldset": {
                        borderColor: "#d9dee4",
                      },
                      "&:hover fieldset": {
                        borderColor: BRAND,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: BRAND,
                        borderWidth: 2,
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: BRAND,
                    },
                  }}
                />

                <TextField
                  label="Service Order No"
                  placeholder="Enter service order number"
                  value={serviceTicketNo}
                  onChange={(e) => setServiceTicketNo(e.target.value)}
                  fullWidth
                  required
                  disabled={submitting}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fafafa",
                      "& fieldset": {
                        borderColor: "#d9dee4",
                      },
                      "&:hover fieldset": {
                        borderColor: BRAND,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: BRAND,
                        borderWidth: 2,
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: BRAND,
                    },
                  }}
                />

                <Collapse in={Boolean(error)}>
                  <Alert
                    severity="error"
                    icon={<ErrorIcon fontSize="inherit" />}
                    sx={{ borderRadius: 2 }}
                  >
                    {error}
                  </Alert>
                </Collapse>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  fullWidth
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                    minHeight: { xs: 50, sm: 52 },
                    borderRadius: 2,
                    fontSize: { xs: 15, sm: 16 },
                    bgcolor: BRAND,
                    boxShadow: "0 8px 20px rgba(0, 51, 102, 0.22)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      bgcolor: BRAND,
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 26px rgba(0, 51, 102, 0.28)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                    "&.Mui-disabled": {
                      bgcolor: BRAND,
                      opacity: 0.7,
                    },
                  }}
                  startIcon={
                    submitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </Box>
            </Collapse>

            <Fade in={success} timeout={500}>
              <Grow in={success} timeout={800}>
                <Box
                  sx={{
                    display: success ? "flex" : "none",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: { xs: 1.5, sm: 3 },
                    py: { xs: 5, sm: 7, md: 8 },
                    gap: { xs: 1.5, sm: 2 },
                    borderRadius: 3,
                    bgcolor: "rgba(46, 125, 50, 0.06)",
                    border: "1px solid rgba(46, 125, 50, 0.18)",
                  }}
                >
                  <CheckCircleIcon
                    sx={{
                      color: "success.main",
                      fontSize: { xs: 64, sm: 78, md: 92 },
                      animation: "successPulse 1.6s ease-in-out infinite",
                      "@keyframes successPulse": {
                        "0%": {
                          transform: "scale(1)",
                          opacity: 1,
                        },
                        "50%": {
                          transform: "scale(1.1)",
                          opacity: 0.9,
                        },
                        "100%": {
                          transform: "scale(1)",
                          opacity: 1,
                        },
                      },
                    }}
                  />

                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: "success.main",
                      fontSize: { xs: 15, sm: 20, md: 22 },
                      lineHeight: 1.25,
                    }}
                  >
                    Submitted Successfully
                  </Typography>

                  <Typography
                    sx={{
                      color: "#444",
                      fontSize: { xs: 14, sm: 15.5 },
                      maxWidth: 480,
                      wordBreak: "break-word",
                    }}
                  >
                    {successMessage}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "#666",
                      fontSize: { xs: 13, sm: 14 },
                    }}
                  >
                    Ticket ID: <strong>{ticketId}</strong>
                    <br />
                    Service Order No: <strong>{serviceTicketNo}</strong>
                  </Typography>
                </Box>
              </Grow>
            </Fade>
          </Box>
        </Box>
      </Paper>
    </PageShell>
  );
}
