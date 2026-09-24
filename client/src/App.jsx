import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import EngineerDashboard from "./pages/engineerDashboard";
import AdminDashboard from "./pages/adminDashboard";

function App() {
  return (
    <BrowserRouter>
     <Routes>

      <Route path="/" element={<Navigate to="/login" replace />} />
  <Route path="/login" element={<Login />} />

  <Route path="/register" element={<Register />} />

<Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <Dashboard />
    </ProtectedRoute>
  }
/>

  <Route
  path="/create-ticket"
  element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <CreateTicket />
    </ProtectedRoute>
  }
/>

<Route
  path="/tickets/:id"
  element={
    <ProtectedRoute
      allowedRoles={["customer", "engineer", "admin"]}
    >
      <TicketDetails />
    </ProtectedRoute>
  }
/>

<Route
  path="/engineer"
  element={
    <ProtectedRoute allowedRoles={["engineer", "admin"]}>
      <EngineerDashboard />
    </ProtectedRoute>
  }
/>

  <Route
    path="/admin"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />
</Routes>
    </BrowserRouter>
  );
}

export default App;