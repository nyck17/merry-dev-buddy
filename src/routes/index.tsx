import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate({ to: "/login" });
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (isAuthenticated === null) return null;
  if (!isAuthenticated) return null;

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <header className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-violet-400">Painel de Licenças</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
        >
          Sair
        </Button>
      </header>
      
      <main>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Stats placeholders as per plan */}
          <StatCard title="Total" value="--" />
          <StatCard title="Ativas" value="--" />
          <StatCard title="Expiradas" value="--" />
          <StatCard title="Vitalícias" value="--" />
        </div>
        
        <div className="mt-12 text-center text-zinc-500 italic">
          Conteúdo do dashboard será implementado em breve...
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-sm">
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      <p className="text-3xl font-bold mt-2 text-zinc-100">{value}</p>
    </div>
  );
}
