"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { getIdentity, socket } from "@/lib/utils";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!username.trim() || !accessCode.trim()) {
      setError("Por favor, complete todos los campos");
      setIsLoading(false);
      return;
    }

    if (username && accessCode) {
      socket.emit(
        "authenticate",
        {
          userName: username,
          code_access: accessCode,
          identity: getIdentity(),
        },
        (response: any) => {
          if (response.success) {
            sessionStorage.setItem("authenticated", "true");
            sessionStorage.setItem("username", username);
            sessionStorage.setItem("token", response.token);

            window.location.href = "/users";
          } else {
            setError(response.message);
          }
        }
      );
    } else {
      setError("Credenciales inválidas");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-blue-600 text-white border-0 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="flex justify-center">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:rotate-12">
                <div className="text-blue-600 font-bold text-xl">XIII</div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-wide">Modelo de</h1>
              <h2 className="text-3xl font-bold tracking-wide">
                Naciones Unidas
              </h2>
            </div>

            <CardTitle className="text-2xl font-semibold">
              Iniciar Sesión
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white font-medium">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white text-black pl-10 h-12 border-0 focus:ring-2 focus:ring-blue-300 transition-all duration-200"
                    placeholder="Ingrese su usuario"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-white font-medium">
                  Código de Acceso
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="accessCode"
                    type={showPassword ? "text" : "password"}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="bg-white text-black pl-10 pr-10 h-12 border-0 focus:ring-2 focus:ring-blue-300 transition-all duration-200"
                    placeholder="Ingrese su código"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-300 text-white px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-white text-blue-600 hover:bg-gray-100 h-12 text-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-blue-700">
          <p className="text-lm">
            Sistema de Gestión Modelo ONU v14062025-010-beta
          </p>
          <p className="text-sm">
            &reg; Todos los derechos reservados. <br />
            Universidad de las Ciencias Informáticas
          </p>
        </div>
      </div>
    </div>
  );
}
