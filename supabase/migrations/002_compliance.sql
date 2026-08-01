-- ============================================================================
-- FaturaFlow — v2: compliance de faturação (Portugal)
-- Executar no Supabase Dashboard → SQL Editor → Run
-- ============================================================================

-- 1. Perfil do fornecedor (Definições) — usado nas faturas
create table public.perfil (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nome       text,
  nif        varchar(9),
  morada     text,
  email      text,
  telefone   text,
  updated_at timestamptz not null default now()
);

alter table public.perfil enable row level security;

create policy "dono_total" on public.perfil
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. Prazo de pagamento (data de vencimento)
alter table public.faturas add column if not exists data_vencimento date;

-- 3. Forma de pagamento
alter table public.faturas add column if not exists forma_pagamento text;

-- 4. Isenção de IVA por linha (ex: art.º 53.º do CIVA)
alter table public.fatura_linhas add column if not exists isencao text;
