"use client"

import { Plus, Edit, Trash2, Vote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

type Voting = {
  id: string
  title: string
  description: string
  commission: string
  deadline: string
  status: string
}

export default function VotingPage() {
  const [votings, setVotings] = useState<Voting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingVoting, setEditingVoting] = useState<any>(null)
  const [deletingVoting, setDeletingVoting] = useState<any>(null)

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setVotings([
        {
          id: "1",
          title: "Ley de Salud Mental",
          description: "Propuesta para mejorar el acceso a servicios de salud mental.",
          commission: "salud",
          deadline: "2024-05-15T18:00",
          status: "active",
        },
        {
          id: "2",
          title: "Reforma Educativa",
          description: "Iniciativa para modernizar el sistema educativo.",
          commission: "educacion",
          deadline: "2024-06-20T12:00",
          status: "closed",
        },
      ])
      setIsLoading(false)
    }, 500)
  }, [])

  const handleCreateVoting = () => {
    setIsCreateDialogOpen(true)
  }

  const handleEditVoting = (voting: any) => {
    setEditingVoting(voting)
    setIsEditDialogOpen(true)
  }

  const handleDeleteVoting = (voting: any) => {
    setDeletingVoting(voting)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveVoting = () => {
    // Aquí iría la lógica para guardar la votación
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingVoting(null)
  }

  const handleConfirmDelete = () => {
    // Aquí iría la lógica para eliminar la votación
    setIsDeleteDialogOpen(false)
    setDeletingVoting(null)
  }

  const session = {
    id: "1",
    status: "active",
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Votaciones</h1>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateVoting}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Votación
        </Button>
      </div>

      {isLoading ? (
        <p>Cargando votaciones...</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>Lista de votaciones activas.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Fecha Límite</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {votings.map((voting) => (
                <TableRow key={voting.id}>
                  <TableCell className="font-medium">{voting.id}</TableCell>
                  <TableCell>{voting.title}</TableCell>
                  <TableCell>{voting.commission}</TableCell>
                  <TableCell>{voting.deadline}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Link href={`/voting/${voting.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          voting.status === "active"
                            ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                            : "text-gray-400"
                        }
                        disabled={voting.status !== "active"}
                      >
                        <Vote className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleEditVoting(voting)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteVoting(voting)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Total de votaciones: {votings.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
      {/* Modal Crear/Editar Votación */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setIsEditDialogOpen(false)
            setEditingVoting(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingVoting ? "Editar Votación" : "Crear Nueva Votación"}</DialogTitle>
            <DialogDescription>
              {editingVoting
                ? "Modifique los datos de la votación."
                : "Complete los datos para crear una nueva votación."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                defaultValue={editingVoting?.title || ""}
                className="col-span-3"
                placeholder="Título de la votación"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Descripción
              </Label>
              <Textarea
                id="description"
                defaultValue={editingVoting?.description || ""}
                className="col-span-3"
                placeholder="Descripción detallada..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commission" className="text-right">
                Comisión
              </Label>
              <Select defaultValue={editingVoting?.commission || ""}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar comisión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salud">Comisión de Salud</SelectItem>
                  <SelectItem value="educacion">Comisión de Educación</SelectItem>
                  <SelectItem value="economia">Comisión de Economía</SelectItem>
                  <SelectItem value="cultura">Comisión de Cultura</SelectItem>
                  <SelectItem value="ciencia">Comisión de Ciencia y Tecnología</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">
                Fecha Límite
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                defaultValue={editingVoting?.deadline || ""}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                setEditingVoting(null)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveVoting}>{editingVoting ? "Guardar Cambios" : "Crear Votación"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar Votación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar Votación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar la votación "{deletingVoting?.title}"? Esta acción no se puede deshacer y
              se perderán todos los votos registrados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
