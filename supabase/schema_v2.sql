-- Tabela de Configurações da Empresa (Apenas uma linha permitida idealmente, mas vamos simplificar)
create table public.company_settings (
  id uuid default gen_random_uuid() primary key,
  name text not null default 'Minha Empresa',
  cnpj text,
  address text,
  phone text,
  email text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Orçamentos
create table public.quotes (
  id uuid default gen_random_uuid() primary key,
  sequence_id serial, -- Número sequencial automático (1, 2, 3...)
  customer_name text,
  customer_contact text,
  total_amount numeric not null,
  status text default 'DRAFT', -- 'DRAFT', 'COMPLETED', 'CANCELED'
  items jsonb, -- Salva os itens do carrinho como JSON
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.company_settings enable row level security;
alter table public.quotes enable row level security;

-- Políticas de Acesso Público (MVP)
create policy "Public Access Company" on public.company_settings for all using (true) with check (true);
create policy "Public Access Quotes" on public.quotes for all using (true) with check (true);

-- Inserir configuração inicial se não existir
insert into public.company_settings (name)
select 'Minha Molduraria'
where not exists (select 1 from public.company_settings);
