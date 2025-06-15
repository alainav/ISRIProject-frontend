"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/public/Agora_azul sin fondo.png";
import {
  Check,
  Search,
  Plus,
  ArrowUpDown,
  Calendar,
  Users,
  Vote,
  Building,
  Settings,
  LogOut,
  LineChart,
  Edit,
  Trash2,
  GalleryThumbnails,
  Power,
  PowerOff,
  MonitorCheck,
} from "lucide-react";
import Link from "next/link";
import {
  getIdentity,
  getIsAuthenticated,
  getStorageUsername,
  getToken,
  prepareAuxCommission,
  prepareAuxVoting,
  socket,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IVoting } from "@/interfaces/IVoting";
import { ICommission } from "@/interfaces/ICommission";
import { IFormData } from "@/interfaces/IFormData";
import { IFormVotingData } from "@/interfaces/IFormVotingData";
import { secondsToMilliseconds } from "date-fns";

// 2. Función para cargar diputados (separa la lógica)
const loadVoting = (
  setMockVoting: Function,
  currentPage: number,
  setTotals: Function
) => {
  socket.emit(
    "list-voting",
    {
      token: getToken(),
      identity: getIdentity(),
      page: currentPage,
    },
    (response: any) => {
      if (response.success) {
        setMockVoting(response.votings);
        setTotals({
          totalPages: response.paginated.paginated.total_pages,
          totalCount: response.paginated.paginated.total_count,
        });
      } else {
        console.error(response.message);
      }
    }
  );
};

export default function VotingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storageUsername, setStorageUserName] = useState<string | null>("");
  const [isAuthenticated, setIsAuthenticated] = useState<string | null>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingVoting, setEditingVoting] = useState<any>(null);
  const [deletingVoting, setDeletingVoting] = useState<IVoting>();
  const [mockVoting, setMockVoting] = useState<IVoting[]>([]);
  const [filteredVoting, setFilteredVoting] = useState<IVoting[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [scheduledCount, setScheduledCount] = useState<number>(0);
  const [commissions, setCommissions] = useState<ICommission[]>([]);
  const [message, setMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState<{
    totalPages: number;
    totalCount: number;
  }>({ totalPages: 0, totalCount: 0 });
  const [startIndex, setStartIndex] = useState<number>(0);

  // 1. Efecto principal para carga inicial
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setIsAuthenticated(getIsAuthenticated());
      setStorageUserName(getStorageUsername());
      setCurrentPage(1);

      try {
        await loadCommissions();
        await loadVoting(setMockVoting, currentPage, setTotals);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [router]);

  // 2. Efecto para paginación
  useEffect(() => {
    const fetchVotingData = async () => {
      setIsLoading(true);
      try {
        await loadVoting(setMockVoting, currentPage, setTotals);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVotingData();
  }, [currentPage]);

  // 3. Efecto para filtrado y estadísticas
  useEffect(() => {
    const updateFilteredData = () => {
      setIsLoading(true);
      const filtered = prepareFilterVoting();
      setFilteredVoting(filtered);
      updateVotingStats(filtered);
      setIsLoading(false);
    };

    updateFilteredData();
  }, [mockVoting, searchTerm, statusFilter]);

  useEffect(() => {
    setTimeout(() => {
      setMessage(undefined);
    }, 10000);
  }, [message]);

  // Funciones optimizadas
  const loadCommissions = async (): Promise<void> => {
    return new Promise((resolve) => {
      socket.emit(
        "list-commissions",
        {
          token: getToken(),
          identity: getIdentity(),
          page: currentPage,
        },
        (response: any) => {
          if (response.success) {
            setCommissions(response.commissions);
            prepareAuxCommission(response.commissions);
          } else {
            console.error(response.message);
          }
          resolve();
        }
      );
    });
  };

  const updateVotingStats = (votingData: IVoting[]) => {
    const activeCount = votingData.filter((s) => s.result === "Activa").length;
    const completedCount = votingData.filter((s) =>
      ["Aprobada", "Denegada", "Sin Desición"].includes(s.result)
    ).length;
    const scheduledCount = votingData.filter(
      (s) => s.result === "Programada"
    ).length;

    setActiveCount(activeCount);
    setCompletedCount(completedCount);
    setScheduledCount(scheduledCount);
  };

  const handleInputChange = (
    field: keyof IFormVotingData,
    value: string | number
  ) => {
    const updatedVoting = { ...editingVoting } as any;

    if (field === "commission") {
      const findCommission = commissions.find((c) => c.name === value);
      value = findCommission?.id_commission || 0;
    }

    updatedVoting[field] = value;

    setEditingVoting(updatedVoting);
  };

  // 1. Reemplazo para handleSaveVoting
  const handleSaveVoting = () => {
    if (!editingVoting) return;

    const action = editingVoting.id_voting ? "update" : "create";
    handleVotingAction(action, editingVoting);
  };

  // 2. Reemplazo para handleConfirmDelete
  const handleConfirmDelete = (id_voting: number | undefined) => {
    if (!id_voting) return;

    handleVotingAction("delete", { id: id_voting });
  };

  const handleVotingAction = async (
    action: "create" | "update" | "delete" | "change-status",
    votingData?: any
  ) => {
    setIsLoading(true);
    try {
      const payload = {
        ...votingData,
        identity: getIdentity(),
        token: getToken(),
      };

      socket.emit(`${action}-voting`, payload, (res: any) => {
        if (res.success) {
          if (action === "delete") {
            setIsDeleteDialogOpen(false);
            setDeletingVoting(undefined);
          } else if (action === "create" || action === "update") {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingVoting(null);
            setMessage(undefined);
          }
          loadVoting(setMockVoting, currentPage, setTotals);
        } else {
          setMessage(res.message);
          console.error(res.message);
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const prepareFilterVoting = (): IVoting[] => {
    if (!mockVoting) return [];

    const searchTermLower = searchTerm.toLowerCase();
    return mockVoting.filter((voting) => {
      const matchesSearch =
        voting.voting_name.toLowerCase().includes(searchTermLower) ||
        voting.commission_name.toLowerCase().includes(searchTermLower);

      return statusFilter === "all"
        ? matchesSearch
        : matchesSearch && voting.result === statusFilter;
    });
  };

  const paginatedVoting = useMemo(() => {
    const newStartIndex = (currentPage - 1) * 10;
    setStartIndex(newStartIndex);
    return filteredVoting.slice(newStartIndex, newStartIndex + 10);
  }, [filteredVoting, currentPage]);

  const navigationTabs = [
    { id: "users", label: "Gestionar Usuario", icon: Users, href: "/users" },
    {
      id: "editions",
      label: "Gestionar Edición",
      icon: Calendar,
      href: "/editions",
    },
    {
      id: "commissions",
      label: "Gestionar Comisiones",
      icon: Building,
      href: "/commissions",
    },
    {
      id: "voting",
      label: "Gestionar Votaciones",
      icon: Vote,
      href: "/voting",
      active: true,
    },
    //{ id: "roles", label: "Gestionar Roles", icon: Settings, href: "/roles" },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("token");
    router.push("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Activa":
      case "Aprobada":
      case "Abierta":
        return "bg-green-100 text-green-800";
      case "Sin Desición":
        return "bg-gray-100 text-gray-800";
      case "Programada":
        return "bg-blue-100 text-blue-800";
      case "Denegada":
      case "Cerrada":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Header Skeleton */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Skeleton */}
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="px-6 py-3 rounded-t-lg bg-gray-200 animate-pulse"
                  style={{ width: "120px" }}
                ></div>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content Skeleton */}
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-md w-40 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg shadow animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-gray-200 rounded-full mr-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 h-10 bg-gray-200 rounded"></div>
              <div className="w-full md:w-48 h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4">
                  <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0 w-full sm:w-auto justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <img
                  src={logo.src}
                  alt="Logo Agora"
                  className="w-16 h-16 md:w-20 md:h-20 object-contain hover:animate-pulse"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                Modelo de Naciones Unidas
              </h1>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-end">
              <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                Bienvenido, {storageUsername || "Usuario"}
              </span>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gray-300 hover:bg-gray-50 whitespace-nowrap"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-1">
            {navigationTabs.map((tab) => (
              <Link key={tab.id} href={tab.href || "#"}>
                <button
                  className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 ${
                    tab.active
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  {tab.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Gestionar Votaciones
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Administre las sesiones de votación del sistema
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Votación
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Votaciones Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Vote className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
                <span className="text-xl sm:text-2xl font-bold">
                  {activeCount}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Votaciones Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
                <span className="text-xl sm:text-2xl font-bold">
                  {completedCount}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
                Votaciones Programadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2" />
                <span className="text-xl sm:text-2xl font-bold">
                  {scheduledCount}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Votaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar votaciones..."
                  className="pl-8 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] text-sm sm:text-base">
                  <SelectValue placeholder="Filtrar por resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los resultados</SelectItem>
                  <SelectItem value="Activa">Activas</SelectItem>
                  <SelectItem value="Aprobada">Aprobadas</SelectItem>
                  <SelectItem value="Denegada">Denegadas</SelectItem>
                  <SelectItem value="Sin Desición">Sin Desición</SelectItem>
                  <SelectItem value="Programada">Programadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
              {message}
              {!paginatedVoting || paginatedVoting.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron votaciones
                </div>
              ) : (
                paginatedVoting.map((voting) => (
                  <div
                    key={voting.id_voting}
                    className="bg-white p-4 rounded-lg shadow"
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium">{voting.voting_name}</h3>
                        <p className="text-sm text-gray-500">
                          {voting.commission_name}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            voting.state
                          )}`}
                        >
                          {voting.state}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            voting.result
                          )}`}
                        >
                          {voting.result}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{voting.totalParticipants}</span>
                        {voting.totalVotes > 0 && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({voting.totalVotes} votos)
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {voting.result !== "Aprobada" &&
                          voting.result !== "Denegada" &&
                          voting.result !== "Sin Desición" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                handleVotingAction("change-status", {
                                  id: voting.id_voting,
                                })
                              }
                            >
                              {voting.state === "Abierta" ? (
                                <PowerOff className="h-3 w-3" />
                              ) : (
                                <Power className="h-3 w-3" />
                              )}
                            </Button>
                          )}

                        {voting.state !== "Cerrada" && (
                          <Link
                            href={`/voting/${voting.id_voting}${
                              voting.state === "Abierta" ? "" : "/monitor"
                            }`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => prepareAuxVoting(voting)}
                            >
                              <Vote className="h-3 w-3" />
                            </Button>
                          </Link>
                        )}

                        <Link href={`/voting/${voting.id_voting}/monitor`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-gray-300 hover:bg-gray-50"
                            onClick={() => prepareAuxVoting(voting)}
                          >
                            <MonitorCheck className="w-3 h-3" />
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setEditingVoting(voting);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 hover:text-red-700"
                          onClick={() =>
                            handleVotingAction("delete", {
                              id: voting.id_voting,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Pagination for mobile */}
              {!isLoading && (
                <div className="sm:hidden bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="text-xs text-gray-700 text-center">
                      Mostrando {filteredVoting.length} de{" "}
                      {Math.min(startIndex + 10, totals.totalCount)} comisiones
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="border-gray-300 text-xs"
                      >
                        Anterior
                      </Button>
                      <span className="px-3 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded">
                        Página {currentPage}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totals.totalPages}
                        className="border-gray-300 text-xs"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[350px]">
                      <div className="flex items-center">
                        Título
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Comisión</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Participantes
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!paginatedVoting || paginatedVoting.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No se encontraron votaciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedVoting.map((voting) => (
                      <TableRow key={voting.id_voting}>
                        <TableCell className="font-medium">
                          {voting.voting_name}
                        </TableCell>
                        <TableCell>{voting.commission_name}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              voting.state
                            )}`}
                          >
                            {voting.state}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              voting.result
                            )}`}
                          >
                            {voting.result}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{voting.totalParticipants}</span>
                            {voting.totalVotes > 0 && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({voting.totalVotes} votos)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                voting.result === "Aprobada" ||
                                voting.result === "Denegada" ||
                                voting.result === "Sin Desición"
                                  ? "hidden"
                                  : ""
                              }
                              onClick={() =>
                                handleVotingAction("change-status", {
                                  id: voting.id_voting,
                                })
                              }
                            >
                              {voting.state === "Abierta" ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>

                            <Link
                              href={`${
                                voting.state === "Abierta"
                                  ? `/voting/${voting.id_voting}`
                                  : `/voting/${voting.id_voting}/monitor`
                              }`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className={
                                  voting.state === "Cerrada" ? "hidden" : ""
                                }
                                onClick={() => {
                                  prepareAuxVoting(voting);
                                }}
                              >
                                <Vote className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/voting/${voting.id_voting}/monitor`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-300 hover:bg-gray-50"
                                onClick={() => {
                                  prepareAuxVoting(voting);
                                }}
                              >
                                <MonitorCheck className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleVotingAction("update", {
                                  id: voting.id_voting,
                                })
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() =>
                                handleVotingAction("delete", {
                                  id: voting.id_voting,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-700">
                    Mostrando {startIndex + 1} a{" "}
                    {Math.min(startIndex + 10, totals.totalCount)} de{" "}
                    {totals.totalCount} resultados
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="border-gray-300 text-xs sm:text-sm"
                    >
                      Anterior
                    </Button>
                    <span className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-300 rounded">
                      {currentPage} / {totals.totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(
                          Math.min(totals.totalPages, currentPage + 1)
                        )
                      }
                      disabled={
                        currentPage === totals.totalPages ||
                        totals.totalPages === 0
                      }
                      className="border-gray-300 text-xs sm:text-sm"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Crear/Editar Votación */}
        <Dialog
          open={isCreateDialogOpen || isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setEditingVoting(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingVoting ? "Editar Votación" : "Crear Nueva Votación"}
              </DialogTitle>
              <DialogDescription>
                {editingVoting
                  ? "Modifique los datos de la votación."
                  : "Complete los datos para crear una nueva votación."}
              </DialogDescription>
              <DialogDescription>{message}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input
                  id="title"
                  defaultValue={editingVoting?.voting_name}
                  className="col-span-3"
                  placeholder="Título de la votación"
                  onChange={(e) => {
                    handleInputChange("voting_name", e.target.value);
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  defaultValue={editingVoting?.description}
                  className="col-span-3"
                  placeholder="Descripción detallada..."
                  onChange={(e) => {
                    handleInputChange("voting_description", e.target.value);
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="commission" className="text-right">
                  Comisión
                </Label>
                <Select
                  defaultValue={editingVoting?.commission_name}
                  onValueChange={(value) =>
                    handleInputChange("commission", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar comisión" />
                  </SelectTrigger>
                  <SelectContent>
                    {commissions.map((actualCommi) => (
                      <SelectItem
                        key={actualCommi.id_commission}
                        value={actualCommi.name}
                      >
                        {actualCommi.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditingVoting(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveVoting}>
                {editingVoting ? "Guardar Cambios" : "Crear Votación"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Eliminar Votación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Eliminar Votación</DialogTitle>
              <DialogDescription>
                ¿Está seguro que desea eliminar la votación "
                {deletingVoting?.voting_name}"? Esta acción no se puede deshacer
                y se perderán todos los votos registrados.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleConfirmDelete(deletingVoting?.id_voting)}
              >
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
