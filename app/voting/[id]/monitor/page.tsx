"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAuxVoting, getIdentity, getSocket, getToken } from "@/lib/utils";
import { IVoting } from "@/interfaces/IVoting";

export default function VotingMonitorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [votingData, setVotingData] = useState<IVoting>(getAuxVoting());
  const [monitorData, setMonitorData] = useState<{
    votes: {
      country: string;
      vote: number;
    }[];
    in_favour: number;
    against: number;
    abstention: number;
  }>();
  const [socket, setSocket] = useState<any>();

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    socket?.emit(
      "show-monitor",
      {
        identity: getIdentity(),
        token: getToken(),
        id: votingData.id_voting,
      },
      (res: any) => {}
    );
  }, [socket]);

  useEffect(() => {
    const newSocket = getSocket(setMonitorData);
    setSocket(newSocket);
  }, [monitorData]);

  const getVoteIcon = (vote: number) => {
    switch (vote) {
      case 1:
        return (
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
          </div>
        );
      case 0:
        return (
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
          </div>
        );
      case 2:
        return (
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  // Create a grid of countries with their votes
  const renderCountryGrid = () => {
    const countries = monitorData?.votes || [];
    const columns = 7;
    const maxItemsPerColumn = 2;

    // 1. Dividir los países en columnas (máximo 28 elementos por columna)
    const columnData: (typeof countries)[] = [];

    for (let i = 0; i < columns; i++) {
      const start = i * maxItemsPerColumn;
      const end = start + maxItemsPerColumn;
      columnData.push(countries.slice(start, end));
    }

    // 2. Calcular el máximo de filas necesario (la columna con más elementos)
    const maxRows = Math.max(...columnData.map((col) => col.length), 0);

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {Array.from({ length: maxRows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {columnData.map((column, colIndex) => {
                  const country = column[rowIndex];
                  if (!country) return null; // No renderizar celdas vacías

                  return (
                    <td
                      key={`${colIndex}-${rowIndex}`}
                      className="px-4 py-3 whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-2">
                        {getVoteIcon(country.vote)}
                        <span>{country.country}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-blue-100">
      {/* Header */}
      <header className="bg-blue-200 shadow-sm border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">XIII</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Modelo de Naciones Unidas
              </h1>
            </div>
            <div className="flex space-x-2">
              <Link href={`/voting`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a la Votación
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h1 className="text-xl font-bold">{votingData.voting_name}</h1>
            <div className="text-right text-gray-600">
              {votingData.date?.toString()}{" "}
              {votingData.hour ? ` • ${votingData.hour}` : ``}
            </div>
          </div>

          <div className="p-4">{renderCountryGrid()}</div>

          <div className="p-6 flex flex-col md:flex-row justify-center items-center gap-8 border-t bg-gray-50">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-green-100 border-4 border-green-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-green-600"
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
              </div>
              <div className="mt-2 text-center">
                <div className="text-xl font-bold">
                  {monitorData?.in_favour || 0}{" "}
                  <span className="text-lg font-medium">A favor</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-red-100 border-4 border-red-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-red-600"
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
              </div>
              <div className="mt-2 text-center">
                <div className="text-xl font-bold">
                  {monitorData?.against || 0}{" "}
                  <span className="text-lg font-medium">En contra</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-yellow-100 border-4 border-yellow-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
                </svg>
              </div>
              <div className="mt-2 text-center">
                <div className="text-xl font-bold">
                  {monitorData?.abstention || 0}{" "}
                  <span className="text-lg font-medium">En contra</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
