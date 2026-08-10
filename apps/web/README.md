# Aletis Web Client

Frontend principal da plataforma **Aletis**, construído com Next.js 16 (App Router), React 19, Tailwind CSS e TypeScript.

## 🚀 Arquitetura 100% Local & Self-Hosted

Este projeto funciona **exclusivamente local e offline dentro da infraestrutura Docker**, conectado diretamente ao banco PostgreSQL 16 local e ao serviço Ollama com os cérebros **DeepSeek-R1** e **Llama 3.2**.

- **Sem Supabase**
- **Sem Vercel**
- **Sem APIs Externas ou Tokens de Terceiros**

## 🛠️ Como Executar em Desenvolvimento

Para rodar apenas o frontend apontando para os containers de banco e IA:

```bash
pnpm --filter web dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
