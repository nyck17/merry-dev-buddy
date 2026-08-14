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

interface License {
  id: number;
  license_key: string;
  user_name: string | null;
  status: 'active' | 'inactive' | 'suspended';
  license_type: 'paid' | 'trial';
  lifetime: boolean;
  expires_at: string | null;
  activated_at: string | null;
  device_id: string | null;
  session_id: string | null;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
        setIsTableLoading(true);
        // Chamadas em paralelo
        const [meRes, statsRes, licensesRes] = await Promise.all([
          apiCall("me", {}),
          apiCall("stats", {}),
          apiCall("list_licenses", { search: "", status: "" })
        ]);

        if (meRes.ok && statsRes.ok) {
          setIsAuthenticated(true);
          setStats(statsRes.stats);
        }

        if (licensesRes.ok) {
          setLicenses(licensesRes.licenses);
        }
      } catch (err: any) {
        console.error("Dashboard init error:", err);
      } finally {
        setIsLoading(false);
        setIsTableLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const filteredLicenses = useMemo(() => {
    return licenses.filter(license => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        license.license_key.toLowerCase().includes(search) ||
        (license.user_name?.toLowerCase().includes(search) || false) ||
        (license.device_id?.toLowerCase().includes(search) || false);
      
      const matchesStatus = statusFilter === "all" || license.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [licenses, searchTerm, statusFilter]);

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
        
        {/* Filters and Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Buscar por chave, cliente ou dispositivo..."
                className="bg-zinc-950 border-zinc-800 pl-10 h-10 text-sm focus-visible:ring-violet-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-zinc-950 border-zinc-800 h-10 text-sm">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="suspended">Suspensas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            {isTableLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 gap-2">
                <AlertCircle className="h-8 w-8 opacity-20" />
                <p>Nenhuma licença encontrada.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-950/50">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-medium">Chave</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Cliente</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Tipo</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Status</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Expira em</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Dispositivo</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLicenses.map((license) => (
                    <TableRow 
                      key={license.id} 
                      className="border-zinc-800 hover:bg-zinc-800/30 transition-colors group"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-zinc-950 px-2 py-1 rounded text-violet-300 font-mono text-xs border border-zinc-800">
                            {license.license_key}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800"
                            onClick={() => copyToClipboard(license.license_key)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300 font-medium">
                        {license.user_name || "—"}
                      </TableCell>
                      <TableCell>
                        {license.license_type === 'paid' ? (
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15">
                            Pago
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-zinc-500 border-zinc-800">
                            Trial
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {license.status === 'active' && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15">
                            Ativa
                          </Badge>
                        )}
                        {license.status === 'suspended' && (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15">
                            Suspensa
                          </Badge>
                        )}
                        {license.status === 'inactive' && (
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15">
                            Inativa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {license.lifetime ? (
                          <span className="text-violet-400 font-medium flex items-center gap-1.5">
                            <Infinity className="h-3.5 w-3.5" />
                            Vitalícia
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-sm">
                            {license.expires_at 
                              ? format(new Date(license.expires_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                              : "—"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                          {license.device_id ? (
                            <>
                              <Laptop className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[100px]" title={license.device_id}>
                                {license.device_id.substring(0, 8)}...
                              </span>
                            </>
                          ) : (
                            <span className="text-zinc-600 italic">Livre</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
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

