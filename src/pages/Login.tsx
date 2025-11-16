import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Se não houver senha cadastrada, redireciona para setup
    const savedPassword = localStorage.getItem("systemPassword");
    if (!savedPassword) {
      navigate("/setup-password");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Verifica a senha cadastrada
    const savedPassword = localStorage.getItem("systemPassword");
    const correctPassword = savedPassword ? atob(savedPassword) : "";
    
    if (password === correctPassword) {
      localStorage.setItem("isAuthenticated", "true");
      toast.success("Acesso permitido!");
      navigate("/");
    } else {
      toast.error("Senha incorreta. Tente novamente.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Acesso ao Sistema</CardTitle>
          <CardDescription>
            Digite a senha para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
                className="text-center text-lg"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading || !password}
            >
              {isLoading ? "Verificando..." : "Entrar"}
            </Button>
            
            <div className="text-center mt-4">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/setup-password")}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Redefinir senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
