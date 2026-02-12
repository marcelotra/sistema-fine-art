-- Create the 'products' table
-- Note: We use standard snake_case for columns. The frontend will map this logic.

create table public.products (
  id text primary key,
  name text not null,
  category text not null, -- 'PHOTO', 'FINE_ART', 'CANVAS'
  price_per_m2 numeric not null,
  cost_price numeric,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;

-- Create a policy that allows EVERYONE to read and write
-- WARNING: This is for development/MVP purposes. 
-- In a real app, you should restrict writes to authenticated users.
create policy "Allow Public Read/Write" on public.products
  for all using (true) with check (true);
