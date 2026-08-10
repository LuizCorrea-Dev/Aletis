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

  // 3. Repetição contínua de uma mesma palavra (ex: "teste teste teste teste teste")
  const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length >= 5) {
    let consecutiveRepeat = 1;
    for (let i = 1; i < words.length; i++) {
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

  return { safe: true };
}
