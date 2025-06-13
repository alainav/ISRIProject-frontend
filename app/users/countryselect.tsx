"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Country {
  id: number;
  name: string;
}

interface CountrySelectProps {
  countries: Country[];
  value?: string;
  onValueChange?: (value: string) => void; // Para uso en filtros (setCountryFilter)
  onChange?: (value: string) => void; // Para uso en formularios (handleInputChange)
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  countriesLoaded?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CountrySelect = ({
  countries,
  value = "",
  onValueChange,
  onChange,
  placeholder = "Buscar país...",
  className = "",
  isLoading = false,
  countriesLoaded = false,
  onOpenChange,
}: CountrySelectProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar con el valor externo
  useEffect(() => {
    if (value && countries.length > 0) {
      const country = countries.find((c) => c.id.toString() === value);
      if (country) {
        setSelectedCountry(country);
        setInputValue(country.name);
      } else {
        setSelectedCountry(null);
        setInputValue("");
      }
    } else {
      setSelectedCountry(null);
      setInputValue("");
    }
  }, [value, countries]);

  // Filtrar países basados en la búsqueda
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Manejar selección de país
  const handleSelect = useCallback(
    (country: Country) => {
      const countryValue = country.id.toString();
      setSelectedCountry(country);
      setInputValue(country.name);
      setIsOpen(false);

      // Llamar a ambos manejadores si existen
      if (onValueChange) {
        onValueChange(countryValue); // Para setCountryFilter
      }
      if (onChange) {
        onChange(countryValue); // Para handleInputChange
      }
    },
    [onChange, onValueChange]
  );

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Si se borra el input, limpiar la selección
    if (newValue === "") {
      if (onValueChange) onValueChange("");
      if (onChange) onChange("");
      setSelectedCountry(null);
    }
  };

  // Manejar apertura/cierre
  const handleToggleOpen = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) onOpenChange(open);

    // Restaurar el valor seleccionado al cerrar sin selección
    if (!open && selectedCountry) {
      setInputValue(selectedCountry.name);
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        handleToggleOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedCountry]);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => handleToggleOpen(true)}
          placeholder={
            isLoading
              ? "Cargando países..."
              : countriesLoaded
              ? placeholder
              : "Haga clic para cargar países"
          }
          className="pl-8 w-full"
          disabled={isLoading}
        />
        {isLoading ? undefined : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Cargando países...</span>
            </div>
          ) : filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <div
                key={country.id}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  selectedCountry?.id === country.id ? "bg-blue-50" : ""
                }`}
                onClick={() => handleSelect(country)}
              >
                {country.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">
              {inputValue
                ? "No se encontraron países"
                : "No hay países disponibles"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
