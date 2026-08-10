# 🌿 ALETIS — Bem-Estar Social & Conexões Intencionais

> **"Não queremos que o utilizador fique viciado, queremos que ele se sinta nutrido."**

O **Aletis** é uma rede social alternativa fundada nos princípios de **Slow Tech** e economia de atenção consciente. Diferente das redes tradicionais desenhadas para retenção infinita e estímulo dopaminérgico, o Aletis estimula interações com propósito, cultivo da saúde mental, apoio comunitário e desaceleração digital.

A aplicação opera **100% autônoma, offline e self-hosted em Docker Compose**, utilizando **PostgreSQL 16 + pgvector**, autenticação nativa, e o motor de Inteligência Artificial **Agente Sentinela Dual-Brain (Llama + DeepSeek local via Ollama)** sem dependência de APIs ou nuvens externas (zero Supabase / zero Vercel).

---

## ✨ Funcionalidades Principais

### 🛡️ O Agente Sentinela Dual-Brain (IA Autônoma & 100% Local)
1. **Cérebro 1 — Raciocínio & Risco (`deepseek-r1:1.5b` local):**
   - Análise lógica profunda de segurança, triagem de risco e detecção de conteúdos nocivos sem vazamento de dados para a nuvem.
2. **Cérebro 2 — Mentoria & Empatia (`llama3.2` local):**
   - Suporte empático, mentoria de Aletis e sugestões reflexivas para acolhimento de desabafos curtos.
3. **Memória Vetorial Contínua (`nomic-embed-text` + `pgvector`):**
   - Busca por Similaridade de Cosseno no PostgreSQL para o Agente Sentinela recordar o histórico emocional e evoluir a cada interação.

### 🏛️ Tribos & Comunidades (Estilo Discord)
- **Canais de Texto e Voz Granulares:** Acesso Público, Privado e Exclusivo Staff.
- **Mural de Avisos (Átrio):** Espaço para anúncios oficiais com permissões de publicação.
- **Gestão Avançada de Cargos & Permissões:** Cores, ícones temáticos e permissões granulares.
- **Moderação Completa de Chat & Membros:** Fixação de mensagens, apelidos, time-out e banimentos.

---

## 🛠️ Arquitetura & Stack Tecnológica

- **Frontend & Backend Web:** Next.js 16 (App Router, Turbopack, React 19, TailwindCSS, Lucide Icons).
- **Arquitetura de Software:** Monorepo com DDD (Domain-Driven Design), Clean Architecture e MVVM (`packages/domain`, `packages/application`, `packages/infrastructure`, `apps/web`).
- **Banco de Dados & Autenticação:** PostgreSQL 16 + pgvector local + Autenticação por Sessão HTTP-Only JWT.
- **Motor de IA Local:** Ollama Dual-Brain (`deepseek-r1:1.5b` + `llama3.2` + `nomic-embed-text`).
- **Containerização:** Docker & Docker Compose (modo standalone 100% self-hosted).

---

## 📁 Estrutura do Monorepo

```
aletis/
├── apps/
│   └── web/                   # Aplicação Next.js 16 (UI, Views, ViewModels, Server Actions)
├── packages/
│   ├── domain/                # Entidades, Schemas Zod, Interfaces de Repositório
│   ├── application/           # DualBrainSentinelaService, Use Cases e Regras de Negócio Pure TS
│   └── infrastructure/        # Implementações PostgreSQL (pg Pool) e pgvector
├── scripts/
│   └── init-local-db.sql      # Schema PostgreSQL local consolidado com pgvector
└── docker-compose.yml         # Orquestração Docker 100% local (PostgreSQL, Ollama, App)
```

---

## 🐳 Execução via Docker (Recomendado)

Para subir toda a infraestrutura autônoma com um único comando:

```bash
# Subir banco de dados, motor de IA e aplicação web
docker compose up --build -d
```

Acesse a aplicação no navegador em [http://localhost:3000](http://localhost:3000).

---

## 🤝 Manifesto

O Aletis não promete felicidade instantânea. Promete **espaço**.  
Aqui, não precisas de atuar ou performar. Existir e partilhar a tua verdade já é o suficiente. 🌿