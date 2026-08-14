import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Laptop,
  ShieldCheck,
  Settings,
  Lock,
  UserPlus
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

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFields, setEditFields] = useState({
    user_name: "",
    status: "active" as License['status'],
    license_type: "paid" as License['license_type'],
    lifetime: false,
    expires_days: 0,
    expires_minutes: 0,
    clear_device: false
  });

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createFields, setCreateFields] = useState({
    user_name: "",
    license_type: "paid" as License['license_type'],
    lifetime: false,
    expires_days: 30,
    expires_minutes: 0,
    custom_key: ""
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLicense, setDeletingLicense] = useState<License | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    new_password: "",
    confirm_password: ""
  });

  // Register Admin Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerFields, setRegisterFields] = useState({
    email: "",
    password: ""
  });

  const fetchLicenses = async () => {
    try {
      setIsTableLoading(true);
      const res = await apiCall("list_licenses", { search: "", status: "" });
      if (res.ok) {
        setLicenses(res.licenses);
      }
    } catch (err) {
      console.error("Fetch licenses error:", err);
    } finally {
      setIsTableLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const res = await apiCall("stats", {});
      if (res.ok) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

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

  const handleEditClick = async (license_key: string) => {
    try {
      setIsTableLoading(true);
      const res = await apiCall("get_license", { license_key });
      if (res.ok && res.license) {
        const l = res.license;
        setEditingLicense(l);
        setEditFields({
          user_name: l.user_name || "",
          status: l.status,
          license_type: l.license_type,
          lifetime: l.lifetime,
          expires_days: 0,
          expires_minutes: 0,
          clear_device: false
        });
        setIsEditModalOpen(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar dados da licença");
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingLicense) return;
    
    setEditLoading(true);
    try {
      const fields: any = {
        user_name: editFields.user_name,
        status: editFields.status,
        license_type: editFields.license_type,
        lifetime: editFields.lifetime
      };

      if (editFields.expires_days > 0) fields.expires_days = editFields.expires_days;
      if (editFields.expires_minutes > 0) fields.expires_minutes = editFields.expires_minutes;
      if (editFields.clear_device) fields.clear_device = true;

      const res = await apiCall("update_license", { 
        license_key: editingLicense.license_key, 
        fields 
      });

      if (res.ok) {
        toast.success("Chave atualizada!", {
          description: "As alterações foram salvas com sucesso."
        });
        setIsEditModalOpen(false);
        fetchLicenses();
        refreshStats();
      }
    } catch (err: any) {
      toast.error("Erro na atualização", {
        description: err.message || "Erro ao atualizar licença"
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateLicense = async () => {
    if (!createFields.lifetime && createFields.expires_days === 0 && createFields.expires_minutes === 0) {
      toast.error("Defina uma duração.");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await apiCall("create_license", createFields);

      if (res.ok) {
        const newKey = res.license.license_key;
        toast.success("Chave criada com sucesso!", {
          duration: 6000,
          action: {
            label: "Copiar chave",
            onClick: () => {
              navigator.clipboard.writeText(newKey);
              toast.success("Copiado!");
            },
          },
        });
        setIsCreateModalOpen(false);
        setCreateFields({
          user_name: "",
          license_type: "paid",
          lifetime: false,
          expires_days: 30,
          expires_minutes: 0,
          custom_key: ""
        });
        fetchLicenses();
        refreshStats();
      }
    } catch (err: any) {
      if (err.message === "key_in_use") {
        toast.error("Esta chave já existe.");
      } else {
        toast.error(err.message || "Erro ao criar licença");
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteLicense = async () => {
    if (!deletingLicense) return;

    setDeleteLoading(true);
    try {
      const res = await apiCall("delete_license", { 
        license_key: deletingLicense.license_key 
      });

      if (res.ok) {
        toast.success("Chave apagada!", {
          description: "A licença foi removida permanentemente."
        });
        setIsDeleteModalOpen(false);
        fetchLicenses();
        refreshStats();
      }
    } catch (err: any) {
      toast.error("Falha ao apagar", {
        description: err.message || "Erro desconhecido"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Chave copiada!", {
      duration: 2000,
      description: "A chave foi enviada para sua área de transferência."
    });
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

  const handleChangePassword = async () => {
    if (passwordFields.new_password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (passwordFields.new_password !== passwordFields.confirm_password) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await apiCall("change_password", { new_password: passwordFields.new_password });
      if (res.ok) {
        toast.success("Senha alterada! Faça login novamente.");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_email");
        setIsPasswordModalOpen(false);
        navigate({ to: "/login" });
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar senha");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRegisterAdmin = async () => {
    if (!registerFields.email.includes("@")) {
      toast.error("E-mail inválido.");
      return;
    }
    if (registerFields.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setRegisterLoading(true);
    try {
      const res = await apiCall("register_admin", registerFields);
      if (res.ok) {
        toast.success("Admin cadastrado!");
        setIsRegisterModalOpen(false);
        setRegisterFields({ email: "", password: "" });
      }
    } catch (err: any) {
      if (err.message === "email_in_use") {
        toast.error("Este email já está em uso.");
      } else if (err.message === "invalid_data") {
        toast.error("Dados inválidos.");
      } else {
        toast.error("Erro ao cadastrar.");
      }
    } finally {
      setRegisterLoading(false);
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
              onClick={() => setIsCreateModalOpen(true)}
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-zinc-700 bg-zinc-800 hover:bg-zinc-700">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-transparent text-zinc-400 font-medium uppercase">
                        {adminEmail ? adminEmail.charAt(0) : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800 text-zinc-100" align="end" sideOffset={8}>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{adminEmail}</p>
                      <p className="text-xs leading-none text-zinc-500 italic">Administrador</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem 
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="focus:bg-violet-500/10 focus:text-violet-400 cursor-pointer"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    <span>Trocar senha</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="focus:bg-violet-500/10 focus:text-violet-400 cursor-pointer"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Cadastrar novo admin</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair da conta</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-zinc-400 hover:text-red-400 hover:bg-red-400/10 hidden sm:flex"
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
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 flex items-center gap-2"
          >
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
                            onClick={() => handleEditClick(license.license_key)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingLicense(license);
                              setIsDeleteModalOpen(true);
                            }}
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

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-violet-400" />
              Editar Chave
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Cliente</Label>
              <Input 
                value={editFields.user_name}
                onChange={e => setEditFields(prev => ({ ...prev, user_name: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-violet-500"
                placeholder="Nome do cliente"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Status</Label>
                <Select 
                  value={editFields.status} 
                  onValueChange={v => setEditFields(prev => ({ ...prev, status: v as any }))}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="suspended">Suspensa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Tipo de Licença</Label>
                <Select 
                  value={editFields.license_type} 
                  onValueChange={v => setEditFields(prev => ({ ...prev, license_type: v as any }))}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="paid">Paga</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
              <Checkbox 
                id="lifetime" 
                checked={editFields.lifetime}
                onCheckedChange={checked => setEditFields(prev => ({ ...prev, lifetime: !!checked }))}
              />
              <Label htmlFor="lifetime" className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2">
                <Infinity className="h-4 w-4 text-violet-400" />
                Licença Vitalícia
              </Label>
            </div>

            {!editFields.lifetime && (
              <div className="space-y-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-200 mb-1">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Nova Expiração
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-500">Adicionar dias</Label>
                    <Input 
                      type="number"
                      min="0"
                      value={editFields.expires_days}
                      onChange={e => setEditFields(prev => ({ ...prev, expires_days: parseInt(e.target.value) || 0 }))}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-500">Adicionar minutos</Label>
                    <Input 
                      type="number"
                      min="0"
                      value={editFields.expires_minutes}
                      onChange={e => setEditFields(prev => ({ ...prev, expires_minutes: parseInt(e.target.value) || 0 }))}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 italic">
                  Deixe 0 em ambos para manter a data atual OU preencha para redefinir a partir de agora.
                </p>
              </div>
            )}

            {editingLicense?.device_id && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditFields(prev => ({ ...prev, clear_device: true }))}
                className={`w-full justify-start gap-2 border-red-500/20 text-red-400 hover:bg-red-400/10 hover:text-red-400 transition-all ${editFields.clear_device ? 'bg-red-400/20 border-red-500/50' : ''}`}
              >
                <Laptop className="h-4 w-4" />
                {editFields.clear_device ? "Dispositivo será desvinculado" : "Desvincular Dispositivo"}
              </Button>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white min-w-[100px]"
            >
              {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-violet-400" />
              Nova Chave
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Nome do Cliente</Label>
              <Input 
                value={createFields.user_name}
                onChange={e => setCreateFields(prev => ({ ...prev, user_name: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-violet-500"
                placeholder="Ex: João Silva (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400">Tipo de Licença</Label>
              <Select 
                value={createFields.license_type} 
                onValueChange={v => setCreateFields(prev => ({ ...prev, license_type: v as any }))}
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectItem value="paid">Paga</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
              <Checkbox 
                id="create-lifetime" 
                checked={createFields.lifetime}
                onCheckedChange={checked => setCreateFields(prev => ({ ...prev, lifetime: !!checked }))}
              />
              <Label htmlFor="create-lifetime" className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2">
                <Infinity className="h-4 w-4 text-violet-400" />
                Licença vitalícia (sem expiração)
              </Label>
            </div>

            {!createFields.lifetime && (
              <div className="space-y-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-200 mb-1">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Duração
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-500">Dias</Label>
                    <Input 
                      type="number"
                      min="0"
                      value={createFields.expires_days}
                      onChange={e => setCreateFields(prev => ({ ...prev, expires_days: parseInt(e.target.value) || 0 }))}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-500">Minutos</Label>
                    <Input 
                      type="number"
                      min="0"
                      value={createFields.expires_minutes}
                      onChange={e => setCreateFields(prev => ({ ...prev, expires_minutes: parseInt(e.target.value) || 0 }))}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 italic">
                  A licença expira em {createFields.expires_days} dias e {createFields.expires_minutes} minutos a partir da criação.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-zinc-400">Chave personalizada</Label>
              <Input 
                value={createFields.custom_key}
                onChange={e => setCreateFields(prev => ({ ...prev, custom_key: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-violet-500"
                placeholder="Deixe vazio para gerar automaticamente"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateLicense}
              disabled={createLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white min-w-[120px]"
            >
              {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Chave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              Excluir Chave
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <p className="text-zinc-300">
              Tem certeza que deseja apagar esta chave?
            </p>
            
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-center">
              <code className="text-violet-400 font-mono text-sm">
                {deletingLicense?.license_key}
              </code>
            </div>

            <p className="text-xs text-zinc-500 bg-red-500/5 p-2 rounded border border-red-500/10">
              Esta ação <strong className="text-red-400/80">NÃO</strong> pode ser desfeita.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteLicense}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white min-w-[150px]"
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apagar definitivamente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

