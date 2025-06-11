"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  Eye,
  LogOut,
  BarChart3,
  UserCheck,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  getIdentity,
  getIsAuthenticated,
  getStorageUsername,
  getToken,
} from "@/lib/utils";

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  //SessionStorge Variables
  const [identity, setIdentity] = useState<string | null>("");
  const [storageUsername, setStorageUserName] = useState<string | null>("");
  const [isAuthenticated, setIsAuthenticated] = useState<string | null>();

  useEffect(() => {
    setIsAuthenticated(getIsAuthenticated());
    setIdentity(getIdentity());
    setStorageUserName(getStorageUsername());
  }, [router]);

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

  const navigationTabs = [
    { id: "overview", label: "Resumen General", icon: BarChart3 },
    { id: "users", label: "Gestionar Usuario", icon: Users },
    { id: "editions", label: "Gestionar Edición", icon: Calendar },
    { id: "commissions", label: "Gestionar Comisiones", icon: Building },
    { id: "voting", label: "Gestionar Votaciones", icon: Vote },
    //{ id: "roles", label: "Gestionar Roles", icon: Settings },
    //{ id: "profile", label: "Mi Perfil", icon: UserCheck },
  ];

  // Mock data
  const mockUsers = [
    {
      email: "Juan@gmail.com",
      username: "juanp",
      firstName: "Juan",
      lastName: "Hernandez",
      secondName: "",
      secondLastName: "Gonzales",
      name: "Juan Hernandez Gonzales",
      creationDate: "2025-04-04",
      expirationDate: "2026-04-04",
      country: "Cuba",
      role: "Presidente",
    },
    {
      email: "pramires@gmail.com",
      username: "perris",
      firstName: "Pedro",
      lastName: "Raúl",
      secondName: "",
      secondLastName: "Ramires",
      name: "Pedro Raúl Ramires",
      creationDate: "2025-08-04",
      expirationDate: "2026-08-04",
      country: "Australia",
      role: "Presidente",
    },
  ];

  const mockEditions = [
    {
      number: 1,
      name: "EdiciónIV",
      startDate: "2025-04-04",
      endDate: "2025-04-08",
      days: 4,
      president: "Alejandro Torres",
      secretary: "Miguel Ruiz",
    },
    {
      number: 2,
      name: "EdiciónX",
      startDate: "2025-08-04",
      endDate: "2025-08-010",
      days: 6,
      president: "Alejandro Torres",
      secretary: "Miguel Ruiz",
    },
  ];

  const mockCommissions = [
    {
      number: 1,
      name: "Seguridad de la Salud",
      president: "Juan Hernandez Gonzales",
      secretary: "Alexis Roa",
      associatedCountries: 12,
      votes: 0,
      countries: [
        { name: "Cuba", representative: "Lázaro Vazques", selected: false },
        { name: "Holanda", representative: "Paola Melian", selected: true },
      ],
    },
    {
      number: 2,
      name: "Asamblea General",
      president: "Pedro Raúl Ramires",
      secretary: "Ester Mendez",
      associatedCountries: 5,
      votes: 0,
      countries: [
        { name: "Cuba", representative: "Lázaro Vazques", selected: false },
        { name: "Holanda", representative: "Paola Melian", selected: true },
      ],
    },
  ];

  const mockVotings = [
    {
      number: 1,
      commission: "Seguridad en la Salud",
      name: "Electorales2",
      description: "Uso completo",
      result: "Rechazado",
      inFavor: 10,
      against: 20,
      abstention: 0,
      status: "Cerrada",
    },
    {
      number: 2,
      commission: "Seguridad en la Salud",
      name: "Municipal21",
      description: "Uso completo",
      result: "Votando",
      inFavor: 14,
      against: 2,
      abstention: 0,
      status: "Abierta",
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{mockUsers.length}</p>
                <p className="text-sm text-gray-600">Usuarios Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{mockEditions.length}</p>
                <p className="text-sm text-gray-600">Ediciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{mockCommissions.length}</p>
                <p className="text-sm text-gray-600">Comisiones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Vote className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{mockVotings.length}</p>
                <p className="text-sm text-gray-600">Votaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">
                    Votación "Electorales2" finalizada
                  </p>
                  <p className="text-sm text-gray-600">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">
                    Votación "Municipal21" en progreso
                  </p>
                  <p className="text-sm text-gray-600">Hace 1 hora</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Nuevo usuario registrado</p>
                  <p className="text-sm text-gray-600">Hace 3 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Votación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Votaciones Activas</span>
                <Badge variant="default">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Votaciones Completadas</span>
                <Badge variant="secondary">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Participación Promedio</span>
                <Badge variant="outline">85%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre de Usuario
              </label>
              <Input value="juanp" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Correo Electrónico
              </label>
              <Input value="Juan@gmail.com" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre Completo
              </label>
              <Input value="Juan Hernandez Gonzales" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">País</label>
              <Input value="Cuba" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rol</label>
              <Input value="Presidente" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Fecha de Expiración
              </label>
              <Input value="2026-04-04" disabled />
            </div>
          </div>
          <div className="pt-4">
            <Button>Editar Perfil</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserForm = (user: any = null) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {user ? "Modificar Usuario" : "Añadir Nuevo Usuario"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Primer Nombre
          </label>
          <Input defaultValue={user?.firstName || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Primer Apellido
          </label>
          <Input defaultValue={user?.lastName || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Segundo Nombre
          </label>
          <Input defaultValue={user?.secondName || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Segundo Apellido
          </label>
          <Input defaultValue={user?.secondLastName || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Correo</label>
          <Input defaultValue={user?.email || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Usuario</label>
          <Input defaultValue={user?.username || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">País</label>
          <Select defaultValue={user?.country || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cuba">Cuba</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="España">España</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Rol</label>
          <Select defaultValue={user?.role || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Presidente">Presidente</SelectItem>
              <SelectItem value="Secretario">Secretario</SelectItem>
              <SelectItem value="Delegado">Delegado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            setIsEditing(false);
            setSelectedItem(null);
          }}
        >
          {user ? "Aceptar" : "Registrar"}
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

  const renderEditionForm = (edition: any = null) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {edition ? "Modificar Edición" : "Crear una Edición"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Nombre de Edición
          </label>
          <Input defaultValue={edition?.name || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Fecha de Inicio
          </label>
          <Input type="date" defaultValue={edition?.startDate || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Fecha de Finalización
          </label>
          <Input type="date" defaultValue={edition?.endDate || ""} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Presidente General
          </label>
          <Select defaultValue={edition?.president || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Alejandro Torres">Alejandro Torres</SelectItem>
              <SelectItem value="Miguel Ruiz">Miguel Ruiz</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Secretario General
          </label>
          <Select defaultValue={edition?.secretary || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Miguel Ruiz">Miguel Ruiz</SelectItem>
              <SelectItem value="Alejandro Torres">Alejandro Torres</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            setIsEditing(false);
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

  const renderCommissionForm = (commission: any = null) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {commission ? "Modificar una Comisión" : "Crear una Comisión"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <Input defaultValue={commission?.name || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Presidente</label>
          <Select defaultValue={commission?.president || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Juan Hernandez">Juan Hernandez</SelectItem>
              <SelectItem value="Pedro Raúl">Pedro Raúl</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Secretario</label>
          <Select defaultValue={commission?.secretary || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Alexis Roa">Alexis Roa</SelectItem>
              <SelectItem value="Ester Mendez">Ester Mendez</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <Input placeholder="Buscar País" className="flex-1" />
        </div>

        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Seleccionar</th>
                <th className="px-4 py-3 text-left">País</th>
                <th className="px-4 py-3 text-left">Representante</th>
              </tr>
            </thead>
            <tbody>
              {commission?.countries?.map((country: any, index: number) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-3">
                    <Checkbox defaultChecked={country.selected} />
                  </td>
                  <td className="px-4 py-3">{country.name}</td>
                  <td className="px-4 py-3">{country.representative}</td>
                </tr>
              )) || (
                <>
                  <tr className="border-t">
                    <td className="px-4 py-3">
                      <Checkbox />
                    </td>
                    <td className="px-4 py-3">Cuba</td>
                    <td className="px-4 py-3">Lázaro Vazques</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3">
                      <Checkbox defaultChecked />
                    </td>
                    <td className="px-4 py-3">Holanda</td>
                    <td className="px-4 py-3">Paola Melian</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            setIsEditing(false);
            setSelectedItem(null);
          }}
        >
          Registrar
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

  const renderVotingForm = (voting: any = null) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {voting ? "Modificar Votación" : "Crear una Votación"}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <Input defaultValue={voting?.name || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <Textarea defaultValue={voting?.description || ""} rows={4} />
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            setIsEditing(false);
            setSelectedItem(null);
          }}
        >
          Registrar
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

  const renderUserManagement = () => (
    <div className="space-y-6">
      {isEditing ? (
        renderUserForm(selectedItem)
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Listado de Usuarios</h2>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Nuevo Usuario
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar Nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Correo</th>
                  <th className="px-4 py-3 text-left font-medium">Usuario</th>
                  <th className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Fecha de Creación
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Fecha de Expiración
                  </th>
                  <th className="px-4 py-3 text-left font-medium">País</th>
                  <th className="px-4 py-3 text-left font-medium">Rol</th>
                  <th className="px-4 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user, index) => (
                  <tr
                    key={index}
                    className={`border-t ${
                      selectedItem === user ? "bg-blue-100" : ""
                    }`}
                  >
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.creationDate}</td>
                    <td className="px-4 py-3">{user.expirationDate}</td>
                    <td className="px-4 py-3">{user.country}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(user);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2">
            <Button variant="outline">Anterior</Button>
            <span className="px-4 py-2">1/10</span>
            <Button variant="outline">Siguiente</Button>
          </div>
        </>
      )}
    </div>
  );

  const renderEditionManagement = () => (
    <div className="space-y-6">
      {isEditing ? (
        renderEditionForm(selectedItem)
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Listado de Ediciones</h2>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear una Edición
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar Nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Número</th>
                  <th className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Fecha de Inicio
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Fecha de Finalización
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Días</th>
                  <th className="px-4 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockEditions.map((edition, index) => (
                  <tr
                    key={index}
                    className={`border-t ${
                      selectedItem === edition ? "bg-blue-100" : ""
                    }`}
                  >
                    <td className="px-4 py-3">{edition.number}</td>
                    <td className="px-4 py-3">{edition.name}</td>
                    <td className="px-4 py-3">{edition.startDate}</td>
                    <td className="px-4 py-3">{edition.endDate}</td>
                    <td className="px-4 py-3">{edition.days}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(edition);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2">
            <Button variant="outline">Anterior</Button>
            <span className="px-4 py-2">1/10</span>
            <Button variant="outline">Siguiente</Button>
          </div>
        </>
      )}
    </div>
  );

  const renderCommissionManagement = () => (
    <div className="space-y-6">
      {isEditing ? (
        renderCommissionForm(selectedItem)
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Listado de Comisiones</h2>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear una Comisión
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar Nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Número</th>
                  <th className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Presidente
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Secretario
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    #Países Asociados
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    #Votaciones
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockCommissions.map((commission, index) => (
                  <tr
                    key={index}
                    className={`border-t ${
                      selectedItem === commission ? "bg-blue-100" : ""
                    }`}
                  >
                    <td className="px-4 py-3">{commission.number}</td>
                    <td className="px-4 py-3">{commission.name}</td>
                    <td className="px-4 py-3">{commission.president}</td>
                    <td className="px-4 py-3">{commission.secretary}</td>
                    <td className="px-4 py-3">
                      {commission.associatedCountries}
                    </td>
                    <td className="px-4 py-3">{commission.votes}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(commission);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2">
            <Button variant="outline">Anterior</Button>
            <span className="px-4 py-2">1/10</span>
            <Button variant="outline">Siguiente</Button>
          </div>
        </>
      )}
    </div>
  );

  const renderVotingManagement = () => (
    <div className="space-y-6">
      {isEditing ? (
        renderVotingForm(selectedItem)
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Listado de Votaciones Comisión de Asamblea General
            </h2>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear una Votación
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar Nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Número</th>
                  <th className="px-4 py-3 text-left font-medium">Comisión</th>
                  <th className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Resultado</th>
                  <th className="px-4 py-3 text-left font-medium">A favor</th>
                  <th className="px-4 py-3 text-left font-medium">En contra</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Abstención
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockVotings.map((voting, index) => (
                  <tr
                    key={index}
                    className={`border-t ${
                      selectedItem === voting ? "bg-blue-100" : ""
                    }`}
                  >
                    <td className="px-4 py-3">{voting.number}</td>
                    <td className="px-4 py-3">{voting.commission}</td>
                    <td className="px-4 py-3">{voting.name}</td>
                    <td className="px-4 py-3">{voting.description}</td>
                    <td className="px-4 py-3">{voting.result}</td>
                    <td className="px-4 py-3">{voting.inFavor}</td>
                    <td className="px-4 py-3">{voting.against}</td>
                    <td className="px-4 py-3">{voting.abstention}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          voting.status === "Abierta" ? "default" : "secondary"
                        }
                      >
                        {voting.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(voting);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2">
            <Button variant="outline">Anterior</Button>
            <span className="px-4 py-2">1/10</span>
            <Button variant="outline">Siguiente</Button>
          </div>
        </>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "profile":
        return renderProfile();
      case "users":
        return renderUserManagement();
      case "editions":
        return renderEditionManagement();
      case "commissions":
        return renderCommissionManagement();
      case "voting":
        return renderVotingManagement();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">XIII</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Modelo de Naciones Unidas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenido, {storageUsername || "Usuario"}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsEditing(false);
                  setSelectedItem(null);
                }}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
