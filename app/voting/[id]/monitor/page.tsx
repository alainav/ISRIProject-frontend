"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAuxVoting, getIdentity, getSocket, getToken } from "@/lib/utils";
import { IVoting } from "@/interfaces/IVoting";

export default function VotingMonitorPage({
  params,
}: {
  params: { id: string };
}) {
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

  const renderCountryGrid = () => {
    const countries = monitorData?.votes || [];
    const maxCountries = 210;
    const maxRowsDesktop = Math.ceil((monitorData?.votes.length || 1) / 8);
    const columnsDesktop = Math.ceil(
      Math.min(countries.length, maxCountries) / maxRowsDesktop
    );

    return (
      <>
        {/* Vista móvil */}
        <div className="md:hidden w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {countries.slice(0, maxCountries).map((country, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getVoteIcon(country.vote)}
                      <span>{country.country}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vista escritorio */}
        <div className="hidden md:block w-full">
          <table className="w-full border-collapse">
            <tbody>
              {Array.from({ length: maxRowsDesktop }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-t">
                  {Array.from({ length: columnsDesktop }).map((_, colIndex) => {
                    const countryIndex = rowIndex + colIndex * maxRowsDesktop;
                    const country = countries[countryIndex];
                    if (!country || countryIndex >= maxCountries) return null;

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
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-100">
        <header className="bg-blue-200 shadow-sm border-b border-blue-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-40 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded-md w-40 animate-pulse"></div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div className="p-4 border-b bg-gray-100">
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 ml-auto"></div>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
              ))}
            </div>

            <div className="p-6 flex flex-col md:flex-row justify-center items-center gap-8 border-t bg-gray-100">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="mt-2 text-center">
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100">
      <header className="bg-blue-200 shadow-sm border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-16 gap-2 sm:gap-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">XIII</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Modelo de Naciones Unidas
              </h1>
            </div>
            <Link href={`/voting`}>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50 text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Volver a la Votación
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold">
                {votingData.voting_name}
              </h1>
              <div className="text-sm sm:text-base text-gray-600">
                {votingData.date?.toString()}{" "}
                {votingData.hour ? ` • ${votingData.hour}` : ``}
              </div>
            </div>
          </div>

          <div className="p-4">{renderCountryGrid()}</div>

          <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-center items-center gap-4 sm:gap-8 border-t bg-gray-50">
            <div className="flex flex-col items-center w-full sm:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-green-100 border-4 border-green-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-green-600"
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
                <div className="text-lg sm:text-xl font-bold">
                  {monitorData?.in_favour || 0}{" "}
                  <span className="text-sm sm:text-lg font-medium">
                    A favor
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center w-full sm:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-red-100 border-4 border-red-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-red-600"
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
                <div className="text-lg sm:text-xl font-bold">
                  {monitorData?.against || 0}{" "}
                  <span className="text-sm sm:text-lg font-medium">
                    En contra
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center w-full sm:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-yellow-100 border-4 border-yellow-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
                </svg>
              </div>
              <div className="mt-2 text-center">
                <div className="text-lg sm:text-xl font-bold">
                  {monitorData?.abstention || 0}{" "}
                  <span className="text-sm sm:text-lg font-medium">
                    Abstenciones
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
