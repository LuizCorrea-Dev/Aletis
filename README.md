# 🌿 ALETIS — Bem-Estar Social & Conexões Intencionais

<div align="center">

![Aletis Banner](https://img.shields.io/badge/Aletis-Bem--Estar%20Social-10b981?style=for-the-badge&logo=leaf&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Dual--Brain%20AI-000000?style=for-the-badge&logo=ollama)](https://ollama.ai/)
[![Docker](https://img.shields.io/badge/Docker-Self--Hosted-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg?style=for-the-badge)](LICENSE)

> **"Não queremos que o utilizador fique viciado, queremos que ele se sinta nutrido."**

</div>

---

## 📌 Sobre o Projeto

O **Aletis** é uma plataforma de rede social criada sob os conceitos de **Slow Tech** e economia de atenção consciente. Ao contrário das plataformas focadas em algoritmo de retenção e estímulos infinitos, o Aletis promove um espaço seguro de desaceleração digital, escuta empática e interações de alto valor interpessoal.

A aplicação opera de forma **100% autônoma, privada e self-hosted via Docker Compose**, combinando banco relacional com busca vetorial e modelos de Inteligência Artificial rodando exclusivamente local via **Ollama**, sem envio de dados para nuvens externas ou serviços SaaS proprietários.

---

## ✨ Recursos Principais

### 🛡️ Agente Sentinela Dual-Brain (IA 100% Local & Privada)
- **Cérebro 1 — Raciocínio & Análise de Risco (`deepseek-r1:1.5b`):** Triagem lógica profunda de segurança e moderação ética em tempo real.
- **Cérebro 2 — Mentoria & Empatia (`llama3.2`):** Apoio emocional acolhedor, conselhos reflexivos e mediação de conversas.
- **Memória Vetorial Reativa (`nomic-embed-text` + `pgvector`):** Armazenamento de embeddings no PostgreSQL para busca por similaridade de cosseno, permitindo que a IA reconheça contexto histórico emocional sem vazamento de privacidade.

### 🏛️ Tribos & Comunidades (Estilo Discord)
- **Canais Multimídia:** Canais de Texto, Voz (WebRTC/Audio) e Feeds dedicados.
- **Átrio:** Mural de anúncios oficiais com controle de permissões de publicação.
- **Níveis de Acesso Granulares:** Canais Públicos, Privados e restritos ao Staff.
- **Gestão de Moderação:** Cargo de Dono (Owner), Moderadores e Membros, banimentos, silenciamento (mute) e aprovação de solicitações.

### 🕊️ Santuário & Feeds Intencionais
- **Publicações sem Métricas Infladas:** Foco na qualidade da partilha em vez de curtidas vazias.
- **Reações com Propósito (Vibes & Zaps):** Sistema de apoio interpessoal e economia de atenção consciente.
- **Listas & Guardados:** Organização de posts e conteúdos inspiradores em coleções pessoais.

---

## 🛠️ Arquitetura & Stack Tecnológica

O projeto foi construído utilizando **Clean Architecture**, **Domain-Driven Design (DDD)** e padronização **MVVM** em um monorepo modular:

- **Frontend & App Server:** Next.js 16 (App Router, Turbopack, React 19, TailwindCSS v4, Lucide Icons).
- **Core Domain & Use Cases:** TypeScript puro em pacotes desacoplados (`packages/domain`, `packages/application`).
- **Camada de Infraestrutura:** `packages/infrastructure` com suporte a `pg` (Pool de conexões) e extensão `pgvector`.
- **Motor de IA Local:** Ollama gerenciado via container Docker dedicado.
- **Orquestração:** Docker Compose com automação de healthchecks e migrações SQL na inicialização.

---

## 📁 Estrutura do Monorepo

```text
aletis/
├── apps/
│   └── web/                   # Aplicação Next.js 16 (UI, Views, ViewModels, Server Actions)
├── packages/
│   ├── domain/                # Entidades, Schemas Zod e Interfaces de Repositório (Domain)
│   ├── application/           # Caso de Uso (Use Cases), Regras de Negócio e Agente Sentinela
│   └── infrastructure/        # Repositórios PostgreSQL + pgvector e conexões de Banco
├── scripts/
│   ├── init-local-db.sql      # Schema PostgreSQL consolidado (Tabelas, Índices, pgvector)
│   ├── run-migration.js       # Script de migração e verificação do DB
│   └── verify-sentinela-integrity.js  # Testes de integridade do Sentinela
├── docs/                      # Documentação técnica e políticas do projeto
└── docker-compose.yml         # Orquestração 100% local (PostgreSQL, Ollama, App)
```

---

## 🚀 Como Executar

### Pré-requisitos
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.
- *(Opcional)* [Node.js 20+](https://nodejs.org/) e [pnpm](https://pnpm.io/) para desenvolvimento local fora do Docker.

### 1. Clonar o Repositório

```bash
git clone https://github.com/SEU_USUARIO/aletis.git
cd aletis
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` a partir do `.env.example`:

```bash
cp .env.example .env
```

### 3. Subir a Aplicação via Docker Compose (Recomendado)

Um único comando inicializa o PostgreSQL com `pgvector`, baixa/inicia o Ollama com os modelos de IA e compila a aplicação Web:

```bash
# Iniciar e compilar todos os containers
docker compose up --build
```

Após a inicialização dos containers, acesse a aplicação em:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

### 🐳 Comandos Úteis do Docker

| Ação | Comando |
| :--- | :--- |
| **Iniciar / Compilar** | `docker compose up --build` |
| **Iniciar em segundo plano (modo detached)** | `docker compose up -d --build` |
| **Parar a aplicação** | `docker compose down` |
| **Parar e remover volumes (limpeza total)** | `docker compose down -v` |
| **Acompanhar logs em tempo real** | `docker compose logs -f` |

---

## 💻 Desenvolvimento Local (Sem Docker para a Web)

Caso prefira rodar apenas a infraestrutura no Docker e a aplicação web localmente:

```bash
# 1. Subir apenas Banco de Dados e Ollama no Docker
docker compose up -d db ollama

# 2. Instalar dependências do monorepo
pnpm install

# 3. Executar em modo desenvolvimento
pnpm dev
```

---

## 📜 Licença

Este projeto está sob licença **Proprietária — Todos os Direitos Reservados**. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Aletis** — Onde a tecnologia serve às pessoas, e não o contrário. 🌿

</div>