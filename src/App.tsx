import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Patients from "./pages/Patients";
import NewPatient from "./pages/NewPatient";
import PatientDetail from "./pages/PatientDetail";
import Evaluation from "./pages/Evaluation";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout><Index /></Layout></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><Layout><Patients /></Layout></ProtectedRoute>} />
          <Route path="/patients/new" element={<ProtectedRoute><Layout><NewPatient /></Layout></ProtectedRoute>} />
          <Route path="/patients/:id" element={<ProtectedRoute><Layout><PatientDetail /></Layout></ProtectedRoute>} />
          <Route path="/evaluation" element={<ProtectedRoute><Layout><Evaluation /></Layout></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
