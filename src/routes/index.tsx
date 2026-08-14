import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiCall } from "@/lib/api";
import { 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Infinity, 
  LogOut, 
  Plus, 
  User,
  Loader2,
  Copy,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Laptop
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

interface Stats {
  total: number;
  active: number;
  expired: number;
  lifetime: number;
}

function Dashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const email = localStorage.getItem("admin_email") || "";
    setAdminEmail(email);

    if (!token) {
      navigate({ to: "/login" });
      setIsAuthenticated(false);
      return;
    }

    const initDashboard = async () => {
      try {
        // Chamadas em paralelo
        const [meRes, statsRes] = await Promise.all([
          apiCall("me", {}),
          apiCall("stats", {})
        ]);

        if (meRes.ok && statsRes.ok) {
          setIsAuthenticated(true);
          setStats(statsRes.stats);
        }
      } catch (err: any) {
        // Erro 401 já é tratado no apiCall recarregando a página,
        // mas tratamos erros genéricos aqui
        console.error("Dashboard init error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiCall("logout", {});
    } catch (e) {
      // Ignora erro no logout
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_email");
      toast.success("Sessão encerrada.");
      navigate({ to: "/login" });
    }
  };

  if (isAuthenticated === false) return null;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-violet-600 p-1.5 rounded-lg">
              <Key className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              Painel de Licenças
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              size="sm" 
              className="bg-violet-600 hover:bg-violet-700 hidden sm:flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Chave
            </Button>
            
            <div className="h-8 w-px bg-zinc-800 hidden sm:block" />
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-sm font-medium text-zinc-200">{adminEmail}</span>
                <span className="text-xs text-zinc-500 italic">Administrador</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                <User className="h-5 w-5" />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total de Chaves" 
            value={stats?.total || 0} 
            icon={<Key className="h-5 w-5" />}
            color="text-blue-400"
            bg="bg-blue-400/10"
          />
          <StatCard 
            title="Ativas" 
            value={stats?.active || 0} 
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="text-emerald-400"
            bg="bg-emerald-400/10"
          />
          <StatCard 
            title="Expiradas" 
            value={stats?.expired || 0} 
            icon={<AlertCircle className="h-5 w-5" />}
            color="text-red-400"
            bg="bg-red-400/10"
          />
          <StatCard 
            title="Vitalícias" 
            value={stats?.lifetime || 0} 
            icon={<Infinity className="h-5 w-5" />}
            color="text-violet-400"
            bg="bg-violet-400/10"
          />
        </div>

        {/* Content Area Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-200">Visão Geral</h2>
          <Button className="bg-violet-600 hover:bg-violet-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Chave
          </Button>
        </div>
        
        {/* Table placeholder for next phase */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl h-64 flex items-center justify-center text-zinc-500 italic">
          Listagem de chaves será implementada na próxima fase...
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

function StatCard({ title, value, icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden group transition-all hover:border-zinc-700">
      <div className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity ${color}`}>
        {icon}
      </div>
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-100">{value}</p>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}

