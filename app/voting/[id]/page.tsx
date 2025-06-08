"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function VotingPage({ params }: { params: { id: string } }) {
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  const handleVote = (voteType: string) => {
    setSelectedVote(voteType)
  }

  const submitVote = () => {
    if (selectedVote) {
      setHasVoted(true)
      // Here you would typically send the vote to your backend
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%)" }}>
      {/* Simple Header with Back Button */}
      <header className="p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/voting">
            <Button variant="outline" className="bg-white/90 hover:bg-white shadow-md border-0 font-medium">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M12 19L5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Volver
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Votación sobre el uso correcto de los equipos médicos en la salud
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Se realiza la votación según la resolución 505/21 del MINSAP
              </p>
            </div>

            {!hasVoted ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                  {/* Opción SÍ */}
                  <div
                    className={`flex flex-col items-center cursor-pointer transform transition-all duration-300 ${
                      selectedVote === "yes" ? "scale-110 drop-shadow-2xl" : "hover:scale-105 hover:drop-shadow-lg"
                    }`}
                    onClick={() => handleVote("yes")}
                  >
                    <div
                      className={`w-48 h-48 rounded-full flex items-center justify-center mb-6 shadow-2xl transition-all duration-300 ${
                        selectedVote === "yes"
                          ? "bg-gradient-to-br from-green-300 to-green-400 border-8 border-green-600 ring-4 ring-green-200"
                          : "bg-gradient-to-br from-green-200 to-green-300 border-6 border-green-500"
                      }`}
                    >
                      <svg
                        className="w-28 h-28 text-green-800"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">Sí</h3>
                  </div>

                  {/* Opción NO */}
                  <div
                    className={`flex flex-col items-center cursor-pointer transform transition-all duration-300 ${
                      selectedVote === "no" ? "scale-110 drop-shadow-2xl" : "hover:scale-105 hover:drop-shadow-lg"
                    }`}
                    onClick={() => handleVote("no")}
                  >
                    <div
                      className={`w-48 h-48 rounded-full flex items-center justify-center mb-6 shadow-2xl transition-all duration-300 ${
                        selectedVote === "no"
                          ? "bg-gradient-to-br from-red-300 to-red-400 border-8 border-red-600 ring-4 ring-red-200"
                          : "bg-gradient-to-br from-red-200 to-red-300 border-6 border-red-500"
                      }`}
                    >
                      <svg
                        className="w-28 h-28 text-red-800"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">No</h3>
                  </div>

                  {/* Opción ABSTENCIÓN */}
                  <div
                    className={`flex flex-col items-center cursor-pointer transform transition-all duration-300 ${
                      selectedVote === "abstention"
                        ? "scale-110 drop-shadow-2xl"
                        : "hover:scale-105 hover:drop-shadow-lg"
                    }`}
                    onClick={() => handleVote("abstention")}
                  >
                    <div
                      className={`w-48 h-48 rounded-full flex items-center justify-center mb-6 shadow-2xl transition-all duration-300 ${
                        selectedVote === "abstention"
                          ? "bg-gradient-to-br from-yellow-300 to-yellow-400 border-8 border-yellow-600 ring-4 ring-yellow-200"
                          : "bg-gradient-to-br from-yellow-200 to-yellow-300 border-6 border-yellow-500"
                      }`}
                    >
                      <svg
                        className="w-28 h-28 text-yellow-800"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path
                          d="M4.93 4.93L19.07 19.07"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">Abstención</h3>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={submitVote}
                    disabled={!selectedVote}
                    className={`px-16 py-6 text-2xl font-bold rounded-xl shadow-2xl transition-all duration-300 ${
                      selectedVote
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Votar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <svg
                    className="w-20 h-20 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-green-600 mb-6">¡Voto registrado correctamente!</h2>
                <p className="text-xl text-gray-600 mb-8">Su voto ha sido registrado en el sistema.</p>
                <Link href="/voting">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg">
                    Volver a votaciones
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
