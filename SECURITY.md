# Security Policy - Aletis Project

A segurança da comunidade e da plataforma **Aletis** é nossa prioridade máxima. Levamos a sério todas as relatorias de vulnerabilidades e agradecemos a colaboração de pesquisadores e da comunidade de código aberto para manter o ambiente seguro, privado e acolhedor.

---

## Versões Suportadas (Supported Versions)

Apenas a versão mais recente em execução no ramo `main` recebe correções ativas de segurança.

| Versão | Suportada |
| ------- | ------------------ |
| `1.x.x` (Atual / `main`) | :white_check_mark: |
| `< 1.0.0` (Drafts / Legado) | :x: |

---

## Reportando uma Vulnerabilidade (Reporting a Vulnerability)

Se você identificou uma vulnerabilidade de segurança no ecossistema **Aletis** (Web App, API, Integrações Stripe, Comunicação em Tempo Real LiveKit, Moderação Sentinela AI ou Infraestrutura PostgreSQL), **não abra uma issue pública**.

### Como Enviar o Relatório

Envie um e-mail detalhado para a equipe de segurança ou mantenha contato privado através dos canais de suporte oficiais:

- **E-mail de Segurança**: `security@aletis.app` *(ou crie uma divulgação privada via GitHub Security Advisory)*
- **Assunto Recomendado**: `[SECURITY VULNERABILITY] Descrição sucinta da falha`

### O que Incluir no Relatório

Para nos ajudar a analisar e responder rapidamente, inclua:

1. **Descrição da Falha**: Explicação clara da vulnerabilidade e seu impacto em potencial.
2. **Componentes Afetados**: Módulo específico (ex: Autenticação, Webhooks do Stripe, Tokens LiveKit, Filtros Sentinela AI, Endpoints `/api/`).
3. **Passos para Reproduzir (PoC)**: Instruções detalhadas, scripts de prova de conceito ou requisições de exemplo.
4. **Vetor de Ataque / Gravidade Estimada**: Baixa, Média, Alta ou Crítica (CVSS se disponível).

---

## O que Esperar do Nosso Processo

1. **Confirmação de Recebimento**: Responderemos ao seu relatório inicial em até **24 a 48 horas**.
2. **Avaliação e Triagem**: Em até **7 dias úteis**, informaremos se a vulnerabilidade foi confirmada e qual o plano de correção.
3. **Resolução e Patch**: Trabalharemos para aplicar a correção prioritária e implantá-la em produção.
4. **Reconhecimento**: Se desejado, adicionaremos seu nome/perfil aos nossos agradecimentos de colaboradores de segurança após a resolução do problema.

---

## Práticas de Segurança e Diretrizes do Projeto Aletis

- **Privacidade de Chaves e Credenciais**: Nunca comite chaves de API (`STRIPE_SECRET_KEY`, `LIVEKIT_API_SECRET`, senhas de banco de dados PostgreSQL) nos repositórios. Utilize sempre variáveis de ambiente configuradas no arquivo `.env`.
- **Moderação Inteligente (Sentinela AI)**: Conteúdos ofensivos, tentativas de injeção ou assédio são filtrados em tempo real pela camada de IA do Sentinela.
- **Transações Financeiras**: Todos os pagamentos e webhooks (VIBE Boosts e Assinaturas) são assinados criptograficamente via Stripe Webhook Secrets para evitar fraudes ou duplicação de transações.
- **Tráfego Criptografado**: Todas as comunicações de voz, vídeo e dados ocorrem via HTTPS e WebSockets seguros (WSS).
