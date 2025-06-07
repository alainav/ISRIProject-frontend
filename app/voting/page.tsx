"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, Calendar, Building, Vote, Settings, LogOut, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"

type SortField = "number" | "commission" | "name" | "result" | "inFavor" | "against" | "abstention" | "status"
type SortDirection = "asc" | "desc"

interface Voting {
  id: number
  number: number
  commission: string
  name: string
  description: string
  result: string
  inFavor: number
  against: number
  abstention: number
  status: "Abierta" | "Cerrada"
}

export default function VotingPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [commissionFilter, setCommissionFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortField, setSortField] = useState<SortField>("number")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Voting | null>(null)

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
    { id: "commissions", label: "Gestionar Comisiones", icon: Building, href: "/commissions" },
    { id: "voting", label: "Gestionar Votaciones", icon: Vote, href: "/voting", active: true },
    { id: "roles", label: "Gestionar Roles", icon: Settings, href: "/roles" },
  ]

  // Mock data for votings
  const mockVotings: Voting[] = [
    {
      id: 1,
      number: 1,
      commission: "Seguridad en la Salud",
      name: "Electorales2",
      description: "Votación sobre el uso correcto de los equipos médicos en la salud",
      result: "Rechazado",
      inFavor: 10,
      against: 20,
      abstention: 0,
      status: "Cerrada",
    },
    {
      id: 2,
      number: 2,
      commission: "Seguridad en la Salud",
      name: "Municipal21",
      description: "Se realiza la votación según la resolución 505/21 del MINSAP",
      result: "Votando",
      inFavor: 14,
      against: 14,
      abstention: 14,
      status: "Abierta",
    },
    {
      id: 3,
      number: 3,
      commission: "Asamblea General",
      name: "Resolución 42",
      description: "Votación sobre medidas económicas internacionales",
      result: "Aprobado",
      inFavor: 25,
      against: 5,
      abstention: 10,
      status: "Cerrada",
    },
    {
      id: 4,
      number: 4,
      commission: "Derechos Humanos",
      name: "Propuesta 18",
      description: "Votación sobre derechos de refugiados",
      result: "Votando",
      inFavor: 8,
      against: 6,
      abstention: 2,
      status: "Abierta",
    },
  ]

  const commissions = [...new Set(mockVotings.map((voting) => voting.commission))].sort()

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

  const filteredAndSortedVotings = mockVotings
    .filter((voting) => {
      const matchesSearch =
        voting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voting.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCommission = !commissionFilter || voting.commission === commissionFilter
      const matchesStatus = !statusFilter || voting.status === statusFilter

      return matchesSearch && matchesCommission && matchesStatus
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

  const totalPages = Math.ceil(filteredAndSortedVotings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedVotings = filteredAndSortedVotings.slice(startIndex, startIndex + itemsPerPage)

  const renderVotingForm = (voting: Voting | null = null) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{voting ? "Modificar Votación" : "Crear una Votación"}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Comisión</label>
          <Select defaultValue={voting?.commission || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {commissions.map((commission) => (
                <SelectItem key={commission} value={commission}>
                  {commission}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <Input defaultValue={voting?.name || ""} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Descripción</label>
        <Textarea defaultValue={voting?.description || ""} rows={4} />
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            setIsEditing(false)
            setSelectedItem(null)
          }}
        >
          {voting ? "Aceptar" : "Registrar"}
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

  const clearFilters = () => {
    setSearchTerm("")
    setCommissionFilter("")
    setStatusFilter("")
    setCurrentPage(1)
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
            renderVotingForm(selectedItem)
          ) : (
            <>
              {/* Header Section */}
              <div className\
