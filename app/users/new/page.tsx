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
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import {
  getIdentity,
  getIsAuthenticated,
  getStorageUsername,
  getToken,
  socket,
} from "@/lib/utils";
import { IFormData } from "@/interfaces/IFormData";

interface FormErrors {
  [key: string]: string;
}

export default function NewUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<IFormData>({
    first_name: "",
    second_name: null,
    first_surname: "",
    second_surname: "",
    email: "",
    userName: "",
    country: "",
    role: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: number; name: string }[]>(
    []
  );
  //SessionStorge Variables
  const [storageUsername, setStorageUserName] = useState<string | null>("");
  const [isAuthenticated, setIsAuthenticated] = useState<string | null>();

  useEffect(() => {
    setIsAuthenticated(getIsAuthenticated());
    setStorageUserName(getStorageUsername());

    setFormData({ ...formData, identity: getIdentity(), token: getToken() });
    // 3. Función para cargar los roles (separa la lógica)
    const loadRoles = () => {
      socket.emit(
        "get-roles",
        {
          token: getToken(),
          identity: getIdentity(),
        },
        (response: any) => {
          if (response.success) {
            setRoles(response.roles);
          }
        }
      );
    };

    // 4. Función para cargar los paises (separa la lógica)
    const loadCountries = () => {
      socket.emit(
        "get-countries",
        {
          token: getToken(),
          identity: getIdentity(),
        },
        (response: any) => {
          if (response.success) {
            setCountries(response.countries);
          }
        }
      );
    };

    loadRoles();
    loadCountries();
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
    if (!formData.first_name.trim())
      newErrors.first_name = "El primer nombre es requerido";

    if (!formData.first_surname.trim())
      newErrors.first_surname = "El primer apellido es requerido";

    if (!formData.email.trim())
      newErrors.email = "El correo electrónico es requerido";

    if (!formData.userName.trim())
      newErrors.userName = "El nombre de usuario es requerido";

    if (!formData.country) newErrors.country = "El país es requerido";

    if (!formData.role) newErrors.role = "El rol es requerido";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Formato de correo electrónico inválido";
    }

    // Username validation
    if (formData.userName && formData.userName.length < 6) {
      newErrors.username =
        "El nombre de usuario debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof IFormData,
    value: string // Solo aceptar string ahora
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    socket.emit("create-deputy", formData, (response: any) => {
      setIsSubmitting(false);
      if (response.success) {
        setShowSuccess(true);
        router.push("/users");
      } else {
        setErrors({ username: response.message });
      }
    });
  };

  const handleCancel = () => {
    router.push("/users");
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
                Añadir Nuevo Representante
              </h2>
              <p className="text-gray-600 mt-1">
                Complete la información del nuevo representante
              </p>
            </div>
          </div>

          {/* Success Alert */}
          {showSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Usuario creado exitosamente. Redirigiendo a la lista de
                representantes...
              </AlertDescription>
            </Alert>
          )}

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
                        value={formData.first_name}
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
                        htmlFor="secondName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Segundo Nombre
                      </Label>
                      <Input
                        id="secondName"
                        value={formData.second_name}
                        onChange={(e) =>
                          handleInputChange("second_name", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Ingrese el segundo nombre (opcional)"
                      />
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
                        value={formData.first_surname}
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
                        htmlFor="secondLastName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Segundo Apellido*
                      </Label>
                      <Input
                        id="secondLastName"
                        value={formData.second_surname}
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
                        value={formData.country}
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
                        value={formData.role}
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
                        Registrar Usuario
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
