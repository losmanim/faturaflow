# Guia de Setup — FaturaFlow

Passo a passo completo para pôr o FaturaFlow funcional, localmente e em produção.
Tempo total estimado: **~20 minutos**.

---

## Parte 1 — Supabase (base de dados + autenticação) · ~10 min

### 1.1 Criar conta e projeto

1. Ir a https://supabase.com → **Start your project** → **Sign in with GitHub** (usa a conta `losmanim`)
2. Clicar **New project**
3. Preencher:
   - **Organization**: criar uma se for a primeira vez (nome livre, ex: `losmanim`)
   - **Name**: `faturaflow`
   - **Database Password**: clicar **Generate a password** → **guardar num gestor de passwords** (só é precisa para acesso direto à BD, não para a app)
   - **Region**: `West Europe (Ireland)` — a mais próxima de Portugal
   - **Plan**: Free
4. **Create new project** → aguardar ~2 minutos (provisionamento)

### 1.2 Executar o schema da base de dados

1. No menu lateral: **SQL Editor** → **New query**
2. Abrir o ficheiro [`supabase/schema.sql`](../supabase/schema.sql) deste repo, copiar **todo** o conteúdo e colar no editor
3. **Run** (ou Ctrl+Enter) → deve aparecer `Success. No rows returned`
4. Verificar: menu lateral → **Table Editor** → têm de existir 4 tabelas:
   `clientes` · `produtos` · `faturas` · `fatura_linhas`

> ⚠️ Se der erro de "already exists", o schema já tinha sido executado — ignorar.

### 1.3 Configurar autenticação para a demo

1. Menu lateral → **Authentication** → **Sign In / Providers**
2. Na secção **Email**: **desativar** a opção **Confirm email** → **Save**

> Porquê: o serviço de email gratuito do Supabase é lento e limitado. Com a confirmação desativada, o registo entra imediatamente — ideal para a demo. (Num produto real com SMTP próprio, reativar.)

### 1.4 Recolher as credenciais

1. Menu lateral → **Project Settings** (engrenagem ⚙️) → **Data API**
2. Copiar o **Project URL** (formato `https://xxxxxxxx.supabase.co`)
3. Ainda em Settings → **API Keys** → copiar a chave **Publishable** (ou `anon` `public` se aparecer o formato legado `eyJ...`)

> 🔐 **NUNCA** copiar/usar a `service_role` ou `secret` key no frontend — essa contorna toda a segurança (RLS).

---

## Parte 2 — Ambiente local · ~2 min

```bash
cd "~/Área de trabalho/faturaflow"
cp .env.local.example .env.local
```

Editar `.env.local` com os valores copiados em 1.4:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave publishable/anon>
```

Testar:

```bash
npm run dev   # http://localhost:3000
```

> O `.env.local` está no `.gitignore` — nunca será commitado.

---

## Parte 3 — Deploy na Vercel · ~5 min

> ⚠️ Fazer **depois** de o código da app estar terminado e pushed para o GitHub.

1. Ir a https://vercel.com → **Sign up** → **Continue with GitHub** (conta `losmanim`)
2. **Add New...** → **Project** → **Import** no repo `faturaflow`
3. Framework: **Next.js** (detetado automaticamente) — não alterar mais nada
4. Em **Environment Variables**, adicionar as 2 variáveis (mesmos valores do `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deploy** → em ~2 minutos a app está live em `https://faturaflow-xxx.vercel.app`

> A Vercel faz redeploy automático a cada push para `main`.

---

## Parte 4 — URLs de autenticação (produção) · ~2 min

No Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL**: `https://faturaflow-xxx.vercel.app` (o domínio da Vercel)
- **Redirect URLs** → adicionar:
  - `https://faturaflow-xxx.vercel.app/**`
  - `http://localhost:3000/**` (para desenvolvimento)

---

## ✅ Checklist final

- [ ] Projeto Supabase criado (Parte 1.1)
- [ ] `schema.sql` executado — 4 tabelas visíveis (1.2)
- [ ] "Confirm email" desativado (1.3)
- [ ] `.env.local` preenchido e `npm run dev` a funcionar (Parte 2)
- [ ] Deploy na Vercel com as 2 env vars (Parte 3)
- [ ] Site URL + Redirect URLs configurados (Parte 4)
- [ ] Criar conta de teste na app live e registar 2-3 clientes/produtos/faturas para a demo

---

## 🔐 Regras de segurança

| Item | Regra |
|------|-------|
| `.env.local` | Nunca commitar (já protegido pelo `.gitignore`) |
| `service_role` / secret key | Nunca no frontend, nunca no repo |
| Publishable/anon key | Segura no frontend — o acesso é controlado por RLS na base de dados |
| Database password | Só no gestor de passwords |
