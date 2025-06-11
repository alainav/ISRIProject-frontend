"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Building,
  Vote,
  Settings,
  LogOut,
  ArrowLeft,
  Save,
  X,
  User,
  Mail,
  MapPin,
  Shield,
  CalendarIcon,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { IUser } from "@/interfaces/IUser";
import {
  getAuxCountries,
  getAuxRoles,
  getAuxUser,
  getIdentity,
  getIsAuthenticated,
  getStorageUsername,
  getToken,
} from "@/lib/utils";
import { IFormData } from "@/interfaces/IFormData";
import { socket } from "@/lib/utils";

interface FormErrors {
  [key: string]: string;
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<IUser>(getAuxUser());
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState<IExtandar[]>(getAuxCountries());
  const [roles, setRoles] = useState<IExtandar[]>(getAuxRoles());
  const [message, setMessage] = useState(
    "Usuario actualizado exitosamente. Redirigiendo a la lista de usuarios..."
  );
  //SessionStorge Variables
  const [storageUsername, setStorageUserName] = useState<string | null>("");
  const [isAuthenticated, setIsAuthenticated] = useState<string | null>();

  useEffect(() => {
    setIsAuthenticated(getIsAuthenticated());
    setStorageUserName(getStorageUsername());

    setIsLoading(false);
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.name.first_name.trim())
      newErrors.firstName = "El primer nombre es requerido";
    if (!formData.name.first_surname.trim())
      newErrors.lastName = "El primer apellido es requerido";
    if (!formData.email.trim())
      newErrors.email = "El correo electrónico es requerido";
    if (!formData.userName.trim())
      newErrors.username = "El nombre de usuario es requerido";
    if (!formData.country) newErrors.country = "El país es requerido";
    if (!formData.role) newErrors.role = "El rol es requerido";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Formato de correo electrónico inválido";
    }

    // Username validation
    if (formData.userName && formData.userName.length < 5) {
      newErrors.username =
        "El nombre de usuario debe tener al menos 5 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof IFormData, value: string) => {
    const updatedUser: any = { ...formData };

    switch (field) {
      case "first_name":
      case "second_name":
      case "first_surname":
      case "second_surname":
        updatedUser.name = {
          ...updatedUser.name,
          [field]: value,
        };
        break;
      case "role":
        updatedUser.role.id = Number(value);
        break;
      case "country":
        updatedUser.country.id = Number(value);
        break;
      default:
        updatedUser[field] = value;
        break;
    }

    // Actualizar ambos: estado local y usuario auxiliar
    setFormData(updatedUser);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    socket.emit(
      "update-deputy",
      {
        ...formData,
        role: formData.role.id,
        country: formData.country.id,
        token: getToken(),
        identity: getIdentity(),
      },
      (res: any) => {
        setIsSubmitting(false);
        setShowSuccess(true);
        if (res.success) {
          setMessage(res.message);
          router.push("/users");
        } else {
          setMessage(res.message);
        }
      }
    );
  };

  const handleCancel = () => {
    router.push("/users");
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center space-x-4">
            <Link href="/users">
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Usuarios
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Modificar Usuario
              </h2>
              <p className="text-gray-600 mt-1">
                Edite la información del usuario seleccionado
              </p>
            </div>
          </div>

          {/* Success Alert */}
          {showSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* User Status Card */}
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {formData.name.first_name} {formData.name.first_surname}
                    </h3>
                    <p className="text-gray-600">{formData.email}</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  {getStatusBadge(formData.status)}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    Creado: {formData.date_register}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center text-xl">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Información del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Primer Nombre *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.name.first_name}
                        onChange={(e) =>
                          handleInputChange("first_name", e.target.value)
                        }
                        className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.firstName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                        placeholder="Ingrese el primer nombre"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Primer Apellido *
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.name.first_surname}
                        onChange={(e) =>
                          handleInputChange("first_surname", e.target.value)
                        }
                        className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.lastName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                        placeholder="Ingrese el primer apellido"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="secondName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Segundo Nombre
                      </Label>
                      <Input
                        id="secondName"
                        value={formData.name.second_name}
                        onChange={(e) =>
                          handleInputChange("second_name", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Ingrese el segundo nombre (opcional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="secondLastName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Segundo Apellido
                      </Label>
                      <Input
                        id="secondLastName"
                        value={formData.name.second_surname}
                        onChange={(e) =>
                          handleInputChange("second_surname", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Ingrese el segundo apellido (opcional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Información de Cuenta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700 flex items-center"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Correo Electrónico *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.email
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                        placeholder="usuario@ejemplo.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="username"
                        className="text-sm font-medium text-gray-700"
                      >
                        Nombre de Usuario *
                      </Label>
                      <Input
                        id="username"
                        value={formData.userName}
                        onChange={(e) =>
                          handleInputChange("userName", e.target.value)
                        }
                        className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.username
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                        placeholder="nombreusuario"
                      />
                      {errors.username && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.username}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="creationDate"
                        className="text-sm font-medium text-gray-700 flex items-center"
                      >
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Fecha de Creación
                      </Label>
                      <Input
                        id="creationDate"
                        type="date"
                        value={formData.date_register}
                        onChange={(e) =>
                          handleInputChange("date_register", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="expirationDate"
                        className="text-sm font-medium text-gray-700 flex items-center"
                      >
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Fecha de Expiración
                      </Label>
                      <Input
                        id="expirationDate"
                        type="date"
                        value={formData.date_expired}
                        onChange={(e) =>
                          handleInputChange("date_expired", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Role and Location */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Rol y Ubicación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="country"
                        className="text-sm font-medium text-gray-700 flex items-center"
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        País *
                      </Label>
                      <Select
                        value={formData.country.id.toString()}
                        onValueChange={(value) =>
                          handleInputChange("country", value)
                        }
                      >
                        <SelectTrigger
                          className={`border-gray-300 focus:border-blue-500 ${
                            errors.country
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }`}
                        >
                          <SelectValue placeholder="Seleccione un país" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem
                              key={country.id}
                              value={country.id.toString()}
                            >
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.country && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.country}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="role"
                        className="text-sm font-medium text-gray-700 flex items-center"
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Rol *
                      </Label>
                      <Select
                        value={formData.role.id.toString()}
                        onValueChange={(value) =>
                          handleInputChange("role", value)
                        }
                      >
                        <SelectTrigger
                          className={`border-gray-300 focus:border-blue-500 ${
                            errors.role
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }`}
                        >
                          <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem
                              key={role.id}
                              value={role.id.toString()}
                            >
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-300 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Guardando...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Aceptar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
