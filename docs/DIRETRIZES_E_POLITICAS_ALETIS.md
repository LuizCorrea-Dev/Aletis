# 🛡️ Diretrizes, Políticas de Segurança e Regras de Negócio — ALETIS

Este documento consolida todas as políticas de privacidade, segurança, moderação e regras de negócio da plataforma **Aletis**, anteriormente estruturadas como políticas RLS no Supabase e agora integradas diretamente na arquitetura de software e banco de dados PostgreSQL local.

---

## 1. 🌿 Princípios de Convivência e Slow Tech

1. **Economia da Atenção Consciente:** Não existem algoritmos de retenção aditiva ou feeds infinitos desenhados para gerar vício dopaminérgico.
2. **Acolhimento & Desabafos:** Desabafos profundos sobre dor, ansiedade, sobrecarga, cansaço e vulnerabilidade são **100% permitidos e encorajados**.
3. **Tolerância Zero para Toxidade:** Discurso de ódio, assédio, agressividade passiva, sarcasmo maldoso, deboche de sentimentos alheios e spam comercial são estritamente proibidos.

---

## 2. 🛡️ O Agente Sentinela Dual-Brain (IA Autônoma & Local)

O **Agente Sentinela** opera localmente no Docker via Ollama utilizando dois cérebros de IA e memória vetorial contínua:

### 🧠 Arquitetura Dual-Brain
1. **Cérebro 1 — Raciocínio & Risco (DeepSeek-R1 local):**
   - Análise de segurança profunda, classificação de intenções, heurística e detecção de riscos.
   - Filtra violadores sem enviar nenhum dado para APIs externas na nuvem.
2. **Cérebro 2 — Mentoria & Apoio (Llama 3.2 local):**
   - Fornece mentoria empática, sugestões reflexivas e acolhimento personalizado para publicações curtas.
3. **Memória Vetorial Contínua (`nomic-embed-text` + pgvector):**
   - Cada interação gera um vetor de embedding de 768 dimensões gravado na tabela `sentinela_user_memories`.
   - O Sentinela realiza busca por Similaridade de Cosseno (`<=>`) para recordar o histórico emocional e evoluir o contexto do usuário a cada publicação.

---

## 3. 🚨 Protocolo SOS de Emergência

Se o sistema identificar termos associados à ideação suicida, autolesão ou risco iminente à vida:
1. A publicação/comentário é interrompida com uma mensagem de carinho e suporte humano imediato.
2. São exibidas automaticamente as linhas de apoio de emergência gratuitas e sigilosas:
   - **Brasil:** CVV (Centro de Valorização da Vida) — Ligar **188** (`cvv.org.br`)
   - **Portugal:** SNS 24 — Ligar **808 24 24 24** (`sns24.gov.pt`)
   - **Emergência Médica:** SAMU **192**

---

## 4. ⚖️ Políticas de Privacidade e Controle de Acesso (RLS Substituta)

1. **Privacidade de Perfis:** Usuários podem alternar entre perfis públicos, verificados e âncoras.
2. **Postagens Anônimas:** Quando um post for configurado como anônimo (`is_anonymous = true`), a identidade do autor é omitida para todos os usuários, exceto para consultas administrativas locais autorizadas.
3. **Grupos & Comunidades:**
   - **Comunidades Públicas:** Conteúdo visível para todos os membros da rede.
   - **Comunidades Privadas:** Acesso restrito a membros aprovados (`ROLE: OWNER, MODERATOR, MEMBER`).
   - **Mural de Avisos (Átrio):** Apenas o Criador (Owner) e Moderadores possuem permissão de publicação e fixação de avisos.
   - **Canais Privados & Staff:** Restritos a cargos com permissões explicitamente concedidas.

---

## 5. 💎 Sistema de Vibes & Penalidades

1. **Moeda Positiva (Vibes):** Cada novo membro inicia com um saldo de boas-vindas para impulsionar e acolher a comunidade.
2. **Recompensas por Engajamento:** Contribuições intencionais e atenciosas recompensam o autor com Vibes.
3. **Time-Out e Penalidade do Sentinela:**
   - Infrações por deboche ou invalidação de dor resultam na perda imediata de **50 Vibes** e entrada em estado de *Time-Out*.
   - Usuários em Time-Out precisam publicar um desabafo no feed para recuperar o saldo e restabelecer sua participação.
