-- Supabase Profiles Table and RLS Policies

create table public.profiles (
  id      uuid  primary key references auth.users(id) on delete cascade,
  email   text,
  role    text  not null default 'user'
                check (role in ('admin', 'user'))
);

-- RLS: on by default, deny all
alter table public.profiles enable row level security;

-- Policy 1: every user reads their own row
create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy 2: admins read every row
create policy "admin reads all"
  on public.profiles for select
  using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Policy 3: admins can update any profile
create policy "admin updates all"
  on public.profiles for update
  using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Auto-assign role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when new.email = 'admin@gmail.com' then 'admin' else 'user' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
