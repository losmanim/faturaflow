# FaturaFlow

> SaaS de faturação para pequenas e médias empresas — clientes, produtos e faturas com PDF, num dashboard moderno.

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)

**[English version](#-english-version)**

---

## 📌 Sobre

Sistema de faturação pensado para PMEs portuguesas: gerir clientes e produtos, emitir faturas em PDF e acompanhar a receita num dashboard com métricas. Projeto de portfolio full-stack com foco em **segurança por desenho** (Row Level Security — cada utilizador só acede aos próprios dados, garantido pela base de dados).

## 🗺️ Roadmap

- [x] Setup Next.js 16 + TypeScript + Tailwind 4
- [x] Clientes Supabase (browser + server) com padrão SSR oficial
- [x] Schema da base de dados com RLS (`supabase/schema.sql`)
- [x] Autenticação (email + password) com rotas protegidas via proxy
- [x] CRUD de clientes e produtos (validação server-side)
- [x] Emissão de faturas com linhas dinâmicas, IVA e numeração sequencial
- [x] Máquina de estados da fatura (rascunho → emitida → paga/anulada)
- [x] Fatura imprimível / exportável em PDF (impressão do browser)
- [x] Dashboard com métricas (receita do mês, a receber, faturas recentes)
- [ ] Testes (Vitest + Playwright) e CI
- [ ] Deploy na Vercel
- [ ] Download direto de PDF

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Linguagem | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Deploy | Vercel |

## 🚀 Como correr

```bash
git clone https://github.com/losmanim/faturaflow.git
cd faturaflow
npm install

# 1. Criar projeto gratuito em https://supabase.com
# 2. SQL Editor → executar supabase/schema.sql
# 3. Copiar credenciais:
cp .env.local.example .env.local   # preencher URL + anon key

npm run dev   # http://localhost:3000
```

## 🔐 Segurança

- **Row Level Security** em todas as tabelas — isolamento por utilizador garantido pelo PostgreSQL
- Anon key no frontend é segura por desenho (RLS); `service_role` nunca é exposta
- `.env.local` fora do git (`.gitignore`)
- Sessão via cookies httpOnly (padrão `@supabase/ssr`)

## 📁 Estrutura

```
faturaflow/
├── src/
│   ├── app/              # Rotas (App Router)
│   └── lib/supabase/     # client.ts (browser) + server.ts (server)
├── supabase/
│   └── schema.sql        # Tabelas + RLS (executar no SQL Editor)
└── .env.local.example    # Template de variáveis de ambiente
```

## 👤 Autor

**Luiz Antonio** — Web Developer · Porto, Portugal

📧 los486@hotmail.com · 🌐 [Portfolio](https://losmanim.github.io/portfolio)

## 📄 Licença

MIT

---
---

# 🇬🇧 English Version

> Invoicing SaaS for small and medium businesses — clients, products and PDF invoices in a modern dashboard.

Full-stack portfolio project built with **Next.js 16, TypeScript, Tailwind 4 and Supabase**, with a **security-first design**: Row Level Security ensures each user can only access their own data at the database level.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project URL + anon key
# Run supabase/schema.sql in the Supabase SQL Editor
npm run dev
```

## Author

**Luiz Antonio** — Web Developer, Porto, Portugal · [Portfolio](https://losmanim.github.io/portfolio)

## License

MIT
