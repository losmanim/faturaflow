# FaturaFlow-BR

> Emissor de NFS-e (Nota Fiscal de Serviços Eletrônica) para **MEI e prestadores de serviço no Simples Nacional** — clientes, serviços e notas com status em tempo real, XML e PDF, num painel moderno.

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)

---

## 📌 Sobre

Um emissor de NFS-e focado no **maior nicho de faturação do Brasil: os MEI e os prestadores de serviço no Simples Nacional**. Em vez de o usuário preencher o portal da prefeitura toda semana, ele configura a empresa (CNPJ, município, regime) uma vez e emite notas com um clique, acompanhando o status fiscal (rascunho → autorizada/rejeitada), baixando o **XML autorizado** e imprimindo o documento.

Projeto de portfólio full-stack com dois pontos de destaque de arquitetura:

1. **Camada fiscal isolada (padrão adapter)** — a app fala com uma interface `EmissorNFS`; as implementações (`mock`, `focus`) são trocáveis por variável de ambiente, sem tocar no resto do sistema. É o padrão anti-corrupção que separa o produto do protocolo fiscal.
2. **Segurança por desenho** — Row Level Security no PostgreSQL: cada usuário só acessa os próprios dados e notas.

## ⚖️ Nicho e modelo de negócio (viabilidade)

- A SEFAZ **descontinuou o emissor gratuito de NF-e**, abrindo espaço para SaaS emissores.
- **MEI não precisa de certificado digital** (LC 123/2006) — pode emitir com login Gov.br / Emissor Nacional. Este nicho é o alvo principal.
- Para o MVP, o emissor roda em modo **simulação** (funciona sem credenciais). Para emitir notas reais, liga-se a um intermediário certificado (ex.: **Focus NFe**, que cobre milhares de municípios e guarda o certificado A1) — ou, numa fase avançada, implementa-se a integração direta com a SEFAZ/município.
- Impostos do Simples Nacional (ISS, PIS, COFINS, CSLL e os novos **IBS/CBS** da Reforma Tributária) são recolhidos via **DAS** — a nota trata isso automaticamente, sem compor o valor.

## 🗺️ Funcionalidades

- [x] Setup Next.js 16 + TypeScript + Tailwind 4 + Supabase (SSR + RLS)
- [x] Autenticação (email + password) com rotas protegidas
- [x] CRUD de clientes (tomadores) com **CPF/CNPJ**
- [x] Empresa emissora configurável (CNPJ, município IBGE, regime tributário, ISS, NBS)
- [x] Notas com serviços dinâmicos (**código NBS** por linha) e competência
- [x] Máquina de estados da NFS-e: `nao_emitida → processando → autorizada/rejeitada → cancelada`
- [x] Emissão com **RPS** sequencial, protocolo, número da NFS-e e código de verificação
- [x] Guarda do **XML autorizado** (download) + documento imprimível
- [x] Dashboard com faturado no mês, autorizadas, rascunhos e rejeitadas
- [x] Adaptador fiscal: `mock` (demo) + `focus` (integração real, via env)
- [ ] Testes (Vitest + Playwright) e CI
- [ ] Deploy na Vercel
- [ ] Integração direta SEFAZ (fase avançada)

## 🏗️ Arquitetura do adaptador fiscal

```
                    ┌─────────────────────────────┐
                    │   App (rotas / formulários) │
                    └──────────────┬──────────────┘
                                   │ usa
                    ┌──────────────▼──────────────┐
                    │   interface EmissorNFS       │  src/lib/fiscal/emissor.ts
                    │   emitir(DadosEmissao)       │
                    └──┬──────────────────┬───────┘
        EMISSOR_NFSE=mock        EMISSOR_NFSE=focus
                       │                     │
          ┌────────────▼──────┐   ┌──────────▼───────────┐
          │ emissorMock      │   │ emissorFocus         │  src/lib/fiscal/focus.ts
          │ demo sem creds   │   │ API Focus NFe        │
          └──────────────────┘   └──────────────────────┘
```

Trocar de emissor é **uma variável de ambiente** (`EMISSOR_NFSE`), não uma alteração de código. Cada implementação traduz a nossa estrutura para o protocolo do fornecedor e normaliza erros/rejeições.

## 🚀 Como correr

```bash
git clone https://github.com/losmanim/faturaflow.git
cd faturaflow
git checkout faturaflow-br
npm install

# 1. Criar projeto gratuito em https://supabase.com
# 2. SQL Editor → executar em ordem:
#    supabase/schema.sql                          (tabelas base + RLS)
#    supabase/migrations/002_compliance.sql       (perfil + compliance PT)
#    supabase/migrations/003_br_nfse.sql          (NFS-e / dados BR)
# 3. Copiar credenciais:
cp .env.local.example .env.local   # preencher URL + anon key

npm run dev   # http://localhost:3000
```

### Modo de emissão

| Variável | Valores | Descrição |
|----------|---------|-----------|
| `EMISSOR_NFSE` | `mock` (padrão) / `focus` | Simulador sem credenciais ou emissor real |
| `FOCUS_NFSE_TOKEN` | token da API Focus | Obrigatório quando `EMISSOR_NFSE=focus` |
| `FOCUS_AMBIENTE` | `homologacao` (padrão) / `producao` | Ambiente fiscal |

## 🔐 Segurança

- **Row Level Security** em todas as tabelas — isolamento por usuário garantido pelo PostgreSQL
- Anon key no frontend é segura por desenho (RLS); `service_role` nunca é exposta
- `.env.local` fora do git (`.gitignore`) — token fiscal nunca vai para o repositório
- Sessão via cookies httpOnly (padrão `@supabase/ssr`)

## 📁 Estrutura

```
faturaflow/
├── src/
│   ├── app/                 # Rotas (App Router)
│   ├── components/          # UI (formulários, NotaActions, print)
│   └── lib/
│       ├── supabase/        # client.ts (browser) + server.ts (server)
│       └── fiscal/          # Adapter fiscal (emissor.ts, mock.ts, focus.ts)
├── supabase/migrations/     # Migrations (executar em ordem no SQL Editor)
└── .env.local.example       # Template de variáveis de ambiente
```

## 📄 Licença

MIT
