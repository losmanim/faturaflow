-- ============================================================================
-- FaturaFlow-BR — v3: NFS-e para MEI e prestadores de serviço
-- Executar no Supabase Dashboard → SQL Editor → Run
--
-- Este ramo ("faturaflow-br") transforma o FaturaFlow num emissor de
-- NFS-e (Nota Fiscal de Serviços Eletrônica) focado no nicho MEI/Simples
-- Nacional. As colunas são aditivas — não quebram o fluxo original.
-- ============================================================================

-- 1. Tomador: CPF ou CNPJ (substitui o NIF português)
alter table public.clientes add column if not exists cpf_cnpj text;

-- 2. Linhas de serviço: código NBS (serviço), alíquota de ISS e flag Simples
alter table public.fatura_linhas add column if not exists nbs text;
alter table public.fatura_linhas add column if not exists iss numeric(5,2) not null default 0;
alter table public.fatura_linhas add column if not exists simples_nacional boolean not null default true;

-- 3. A fatura passa a ser a NFS-e:
--    - competência (mês do serviço prestado)
--    - máquina de estados da nota (nao_emitida → processando → autorizada/rejeitada → cancelada)
--    - RPS (número/série), número da NFS-e, código de verificação, protocolo SEFAZ/município
--    - artefactos: XML autorizado + link do PDF
alter table public.faturas add column if not exists competencia date;
alter table public.faturas add column if not exists status_nota text not null default 'nao_emitida';
alter table public.faturas add column if not exists rps_numero bigint;
alter table public.faturas add column if not exists rps_serie text;
alter table public.faturas add column if not exists numero_nfse text;
alter table public.faturas add column if not exists codigo_verificacao text;
alter table public.faturas add column if not exists protocolo text;
alter table public.faturas add column if not exists link_pdf text;
alter table public.faturas add column if not exists xml_nota text;
alter table public.faturas add column if not exists motivo_rejeicao text;
alter table public.faturas add column if not exists data_autorizacao timestamptz;

-- 4. Empresa emissora (Definições) — dados fiscais brasileiros
alter table public.perfil add column if not exists cnpj text;
alter table public.perfil add column if not exists razao_social text;
alter table public.perfil add column if not exists inscricao_municipal text;
alter table public.perfil add column if not exists regime_tributario text not null default 'MEI';
alter table public.perfil add column if not exists municipio text;
alter table public.perfil add column if not exists codigo_municipio text;
alter table public.perfil add column if not exists aliq_iss numeric(5,2) not null default 0;
alter table public.perfil add column if not exists nbs_default text;
