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
import { CountrySelect } from "../../countryselect";

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
    //{ id: "roles", label: "Gestionar Roles", icon: Settings, href: "/roles" },
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

    if (
      formData.name.second_name === "" ||
      !formData.name.second_name ||
      formData.name.second_name === null
    ) {
      formData.name.second_name = null;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Skeleton */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto py-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse mr-2"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Back Button & Title Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* User Card Skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div>
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Form Skeleton */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="bg-gray-50 border-b border-gray-200 p-6">
                <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="p-8">
                <div className="space-y-8">
                  {[1, 2, 3].map((section) => (
                    <div key={section} className="space-y-6">
                      <div className="h-5 w-48 bg-gray-200 rounded animate-pulse border-b border-gray-200 pb-2"></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((field) => (
                          <div key={field} className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-9 w-36 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
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
          <div className="flex space-x-1 overflow-x-auto py-1 md:py-0">
            {navigationTabs.map((tab) => (
              <Link key={tab.id} href={tab.href || "#"}>
                <button
                  className={`px-3 py-2 md:px-6 md:py-3 text-xs md:text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 ${
                    tab.active
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2" />
                  {tab.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <Link href="/users">
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 w-full md:w-auto"
                size="sm"
              >
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Volver a Usuarios
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Modificar Usuario
              </h2>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Edite la información del usuario seleccionado
              </p>
            </div>
          </div>

          {/* Success Alert */}
          {showSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm md:text-base">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* User Status Card */}
          <Card className="shadow-md">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                      {formData.name.first_name} {formData.name.first_surname}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 break-all">
                      {formData.email}
                    </p>
                  </div>
                </div>
                <div className="text-center md:text-right space-y-2">
                  {getStatusBadge(formData.status)}
                  <div className="flex items-center justify-center md:justify-end text-xs md:text-sm text-gray-600">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Creado: {formData.date_register}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b border-gray-200 py-3 md:py-4">
              <CardTitle className="flex items-center text-lg md:text-xl">
                <User className="w-4 h-4 md:w-6 md:h-6 mr-2 text-blue-600" />
                Información del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Personal Information */}
                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {[
                      {
                        id: "firstName",
                        label: "Primer Nombre *",
                        value: formData.name.first_name,
                        onChange: (e: any) =>
                          handleInputChange("first_name", e.target.value),
                        error: errors.firstName,
                      },
                      {
                        id: "lastName",
                        label: "Primer Apellido *",
                        value: formData.name.first_surname,
                        onChange: (e: any) =>
                          handleInputChange("first_surname", e.target.value),
                        error: errors.lastName,
                      },
                      {
                        id: "secondName",
                        label: "Segundo Nombre",
                        value: formData.name.second_name || undefined,
                        onChange: (e: any) =>
                          handleInputChange("second_name", e.target.value),
                      },
                      {
                        id: "secondLastName",
                        label: "Segundo Apellido",
                        value: formData.name.second_surname,
                        onChange: (e: any) =>
                          handleInputChange("second_surname", e.target.value),
                      },
                    ].map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label
                          htmlFor={field.id}
                          className="text-xs md:text-sm font-medium text-gray-700"
                        >
                          {field.label}
                        </Label>
                        <Input
                          id={field.id}
                          value={field.value}
                          onChange={field.onChange}
                          className={`text-xs md:text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                            field.error
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                          placeholder={`Ingrese ${field.label.toLowerCase()}`}
                        />
                        {field.error && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            {field.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Información de Cuenta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {[
                      {
                        id: "email",
                        label: "Correo Electrónico *",
                        type: "email",
                        icon: <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1" />,
                        value: formData.email,
                        onChange: (e: any) =>
                          handleInputChange("email", e.target.value),
                        error: errors.email,
                        placeholder: "usuario@ejemplo.com",
                      },
                      {
                        id: "username",
                        label: "Nombre de Usuario *",
                        icon: null,
                        value: formData.userName,
                        onChange: (e: any) =>
                          handleInputChange("userName", e.target.value),
                        error: errors.username,
                        placeholder: "nombreusuario",
                      },
                      {
                        id: "creationDate",
                        label: "Fecha de Creación",
                        type: "date",
                        icon: (
                          <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        ),
                        value: formData.date_register,
                        onChange: (e: any) =>
                          handleInputChange("date_register", e.target.value),
                      },
                      {
                        id: "expirationDate",
                        label: "Fecha de Expiración",
                        type: "date",
                        icon: (
                          <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        ),
                        value: formData.date_expired,
                        onChange: (e: any) =>
                          handleInputChange("date_expired", e.target.value),
                      },
                    ].map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label
                          htmlFor={field.id}
                          className="text-xs md:text-sm font-medium text-gray-700 flex items-center"
                        >
                          {field.icon}
                          {field.label}
                        </Label>
                        <Input
                          id={field.id}
                          type={field.type || "text"}
                          value={field.value}
                          onChange={field.onChange}
                          className={`text-xs md:text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                            field.error
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                          placeholder={field.placeholder}
                        />
                        {field.error && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            {field.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role and Location */}
                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Rol y Ubicación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {[
                      {
                        id: "country",
                        label: "País *",
                        icon: <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />,
                        value: formData.country.id.toString(),
                        onChange: (value: any) =>
                          handleInputChange("country", value),
                        countries: countries, // Usamos countries en lugar de options
                        error: errors.country,
                        placeholder: "Seleccione un país",
                      },
                      {
                        id: "role",
                        label: "Rol *",
                        icon: <Shield className="w-3 h-3 md:w-4 md:h-4 mr-1" />,
                        value: formData.role.id.toString(),
                        onChange: (value: any) =>
                          handleInputChange("role", value),
                        options: roles, // Mantenemos options para el Select tradicional
                        error: errors.role,
                      },
                    ].map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label
                          htmlFor={field.id}
                          className="text-xs md:text-sm font-medium text-gray-700 flex items-center"
                        >
                          {field.icon}
                          {field.label}
                        </Label>
                        {field.id === "country" ? (
                          <CountrySelect
                            countries={field.countries || []}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={
                              field.placeholder || "Seleccione un país"
                            }
                            className={`text-xs md:text-sm border-gray-300 focus:border-blue-500 ${
                              field.error
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }`}
                          />
                        ) : (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={`text-xs md:text-sm border-gray-300 focus:border-blue-500 ${
                                field.error
                                  ? "border-red-500 focus:border-red-500"
                                  : ""
                              }`}
                            >
                              <SelectValue
                                placeholder={`Seleccione ${field.label.toLowerCase()}`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {(field.options || []).map(
                                (
                                  option // Añadimos chequeo para options
                                ) => (
                                  <SelectItem
                                    key={option.id}
                                    value={option.id.toString()}
                                    className="text-xs md:text-sm"
                                  >
                                    {option.name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        )}
                        {field.error && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            {field.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col-reverse md:flex-row justify-end space-y-4 space-y-reverse md:space-y-0 md:space-x-4 pt-4 md:pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-300 hover:bg-gray-50 w-full md:w-auto"
                    disabled={isSubmitting}
                    size="sm"
                  >
                    <X className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
                    disabled={isSubmitting}
                    size="sm"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 md:mr-2"></div>
                        Guardando...
                      </div>
                    ) : (
                      <>
                        <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
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
