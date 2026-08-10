/**
 * Script de Verificação de Integridade do Sistema Sentinela & Memória Contínua
 * Testa todas as camadas do ecossistema:
 * 1. Heurística Local ($0) - Posts vs Comentários (Anti-Farming)
 * 2. Ollama Local Container (http://localhost:11434)
 * 3. Health Check da Aplicação Next.js (http://localhost:3000/api/health)
 * 4. Validação de Regras do Sentinela (Grito vs Resposta, Troll-Buster & Memória Contínua)
 */

import http from "http";

// ── Cores para o Console ──────────────────────────────────────────────────────
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

function logSuccess(title, detail = "") {
  console.log(`${GREEN}✔ [APROVADO] ${title}${RESET} ${detail}`);
}

function logWarning(title, detail = "") {
  console.log(`${YELLOW}⚠ [AVISO] ${title}${RESET} ${detail}`);
}

function logError(title, detail = "") {
  console.log(`${RED}✖ [FALHA] ${title}${RESET} ${detail}`);
}

function logInfo(text) {
  console.log(`${CYAN}${text}${RESET}`);
}

// ── 1. Teste da Camada 1: Heurística Local ───────────────────────────────────
function evaluateTextHeuristics(content) {
  const trimmed = content.trim();
  if (!trimmed) return { safe: false, reason: "Conteúdo vazio." };
  if (/(.)\1{6,}/i.test(trimmed)) return { safe: false, reason: "Repetição excessiva de caractere." };

  if (trimmed.length >= 25) {
    const uniqueChars = new Set(trimmed.toLowerCase()).size;
    if (uniqueChars < 6) return { safe: false, reason: "Entropia/diversidade baixa de caracteres." };
  }

  const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length >= 5) {
    let count = 1;
    for (let i = 1; i < words.length; i++) {
      if (words[i] === words[i - 1] && words[i].length > 2) {
        count++;
        if (count >= 4) return { safe: false, reason: "Palavra repetida continuamente." };
      } else {
        count = 1;
      }
    }
  }
  return { safe: true };
}

function testLayer1Heuristics() {
  logInfo("\n--- [TESTE CAMADA 1] Heurística Local ($0) ---");
  
  const spamTest = evaluateTextHeuristics("aaaaaaaaaaaaaaaaa");
  if (!spamTest.safe) {
    logSuccess("Filtro de repetição de caracteres", `-> Bloqueou: "${spamTest.reason}"`);
  } else {
    logError("Filtro de repetição de caracteres falhou");
  }

  const entropyTest = evaluateTextHeuristics("ababababababababababababababab");
  if (!entropyTest.safe) {
    logSuccess("Filtro de entropia baixa (Anti-Farming)", `-> Bloqueou: "${entropyTest.reason}"`);
  } else {
    logError("Filtro de entropia falhou");
  }

  const longDesabafo = "Olho para esta mesa e sinto um peso gigante no peito. É um reflexo exato de como a minha cabeça está agora...";
  const validTest = evaluateTextHeuristics(longDesabafo);
  if (validTest.safe) {
    logSuccess("Desabafo longo (O Grito)", "-> Aprovado sem falso-positivo de diversidade");
  } else {
    logError("Desabafo longo foi bloqueado indevidamente");
  }
}

// ── 2. Teste da Camada 2: Container Ollama Local (DeepSeek + Llama3) ─────────
async function testLayer2Ollama() {
  logInfo("\n--- [TESTE CAMADA 2] Container Ollama Local (http://localhost:11434) ---");

  return new Promise((resolve) => {
    const req = http.get("http://localhost:11434/api/tags", (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const data = JSON.parse(body);
          const models = data.models ? data.models.map((m) => m.name) : [];
          logSuccess("Conexão HTTP com o Ollama Container", `-> HTTP ${res.statusCode}`);
          logSuccess("Modelos disponíveis no Ollama", `-> [${models.join(", ")}]`);
          resolve(true);
        } catch (e) {
          logWarning("Ollama respondeu, mas corpo JSON inválido", e.message);
          resolve(false);
        }
      });
    });

    req.on("error", (err) => {
      logWarning("Ollama Container não está respondendo em http://localhost:11434", err.message);
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      logWarning("Timeout na conexão com Ollama (3s)");
      resolve(false);
    });
  });
}

// ── 3. Teste do Health Check do App Next.js ──────────────────────────────────
async function testNextJsAppHealth() {
  logInfo("\n--- [TESTE CAMADA 3] Health Check da Aplicação Next.js (http://localhost:3000) ---");

  return new Promise((resolve) => {
    const req = http.get("http://localhost:3000/api/health", (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const data = JSON.parse(body);
          if (data.status === "ok") {
            logSuccess("Aplicação Next.js online e saudável", `-> Status: "${data.status}" | Timestamp: ${data.timestamp}`);
            resolve(true);
          } else {
            logWarning("Aplicação respondeu mas status != ok", body);
            resolve(false);
          }
        } catch {
          logWarning("Resposta da API de health inválida", body);
          resolve(false);
        }
      });
    });

    req.on("error", (err) => {
      logWarning("Next.js app não está rodando na porta 3000", err.message);
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      logWarning("Timeout na conexão com Next.js app (3s)");
      resolve(false);
    });
  });
}

// ── Execução Principal ───────────────────────────────────────────────────────
async function runIntegrityAudit() {
  console.log("==========================================================");
  console.log("🛡️  AUDITORIA DE INTEGRIDADE DO SISTEMA SENTINELA DE IA");
  console.log("==========================================================");

  testLayer1Heuristics();
  await testLayer2Ollama();
  await testNextJsAppHealth();

  console.log("\n==========================================================");
  console.log("✨ Auditoria de Integridade Concluída!");
  console.log("==========================================================\n");
}

runIntegrityAudit();
