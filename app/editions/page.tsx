"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  Building,
  Vote,
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarIcon,
  User,
} from "lucide-react";
import Link from "next/link";
import { IEdition } from "@/interfaces/IEdition";
import {
  getIdentity,
  getIsAuthenticated,
  getStorageUsername,
  getToken,
  socket,
} from "@/lib/utils";
import { IUser } from "@/interfaces/IUser";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";

type SortField =
  | number
  | "name"
  | "initial_date"
  | "end_date"
  | "duration"
  | "president"
  | "secretary";
type SortDirection = "asc" | "desc";

// 2. Función para cargar diputados (separa la lógica)
const loadEditions = (setMockEditions: Function, currentPage: number) => {
  socket.emit(
    "list-editions",
    {
      token: getToken(),
      identity: getIdentity(),
      page: currentPage,
    },
    (response: any) => {
      if (response.success) {
        setMockEditions(response.editions);
      }
    }
  );
};

export default function EditionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IEdition | null>(null);
  const [mockEditions, setMockEditions] = useState<IEdition[]>([]);
  const [presidents, setPresidents] = useState<IUser[]>([]);
  const [secretaries, setSecretaries] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [storageUsername, setStorageUserName] = useState<string | null>("");
  const [isAuthenticated, setIsAuthenticated] = useState<string | null>();

  useEffect(() => {
    setIsLoading(true);
    setIsAuthenticated(getIsAuthenticated());
    setStorageUserName(getStorageUsername());

    const loadDeputies = (deputy: string) => {
      socket.emit(
        `get-list-general-${deputy}`,
        {
          token: getToken(),
          identity: getIdentity(),
          page: currentPage,
        },
        (response: any) => {
          if (response.success) {
            if (deputy === "presidents") setPresidents(response.deputies);
            else setSecretaries(response.deputies);
          }
        }
      );
    };

    loadEditions(setMockEditions, currentPage);
    loadDeputies("presidents");
    loadDeputies("secretaries");
    setIsLoading(false);
  }, [router, currentPage]);

  useEffect(() => {
    if (isAuthenticated === null) {
      router.push("/");
      return; // Detiene la ejecución si no está autenticado
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("token");
    router.push("/");
  };

  const handleOnUpdate = (id: number | undefined) => {
    setIsLoading(true);
    const sendEdition = { ...selectedItem };

    if (id !== 0) {
      if (!id) {
        return;
      }
      (sendEdition.president = sendEdition.presidentUserName),
        (sendEdition.secretary = sendEdition.secretaryUserName);

      socket.emit(
        "update-edition",
        { identity: getIdentity(), token: getToken(), id, ...sendEdition },
        (response: any) => {
          if (response.success) {
            //Recargar a las ediciones
            loadEditions(setMockEditions, currentPage);
          } else {
            console.error(response.message);
          }
        }
      );
    } else {
      socket.emit(
        "create-edition",
        { identity: getIdentity(), token: getToken(), ...selectedItem },
        (response: any) => {
          if (response.success) {
            //Recargar a las ediciones
            loadEditions(setMockEditions, currentPage);
          } else {
            console.error(response.message);
          }
        }
      );
    }
    setIsLoading(false);
  };

  const handleInputChange = (field: keyof IEdition, value: string) => {
    const updatedEdition: any = { ...selectedItem };

    updatedEdition[field] = value;
    if (field === "president" || field === "secretary") {
      updatedEdition[`${field}UserName`] = value;
    }

    // Actualizar ambos: estado local y usuario auxiliar
    setSelectedItem(updatedEdition);
  };

  const handleDelete = (id: number) => {
    setIsLoading(true);
    socket.emit(
      "delete-edition",
      { identity: getIdentity(), token: getToken(), id },
      (response: any) => {
        if (response.success) {
          //Recargar a las ediciones
          loadEditions(setMockEditions, currentPage);
        }
      }
    );
    setIsLoading(false);
  };

  const navigationTabs = [
    { id: "users", label: "Gestionar Usuario", icon: Users, href: "/users" },
    {
      id: "editions",
      label: "Gestionar Edición",
      icon: Calendar,
      href: "/editions",
      active: true,
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

  const filteredAndSortedEditions = mockEditions.filter((edition) => {
    return (
      edition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      edition.president.toLowerCase().includes(searchTerm.toLowerCase()) ||
      edition.secretary.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredAndSortedEditions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEditions = filteredAndSortedEditions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const renderEditionForm = (edition: IEdition | null = null) => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
          {edition ? "Modificar Edición" : "Crear una Edición"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre de Edición
            </label>
            <Input
              defaultValue={edition?.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha de Inicio
            </label>
            <Input
              type="date"
              defaultValue={edition?.initial_date || ""}
              onChange={(e) =>
                handleInputChange("initial_date", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha de Finalización
            </label>
            <Input
              type="date"
              defaultValue={moment(edition?.end_date).format("YYYY-MM-DD")}
              onChange={(e) => handleInputChange("end_date", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Presidente General
            </label>
            <Select
              defaultValue={edition?.presidentUserName}
              onValueChange={(value) => handleInputChange("president", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Presidente" />
              </SelectTrigger>
              <SelectContent>
                {presidents.map((president) => (
                  <SelectItem
                    key={president.userName}
                    value={president.userName}
                  >
                    {`${president.name.first_name} ${president.name.first_surname}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Secretario General
            </label>
            <Select
              defaultValue={edition?.secretaryUserName}
              onValueChange={(value) => handleInputChange("secretary", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Secretario" />
              </SelectTrigger>
              <SelectContent>
                {secretaries.map((secretary) => (
                  <SelectItem
                    key={secretary.userName}
                    value={secretary.userName}
                  >
                    {`${secretary.name.first_name} ${secretary.name.first_surname}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => {
              setIsLoading(true);
              setIsEditing(false);
              handleOnUpdate(selectedItem?.id_edition ?? 0);
              setSelectedItem(null);
              setIsLoading(false);
            }}
          >
            {edition ? "Aceptar" : "Registrar"}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setSelectedItem(null);
            }}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
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

      <nav className="bg-white border-b border-gray-200 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {isEditing ? (
            renderEditionForm(selectedItem)
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Gestión de Ediciones
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Administre las ediciones del Modelo ONU
                  </p>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 transform hover:scale-105"
                  onClick={() => setIsEditing(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear una Edición
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="border-l-4 shadow-md">
                    <CardContent className="p-4">
                      {isLoading ? (
                        <Skeleton className="h-16 w-full" />
                      ) : (
                        <div className="flex items-center space-x-3">
                          {i === 0 && (
                            <Calendar className="h-8 w-8 text-blue-600" />
                          )}
                          {i === 1 && (
                            <CalendarIcon className="h-8 w-8 text-green-600" />
                          )}
                          {i === 2 && (
                            <User className="h-8 w-8 text-purple-600" />
                          )}
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {i === 0 && mockEditions.length}
                              {i === 1 &&
                                mockEditions.reduce(
                                  (sum, edition) => sum + edition.duration,
                                  0
                                )}
                              {i === 2 &&
                                new Set(mockEditions.map((e) => e.president))
                                  .size}
                            </p>
                            <p className="text-sm text-gray-600">
                              {i === 0 && "Total Ediciones"}
                              {i === 1 && "Días Totales"}
                              {i === 2 && "Presidentes"}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">
                    <Filter className="w-5 h-5 mr-2 text-blue-600" />
                    Filtros y Búsqueda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre, presidente o secretario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md overflow-x-auto">
                <CardContent className="p-0">
                  {isLoading ? (
                    <Skeleton className="h-96 w-full" />
                  ) : (
                    <>
                      {/* Cards para vista móvil */}
                      <div className="block md:hidden space-y-4 px-4 py-2">
                        {paginatedEditions.map((edition) => (
                          <Card key={edition.id_edition} className="shadow-md">
                            <CardContent className="p-4 space-y-2">
                              <h3 className="text-lg font-bold text-blue-600">
                                {edition.name}
                              </h3>
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">Fechas:</span>{" "}
                                {edition.initial_date} - {edition.end_date}
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">Días:</span>{" "}
                                {edition.duration}
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">
                                  Presidente:
                                </span>{" "}
                                {edition.president}
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">
                                  Secretario:
                                </span>{" "}
                                {edition.secretary}
                              </p>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-300 hover:bg-blue-50 text-blue-700"
                                  onClick={() => {
                                    setSelectedItem(edition);
                                    setIsEditing(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 hover:bg-red-50 text-red-700"
                                  onClick={() =>
                                    handleDelete(edition.id_edition)
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Tabla para escritorio */}
                      <div className="hidden md:block">
                        <table className="w-full min-w-[900px]">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Número
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Nombre
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                                Fecha de Inicio
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Fecha de Finalización
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Días
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Presidente
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Secretario
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {paginatedEditions.map((edition) => (
                              <tr
                                key={edition.id_edition}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                  {edition.id_edition}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                  {edition.name}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">
                                  {edition.initial_date}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {edition.end_date}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {edition.duration}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {edition.president}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {edition.secretary}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-blue-300 hover:bg-blue-50 text-blue-700"
                                      onClick={() => {
                                        setSelectedItem(edition);
                                        setIsEditing(true);
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-300 hover:bg-red-50 text-red-700"
                                      onClick={() =>
                                        handleDelete(edition.id_edition)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {!isLoading && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                        <div className="text-sm text-gray-700">
                          Mostrando {startIndex + 1} a{" "}
                          {Math.min(
                            startIndex + itemsPerPage,
                            filteredAndSortedEditions.length
                          )}{" "}
                          de {filteredAndSortedEditions.length} resultados
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
                            {currentPage} / {totalPages || 1}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage(
                                Math.min(totalPages, currentPage + 1)
                              )
                            }
                            disabled={
                              currentPage === totalPages || totalPages === 0
                            }
                            className="border-gray-300"
                          >
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
