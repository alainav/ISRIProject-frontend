"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Minus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VotingPage({ params }: { params: { id: string } }) {
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleVote = (voteType: string) => {
    setSelectedVote(voteType)
  }

  const submitVote = () => {
    if (selectedVote) {
      setHasVoted(true)
      // Here you would typically send the vote to your backend
    }
  }

  const countries = [
    { name: "Cuba", vote: "yes" },
    { name: "Noruega", vote: "no" },
    { name: "Alemania", vote: "abstention" },
    { name: "Brazil", vote: "abstention" },
    { name: "México", vote: "yes" },
    { name: "Ecuador", vote: "no" },
  ]

  const getVoteIcon = (vote: string) => {
    switch (vote) {
      case "yes":
        return <Check className="w-5 h-5 text-green-600" />
      case "no":
        return <X className="w-5 h-5 text-red-600" />
      case "abstention":
        return <Minus className="w-5 h-5 text-yellow-600" />
      default:
        return null
    }
  }

  const results = {
    inFavor: 14,
    against: 14,
    abstention: 14,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">XIII</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Gestionar Votaciones</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasVoted ? (
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Votación sobre el uso correcto de los equipos médicos en la salud
              </CardTitle>
              <p className="text-gray-600">Se realiza la votación según la resolución 505/21 del MINSAP</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedVote === "yes" ? "ring-2 ring-green-500 bg-green-50" : "hover:shadow-md"
                  }`}
                  onClick={() => handleVote("yes")}
                >
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-4">
                      <Check className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Sí</h3>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    selectedVote === "no" ? "ring-2 ring-red-500 bg-red-50" : "hover:shadow-md"
                  }`}
                  onClick={() => handleVote("no")}
                >
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-4">
                      <X className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">No</h3>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    selectedVote === "abstention" ? "ring-2 ring-yellow-500 bg-yellow-50" : "hover:shadow-md"
                  }`}
                  onClick={() => handleVote("abstention")}
                >
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
                      <Minus className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Abstención</h3>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <Button
                  onClick={submitVote}
                  disabled={!selectedVote}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                >
                  Votar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl">
                    Votación sobre el uso correcto de los equipos médicos en la salud
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {countries.map((country, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {getVoteIcon(country.vote)}
                      <span className="text-sm">{country.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">A favor</h3>
                  <p className="text-3xl font-bold text-green-600">:{results.inFavor}</p>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-4">
                    <X className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">En contra</h3>
                  <p className="text-3xl font-bold text-red-600">:{results.against}</p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
                    <Minus className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Se abstienen</h3>
                  <p className="text-3xl font-bold text-yellow-600">:{results.abstention}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
