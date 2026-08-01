-- ============================================================================
-- FaturaFlow — Schema inicial (PostgreSQL / Supabase)
-- Executar em: Supabase Dashboard → SQL Editor → New query → colar → Run
-- ============================================================================

-- Clientes do utilizador ------------------------------------------------------
create table public.clientes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  nome       text not null,
  nif        varchar(9),
  email      text,
  telefone   varchar(20),
  morada     text,
  created_at timestamptz not null default now()
);

-- Produtos / serviços ---------------------------------------------------------
create table public.produtos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  nome       text not null,
  descricao  text,
  preco      numeric(10,2) not null check (preco >= 0),
  iva        numeric(4,2)  not null default 23 check (iva >= 0 and iva <= 100),
  created_at timestamptz not null default now()
);

-- Faturas ---------------------------------------------------------------------
create table public.faturas (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  cliente_id   uuid not null references public.clientes(id),
  numero       text not null,                       -- ex: 'FT 2026/0001'
  data_emissao date not null default current_date,
  estado       text not null default 'rascunho'
               check (estado in ('rascunho', 'emitida', 'paga', 'anulada')),
  notas        text,
  created_at   timestamptz not null default now(),
  unique (user_id, numero)
);

-- Linhas da fatura ------------------------------------------------------------
create table public.fatura_linhas (
  id             uuid primary key default gen_random_uuid(),
  fatura_id      uuid not null references public.faturas(id) on delete cascade,
  produto_id     uuid references public.produtos(id) on delete set null,
  descricao      text not null,
  quantidade     numeric(10,2) not null default 1 check (quantidade > 0),
  preco_unitario numeric(10,2) not null check (preco_unitario >= 0),
  iva            numeric(4,2)  not null default 23
);

-- Índices ---------------------------------------------------------------------
create index on public.clientes (user_id);
create index on public.produtos (user_id);
create index on public.faturas (user_id);
create index on public.faturas (cliente_id);
create index on public.fatura_linhas (fatura_id);

-- ============================================================================
-- Row Level Security — cada utilizador só vê/edita os próprios dados
-- ============================================================================

alter table public.clientes      enable row level security;
alter table public.produtos      enable row level security;
alter table public.faturas       enable row level security;
alter table public.fatura_linhas enable row level security;

create policy "dono_total" on public.clientes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "dono_total" on public.produtos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "dono_total" on public.faturas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Linhas herdam o acesso da fatura-mãe
create policy "dono_via_fatura" on public.fatura_linhas
  for all using (
    exists (
      select 1 from public.faturas f
      where f.id = fatura_id and f.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.faturas f
      where f.id = fatura_id and f.user_id = auth.uid()
    )
  );
