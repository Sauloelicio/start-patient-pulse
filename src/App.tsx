import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
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
          <Route path="/" element={<ProtectedRoute><AppLayout><Index /></AppLayout></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><AppLayout><Patients /></AppLayout></ProtectedRoute>} />
          <Route path="/patients/new" element={<ProtectedRoute><AppLayout><NewPatient /></AppLayout></ProtectedRoute>} />
          <Route path="/patients/:id" element={<ProtectedRoute><AppLayout><PatientDetail /></AppLayout></ProtectedRoute>} />
          <Route path="/evaluation" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
