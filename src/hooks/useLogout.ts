import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("isAuthenticated");
    toast.success("Logout realizado com sucesso");
    navigate("/login");
  };

  return { logout };
};
