/* ------------------------------------------------------------------
   Auth API (axios)

   Server:  http://10.229.210.91:8825/api   (override with VITE_API_URL in .env)

   1) requestPassword  -> POST /service-Tk/register
        body: { userType: "Dealer", fullName: "Vijay P", email: "name@company.com" }
        backend validates the user and EMAILS a password. Any 2xx = success.

   2) loginRequest     -> POST /service-Tk/login
        body: { email, password }
        backend replies { success, message, data: { userId, fullName, email, userType } }
        (there is no token; success=true means the login worked).
------------------------------------------------------------------- */
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://10.229.210.91:8825/api";
const REGISTER_PATH = "/service-Tk/register";
const LOGIN_PATH = "/service-Tk/login";

const ROLES = ["dealer", "oem", "frontdesk"];

/* Login-page account type -> the text the backend expects in "userType" */
const USER_TYPE = {
  dealer: "Dealer",
  oem: "OEM",
  frontdesk: "Front Desk", // <-- confirm the exact value your backend uses for front desk
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/* Turns any axios/.NET error into one readable message for the alert */
function getErrorMessage(err) {
  if (!axios.isAxiosError(err))
    return err?.message || "Something went wrong. Please try again.";
  if (err.code === "ECONNABORTED")
    return "The server took too long to respond. Please try again.";
  if (!err.response)
    return "Cannot reach the server. Check your network connection and try again.";

  const { status, data } = err.response;
  if (typeof data === "string" && data.trim() && data.length < 300) return data;
  const direct = data?.message || data?.Message || data?.error || data?.title; // .NET ProblemDetails uses "title"
  if (direct && status !== 500) return direct;
  const firstValidation = data?.errors
    ? Object.values(data.errors).flat()[0]
    : null;
  if (firstValidation) return firstValidation;

  if (status === 400) return "Please check your details and try again.";
  if (status === 401)
    return "Incorrect email or password. Please check and try again.";
  if (status === 403) return "You do not have access with this account type.";
  if (status === 404) return "No account found with these details.";
  if (status === 409) return "These details are already registered.";
  if (status === 429)
    return "Too many attempts. Please wait a moment and try again.";
  if (status >= 500) return "Server error. Please try again in a few minutes.";
  return "Something went wrong. Please try again.";
}

const normalizeRole = (value, fallback) => {
  const key = String(value || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  return ROLES.includes(key) ? key : fallback;
};

/* Step 1: register -> backend emails the password */
export async function requestPassword({ accountType, username, email }) {
  try {
    const { data } = await api.post(REGISTER_PATH, {
      userType: USER_TYPE[accountType] || accountType,
      fullName: username,
      email,
    });
    if (data?.success === false)
      throw new Error(
        data.message || "Could not send the password. Please try again.",
      );
    return data;
  } catch (err) {
    throw new Error(
      axios.isAxiosError(err) ? getErrorMessage(err) : err.message,
    );
  }
}

/* Step 2: login with the emailed password. Returns { user: { name, username, email, accountType } } */
export async function loginRequest({ accountType, username, email, password }) {
  try {
    const { data } = await api.post(LOGIN_PATH, { email, password });

    // The API answers { success, message, data: { userId, fullName, email, userType } }
    if (!data?.success)
      throw new Error(
        data?.message ||
          "Login failed. Please check your details and try again.",
      );

    const u = data.data || {};
    return {
      user: {
        name: u.fullName || username,
        username: u.fullName || username,
        email: u.email || email,
        // the account type comes from the server (userType); falls back to what was chosen on the page
        accountType: normalizeRole(u.userType, accountType),
      },
    };
  } catch (err) {
    throw new Error(
      axios.isAxiosError(err) ? getErrorMessage(err) : err.message,
    );
  }
}
