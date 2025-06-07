"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
} from "lucide-react"
import Link from "next/link"

type SortField = "number" | "name" | "president" | "secretary" | "associatedCountries" | "votes"
type SortDirection = "asc" | "desc"

interface Commission {
  id: number
  number: number
  name: string
  president: string
  secretary: string
  associatedCountries: number
  votes: number
  countries: { name: string; representative: string; selected: boolean }[]
}

export default function CommissionsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("number")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Commission | null>(null)

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("authenticated") || sessionStorage.getItem("authenticated")
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("authenticated")
    sessionStorage.removeItem("username")
    sessionStorage.removeItem("authenticated")
    sessionStorage.removeItem("username")
    router.push("/")
  }

  const navigationTabs = [
    { id: "users", label: "Gestionar Usuario", icon: Users, href: "/users" },
    { id: "editions", label: "Gestionar Edición", icon: Calendar, href: "/editions" },
    { id: "commissions", label: "Gestionar Comisiones", icon: Building, href: "/commissions", active: true },
    { id: "voting", label: "Gestionar Votaciones", icon: Vote, href: "/voting" },
    { id: "roles", label: "Gestionar Roles", icon: Settings, href: "/roles" },
  ]

  // Mock data for commissions
  const mockCommissions: Commission[] = [
    {
      id: 1,
      number: 1,
      name: "Seguridad de la Salud",
      president: "Juan Hernandez Gonzales",
      secretary: "Alexis Roa",
      associatedCountries: 12,
      votes: 2,
      countries: [
        { name: "Cuba", representative: "Lázaro Vazques", selected: true },
        { name: "Holanda", representative: "Paola Melian", selected: true },
        { name: "México", representative: "Carlos Fuentes", selected: true },
        { name: "Ecuador", representative: "Ana Suárez", selected: true },
      ],
    },
    {
      id: 2,
      number: 2,
      name: "Asamblea General",
      president: "Pedro Raúl Ramires",
      secretary: "Ester Mendez",
      associatedCountries: 5,
      votes: 1,
      countries: [
        { name: "Cuba", representative: "Lázaro Vazques", selected: false },
        { name: "Holanda", representative: "Paola Melian", selected: true },
        { name: "Brasil", representative: "Joao Silva", selected: true },
        { name: "Argentina", representative: "Lucía Pérez", selected: true },
      ],
    },
    {
      id: 3,
      number: 3,
      name: "Derechos Humanos",
      president: "María López Vega",
      secretary: "Luis García Ruiz",
      associatedCountries: 8,
      votes: 0,
      countries: [
        { name: "España", representative: "Antonio Banderas", selected: true },
        { name: "Francia", representative: "Marie Dupont", selected: true },
        { name: "Alemania", representative: "Hans Mueller", selected: true },
        { name: "Italia", representative: "Giulia Romano", selected: true },
      ],
    },
    {
      id: 4,
      number: 4,
      name: "Medio Ambiente",
      president: "Carlos Méndez Silva",
      secretary: "Ana Torres Moreno",
      associatedCountries: 6,
      votes: 0,
      countries: [
        { name: "Canadá", representative: "John Smith", selected: true },
        { name: "Australia", representative: "Emma Wilson", selected: true },
        { name: "Japón", representative: "Takashi Yamamoto", selected: true },
        { name: "Noruega", representative: "Erik Hansen", selected: true },
      ],
    },
  ]

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-600" />
    )
  }

  const filteredAndSortedCommissions = mockCommissions
    .filter((commission) => {
      return (
        commission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.president.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.secretary.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const totalPages = Math.ceil(filteredAndSortedCommissions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCommissions = filteredAndSortedCommissions.slice(startIndex, startIndex + itemsPerPage)

  const renderCommissionForm = (commission: Commission | null = null) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{commission ? "Modificar una Comisión" : "Crear una Comisión"}</h3>

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
              <SelectItem value="Juan Hernandez Gonzales">Juan Hernandez Gonzales</SelectItem>
              <SelectItem value="Pedro Raúl Ramires">Pedro Raúl Ramires</SelectItem>
              <SelectItem value="María López Vega">María López Vega</SelectItem>
              <SelectItem value="Carlos Méndez Silva">Carlos Méndez Silva</SelectItem>
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
              <SelectItem value="Luis García Ruiz">Luis García Ruiz</SelectItem>
              <SelectItem value="Ana Torres Moreno">Ana Torres Moreno</SelectItem>
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
              {commission?.countries?.map((country, index) => (
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
                  <tr className="border-t">
                    <td className="px-4 py-3">
                      <Checkbox />
                    </td>
                    <td className="px-4 py-3">México</td>
                    <td className="px-4 py-3">Carlos Fuentes</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3">
                      <Checkbox />
                    </td>
                    <td className="px-4 py-3">Ecuador</td>
                    <td className="px-4 py-3">Ana Suárez</td>
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
            setIsEditing(false)
            setSelectedItem(null)
          }}
        >
          {commission ? "Aceptar" : "Registrar"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setIsEditing(false)
            setSelectedItem(null)
          }}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )

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
              <h1 className="text-xl font-bold text-gray-900">Modelo de Naciones Unidas</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium">
                Bienvenido, {sessionStorage.getItem("username") || "Usuario"}
              </span>
              <Button variant="outline" onClick={handleLogout} className="border-gray-300 hover:bg-gray-50">
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
            renderCommissionForm(selectedItem)
          ) : (
            <>
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Gestión de Comisiones</h2>
                  <p className="text-gray-600 mt-1">Administre las comisiones del Modelo ONU</p>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 transform hover:scale-105"
                  onClick={() => setIsEditing(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear una Comisión
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Building className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{mockCommissions.length}</p>
                        <p className="text-sm text-gray-600">Total Comisiones</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockCommissions.reduce((sum, commission) => sum + commission.associatedCountries, 0)}
                        </p>
                        <p className="text-sm text-gray-600">Países Asociados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Vote className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockCommissions.reduce((sum, commission) => sum + commission.votes, 0)}
                        </p>
                        <p className="text-sm text-gray-600">Votaciones</p>
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

              {/* Commissions Table */}
              <Card className="shadow-md">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left">
                            <button
                              onClick={() => handleSort("number")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <span>Número</span>
                              {getSortIcon("number")}
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
                              onClick={() => handleSort("president")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span>Presidente</span>
                              {getSortIcon("president")}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button
                              onClick={() => handleSort("secretary")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span>Secretario</span>
                              {getSortIcon("secretary")}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button
                              onClick={() => handleSort("associatedCountries")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <Globe className="w-4 h-4" />
                              <span>Países Asociados</span>
                              {getSortIcon("associatedCountries")}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button
                              onClick={() => handleSort("votes")}
                              className="flex items-center space-x-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <Vote className="w-4 h-4" />
                              <span>Votaciones</span>
                              {getSortIcon("votes")}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <span className="text-sm font-semibold text-gray-900">Acciones</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedCommissions.map((commission) => (
                          <tr key={commission.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{commission.number}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{commission.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{commission.president}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{commission.secretary}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{commission.associatedCountries}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{commission.votes}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-300 hover:bg-blue-50 text-blue-700"
                                  onClick={() => {
                                    setSelectedItem(commission)
                                    setIsEditing(true)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 hover:bg-red-50 text-red-700"
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
                        {Math.min(startIndex + itemsPerPage, filteredAndSortedCommissions.length)} de{" "}
                        {filteredAndSortedCommissions.length} resultados
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages || totalPages === 0}
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
  )
}
