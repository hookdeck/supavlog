create table
  public.videos (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    created_at timestamp without time zone null default now(),
    title text not null,
    description text null,
    url text not null,
    profile_user_id uuid not null,
    constraint videos_pkey primary key (id),
    constraint videos_profile_user_id_fkey foreign key (profile_user_id) references profiles (user_id),
    constraint videos_user_id_fkey foreign key (user_id) references auth.users (id)
  ) tablespace pg_default;

CREATE POLICY "Enable read access for all users" ON "public"."videos"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for users based on user_id" ON "public"."videos"
AS PERMISSIVE FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)

CREATE POLICY "Enable delete for users based on user_id" ON "public"."videos"
AS PERMISSIVE FOR DELETE
TO public
USING (auth.uid() = user_id)


create table
  public.profiles (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    username text not null,
    user_id uuid not null,
    constraint profiles_pkey primary key (id),
    constraint profiles_username_key unique (username),
    constraint profiles_user_id_fkey foreign key (user_id) references auth.users (id)
  ) tablespace pg_default;

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = user_id );
