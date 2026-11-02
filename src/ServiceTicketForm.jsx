import { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  GlobalStyles,
  Paper,
  Snackbar,
  TextField,
  Typography,
  keyframes,
  useMediaQuery,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import LOGO_SRC from "./assets/Xcmg logo.jpg";
import { createServiceTicket } from "./Api/ticketsApi";
import axios from "axios";

const BRAND = "#003366";
const BRAND_DARK = "#00264d";
const BRAND_LIGHT = "#e4ecf5";
const YELLOW = "#f2b705";
const STAMP_FORMAT = "DD MMM YYYY, hh:mm A";
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------- Dropdown data (replace with your API data) ---------- */
const DEPARTMENTS = ["Heavy Equipment", "Mining", "Dealer"];
const SERVICE_TYPES = [
  "Report for Repair",
  "Paid Maintenance",
  "Installation",
  "Delivery",
  "Revisit",
  "Pre-Delivery",
  "Maintain",
];

/* ---------- Fields (in order). `hint` is shown in light grey brackets after the label ---------- */
const FIELDS = [
  // { k: "email", label: "Email", hint: "Your official email id", type: "email" },
  {
    k: "department",
    label: "Department",
    type: "select",
    options: DEPARTMENTS,
  },
  {
    k: "planDate",
    label: "Service plan date",
    hint: "Date of the planned service visit",
    type: "date",
  },
  {
    k: "qntNo",
    label: "QNT No",
    type: "text",
    hint: "If Not available put NA",
  },
  {
    k: "serviceType",
    label: "Service type",
    type: "select",
    options: SERVICE_TYPES,
  },
  {
    k: "serial",
    label: "Machine serial number",
    hint: "Found on the machine plate",
    type: "text",
  },
  {
    k: "model",
    label: "Machine model",
    type: "text",
  },
  {
    k: "hours",
    label: "Working hours",
    hint: "Hour meter reading",
    type: "number",
  },
  {
    k: "job",
    label: "Job",
    hint: "Work to be done, e.g. Front Axle work",
    type: "text",
  },
  { k: "state", label: "State", type: "state" },
  { k: "city", label: "City", hint: "Select or type", type: "city" },
  {
    k: "address",
    label: "Machine detail address",
    hint: "Site location with landmark",
    type: "multiline",
  },
  { k: "customer", label: "Customer name", type: "text" },
  { k: "contact", label: "Contact person", hint: "Site / Owner", type: "text" },
  { k: "phone", label: "Contact number", hint: "Site / Owner", type: "tel" },
  // { k: "engineerName", label: "Engineer name", type: "text" },
  {
    k: "engineerPhone",
    label: "Engineer Phone number",
    hint: "Registered CRM number",
    type: "tel",
  },
  {
    k: "dispatchTo",
    label: "Dispatch to",
    hint: "Existing XCMG employee",
    type: "text",
  },
];

const EMPTY = {
  // email: "",
  department: null,
  planDate: null,
  qntNo: "",
  serviceType: "",
  serial: "",
  model: null,
  hours: "",
  job: "",
  state: null,
  city: null,
  address: "",
  customer: "",
  contact: "",
  phone: "",
  engineerName: "",
  engineerPhone: "",
  dispatchTo: "",
};

const STEPS = [
  "Request received",
  "Checking machine details",
  "Assigning service engineer",
  "Generating your ticket",
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Animations ---------- */
const spin = keyframes`to { transform: rotate(360deg); }`;
const dig = keyframes`0% { transform: rotate(-16deg); } 100% { transform: rotate(12deg); }`;
const lift = keyframes`0% { transform: rotate(-3deg); } 100% { transform: rotate(3deg); }`;
const bob = keyframes`0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); }`;
const slide = keyframes`to { stroke-dashoffset: -40; }`;
const drift = keyframes`from { transform: translateX(-60px); } to { transform: translateX(400px); }`;
const puff = keyframes`0% { opacity: .7; transform: scale(.4) translateY(0); } 100% { opacity: 0; transform: scale(1.6) translateY(-14px); }`;
const rise = keyframes`from { opacity: 0; transform: translateY(60px) scale(.96); } to { opacity: 1; transform: none; }`;
const stamp = keyframes`0% { opacity: 0; transform: rotate(-12deg) scale(2.4); } 70% { opacity: 1; transform: rotate(-12deg) scale(.92); } 100% { opacity: 1; transform: rotate(-12deg) scale(1); }`;
const popIn = keyframes`from { opacity: 0; transform: scale(.5); } to { opacity: 1; transform: scale(1); }`;

const origin = (x, y) => ({
  transformOrigin: `${x}px ${y}px`,
  transformBox: "view-box",
});
const center = { transformOrigin: "center", transformBox: "fill-box" };

/* ---------- Global reset ---------- */
const globalStyles = (
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

/* ---------- Logo ---------- */
function Logo({ height = 40, sx }) {
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

/* ---------- Large blurred logo behind the page ---------- */
function PageBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Logo
        height="min(100dvh, 100vw)"
        sx={{ filter: "blur(10px)", opacity: 0.3, mixBlendMode: "multiply" }}
      />
    </Box>
  );
}

/* ---------- Live date & time ---------- */
function Clock() {
  const [now, setNow] = useState(dayjs());
  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 1000 * 15);
    return () => clearInterval(t);
  }, []);
  return <>{now.format(STAMP_FORMAT)}</>;
}

/* ---------- Excavator + engineer scene ---------- */
function Scene() {
  return (
    <Box
      sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #cfe0f0" }}
    >
      <Box
        component="svg"
        viewBox="0 0 340 175"
        sx={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cfe6fb" />
            <stop offset="1" stopColor="#f4faff" />
          </linearGradient>
        </defs>
        <rect width="340" height="175" fill="url(#sky)" />
        <circle cx="300" cy="30" r="14" fill="#ffe27a" />
        {[
          [20, 28],
          [150, 46],
        ].map(([x, y], i) => (
          <g
            key={i}
            style={{ animation: `${drift} ${22 + i * 8}s linear infinite` }}
          >
            <ellipse cx={x} cy={y} rx="22" ry="7" fill="#fff" />
            <ellipse cx={x + 14} cy={y - 5} rx="14" ry="7" fill="#fff" />
          </g>
        ))}
        <path d="M0 140 Q80 105 170 135 T340 128 V152 H0 z" fill="#c7d9ea" />
        <rect y="152" width="340" height="23" fill="#d9e2ec" />
        <line
          x1="0"
          y1="152"
          x2="340"
          y2="152"
          stroke="#9fb3c8"
          strokeWidth="3"
          strokeDasharray="14 12"
          style={{ animation: `${slide} 1s linear infinite` }}
        />
        <rect x="36" y="128" width="116" height="24" rx="12" fill="#2b2b2b" />
        {[58, 94, 130].map((x) => (
          <g key={x}>
            <circle cx={x} cy="140" r="8" fill="#555" />
            <line
              x1={x - 6}
              y1="140"
              x2={x + 6}
              y2="140"
              stroke="#bbb"
              strokeWidth="2"
              style={{ ...center, animation: `${spin} 1.2s linear infinite` }}
            />
          </g>
        ))}
        <rect x="44" y="98" width="100" height="32" rx="4" fill={YELLOW} />
        <rect x="48" y="104" width="26" height="6" rx="2" fill="#d99f00" />
        <path d="M52 98 V72 h40 l10 26 z" fill={YELLOW} />
        <path d="M58 78 h28 l6 18 h-34 z" fill="#bfe3f7" />
        <g
          style={{
            ...origin(118, 100),
            animation: `${lift} 1.4s ease-in-out infinite alternate`,
          }}
        >
          <polyline
            points="118,100 168,50 200,56"
            fill="none"
            stroke={YELLOW}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g
            style={{
              ...origin(200, 56),
              animation: `${dig} 1.4s ease-in-out infinite alternate`,
            }}
          >
            <line
              x1="200"
              y1="56"
              x2="214"
              y2="112"
              stroke={YELLOW}
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path d="M204 108 h24 l-6 16 h-22 z" fill="#555" />
          </g>
        </g>
        <circle
          cx="222"
          cy="148"
          r="6"
          fill="#b9a58a"
          style={{ ...center, animation: `${puff} 1.4s ease-out infinite` }}
        />
        <path d="M244 152 l6 -16 l6 16 z" fill="#ff7a00" />
        <g style={{ animation: `${bob} 1.1s ease-in-out infinite` }}>
          <line
            x1="296"
            y1="124"
            x2="296"
            y2="152"
            stroke="#223"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="306"
            y1="124"
            x2="306"
            y2="152"
            stroke="#223"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="288" y="90" width="26" height="38" rx="5" fill="#ff7a00" />
          <rect x="288" y="104" width="26" height="4" fill="#fff" />
          <circle cx="301" cy="80" r="9" fill="#f1c9a5" />
          <path d="M289 78 a12 12 0 0 1 24 0 z" fill="#fff" stroke="#bbb" />
          <line
            x1="288"
            y1="98"
            x2="280"
            y2="110"
            stroke="#ff7a00"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect
            x="268"
            y="104"
            width="16"
            height="20"
            rx="2"
            fill="#fff"
            stroke="#555"
          />
          <line x1="272" y1="110" x2="280" y2="110" stroke="#888" />
          <line x1="272" y1="115" x2="280" y2="115" stroke="#888" />
        </g>
      </Box>
    </Box>
  );
}

/* ---------- Vertical stepper ---------- */
function Stepper({ step }) {
  return (
    <Box sx={{ mt: 2.5 }}>
      {STEPS.map((s, i) => {
        const done = i < step,
          active = i === step;
        return (
          <Box key={s} sx={{ display: "flex", gap: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                  transition: "background .3s",
                  bgcolor: done ? "#1b8a4b" : active ? BRAND : "#c3d0de",
                  animation: active ? `${popIn} .3s` : "none",
                  boxShadow: active ? `0 0 0 4px ${BRAND_LIGHT}` : "none",
                }}
              >
                {done ? "✓" : i + 1}
              </Box>
              {i < STEPS.length - 1 && (
                <Box
                  sx={{
                    width: 3,
                    flex: 1,
                    minHeight: 16,
                    bgcolor: done ? "#1b8a4b" : "#d5dfea",
                    transition: "background .4s",
                  }}
                />
              )}
            </Box>
            <Typography
              sx={{
                pb: 1.5,
                pt: 0.2,
                fontSize: 15,
                fontWeight: active ? 800 : 600,
                color: i > step ? "#8a99aa" : "#1b1b1b",
              }}
            >
              {s}
              {active ? "…" : ""}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

/* ---------- Final ticket ---------- */
function Ticket({ id, d, createdAt, createdBy, onClose }) {
  const rows = [
    ["Department", d.department],
    ["Service type", d.serviceType],
    ["Machine", `${d.model} · ${d.serial}`],
    ["Job", d.job],
    ["Plan date", dayjs(d.planDate).format("DD MMM YYYY")],
    ["Location", `${d.city}, ${d.state}`],
    ["Customer", d.customer],
    ["Engineer", d.engineerName],
    ["Created by", createdBy],
    ["Created on", createdAt],
  ];

  return (
    <Box sx={{ animation: `${rise} .7s cubic-bezier(.2,.9,.3,1) both` }}>
      <Box
        sx={{
          bgcolor: BRAND,
          color: "#fff",
          px: { xs: 2, sm: 2.5 },
          py: 2,
          borderRadius: "14px 14px 0 0",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Logo height={44} sx={{ borderRadius: 1 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, opacity: 0.8 }}>
            Service ticket
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 22, sm: 26 },
              fontWeight: 800,
              letterSpacing: 1,
              lineHeight: 1.1,
              overflowWrap: "anywhere",
            }}
          >
            {id}
          </Typography>
        </Box>
        <Box
          sx={{
            ml: "auto",
            border: "3px solid #7be39a",
            color: "#7be39a",
            px: 1,
            borderRadius: 1,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: 1.5,
            animation: `${stamp} .5s .6s both`,
          }}
        >
          CONFIRMED
        </Box>
      </Box>
      <Box
        sx={{ position: "relative", borderTop: "2px dashed #b9c7d6", mx: 2 }}
      >
        <Box
          sx={{
            position: "absolute",
            left: -28,
            top: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: "#fff",
            boxShadow: "inset -2px 0 3px rgba(0,0,0,.15)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: -28,
            top: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: "#fff",
            boxShadow: "inset 2px 0 3px rgba(0,0,0,.15)",
          }}
        />
      </Box>
      <Box
        sx={{
          bgcolor: "#f7f9fc",
          px: { xs: 2, sm: 2.5 },
          py: 2,
          border: "1px solid #dbe3ec",
          borderTop: 0,
          borderRadius: "0 0 14px 14px",
        }}
      >
        {rows.map(([k, v]) => (
          <Box
            key={k}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              py: 0.8,
              borderBottom: "1px solid #e8eef4",
            }}
          >
            <Typography sx={{ color: "#667", fontSize: 14, flexShrink: 0 }}>
              {k}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 14,
                textAlign: "right",
                minWidth: 0,
                overflowWrap: "anywhere",
              }}
            >
              {v}
            </Typography>
          </Box>
        ))}
        <Box
          sx={{
            mt: 2,
            height: 38,
            opacity: 0.8,
            background:
              "repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 5px,#111 5px 8px,transparent 8px 10px)",
          }}
        />
        <Typography
          sx={{ textAlign: "center", fontSize: 12, color: "#667", mt: 1 }}
        >
          Your ticket was generated successfully
        </Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            mt: 2,
            minHeight: 50,
            textTransform: "none",
            fontWeight: 700,
            fontSize: 16,
            bgcolor: BRAND,
            "&:hover": { bgcolor: BRAND_DARK },
          }}
        >
          Create another ticket
        </Button>
      </Box>
    </Box>
  );
}

/* ---------- Touch-friendly dropdown list ---------- */
const listboxProps = {
  sx: {
    maxHeight: { xs: "38dvh", sm: 280 },
    "& .MuiAutocomplete-option": {
      minHeight: 46,
      fontSize: 16,
      overflowWrap: "anywhere",
    },
  },
};

/* ---------- Input styling ---------- */
const inputRootSx = {
  bgcolor: "#fff",
  borderRadius: 1.5,
  minHeight: { xs: 50, sm: 46 },
  "& fieldset": { borderColor: "#9db0c4" },
  "&:hover fieldset": { borderColor: BRAND },
  "&.Mui-focused fieldset": { borderColor: BRAND, borderWidth: 2 },
};
const fieldSx = {
  "& .MuiOutlinedInput-root": inputRootSx,
  "& .MuiPickersOutlinedInput-root": inputRootSx,
  "& .MuiInputBase-input, & .MuiPickersSectionList-root, & .MuiPickersInputBase-sectionsContainer":
    { fontSize: 16 },
};

const STATES_URL = "http://10.229.210.91:8825/api/service-Tk/states";
const CITIES_URL = "http://10.229.210.91:8825/api/service-Tk/cities";

/* API items can be strings or objects. Always keep just the name. */
const toNames = (list) =>
  (Array.isArray(list) ? list : [])
    .map((item) =>
      typeof item === "string"
        ? item
        : (item?.name ??
          item?.stateName ??
          item?.cityName ??
          item?.label ??
          item?.value),
    )
    .filter(Boolean);
/* ---------- Page ----------
   <ServiceTicketForm userName={user.name} userEmail={user.email} /> */
export default function ServiceTicketForm({ userName = "Service Engineer" }) {
  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState("idle"); // idle | processing | done
  const [step, setStep] = useState(0);
  const [ticket, setTicket] = useState(null);
  const [toast, setToast] = useState({ open: false, msg: "" });
  const isMobile = useMediaQuery("(max-width:599.95px)");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingStates(true);
      try {
        const { data } = await axios.get(STATES_URL);
        if (!cancelled) setStates(toNames(data?.data ?? data));
      } catch (error) {
        if (!cancelled)
          setToast({
            open: true,
            msg:
              error?.response?.data?.message ||
              "Unable to load states. Please try again.",
          });
      } finally {
        if (!cancelled) setLoadingStates(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setCities([]);
    if (!form.state) return;
    let cancelled = false;
    (async () => {
      setLoadingCities(true);
      try {
        const { data } = await axios.get(CITIES_URL, {
          params: { State: form.state },
        }); // state NAME
        if (!cancelled) setCities(toNames(data?.data ?? data));
      } catch (error) {
        if (!cancelled)
          setToast({
            open: true,
            msg:
              error?.response?.data?.message ||
              "Unable to load cities. Please try again.",
          });
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form.state]);

  const set = (k, v) => {
    setForm((f) => ({
      ...f,
      [k]: v,
      ...(k === "state" ? { city: null } : {}),
    }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    FIELDS.forEach(({ k, type }) => {
      const v = form[k];
      if (v === null || String(v).trim() === "")
        e[k] = "This field is required";
      else if (type === "tel" && !PHONE_RE.test(v))
        e[k] = "Enter a valid 10-digit mobile number";
      else if (type === "date" && !dayjs(v).isValid())
        e[k] = "Enter a valid date";
      else if (type === "number" && Number(v) < 0) e[k] = "Cannot be negative";
    });
    setErrors(e);
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setToast({
        open: true,
        msg: "Please fill in all required fields correctly.",
      });
      const first = FIELDS.find(({ k }) => e[k]);
      document
        .getElementById(`field-${first.k}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setPhase("processing");
    setStep(0);
    let failed = false;

    // Animation plays while the real request runs; it stops if the request fails.
    const animation = (async () => {
      for (let i = 1; i < STEPS.length; i++) {
        await sleep(1200);
        if (failed) return;
        setStep(i);
      }
      await sleep(1200);
    })();

    try {
      const id = await createServiceTicket(form); // POST /service-Tk/create
      await animation;
      setTicket({ id, data: form, createdAt: dayjs().format(STAMP_FORMAT) });
      setPhase("done");
    } catch (err) {
      failed = true;
      setPhase("idle");
      setToast({
        open: true,
        msg: err.message || "Could not create the ticket. Please try again.",
      });
    }
  };

  const reset = () => {
    setPhase("idle");
    setTicket(null);
    setForm({ ...EMPTY });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const input = (f) => {
    const common = {
      size: "small",
      fullWidth: true,
      placeholder: "Enter your answer",
      error: !!errors[f.k],
      sx: fieldSx,
    };
    const aria = {
      "aria-label": f.hint ? `${f.label} (${f.hint})` : f.label,
      autoComplete: "off",
    };
    switch (f.type) {
      case "date":
        return (
          <DatePicker
            value={form.planDate}
            format="DD/MM/YYYY"
            onChange={(v) => set("planDate", v)}
            slotProps={{
              textField: {
                ...common,
                placeholder: "DD/MM/YYYY",
                inputProps: aria,
              },
            }}
          />
        );
      case "select": {
        const noKeyboard = isMobile && f.options.length <= 8;
        return (
          <Autocomplete
            options={f.options}
            value={form[f.k] || null}
            autoHighlight
            openOnFocus
            size="small"
            onChange={(_, v) => set(f.k, v)}
            ListboxProps={listboxProps}
            renderInput={(p) => (
              <TextField
                {...p}
                {...common}
                placeholder="Select an option"
                inputProps={{
                  ...p.inputProps,
                  ...aria,
                  ...(noKeyboard
                    ? {
                        readOnly: true,
                        style: { cursor: "pointer", caretColor: "transparent" },
                      }
                    : {}),
                }}
              />
            )}
          />
        );
      }
      case "state":
        return (
          <Autocomplete
            options={states}
            value={form.state}
            loading={loadingStates}
            loadingText="Loading states…"
            noOptionsText="No states found"
            openOnFocus
            autoHighlight
            size="small"
            fullWidth
            onChange={(_, value) => set("state", value)}
            ListboxProps={listboxProps}
            renderInput={(params) => (
              <TextField
                {...params}
                {...common}
                placeholder="Select or search state"
              />
            )}
          />
        );

      case "city":
        return (
          <Autocomplete
            options={cities}
            value={form.city}
            loading={loadingCities}
            loadingText="Loading cities…"
            noOptionsText="No cities found"
            disabled={!form.state}
            openOnFocus
            autoHighlight
            size="small"
            fullWidth
            onChange={(_, value) => set("city", value)}
            ListboxProps={listboxProps}
            renderInput={(params) => (
              <TextField
                {...params}
                {...common}
                placeholder={
                  form.state ? "Select or search city" : "Select a state first"
                }
              />
            )}
          />
        );
      case "multiline":
        return (
          <TextField
            {...common}
            multiline
            minRows={3}
            value={form[f.k]}
            onChange={(e) => set(f.k, e.target.value)}
            inputProps={aria}
          />
        );
      case "tel":
        return (
          <TextField
            {...common}
            type="tel"
            value={form[f.k]}
            placeholder="10-digit mobile number"
            inputProps={{
              ...aria,
              maxLength: 10,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            onChange={(e) =>
              set(f.k, e.target.value.replace(/\D/g, "").slice(0, 10))
            }
          />
        );
      case "email":
        return (
          <TextField
            {...common}
            type="email"
            value={form[f.k]}
            placeholder="name@company.com"
            onChange={(e) => set(f.k, e.target.value)}
            inputProps={{
              ...aria,
              inputMode: "email",
              autoCapitalize: "none",
              autoCorrect: "off",
              spellCheck: false,
            }}
          />
        );
      case "number":
        return (
          <TextField
            {...common}
            type="number"
            inputProps={{ ...aria, min: 0, inputMode: "numeric" }}
            value={form[f.k]}
            onChange={(e) => set(f.k, e.target.value)}
          />
        );
      default:
        return (
          <TextField
            {...common}
            value={form[f.k]}
            onChange={(e) => set(f.k, e.target.value)}
            inputProps={aria}
          />
        );
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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

        {/* Top bar */}
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
              maxWidth: 640,
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
            <Box sx={{ textAlign: "right", minWidth: 0 }}>
              <Typography
                noWrap
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: 13.5, sm: 15 },
                  color: "#1b1b1b",
                }}
              >
                {userName}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 11, sm: 12.5 },
                  color: "#667",
                  lineHeight: 1.3,
                  whiteSpace: { xs: "normal", sm: "nowrap" },
                }}
              >
                <Clock />
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Form paper */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            width: "100%",
            maxWidth: 640,
            mx: "auto",
            px: { xs: 1.25, sm: 2 },
            py: { xs: 1.5, sm: 4 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              overflow: "hidden",
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.78)",
              border: "1px solid #cfdae6",
              boxShadow: "0 6px 24px rgba(0,51,102,.15)",
            }}
          >
            <Box sx={{ height: 10, bgcolor: BRAND }} />
            <Box
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
              sx={{ p: { xs: 2, sm: 4 } }}
            >
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 24, sm: 30 },
                  fontWeight: 800,
                  color: BRAND,
                  lineHeight: 1.2,
                }}
              >
                Service Ticket
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  mb: { xs: 2.5, sm: 3 },
                  color: "#444",
                  fontSize: { xs: 14, sm: 15 },
                }}
              >
                Fill in the details below to raise a service request. All fields
                are required.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 2.25, sm: 2.5 },
                }}
              >
                {FIELDS.map((f) => (
                  <Box
                    key={f.k}
                    id={`field-${f.k}`}
                    sx={{ scrollMarginTop: 90 }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#1b1b1b",
                        mb: 0.8,
                        lineHeight: 1.35,
                      }}
                    >
                      {f.label}
                      {f.hint && (
                        <Box
                          component="span"
                          sx={{
                            fontWeight: 400,
                            fontSize: 13,
                            color: "#7f8fa1",
                            ml: 0.75,
                          }}
                        >
                          ({f.hint})
                        </Box>
                      )}{" "}
                      <Box component="span" sx={{ color: "#d32f2f" }}>
                        *
                      </Box>
                    </Typography>
                    {input(f)}
                    {errors[f.k] ? (
                      <Typography
                        sx={{ color: "#d32f2f", fontSize: 13, mt: 0.6 }}
                      >
                        {errors[f.k]}
                      </Typography>
                    ) : f.type === "tel" ? (
                      <Typography
                        sx={{ color: "#556", fontSize: 12.5, mt: 0.6 }}
                      >
                        {form[f.k].length}/10 digits
                      </Typography>
                    ) : null}
                  </Box>
                ))}
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={phase !== "idle"}
                sx={{
                  mt: { xs: 3, sm: 4 },
                  minHeight: 54,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: 17,
                  borderRadius: 1.5,
                  bgcolor: BRAND,
                  "&:hover": { bgcolor: BRAND_DARK },
                }}
              >
                Create ticket
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Footer */}
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

      {/* Submit animation, then ticket */}
      <Dialog
        open={phase !== "idle"}
        fullWidth
        maxWidth="xs"
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: 3,
            m: 1.5,
            width: "calc(100% - 24px)",
            maxHeight: "calc(100dvh - 24px)",
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {phase === "processing" && (
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
              >
                <Logo height={36} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: 17, sm: 18 },
                      color: BRAND,
                      lineHeight: 1.2,
                    }}
                  >
                    Creating your ticket
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#667" }}>
                    Please wait, this takes a few seconds
                  </Typography>
                </Box>
              </Box>
              <Scene />
              <Stepper step={step} />
            </Box>
          )}
          {phase === "done" && ticket && (
            <Ticket
              id={ticket.id}
              d={ticket.data}
              createdAt={ticket.createdAt}
              createdBy={userName}
              onClose={reset}
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast({ open: false, msg: "" })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ width: { xs: "calc(100% - 24px)", sm: "auto" } }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setToast({ open: false, msg: "" })}
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}
