/**
 * Filtro Heurístico Local (Camada 1 - Custo $0)
 * Analisa o texto antes de enviar para IAs externas.
 * Detecta spam de caracteres repetidos, repetição semântica excessiva e falta de diversidade de texto.
 */

export interface TextHeuristicResult {
  safe: boolean;
  reason?: string;
}

export function evaluateTextHeuristics(content: string): TextHeuristicResult {
  const trimmed = content.trim();

  if (!trimmed) {
    return { safe: false, reason: "O conteúdo não pode estar vazio." };
  }

  // 1. Repetição excessiva de um mesmo caractere em sequência (ex: "aaaaaa...", "!!!!!!")
  if (/(.)\1{6,}/i.test(trimmed)) {
    return {
      safe: false,
      reason: "O Sentinela detectou repetição excessiva de caracteres.",
    };
  }

  // 2. Análise de diversidade de caracteres (Entropia simples)
  // Textos com mais de 25 caracteres devem ter pelo menos 6 caracteres/símbolos únicos diferentes.
  // Evita falsos positivos em desabafos longos legítimos da língua portuguesa.
  if (trimmed.length >= 25) {
    const uniqueChars = new Set(trimmed.toLowerCase()).size;

    if (uniqueChars < 6) {
      return {
        safe: false,
        reason: "O texto possui baixíssima diversidade de caracteres (possível spam).",
      };
    }
  }

  // 3. Detecção de caracteres de marcação/tags HTML (< ou >)
  if (/[<>]/.test(trimmed)) {
    return {
      safe: false,
      reason: "O Sentinela detectou caracteres inválidos ou símbolos de marcação HTML (< ou >).",
    };
  }

  // 4. Detecção de palavras contínuas sem espaço excessivamente longas (Keyboard Mash / Spam de layout)
  const rawWords = trimmed.split(/\s+/).filter(Boolean);
  const words = rawWords.map((w) => w.toLowerCase());

  for (const word of words) {
    if (word.length > 40 && !/^https?:\/\//i.test(word)) {
      return {
        safe: false,
        reason: "O Sentinela detectou palavra ou sequência excessivamente longa sem espaços.",
      };
    }
  }

  // 5. Repetição contínua ou total de uma mesma palavra (ex: "teste teste teste teste" ou 4+ "wef" espalhados)
  const wordCounts = new Map<string, number>();
  if (words.length >= 5) {
    let consecutiveRepeat = 1;
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (w.length > 1) {
        wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
      }
      if (i > 0) {
        if (words[i] === words[i - 1] && words[i].length > 2) {
          consecutiveRepeat++;
          if (consecutiveRepeat >= 4) {
            return {
              safe: false,
              reason: "O Sentinela detectou repetição contínua da mesma palavra.",
            };
          }
        } else {
          consecutiveRepeat = 1;
        }
      }
    }

    // Se uma palavra curta/média de 2 a 6 letras se repete 4+ vezes em um texto com menos de 30 palavras
    if (words.length < 30) {
      for (const [w, count] of wordCounts.entries()) {
        if (count >= 4 && w.length >= 2 && w.length <= 6) {
          return {
            safe: false,
            reason: "O Sentinela detectou repetição excessiva de palavras idênticas.",
          };
        }
      }
    }
  }

  // 6. Alternância errática de Maiúsculas/Minúsculas no meio de palavras (Shift Mash: ex: "xQEAFwerfwe", "GEwrdfWERF")
  let erraticCaseCount = 0;
  for (const rawWord of rawWords) {
    if (rawWord.length >= 5 && /[a-z]+[A-Z]+[a-z]+|[A-Z]+[a-z]+[A-Z]+/.test(rawWord)) {
      erraticCaseCount++;
      if (erraticCaseCount >= 2) {
        return {
          safe: false,
          reason: "O Sentinela detectou alternância anômala de maiúsculas e minúsculas (possível digitação aleatória).",
        };
      }
    }
  }

  // 7. Detecção de palavras de 3+ letras sem NENHUMA vogal e mistura alfanumérica aleatória
  const COMMON_UNITS_REGEX = /^(\d+(km|m|cm|mm|g|kg|mg|h|min|s|d|k|mb|gb|tb|hz|khz|mhz|ghz|v|w|a|ª|º)|(v\d+|\d+v\d+|\d+d|\d+k))$/i;
  let vowellessWordCount = 0;
  let alphaNumMashCount = 0;
  const vowelRegex = /[aeiouyáéíóúâêôãõ]/i;

  for (const rawWord of rawWords) {
    const cleanAlpha = rawWord.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
    const lettersOnly = cleanAlpha.replace(/[^a-zA-ZáéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]/g, "");

    if (lettersOnly.length >= 3 && !vowelRegex.test(lettersOnly)) {
      vowellessWordCount++;
      if (vowellessWordCount >= 2) {
        return {
          safe: false,
          reason: "O Sentinela detectou palavras sem vogais (possível digitação aleatória).",
        };
      }
    }

    if (
      cleanAlpha.length >= 4 &&
      /\d/.test(cleanAlpha) &&
      /[a-zA-Z]/.test(cleanAlpha) &&
      !COMMON_UNITS_REGEX.test(cleanAlpha)
    ) {
      alphaNumMashCount++;
      if (alphaNumMashCount >= 2) {
        return {
          safe: false,
          reason: "O Sentinela detectou mistura anômala de números e letras (possível digitação aleatória).",
        };
      }
    }
  }

  // 8. Análise da Proporção Global de Vogais (Proporção de Vogais < 28% em textos de 25+ letras)
  const allLetters = trimmed.replace(/[^a-zA-ZáéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]/g, "");
  if (allLetters.length >= 25) {
    const vowelMatches = allLetters.match(/[aeiouyáéíóúâêôãõ]/gi) || [];
    const vowelRatio = vowelMatches.length / allLetters.length;
    if (vowelRatio < 0.28) {
      return {
        safe: false,
        reason: "O Sentinela detectou baixíssima proporção de vogais (possível digitação aleatória).",
      };
    }
  }

  // 9. Análise de Frequência de N-Grams (Trigramas de Caracteres repetidos ex: "wef" 5+ vezes)
  const cleanCharText = words.join("").replace(/[^a-z0-9]/g, "");
  if (cleanCharText.length >= 15) {
    const ngramCounts = new Map<string, number>();
    for (let i = 0; i <= cleanCharText.length - 3; i++) {
      const trigram = cleanCharText.substring(i, i + 3);
      ngramCounts.set(trigram, (ngramCounts.get(trigram) || 0) + 1);
    }
    for (const [, count] of ngramCounts.entries()) {
      if (count >= 5 && cleanCharText.length < 150) {
        return {
          safe: false,
          reason: "O Sentinela detectou repetição de padrão de teclado (trigramas aleatórios).",
        };
      }
    }
  }

  // 10. Sequência anormal de consoantes consecutivas (ex: "bcdfghjklmnp")
  if (/[bcdfghjklmnpqrstvwxyzç]{8,}/i.test(trimmed)) {
    return {
      safe: false,
      reason: "O Sentinela detectou sequência excessiva de consoantes (possível digitação aleatória).",
    };
  }

  return { safe: true };
}
