"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, Globe } from "lucide-react";

export interface Country {
  code: string;       // BR
  name: string;       // Brasil
  flag: string;       // 🇧🇷
  dialCode: string;   // +55
  mask: string;       // (99) 99999-9999
  placeholder: string;// (11) 99999-9999
  maxDigits: number;  // 11
}

export const COUNTRIES: Country[] = [
  { code: "BR", name: "Brasil", flag: "🇧🇷", dialCode: "+55", mask: "(99) 99999-9999", placeholder: "(11) 99999-9999", maxDigits: 11 },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", dialCode: "+1", mask: "(999) 999-9999", placeholder: "(202) 555-0123", maxDigits: 10 },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dialCode: "+351", mask: "999 999 999", placeholder: "912 345 678", maxDigits: 9 },
  { code: "ES", name: "Espanha", flag: "🇪🇸", dialCode: "+34", mask: "999 99 99 99", placeholder: "612 34 56 78", maxDigits: 9 },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54", mask: "9 99 9999-9999", placeholder: "9 11 1234-5678", maxDigits: 11 },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧", dialCode: "+44", mask: "7999 999999", placeholder: "7911 123456", maxDigits: 10 },
  { code: "FR", name: "França", flag: "🇫🇷", dialCode: "+33", mask: "9 99 99 99 99", placeholder: "6 12 34 56 78", maxDigits: 9 },
  { code: "DE", name: "Alemanha", flag: "🇩🇪", dialCode: "+49", mask: "9999 9999999", placeholder: "1512 3456789", maxDigits: 11 },
  { code: "IT", name: "Itália", flag: "🇮🇹", dialCode: "+39", mask: "399 999 9999", placeholder: "312 345 6789", maxDigits: 10 },
  { code: "CA", name: "Canadá", flag: "🇨🇦", dialCode: "+1", mask: "(999) 999-9999", placeholder: "(416) 555-0147", maxDigits: 10 },
  { code: "MX", name: "México", flag: "🇲🇽", dialCode: "+52", mask: "999 999 9999", placeholder: "551 234 5678", maxDigits: 10 },
  { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "+56", mask: "9 9999 9999", placeholder: "9 1234 5678", maxDigits: 9 },
  { code: "CO", name: "Colômbia", flag: "🇨🇴", dialCode: "+57", mask: "399 999 9999", placeholder: "300 123 4567", maxDigits: 10 },
  { code: "UY", name: "Uruguai", flag: "🇺🇾", dialCode: "+598", mask: "99 999 999", placeholder: "99 123 456", maxDigits: 8 },
  { code: "PY", name: "Paraguai", flag: "🇵🇾", dialCode: "+595", mask: "999 999 999", placeholder: "981 123 456", maxDigits: 9 },
  { code: "JP", name: "Japão", flag: "🇯🇵", dialCode: "+81", mask: "90-9999-9999", placeholder: "90-1234-5678", maxDigits: 10 },
  { code: "AO", name: "Angola", flag: "🇦🇴", dialCode: "+244", mask: "999 999 999", placeholder: "912 345 678", maxDigits: 9 },
  { code: "MZ", name: "Moçambique", flag: "🇲🇿", dialCode: "+258", mask: "89 999 9999", placeholder: "84 123 4567", maxDigits: 9 },
  { code: "CH", name: "Suíça", flag: "🇨🇭", dialCode: "+41", mask: "79 999 99 99", placeholder: "79 123 45 67", maxDigits: 9 },
  { code: "AU", name: "Austrália", flag: "🇦🇺", dialCode: "+61", mask: "499 999 999", placeholder: "412 345 678", maxDigits: 9 },
];

export function findCountry(codeOrDial?: string): Country {
  if (!codeOrDial) return COUNTRIES[0];
  const clean = codeOrDial.trim().toUpperCase();
  return (
    COUNTRIES.find(
      (c) =>
        c.dialCode === clean ||
        c.dialCode === `+${clean}` ||
        c.code === clean
    ) || COUNTRIES[0]
  );
}

export function formatPhoneWithMask(digits: string, mask: string): string {
  const onlyNums = digits.replace(/\D/g, "");
  let formatted = "";
  let digitIdx = 0;

  for (let i = 0; i < mask.length && digitIdx < onlyNums.length; i++) {
    if (mask[i] === "9" || mask[i] === "#") {
      formatted += onlyNums[digitIdx];
      digitIdx++;
    } else {
      formatted += mask[i];
    }
  }

  return formatted;
}

interface PhoneInputWithCountryProps {
  value: string;
  countryDialCode?: string;
  onChange: (phone: string, dialCode: string, fullFormatted: string) => void;
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  value,
  countryDialCode = "+55",
  onChange,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    return findCountry(countryDialCode);
  });

  useEffect(() => {
    if (countryDialCode) {
      const found = findCountry(countryDialCode);
      setSelectedCountry(found);
    }
  }, [countryDialCode]);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.dialCode.includes(query)
    );
  }, [searchQuery]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const rawDigits = rawInput.replace(/\D/g, "").slice(0, selectedCountry.maxDigits);
    const formatted = formatPhoneWithMask(rawDigits, selectedCountry.mask);
    const fullFormatted = `${selectedCountry.dialCode} ${formatted}`;

    onChange(formatted, selectedCountry.dialCode, fullFormatted);
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");

    // Reformatar número atual com a nova máscara
    const rawDigits = value.replace(/\D/g, "").slice(0, country.maxDigits);
    const formatted = formatPhoneWithMask(rawDigits, country.mask);
    const fullFormatted = `${country.dialCode} ${formatted}`;

    onChange(formatted, country.dialCode, fullFormatted);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {/* Botão Seletor de País (Bandeira + DDI) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 bg-slate-900 border border-slate-700 hover:border-[#50c878] rounded-xl px-3 flex items-center gap-2 text-white transition-colors cursor-pointer shrink-0"
        >
          <span className="text-xl">{selectedCountry.flag}</span>
          <span className="font-mono text-sm font-bold text-slate-200">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Input do Número de Telefone com Máscara */}
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={handlePhoneInputChange}
            placeholder={selectedCountry.placeholder}
            className="w-full h-12 bg-slate-900 border border-slate-700 rounded-xl px-4 text-white focus:outline-none focus:border-[#50c878] transition-colors font-mono font-bold tracking-wider text-sm placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Dropdown de Seleção e Busca de Países */}
      {isOpen && (
        <div className="absolute top-14 left-0 z-50 w-72 bg-background border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Campo de Pesquisa */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar país ou DDI (+55)..."
              autoFocus
              className="bg-transparent w-full text-xs text-white focus:outline-none placeholder:text-slate-500 font-medium"
            />
          </div>

          {/* Lista Scrollável de Países */}
          <div className="max-h-56 overflow-y-auto custom-scrollbar p-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = country.code === selectedCountry.code;
                return (
                  <button
                    key={`${country.code}-${country.dialCode}`}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#50c878]/15 text-[#50c878] font-bold"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] font-semibold text-slate-400">
                        {country.dialCode}
                      </span>
                      {isSelected && <Check size={14} className="text-[#50c878]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 font-medium">
                Nenhum país encontrado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
