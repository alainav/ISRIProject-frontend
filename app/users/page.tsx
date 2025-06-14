"use client";

import { Label } from "@/components/ui/label";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
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
  User,
  Key,
  Loader,
} from "lucide-react";
import Link from "next/link";
import {
  getAuxCountries,
  getIdentity,
  getIsAuthenticated,
  getStorageUsername,
  getToken,
  prepareAuxCountry,
  prepareAuxRole,
  prepareAuxUser,
  socket,
} from "@/lib/utils";
import { IUser } from "@/interfaces/IUser";
import { CountrySelect } from "./countryselect";

type SortField = "userName" | "email" | "creationDate" | "expirationDate";
type SortDirection = "asc" | "desc";

// 2. Función para cargar diputados (separa la lógica)
const loadDeputies = (
  setMockUsers: Function,
  setTotals: Function,
  currentPage: number
) => {
  socket.emit(
    "list-all-deputies",
    {
      token: getToken(),
      identity: getIdentity(),
      page: currentPage,
    },
    (response: any) => {
      if (response.success) {
        setMockUsers(response.deputies);
        setTotals({
          totalPages: response.paginated.total_pages,
          totalCount: response.paginated.total_count,
        });
      }
    }
  );
};

export default function UsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("userName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [mockUsers, setMockUsers] = useState<IUser[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: number; name: string }[]>(
    []
  );
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [countriesLoaded, setCountriesLoaded] = useState(false);
  const [totals, setTotals] = useState<{
    totalPages: number;
    totalCount: number;
  }>({ totalPages: 0, totalCount: 0 });
  const [totalsCountry, setTotalsCountry] = useState<number>(10000);

  const [startIndex, setStartIndex] = useState<number>(0);
  const [filteredAndSortedUsers, setFilterUsers] = useState<IUser[]>([]);
  //SessionStorge Variables
  const [storageUsername, setStorageUserName] = useState<string | null>("");
  const [isAuthenticated, setAuthenticated] = useState<string | null>();

  // 2. Modificar la función loadCountries para usar paginación
  const loadCountries = (page = 1, initialLoad = false) => {
    // No cargar si ya estamos cargando o si ya cargamos todos los países
    if (
      isLoadingCountries ||
      (countriesLoaded && initialLoad) ||
      countries.length > totalsCountry
    )
      return;

    if (getAuxCountries().length !== 0) {
      setCountries(getAuxCountries());
      return;
    }

    setIsLoadingCountries(true);
    socket.emit(
      "get-countries",
      {
        token: getToken(),
        identity: getIdentity(),
        page: page,
        perPage: 50,
      },
      (response: any) => {
        if (response.success) {
          setCountries((prev) => [...prev, ...response.countries]);

          setTotalsCountry(response.paginated.paginated.total_count);

          // Verificar si hay más páginas por cargar
          if (page < response.paginated.paginated.total_pages) {
            loadCountries(page + 1);
          } else {
            setCountriesLoaded(true);
          }
        }

        setIsLoadingCountries(false);
      }
    );
  };

  useEffect(() => {
    setIsLoading(true);
    // 1. Verificación inicial de autenticación (se ejecuta primero)
    setAuthenticated(getIsAuthenticated());
    setStorageUserName(getStorageUsername());

    // 3. Función para cargar los roles (separa la lógica)
    const loadRoles = () => {
      socket.emit(
        "get-roles",
        {
          token: getToken(),
          identity: getIdentity(),
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

    loadDeputies(setMockUsers, setTotals, currentPage);
    loadRoles();
    loadCountries(1, true); // Cargar solo primera página inicialmente
    setIsLoading(false);
  }, [router, socket]); // Agrega todas las dependencias necesarias

  useEffect(() => {
    if (isAuthenticated === null) {
      router.push("/");
      return; // Detiene la ejecución si no está autenticado
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setIsLoading(true);
    loadDeputies(setMockUsers, setTotals, currentPage);
    setIsLoading(false);
  }, [currentPage]);

  useEffect(() => {
    setIsLoading(true);
    const filtered = prepareFilterDeputies();
    setFilterUsers(filtered);
    setIsLoading(false);
  }, [mockUsers, searchTerm, countryFilter, roleFilter, statusFilter]);

  // 4. Crear función para cargar más países cuando se abre el dropdown

  const handleLogout = () => {
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("token");
    router.push("/");
  };

  const handleDelete = (userName: string, eventName: string) => {
    setIsLoading(true);
    socket.emit(
      eventName,
      { identity: getIdentity(), token: getToken(), userName },
      (response: any) => {
        if (response.success) {
          //Recargar a los representantes
          loadDeputies(setMockUsers, setTotals, currentPage);
        }
      }
    );
    setIsLoading(false);
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
    //{ id: "roles", label: "Gestionar Roles", icon: Settings, href: "/roles" },
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

  const prepareFilterDeputies = () => {
    return mockUsers?.filter((user) => {
      const matchesSearch =
        user.name.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry =
        !countryFilter || user.country.id.toString() === countryFilter;
      const matchesRole = !roleFilter || user.role.name === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;

      return matchesSearch && matchesCountry && matchesRole && matchesStatus;
    });
  };

  const paginatedUsers = useMemo(() => {
    setStartIndex((currentPage - 1) * 10);
    return filteredAndSortedUsers.slice(0, itemsPerPage);
  }, [filteredAndSortedUsers, currentPage, itemsPerPage]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-xs py-1 px-2 rounded-full border";

    switch (status) {
      case "Activo":
        return (
          <span
            className={`${baseClasses} bg-green-100 text-green-800 border-green-200`}
          >
            Activo
          </span>
        );
      case "inactive":
        return (
          <span
            className={`${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`}
          >
            Inactivo
          </span>
        );
      case "Inactivo":
        return (
          <span
            className={`${baseClasses} bg-red-100 text-red-800 border-red-200`}
          >
            Expirado
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}
          >
            {status}
          </span>
        );
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
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0 w-full sm:w-auto justify-center sm:justify-start">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white font-bold text-sm">XIII</span>
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
            {!isLoadingCountries ? (
              <Link href="/users/new">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 transform hover:scale-105"
                  onClick={() => prepareAuxCountry(countries)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Añadir Representante
                </Button>
              </Link>
            ) : (
              <Loader className="w-4 h-4 animate-spin" />
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {totals.totalCount}
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

                  <CountrySelect
                    countries={countries}
                    value={countryFilter}
                    onValueChange={setCountryFilter}
                    placeholder="Seleccione un país"
                    className="mb-4"
                    isLoading={isLoadingCountries}
                    countriesLoaded={countriesLoaded}
                    onOpenChange={(open) => {
                      if (open && !countriesLoaded && !isLoadingCountries) {
                        //loadCountries(1, true);
                      }
                    }}
                  />
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
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-sm text-gray-600">
                  Mostrando {paginatedUsers.length} de {totals.totalCount}{" "}
                  representantes
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
              {isLoading ? (
                <div className="p-6">
                  <div className="hidden md:block">
                    {/* Desktop Skeleton */}
                    <div className="animate-pulse space-y-4">
                      <div className="grid grid-cols-10 gap-4">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className="h-4 bg-gray-300 rounded"
                          ></div>
                        ))}
                      </div>
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="grid grid-cols-10 gap-4 pt-4">
                          {[...Array(10)].map((_, j) => (
                            <div
                              key={j}
                              className="h-4 bg-gray-200 rounded"
                            ></div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="block md:hidden">
                    {/* Mobile Skeleton */}
                    <div className="animate-pulse space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow">
                          <div className="flex justify-between">
                            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                            <div className="h-6 bg-gray-300 rounded w-16"></div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/5"></div>
                          </div>
                          <div className="mt-4 flex justify-end space-x-2">
                            <div className="h-8 w-8 bg-gray-300 rounded"></div>
                            <div className="h-8 w-8 bg-gray-300 rounded"></div>
                            <div className="h-8 w-8 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
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
                              onClick={() => handleSort("expirationDate")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <CalendarIcon className="w-4 h-4" />
                              <span>Fecha Expiración</span>
                              {getSortIcon("expirationDate")}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              <MapPin className="w-4 h-4" />
                              <span>País</span>
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              <Shield className="w-4 h-4" />
                              <span>Rol</span>
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
                                {!isLoadingCountries ? (
                                  <Link href={`/users/${user.userName}/edit`}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-blue-300 hover:bg-blue-50 text-blue-700"
                                      onClick={() => {
                                        prepareAuxUser(user);
                                        prepareAuxCountry(countries);
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                ) : (
                                  <Loader className="w-4 h-4 animate-spin" />
                                )}

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
                                    handleDelete(
                                      user.userName,
                                      "activate-deputy"
                                    )
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

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs sm:text-sm text-gray-700">
                          Mostrando {filteredAndSortedUsers.length} de{" "}
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

                  {/* Mobile Cards */}
                  <div className="block md:hidden p-4">
                    {paginatedUsers.map((user) => (
                      <div
                        key={user.email}
                        className="bg-white rounded-lg shadow p-4 mb-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {user.name.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {user.email}
                            </p>
                          </div>
                          {getStatusBadge(user.status)}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{user.userName}</span>
                          </div>
                          <div className="flex items-center">
                            <Key className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{user.code_access}</span>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{user.date_register}</span>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{user.date_expired}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{user.country.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{user.role.name}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end space-x-2">
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
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Pagination */}
              {/*{!isLoading && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
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
                        className="border-gray-300"
                      >
                        Anterior
                      </Button>
                      <span className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded">
                        {currentPage} / {totals.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(
                            Math.min(totals.totalPages, currentPage + 1)
                          )
                        }
                        disabled={currentPage === totals.totalPages}
                        className="border-gray-300"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </div>
              )}*/}
              {/* Pagination for mobile */}
              {!isLoading && (
                <div className="sm:hidden bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="text-xs text-gray-700 text-center">
                      Mostrando {filteredAndSortedUsers.length} de{" "}
                      {totals.totalCount} comisiones
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
