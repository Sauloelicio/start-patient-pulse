import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState<number | null>(null);
  const navigate = useNavigate();

  const MAX_ATTEMPTS = 3;
  const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

  useEffect(() => {
    // Verificar se já está autenticado
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      navigate("/");
    }

    // Verificar se há bloqueio ativo
    const storedBlockEnd = localStorage.getItem("loginBlockEnd");
    const storedAttempts = localStorage.getItem("loginAttempts");
    
    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts));
    }

    if (storedBlockEnd) {
      const blockEnd = parseInt(storedBlockEnd);
      const now = Date.now();
      
      if (now < blockEnd) {
        setIsBlocked(true);
        setBlockEndTime(blockEnd);
        
        const timer = setTimeout(() => {
          setIsBlocked(false);
          setBlockEndTime(null);
          setAttempts(0);
          localStorage.removeItem("loginBlockEnd");
          localStorage.removeItem("loginAttempts");
        }, blockEnd - now);

        return () => clearTimeout(timer);
      } else {
        // Bloqueio expirou
        localStorage.removeItem("loginBlockEnd");
        localStorage.removeItem("loginAttempts");
      }
    }
  }, [navigate]);

  const getRemainingTime = () => {
    if (!blockEndTime) return "";
    const remaining = Math.ceil((blockEndTime - Date.now()) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast.error(`Aguarde ${getRemainingTime()} para tentar novamente`);
      return;
    }

    setIsLoading(true);

    let data;
    let error;
    try {
      ({ data, error } = await supabase.functions.invoke("shared-login", {
        body: { password },
      }));
    } catch {
      toast.error("Não foi possível acessar o sistema. Tente novamente.");
      setIsLoading(false);
      return;
    }
    if (error && error.context?.status !== 401) {
      toast.error("Não foi possível acessar o sistema. Tente novamente.");
      setIsLoading(false);
      return;
    }

    if (!error && data?.session) {
      const { error: sessionError } = await supabase.auth.setSession(data.session);
      if (sessionError) {
        toast.error("Não foi possível acessar o sistema. Tente novamente.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("isAuthenticated", "true");
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("loginBlockEnd");
      toast.success("Acesso autorizado!");
      navigate("/");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("loginAttempts", newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        const blockEnd = Date.now() + BLOCK_DURATION;
        setIsBlocked(true);
        setBlockEndTime(blockEnd);
        localStorage.setItem("loginBlockEnd", blockEnd.toString());
        toast.error("Muitas tentativas incorretas. Aguarde 5 minutos.");
        
        setTimeout(() => {
          setIsBlocked(false);
          setBlockEndTime(null);
          setAttempts(0);
          localStorage.removeItem("loginBlockEnd");
          localStorage.removeItem("loginAttempts");
        }, BLOCK_DURATION);
      } else {
        const remainingAttempts = MAX_ATTEMPTS - newAttempts;
        toast.error(`Senha incorreta. ${remainingAttempts} tentativa(s) restante(s).`);
      }
      setPassword("");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="bg-gradient-primary text-primary-foreground flex flex-col justify-between p-8 lg:p-14">
        <span className="font-display text-2xl font-extrabold">START<span className="text-accent">.</span></span>
        <div className="py-10 lg:py-0">
          <h1 className="text-3xl lg:text-5xl font-bold leading-tight">Fisioterapia Ortopédica e Esportiva</h1>
          <p className="mt-4 text-primary-foreground/80 max-w-md">Gestão de pacientes, sessões e avaliações em um só lugar.</p>
        </div>
        <p className="hidden lg:block text-sm text-primary-foreground/70">© START Fisioterapia</p>
      </div>
      <div className="flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-0 shadow-elevated">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-accent" />
          </div>
          <CardTitle className="text-2xl">Acessar sistema</CardTitle>
          <CardDescription>
            Acesso apenas para profissionais autorizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Digite a senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isBlocked}
                required
                className="text-center text-lg"
              />
              {isBlocked && (
                <p className="text-sm text-destructive text-center">
                  Acesso temporariamente bloqueado. Tente novamente mais tarde.
                </p>
              )}
              {!isBlocked && attempts > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  {MAX_ATTEMPTS - attempts} tentativa(s) restante(s)
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={isLoading || isBlocked}
            >
              {isBlocked ? "Aguarde..." : isLoading ? "Verificando..." : "Acessar Sistema"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Login;
