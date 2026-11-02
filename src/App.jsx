import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

/* IMPORTANT: every file must import AuthContexts with this EXACT same path and letter case
   (Auth / AuthContexts). Mixed casing (auth vs Auth) creates two separate copies of the
   context on Windows/Vite, and useAuth() then returns null. */
import {
  AuthProvider,
  RequireAuth,
  ROLE_HOME,
  useAuth,
} from "./Auth/authContext";
import LoginPage from "./Pages/LoginPage"; // adjust the folder name to where your LoginPage is
import FrontDeskPage from "./Pages/FrontDeskPage"; // adjust as above
import ServiceTicketForm from "./ServiceTicketForm"; // adjust as above

function Home() {
  const { user } = useAuth();
  return (
    <Navigate
      to={user ? ROLE_HOME[user.accountType] || "/login" : "/login"}
      replace
    />
  );
}

function ServiceTicketPage() {
  const { user } = useAuth();
  return <ServiceTicketForm userName={user.name} />;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider must wrap ALL routes, including /login */}
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* Dealer + OEM */}
          <Route
            path="/service-ticket"
            element={
              <RequireAuth roles={["dealer", "oem"]}>
                <ServiceTicketPage />
              </RequireAuth>
            }
          />

          {/* Front Desk */}
          <Route
            path="/front-desk"
            element={
              <RequireAuth roles={["frontdesk"]}>
                <FrontDeskPage />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
