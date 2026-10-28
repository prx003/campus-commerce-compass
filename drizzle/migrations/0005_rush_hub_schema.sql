do $$ begin
  create type public.app_role as enum ('admin','principal','hr','academic','admissions','sales','marketing','governance','staff');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

do $$ begin
  create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "admin insert roles" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "admin delete roles" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(),'admin'));
exception when duplicate_object then null; end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email);
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'staff');
  end if;
  return new;
end; $$;

do $$ begin
  create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
exception when duplicate_object then null; end $$;

create table if not exists public.app_state (
  key text primary key,
  value jsonb not null,
  updated_by uuid,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.app_state to authenticated;
grant all on public.app_state to service_role;
grant select, insert, update on public.app_state to anon;
alter table public.app_state enable row level security;
do $$ begin
  create policy "signed in read state" on public.app_state for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "signed in insert state" on public.app_state for insert to authenticated with check (auth.uid() is not null);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "signed in update state" on public.app_state for update to authenticated using (auth.uid() is not null);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read state" on public.app_state for select to anon using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public insert state" on public.app_state for insert to anon with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public update state" on public.app_state for update to anon using (true);
exception when duplicate_object then null; end $$;