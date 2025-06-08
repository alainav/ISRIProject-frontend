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

  const [storageUsername, setStorageUserName] = useState<string | null>("");
  const [isAuthenticated, setIsAuthenticated] = useState<string | null>();

  useEffect(() => {
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

  const renderEditionForm = (edition: IEdition | null = null) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {edition ? "Modificar Edición" : "Crear una Edición"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            onChange={(e) => handleInputChange("initial_date", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Fecha de Finalización
          </label>

          <Input
            type="date"
            defaultValue={edition?.end_date || ""}
            onChange={(e) => handleInputChange("end_date", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <SelectItem key={president.userName} value={president.userName}>
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
                <SelectItem key={secretary.userName} value={secretary.userName}>
                  {`${secretary.name.first_name} ${secretary.name.first_surname}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            setIsEditing(false);
            handleOnUpdate(
              selectedItem?.id_edition ? selectedItem?.id_edition : 0
            );
            setSelectedItem(null);
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
                Bienvenido, {storageUsername || "Usuario"}
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
          {isEditing ? (
            renderEditionForm(selectedItem)
          ) : (
            <>
              {/* Header Section */}
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

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockEditions.length}
                        </p>
                        <p className="text-sm text-gray-600">Total Ediciones</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockEditions.reduce(
                            (sum, edition) => sum + edition.duration,
                            0
                          )}
                        </p>
                        <p className="text-sm text-gray-600">Días Totales</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {new Set(mockEditions.map((e) => e.president)).size}
                        </p>
                        <p className="text-sm text-gray-600">Presidentes</p>
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

              {/* Editions Table */}
              <Card className="shadow-md">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left">
                            <button
                              //onClick={() => handleSort("number")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <span>Número</span>
                              {
                                //getSortIcon("number")
                              }
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button
                              onClick={() => handleSort("name")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <span>Nombre</span>
                              {getSortIcon("name")}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button
                              //onClick={() => handleSort("startDate")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <CalendarIcon className="w-4 h-4" />
                              <span>Fecha de Inicio</span>
                              {/*getSortIcon("startDate")*/}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button
                              //onClick={() => handleSort("endDate")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <CalendarIcon className="w-4 h-4" />
                              <span>Fecha de Finalización</span>
                              {/*getSortIcon("endDate")*/}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button
                              //onClick={() => handleSort("days")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <span>Días</span>
                              {/*getSortIcon("days")*/}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button
                              onClick={() => handleSort("president")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <span>Presidente</span>
                              {getSortIcon("president")}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button
                              onClick={() => handleSort("secretary")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <span>Secretario</span>
                              {getSortIcon("secretary")}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <span className="text-sm font-semibold text-gray-900">
                              Acciones
                            </span>
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
                            <td className="px-6 py-4 text-sm text-gray-700">
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

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
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
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
