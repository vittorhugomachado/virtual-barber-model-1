alter table public.customers
add column if not exists auth_user_id uuid references auth.users(id),
add column if not exists email text;

create unique index if not exists customers_barbershop_auth_user_id_key
on public.customers (barbershop_id, auth_user_id)
where auth_user_id is not null;
