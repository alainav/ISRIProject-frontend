"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LineChart } from "lucide-react";
import Link from "next/link";
import { getAuxVoting, getIdentity, getToken, socket } from "@/lib/utils";
import { IVoting } from "@/interfaces/IVoting";

export default function VotingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<number | null>();
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [votingData, setVotingData] = useState<IVoting>(getAuxVoting());
  const [message, setMessage] = useState<string>(
    "Su voto ha sido registrado correctamente."
  );

  const handleVote = (option: number) => {
    if (!hasVoted) {
      setSelectedOption(option);
    }
  };

  useEffect(() => {
    console.log("Elegido", selectedOption);
  }, [selectedOption]);
  const submitVote = () => {
    if (selectedOption) {
      setIsLoading(true);

      socket.emit(
        "execute-vote",
        {
          token: getToken(),
          identity: getIdentity(),
          id: votingData.id_voting,
          vote: selectedOption,
        },
        (res: any) => {
          setMessage(res.message);
          setIsLoading(false);
          setHasVoted(true);
          if (res.success) {
          }
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Simplified Header */}
      <header className="bg-transparent py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/voting">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <Link href={`/voting/${votingData.id_voting}/monitor`}>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
              >
                <LineChart className="w-4 h-4 mr-2" />
                Ver Monitor
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">
              {votingData.voting_name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:justify-between mt-2">
              <p className="text-gray-600">{votingData.commission_name}</p>
              <p className="text-gray-600">
                {votingData.date?.toString()}{" "}
                {votingData.hour ? ` • ${votingData.hour}` : ``}
              </p>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-700 mb-8">{votingData.description}</p>

            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold mb-6">
                {hasVoted ? "¡Gracias por su voto!" : "Seleccione su voto:"}
              </h2>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-10">
              <div
                className={`relative w-40 h-40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  selectedOption === 1
                    ? "bg-green-100 border-4 border-green-500 shadow-lg transform scale-110"
                    : "bg-green-50 border border-green-200 hover:bg-green-100"
                } ${hasVoted && selectedOption === 1 ? "animate-pulse" : ""}`}
                onClick={() => handleVote(1)}
              >
                <div
                  className={`text-green-600 flex flex-col items-center justify-center transition-opacity ${
                    hasVoted && selectedOption !== 1
                      ? "opacity-50"
                      : "opacity-100"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-bold mt-2">A favor</span>
                </div>
              </div>

              <div
                className={`relative w-40 h-40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  selectedOption === 0
                    ? "bg-red-100 border-4 border-red-500 shadow-lg transform scale-110"
                    : "bg-red-50 border border-red-200 hover:bg-red-100"
                } ${hasVoted && selectedOption === 0 ? "animate-pulse" : ""}`}
                onClick={() => handleVote(0)}
              >
                <div
                  className={`text-red-600 flex flex-col items-center justify-center transition-opacity ${
                    hasVoted && selectedOption !== 0
                      ? "opacity-50"
                      : "opacity-100"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="font-bold mt-2">En contra</span>
                </div>
              </div>

              <div
                className={`relative w-40 h-40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  selectedOption === 2
                    ? "bg-yellow-100 border-4 border-yellow-500 shadow-lg transform scale-110"
                    : "bg-yellow-50 border border-yellow-200 hover:bg-yellow-100"
                } ${hasVoted && selectedOption === 2 ? "animate-pulse" : ""}`}
                onClick={() => handleVote(2)}
              >
                <div
                  className={`text-yellow-600 flex flex-col items-center justify-center transition-opacity ${
                    hasVoted && selectedOption !== 2
                      ? "opacity-50"
                      : "opacity-100"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
                  </svg>
                  <span className="font-bold mt-2">Abstención</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              {!hasVoted ? (
                <Button
                  onClick={submitVote}
                  disabled={
                    selectedOption === undefined ||
                    selectedOption === null ||
                    isLoading
                  }
                  className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                >
                  {isLoading ? "Procesando..." : "Votar"}
                </Button>
              ) : (
                <div className="text-center">
                  <p
                    className={`${
                      selectedOption === 1
                        ? `text-green-600`
                        : selectedOption === 0
                        ? `text-red-600`
                        : `text-yellow-600`
                    } font-medium mb-4`}
                  >
                    {message}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/voting">
                      <Button variant="outline">Volver a la lista</Button>
                    </Link>
                    <Link href={`/voting/${votingData.id_voting}/monitor`}>
                      <Button>
                        <LineChart className="w-4 h-4 mr-2" />
                        Ver resultados
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
