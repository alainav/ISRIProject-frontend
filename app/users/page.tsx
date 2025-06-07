"use client";

import { Label } from "@/components/ui/label";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  Building,
  Vote,
  Settings,
  Search,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Mail,
  MapPin,
  Shield,
  CalendarIcon,
  Icon,
  Orbit,
} from "lucide-react";
import Link from "next/link";
import {
  prepareAuxCountry,
  prepareAuxRole,
  prepareAuxUser,
  socket,
} from "@/lib/utils";
import { IUser } from "@/interfaces/IUser";

type SortField = "userName" | "email" | "creationDate" | "expirationDate";
type SortDirection = "asc" | "desc";

// 2. Función para cargar diputados (separa la lógica)
const loadDeputies = (setMockUsers: Function, currentPage: number) => {
  socket.emit(
    "list-all-deputies",
    {
      token: sessionStorage.getItem("token"),
      identity: sessionStorage.getItem("identity"),
      page: currentPage,
    },
    (response: any) => {
      if (response.success) {
        setMockUsers(response.deputies);
      }
    }
  );
};

export default function UsersPage() {
  const router = useRouter();
  const identity = sessionStorage.getItem("identity");
  const token = sessionStorage.getItem("token");
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("userName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [mockUsers, setMockUsers] = useState<IUser[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: number; name: string }[]>(
    []
  );

  // Enhanced mock data with more users and better variety

  useEffect(() => {
    // 1. Verificación inicial de autenticación (se ejecuta primero)
    const isAuthenticated = sessionStorage.getItem("authenticated");
    if (!isAuthenticated) {
      router.push("/");
      return; // Detiene la ejecución si no está autenticado
    }

    // 3. Función para cargar los roles (separa la lógica)
    const loadRoles = () => {
      socket.emit(
        "get-roles",
        {
          token: sessionStorage.getItem("token"),
          identity: sessionStorage.getItem("identity"),
          page: currentPage,
        },
        (response: any) => {
          if (response.success) {
            setRoles(response.roles);
            prepareAuxRole(response.roles);
          }
        }
      );
    };

    // 4. Función para cargar los paises (separa la lógica)
    const loadCountries = () => {
      socket.emit(
        "get-countries",
        {
          token: sessionStorage.getItem("token"),
          identity: sessionStorage.getItem("identity"),
          page: currentPage,
        },
        (response: any) => {
          if (response.success) {
            setCountries(response.countries);
            prepareAuxCountry(response.countries);
          }
        }
      );
    };

    loadDeputies(setMockUsers, currentPage);
    loadRoles();
    loadCountries();
  }, [router, currentPage, socket]); // Agrega todas las dependencias necesarias

  const handleLogout = () => {
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    router.push("/");
  };

  const handleDelete = (userName: string, eventName: string) => {
    socket.emit(eventName, { identity, token, userName }, (response: any) => {
      if (response.success) {
        //Recargar a los representantes
        loadDeputies(setMockUsers, currentPage);
      }
    });
  };

  const navigationTabs = [
    {
      id: "users",
      label: "Gestionar Usuario",
      icon: Users,
      href: "/users",
      active: true,
    },
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
    },
    { id: "roles", label: "Gestionar Roles", icon: Settings, href: "/roles" },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-600" />
    );
  };

  const filteredAndSortedUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry =
      !countryFilter || user.country.name === countryFilter;
    const matchesRole = !roleFilter || user.role.name === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;

    return matchesSearch && matchesCountry && matchesRole && matchesStatus;
  });
  /*.sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];

      if (sortField === "creationDate" || sortField === "expirationDate") {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });*/

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Activo
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Inactivo
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Expirado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCountryFilter("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">XIII</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Modelo de Naciones Unidas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium">
                Bienvenido, {sessionStorage.getItem("username") || "Usuario"}
              </span>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gray-300 hover:bg-gray-50"
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
          <div className="flex space-x-1 overflow-x-auto">
            {navigationTabs.map((tab) => (
              <Link key={tab.id} href={tab.href || "#"}>
                <button
                  className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 ${
                    tab.active
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4 inline mr-2" />
                  {tab.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Gestión de Representantes
              </h2>
              <p className="text-gray-600 mt-1">
                Administre a los representantes del sistema Modelo ONU
              </p>
            </div>
            <Link href="/users/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 transform hover:scale-105">
                <UserPlus className="w-4 h-4 mr-2" />
                Añadir Representante
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockUsers.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total Representantes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockUsers.filter((u) => u.status === "Activo").length}
                    </p>
                    <p className="text-sm text-gray-600">
                      Representantes Activos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {countries.length}
                    </p>
                    <p className="text-sm text-gray-600">Países</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Settings className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {roles.length}
                    </p>
                    <p className="text-sm text-gray-600">Roles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Buscar Usuario
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre, email o usuario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    País
                  </Label>
                  <Select
                    value={countryFilter}
                    onValueChange={setCountryFilter}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Todos los países" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los países</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Rol
                  </Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Todos los roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Estado
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-sm text-gray-600">
                  Mostrando {paginatedUsers.length} de{" "}
                  {filteredAndSortedUsers.length} usuarios
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="text-sm"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort("email")}
                          className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Correo</span>
                          {getSortIcon("email")}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-gray-900">
                          Usuario
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-gray-900">
                          Código de Acceso
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort("userName")}
                          className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          <span>Nombre Completo</span>
                          {getSortIcon("userName")}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort("creationDate")}
                          className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          <CalendarIcon className="w-4 h-4" />
                          <span>Fecha Creación</span>
                          {getSortIcon("creationDate")}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort("expirationDate")}
                          className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          <CalendarIcon className="w-4 h-4" />
                          <span>Fecha Expiración</span>
                          {getSortIcon("expirationDate")}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          //onClick={() => handleSort("country")}
                          className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>País</span>
                          {
                            //getSortIcon("country")
                          }
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          //onClick={() => handleSort("role")}
                          className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Rol</span>
                          {
                            //getSortIcon("role")
                          }
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-gray-900">
                          Estado
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-gray-900">
                          Acciones
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user.email}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {user.userName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {user.code_access}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {user.name.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {user.date_register}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {user.date_expired}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {user.country.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {user.role.name}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link href={`/users/${user.userName}/edit`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-300 hover:bg-blue-50 text-blue-700"
                                onClick={() => prepareAuxUser(user)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 hover:bg-red-50 text-red-700"
                              onClick={() =>
                                handleDelete(user.userName, "delete-deputy")
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-300 hover:bg-green-50 text-green-700"
                              onClick={() =>
                                handleDelete(user.userName, "activate-deputy")
                              }
                            >
                              <Orbit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Mostrando {startIndex + 1} a{" "}
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredAndSortedUsers.length
                    )}{" "}
                    de {filteredAndSortedUsers.length} resultados
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="border-gray-300"
                    >
                      Anterior
                    </Button>
                    <span className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="border-gray-300"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
