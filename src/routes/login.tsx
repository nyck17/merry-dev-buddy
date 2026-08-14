import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiCall } from "@/lib/api";
import { Mail, Lock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiCall("login", { email, password });
      
      if (data.ok) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_email", data.admin.email);
        toast.success("Bem-vindo de volta!", {
          description: `Logado como ${data.admin.email}`
        });
        navigate({ to: "/" });
      } else {
        const msg = data.error === "invalid_credentials" 
          ? "Email ou senha incorretos." 
          : "Erro ao realizar login.";
        toast.error("Falha no acesso", { description: msg });
      }
    } catch (err: any) {
      toast.error("Erro de conexão", { 
        description: err.message || "Não foi possível contatar o servidor." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
      
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl text-zinc-100 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-indigo-600" />
        
        <CardHeader className="space-y-4 pt-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/20 text-violet-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight text-zinc-100">
              Painel Admin
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Gerencie suas licenças com segurança
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lovable.dev" 
                  required
                  className="border-zinc-800 bg-zinc-950/50 pl-10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-violet-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" title="Password" className="text-zinc-300">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-zinc-800 bg-zinc-950/50 pl-10 text-zinc-100 focus-visible:ring-violet-500"
                />
              </div>
            </div>

          </CardContent>
          
          <CardFooter className="pb-8">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-violet-600 text-zinc-100 hover:bg-violet-700 transition-all font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

