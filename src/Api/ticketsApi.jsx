/* ------------------------------------------------------------------
   Service ticket API (axios)

   POST http://10.229.210.91:8825/api/service-Tk/create
   Optional .env override:  VITE_TICKET_API_URL=http://10.229.210.91:8825/api
------------------------------------------------------------------- */
import axios from "axios";
import dayjs from "dayjs";

const TICKET_API_URL =
  import.meta.env.VITE_TICKET_API_URL || "http://10.229.210.91:8825/api";
const CREATE_PATH = "/service-Tk/create";

const ticketClient = axios.create({
  baseURL: TICKET_API_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

/* Email of the person who is logged in (saved by AuthContext under "xcmg_auth") */
const AUTH_KEY = "xcmg_auth";
export const getLoggedInEmail = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY))?.user?.email || "";
  } catch {
    return "";
  }
};

/* Form values -> the JSON the backend expects */
export const buildTicketPayload = (f) => ({
  email: getLoggedInEmail() || (f.email || "").trim(), // logged-in email first
  department: f.department,
  servicePlanDate: dayjs(f.planDate).format("DD.MM.YYYY"),
  qntNo: f.qntNo.trim(),
  serviceType: f.serviceType,
  machineSlNo: f.serial.trim(),
  machineModel: f.model,
  workingHours: Number(f.hours),
  job: f.job.trim(),
  city: String(f.city).trim(),
  state: f.state,
  machineDetailAddress: f.address.trim(),
  customer: f.customer.trim(),
  contactPerson: f.contact.trim(),
  contactNumber: f.phone,
  engineerName: f.engineerName.trim(),
  engineerPhone: f.engineerPhone,
  dispatchTo: f.dispatchTo.trim(),
});

/* Any axios / .NET error -> one readable message */
function getErrorMessage(err) {
  if (!axios.isAxiosError(err))
    return err?.message || "Something went wrong. Please try again.";
  if (err.code === "ECONNABORTED")
    return "The server took too long to respond. Please try again.";
  if (!err.response)
    return "Cannot reach the server. Check your network connection and try again.";

  const { status, data } = err.response;
  if (typeof data === "string" && data.trim() && data.length < 300) return data;
  const direct = data?.message || data?.Message || data?.error || data?.title;
  if (direct && status !== 500) return direct;
  const firstValidation = data?.errors
    ? Object.values(data.errors).flat()[0]
    : null;
  if (firstValidation) return firstValidation;

  if (status === 400)
    return "Some details are not valid. Please check the form and try again.";
  if (status === 401 || status === 403)
    return "You are not allowed to create tickets. Please sign in again.";
  if (status === 404)
    return "Ticket service not found. Please contact support.";
  if (status === 409) return "A ticket with these details already exists.";
  if (status >= 500) return "Server error. Please try again in a few minutes.";
  return "Something went wrong. Please try again.";
}

/* Returns the ticket number from the response (or a generic label if the API sends none) */
export async function createServiceTicket(form) {
  try {
    const payload = buildTicketPayload(form);
    if (!payload.email)
      throw new Error("Your session has expired. Please sign in again.");
    const { data } = await ticketClient.post(CREATE_PATH, payload);
    const id =
      data?.data?.ticketId ??
      data?.ticketId ??
      data?.data?.ticketNo ??
      data?.ticketNo ??
      data?.id;
    return id ? String(id) : "Created";
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
}
