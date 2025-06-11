"use client";

import { useEffect, useMemo, useState } from "react";
import moment from "moment";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Globe,
  User,
  Badge,
} from "lucide-react";
import Link from "next/link";
import { ICommission } from "@/interfaces/ICommission";
import {
  getIdentity,
  getIsAuthenticated,
  getStorageUsername,
  getToken,
  socket,
} from "@/lib/utils";
import { ICountries } from "@/interfaces/ICountries";
import { IUser } from "@/interfaces/IUser";
import { Skeleton } from "@/components/ui/skeleton";

type SortField =
  | "number"
  | "name"
  | "president"
  | "secretary"
  | "associatedCountries"
  | "votes";
type SortDirection = "asc" | "desc";

const loadCommissions = (
  setMockCommissions: Function,
  setTotalCommission: Function,
  currentPage: number
) => {
  socket.emit(
    `list-commissions`,
    {
      token: getToken(),
      identity: getIdentity(),
      page: currentPage,
    },
    (response: any) => {
      if (response.success) {
        setMockCommissions(response.commissions);
        setTotalCommission({
          totalCount: response.paginated.total_count,
          totalCountries: response.totalCountries,
          totalVoting: response.totalVoting,
          totalPages: response.paginated.total_pages,
        });
      } else {
        console.error(response.message);
      }
    }
  );
};

export default function CommissionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [sortField, setSortField] = useState<SortField>("number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [isCharge, setIsCharge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowing, setIsShowing] = useState(false);
  const [message, setMessage] = useState("En espera de mensaje");
  const [selectedItem, setSelectedItem] = useState<ICommission | null>(null);
  const [countries, setCountries] = useState<ICountries[]>([]);
  const [editions, setEditions] = useState<
    { name: string; end_date: Date; cubaDate: Date }[]
  >([]);
  const [filteredCountries, setFilteredCountries] = useState<ICountries[]>([]);
  const [mockCommissions, setMockCommissions] = useState<ICommission[]>([]);
  const [totalCommission, setTotalCommission] = useState<{
    totalCountries: number;
    totalVoting: number;
    totalPages: number;
    totalCount: number;
  }>({
    totalCountries: 0,
    totalVoting: 0,
    totalPages: 0,
    totalCount: 0,
  });
  const [presidents, setPresidents] = useState<IUser[]>([]);
  const [secretaries, setSecretaries] = useState<IUser[]>([]);
  const [filteredAndSortedCommissions, setFilterCommission] = useState<
    ICommission[]
  >([]);
  const [selectedCountries, setSelectedCountries] = useState<ICountries[]>([]);
  const [startIndex, setStartIndex] = useState<number>(0);

  //SessionStorge Variables
  const [identity, setIdentity] = useState<string | null>("");
  const [storageUsername, setStorageUserName] = useState<string | null>("");
  const [isAuthenticated, setIsAuthenticated] = useState<string | null>();

  useEffect(() => {
    setIsLoading(true);
    setIsAuthenticated(getIsAuthenticated());
    setIdentity(getIdentity());
    setStorageUserName(getStorageUsername());

    const loadCountries = () => {
      socket.emit(
        `get-countries`,
        {
          token: getToken(),
          identity: getIdentity(),
          page: currentPage,
        },
        (response: any) => {
          if (response.success) {
            setCountries(response.countries);
          }
        }
      );
    };

    const loadDeputies = (deputy: string) => {
      socket.emit(
        `get-list-commissions-${deputy}`,
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

    const loadEditions = () => {
      socket.emit(
        `list-active-editions`,
        {
          token: getToken(),
          identity: getIdentity(),
          page: currentPage,
        },
        (response: any) => {
          if (response.success) {
            const editionNames = response.editions.map((edition: any) => {
              return {
                name: edition.name,
                end_date: edition.end_date,
                cubaDate: edition.cubaDate,
              };
            });

            setEditions(editionNames);
          } else {
            console.error(response.message);
          }
        }
      );
    };

    loadCommissions(setMockCommissions, setTotalCommission, currentPage);
    loadCountries();
    loadEditions();
    loadDeputies("presidents");
    loadDeputies("secretaries");
  }, [router, currentPage]);

  useEffect(() => {
    if (isAuthenticated === null) {
      router.push("/");
      return; // Detiene la ejecución si no está autenticado
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setIsLoading(true);
    loadCommissions(setMockCommissions, setTotalCommission, currentPage);
    setIsLoading(false);
  }, [currentPage]);

  useEffect(() => {
    setIsLoading(true);
    const filtered = prepareFilterCommission();
    setFilterCommission(filtered);
    setIsLoading(false);
  }, [mockCommissions, searchTerm]);

  useEffect(() => {
    setIsLoading(true);
    const filtered = prepareFilterCountry();
    setFilteredCountries(filtered);
    setIsLoading(false);
  }, [countries, searchCountry]);

  useEffect(() => {
    setIsLoading(true);
    if (selectedItem && !isCharge) {
      if (selectedItem.countries) {
        const countryNames = selectedItem.countries.map((c) => c);
        setSelectedCountries(countryNames);
        setIsCharge(true);
      }
    } else if (selectedItem && isCharge) {
      setSelectedCountries(selectedCountries);
    }
    setIsLoading(false);
  }, [selectedItem]);

  const handleLogout = () => {
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("token");
    router.push("/");
  };

  const handleDelete = (id: number) => {
    setIsLoading(true);
    socket.emit(
      "delete-commission",
      { identity: getIdentity(), token: getToken(), id },
      (response: any) => {
        if (response.success) {
          //Recargar a las ediciones
          loadCommissions(setMockCommissions, setTotalCommission, currentPage);
          setMessage(response.message);
        } else {
          setMessage(response.message);
        }

        setIsShowing(true);
        setTimeout(() => {
          setIsShowing(false);
        }, 10000);
      }
    );
    setIsLoading(false);
  };

  const handleCountryChange = (country: ICountries, isChecked: boolean) => {
    setSelectedCountries((prev) => {
      if (isChecked) {
        // Agregar país si no está ya en la lista
        return [...prev, country];
      } else {
        // Remover país
        return prev.filter((c) => c.name !== country.name);
      }
    });
  };

  const handleInputChange = (field: keyof ICommission, value: string) => {
    const updatedEdition: any = { ...selectedItem };

    updatedEdition[field] = value;
    if (field === "president" || field === "secretary") {
      updatedEdition[`${field}UserName`] = value;
    }

    // Actualizar ambos: estado local y usuario auxiliar
    setSelectedItem(updatedEdition);
  };

  const handleOnUpdate = (id: number | undefined) => {
    setIsLoading(true);
    const sendCommission: any = { ...selectedItem };

    sendCommission.countries = selectedCountries.map((country) => country.id);

    if (id !== 0) {
      if (!id) {
        return;
      }
      (sendCommission.president = sendCommission.presidentUserName),
        (sendCommission.secretary = sendCommission.secretaryUserName);

      socket.emit(
        "update-commission",
        {
          identity: getIdentity(),
          token: getToken(),
          id: sendCommission.id_commission,
          ...sendCommission,
        },
        (response: any) => {
          if (response.success) {
            //Recargar a las comisiones
            loadCommissions(
              setMockCommissions,
              setTotalCommission,
              currentPage
            );
          } else {
            console.error(response.message);
          }
        }
      );
    } else {
      socket.emit(
        "create-commission",
        { identity: getIdentity(), token: getToken(), ...sendCommission },
        (response: any) => {
          if (response.success) {
            console.error(response.message);
            //Recargar a las comisiones
            loadCommissions(
              setMockCommissions,
              setTotalCommission,
              currentPage
            );
          } else {
            console.error(response.message);
          }
        }
      );
    }
    setIsLoading(false);
  };

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
      active: true,
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

  const prepareFilterCommission = () => {
    return mockCommissions.filter((commission) => {
      return (
        commission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.president.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.secretary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  const prepareFilterCountry = () => {
    return countries.filter((country) => {
      return country.name.toLowerCase().includes(searchCountry.toLowerCase());
    });
  };

  /*.sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];

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

  const paginatedCommissions = useMemo(() => {
    setStartIndex((currentPage - 1) * 10);
    return filteredAndSortedCommissions.slice(0, itemsPerPage);
  }, [filteredAndSortedCommissions, currentPage, itemsPerPage]);

  const renderCommissionForm = (commission: ICommission | null = null) => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
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
          {commission ? "Modificar una Comisión" : "Crear una Comisión"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <Input
              defaultValue={commission?.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Presidente</label>
            <Select
              defaultValue={commission?.presidentUserName}
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
            <label className="block text-sm font-medium mb-2">Secretario</label>
            <Select
              defaultValue={commission?.secretaryUserName}
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

          <div>
            <label className="block text-sm font-medium mb-2">Edición</label>
            <Select
              defaultValue={commission?.edition}
              onValueChange={(value) => handleInputChange("edition", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Edición" />
              </SelectTrigger>
              <SelectContent>
                {editions.map((edition) => (
                  <SelectItem key={edition.name} value={edition.name}>
                    {moment(edition.end_date, "DD-MM-YYYY").isBefore(
                      moment(edition.cubaDate, "DD-MM-YYYY")
                    ) ? (
                      <span className="text-red-800">{`(Concluida el ${edition.end_date}) ${edition.name}`}</span>
                    ) : (
                      <span className="text-green-800">{edition.name}</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Buscar País"
            onChange={(e) => setSearchCountry(e.target.value)}
            className="w-full"
          />

          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Seleccionar</th>
                  <th className="px-4 py-3 text-left">País</th>
                  <th className="px-4 py-3 text-left">Representante</th>
                </tr>
              </thead>
              <tbody>
                {filteredCountries.map((country) => (
                  <tr key={country.id} className="border-t">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedCountries.some(
                          (c) => c.name === country.name
                        )}
                        onCheckedChange={(checked) =>
                          handleCountryChange(country, checked === true)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">{country.name}</td>
                    <td className="px-4 py-3">
                      {country.deputy || "No Existe"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => {
              setIsLoading(true);
              handleOnUpdate(commission?.id_commission ?? 0);
              setSelectedItem(null);
              setIsCharge(false);
              setSelectedCountries([]);
              setIsEditing(false);
              setIsLoading(false);
            }}
          >
            {commission ? "Aceptar" : "Registrar"}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setSelectedItem(null);
              setIsCharge(false);
              setSelectedCountries([]);
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-1 hide-scrollbar">
            {navigationTabs.map((tab) => (
              <a
                key={tab.id}
                href={tab.href || "#"}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap border-b-2 ${
                  tab.active
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
        <div className="space-y-5">
          {isEditing ? (
            renderCommissionForm(selectedItem)
          ) : (
            <>
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Gestión de Comisiones
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Administre las comisiones del Modelo ONU
                  </p>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Crear una Comisión
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {isLoading ? (
                  <>
                    <Card className="border-l-4 border-l-gray-300 animate-pulse">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="bg-gray-200 rounded-full w-7 h-7 sm:w-8 sm:h-8"></div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="h-5 sm:h-6 bg-gray-200 rounded w-16 sm:w-24"></div>
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-gray-300 animate-pulse">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="bg-gray-200 rounded-full w-7 h-7 sm:w-8 sm:h-8"></div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="h-5 sm:h-6 bg-gray-200 rounded w-16 sm:w-24"></div>
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-gray-300 animate-pulse">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="bg-gray-200 rounded-full w-7 h-7 sm:w-8 sm:h-8"></div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="h-5 sm:h-6 bg-gray-200 rounded w-16 sm:w-24"></div>
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Building className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                          <div>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">
                              {totalCommission.totalCount || 0}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Total Comisiones
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Globe className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                          <div>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">
                              {totalCommission.totalCountries || 0}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Países Asociados
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Vote className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
                          <div>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">
                              {totalCommission.totalVoting || 0}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Votaciones
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Filters and Search */}
              <Card className="shadow-md">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-blue-600" />
                    {isShowing ? (
                      <span className="text-yellow-800 bg-yellow-200 p-2 rounded text-xs sm:text-sm shadow-md">
                        {`Notificación: ${message}`}
                      </span>
                    ) : (
                      `Filtros y Búsqueda`
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre, presidente o secretario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 sm:pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm h-9 sm:h-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Commissions Table - Mobile Cards */}
              <div className="block sm:hidden">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                              </div>
                              <div className="space-y-1">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                              </div>
                              <div className="space-y-1">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                              </div>
                              <div className="space-y-1">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                              <div className="w-8 h-8 bg-gray-200 rounded"></div>
                              <div className="w-8 h-8 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedCommissions.map((commission) => (
                      <Card
                        key={commission.id_commission}
                        className="shadow-md"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="text-sm font-bold text-gray-900">
                                #{commission.id_commission} - {commission.name}
                              </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-gray-500">Presidente</p>
                                <p className="font-medium">
                                  {commission.president}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Secretario</p>
                                <p className="font-medium">
                                  {commission.secretary}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Países</p>
                                <p className="font-medium">
                                  {commission.numOfCountries}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Votaciones</p>
                                <p className="font-medium">
                                  {commission.votes}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="border-blue-300 hover:bg-blue-50 text-blue-700 h-8 w-8"
                                onClick={() => {
                                  setSelectedItem(commission);
                                  setIsEditing(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="border-red-300 hover:bg-red-50 text-red-700 h-8 w-8"
                                onClick={() =>
                                  handleDelete(commission.id_commission)
                                }
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Commissions Table - Desktop */}
              <Card className="shadow-md hidden sm:block">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            {[...Array(7)].map((_, i) => (
                              <th key={i} className="px-4 py-3 text-left">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {[...Array(5)].map((_, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              {[...Array(6)].map((_, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-3">
                                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                                </td>
                              ))}
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <div className="w-7 h-7 bg-gray-200 rounded"></div>
                                  <div className="w-7 h-7 bg-gray-200 rounded"></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left">
                                <button
                                  onClick={() => handleSort("number")}
                                  className="flex items-center space-x-1 text-xs sm:text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  <span>Número</span>
                                  {getSortIcon("number")}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button
                                  onClick={() => handleSort("name")}
                                  className="flex items-center space-x-1 text-xs sm:text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  <span>Nombre</span>
                                  {getSortIcon("name")}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button
                                  onClick={() => handleSort("president")}
                                  className="flex items-center space-x-1 text-xs sm:text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>Presidente</span>
                                  {getSortIcon("president")}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button
                                  onClick={() => handleSort("secretary")}
                                  className="flex items-center space-x-1 text-xs sm:text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>Secretario</span>
                                  {getSortIcon("secretary")}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button
                                  onClick={() =>
                                    handleSort("associatedCountries")
                                  }
                                  className="flex items-center space-x-1 text-xs sm:text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>Países</span>
                                  {getSortIcon("associatedCountries")}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button
                                  onClick={() => handleSort("votes")}
                                  className="flex items-center space-x-1 text-xs sm:text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  <Vote className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>Votaciones</span>
                                  {getSortIcon("votes")}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="text-xs sm:text-sm font-semibold text-gray-900">
                                  Acciones
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {paginatedCommissions.map((commission) => (
                              <tr
                                key={commission.id_commission}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 text-xs sm:text-sm text-gray-900 font-medium">
                                  {commission.id_commission}
                                </td>
                                <td className="px-4 py-3 text-xs sm:text-sm text-gray-900 font-medium">
                                  {commission.name}
                                </td>
                                <td className="px-4 py-3 text-xs sm:text-sm text-gray-700">
                                  {commission.president}
                                </td>
                                <td className="px-4 py-3 text-xs sm:text-sm text-gray-700">
                                  {commission.secretary}
                                </td>
                                <td className="px-4 py-3 text-xs sm:text-sm text-gray-700">
                                  {commission.numOfCountries}
                                </td>
                                <td className="px-4 py-3 text-xs sm:text-sm text-gray-700">
                                  {commission.votes}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-1 sm:gap-2">
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="border-blue-300 hover:bg-blue-50 text-blue-700 h-7 w-7 sm:h-8 sm:w-8"
                                      onClick={() => {
                                        setSelectedItem(commission);
                                        setIsEditing(true);
                                      }}
                                    >
                                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="border-red-300 hover:bg-red-50 text-red-700 h-7 w-7 sm:h-8 sm:w-8"
                                      onClick={() =>
                                        handleDelete(commission.id_commission)
                                      }
                                    >
                                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-xs sm:text-sm text-gray-700">
                            Mostrando {startIndex + 1} a{" "}
                            {Math.min(
                              startIndex + 10,
                              totalCommission.totalCount
                            )}{" "}
                            de {totalCommission.totalCount} resultados
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
                              {currentPage} / {totalCommission.totalPages || 1}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage(
                                  Math.min(
                                    totalCommission.totalPages,
                                    currentPage + 1
                                  )
                                )
                              }
                              disabled={
                                currentPage === totalCommission.totalPages ||
                                totalCommission.totalPages === 0
                              }
                              className="border-gray-300 text-xs sm:text-sm"
                            >
                              Siguiente
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Pagination for mobile */}
              {!isLoading && (
                <div className="sm:hidden bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="text-xs text-gray-700 text-center">
                      Mostrando{" "}
                      {Math.min(
                        filteredAndSortedCommissions.length,
                        totalCommission.totalCount
                      )}{" "}
                      de {Math.min(startIndex + 10, totalCommission.totalCount)}{" "}
                      comisiones
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
                        disabled={currentPage === totalCommission.totalPages}
                        className="border-gray-300 text-xs"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
