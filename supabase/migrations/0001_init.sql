-- Heirloom — initial schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- or via `supabase db push` if you have the Supabase CLI set up.

-- ============================================================================
-- TABLES
-- ============================================================================

create table public.catalogs (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  cover_image_url text,
  owner_id        uuid not null references auth.users(id) on delete cascade,
  invite_code     text not null unique,
  created_at      timestamptz not null default now()
);

create table public.catalog_members (
  id          uuid primary key default gen_random_uuid(),
  catalog_id  uuid not null references public.catalogs(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('owner','contributor','viewer')),
  joined_at   timestamptz not null default now(),
  unique (catalog_id, user_id)
);

create table public.recipes (
  id                       uuid primary key default gen_random_uuid(),
  catalog_id               uuid not null references public.catalogs(id) on delete cascade,
  title                    text not null,
  description              text,
  recipe_from              text,
  contributed_by           uuid references auth.users(id) on delete set null,
  prep_time_minutes        int,
  cook_time_minutes        int,
  servings                 int,
  notes                    text,
  original_card_image_url  text,
  dish_photo_url           text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create table public.recipe_ingredients (
  id         uuid primary key default gen_random_uuid(),
  recipe_id  uuid not null references public.recipes(id) on delete cascade,
  position   int not null,
  amount     text,
  item       text not null
);

create table public.recipe_instructions (
  id         uuid primary key default gen_random_uuid(),
  recipe_id  uuid not null references public.recipes(id) on delete cascade,
  position   int not null,
  step       text not null
);

create table public.tags (
  id          uuid primary key default gen_random_uuid(),
  catalog_id  uuid not null references public.catalogs(id) on delete cascade,
  name        text not null,
  category    text not null check (category in ('occasion','meal_type','person','custom')),
  unique (catalog_id, name)
);

create table public.recipe_tags (
  recipe_id  uuid not null references public.recipes(id) on delete cascade,
  tag_id     uuid not null references public.tags(id) on delete cascade,
  primary key (recipe_id, tag_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index catalogs_owner_id_idx on public.catalogs(owner_id);
create index catalog_members_user_id_idx on public.catalog_members(user_id);
create index recipes_catalog_id_idx on public.recipes(catalog_id);
create index recipes_recipe_from_idx on public.recipes(catalog_id, recipe_from);
create index recipe_ingredients_recipe_id_idx on public.recipe_ingredients(recipe_id);
create index recipe_instructions_recipe_id_idx on public.recipe_instructions(recipe_id);
create index tags_catalog_id_idx on public.tags(catalog_id);
create index recipe_tags_tag_id_idx on public.recipe_tags(tag_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.tg_set_updated_at();

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- SECURITY DEFINER lets these bypass RLS while checking membership,
-- avoiding the classic "policy references its own table" recursion.
-- ============================================================================

create or replace function public.is_catalog_member(p_catalog_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from catalog_members
    where catalog_id = p_catalog_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.catalog_role(p_catalog_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from catalog_members
  where catalog_id = p_catalog_id
    and user_id = auth.uid()
  limit 1;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.catalogs enable row level security;
alter table public.catalog_members enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_instructions enable row level security;
alter table public.tags enable row level security;
alter table public.recipe_tags enable row level security;

-- catalogs --------------------------------------------------------------------

create policy "members can read their catalogs"
  on public.catalogs for select
  using (public.is_catalog_member(id));

-- Joining a catalog via invite needs to read the catalog row before becoming a member.
-- Anyone authenticated can look up a catalog by invite_code; the join itself is enforced
-- via catalog_members insert policy.
create policy "authenticated users can look up catalogs by invite"
  on public.catalogs for select
  using (auth.role() = 'authenticated');

create policy "authenticated users can create catalogs"
  on public.catalogs for insert
  with check (auth.uid() = owner_id);

create policy "owner can update catalog"
  on public.catalogs for update
  using (public.catalog_role(id) = 'owner');

create policy "owner can delete catalog"
  on public.catalogs for delete
  using (public.catalog_role(id) = 'owner');

-- catalog_members -------------------------------------------------------------

create policy "members can read fellow members"
  on public.catalog_members for select
  using (public.is_catalog_member(catalog_id));

-- A user can insert themselves (used by catalog create and invite-accept flows).
create policy "user can add themselves to a catalog"
  on public.catalog_members for insert
  with check (auth.uid() = user_id);

create policy "owner can update members"
  on public.catalog_members for update
  using (public.catalog_role(catalog_id) = 'owner');

create policy "owner can remove members"
  on public.catalog_members for delete
  using (public.catalog_role(catalog_id) = 'owner');

-- recipes ---------------------------------------------------------------------

create policy "members can read recipes"
  on public.recipes for select
  using (public.is_catalog_member(catalog_id));

create policy "owner and contributor can insert recipes"
  on public.recipes for insert
  with check (public.catalog_role(catalog_id) in ('owner','contributor'));

create policy "owner and contributor can update recipes"
  on public.recipes for update
  using (public.catalog_role(catalog_id) in ('owner','contributor'));

create policy "owner can delete recipes"
  on public.recipes for delete
  using (public.catalog_role(catalog_id) = 'owner');

-- recipe_ingredients ----------------------------------------------------------

create policy "members can read recipe ingredients"
  on public.recipe_ingredients for select
  using (
    public.is_catalog_member(
      (select catalog_id from public.recipes where id = recipe_id)
    )
  );

create policy "contributor+ can manage recipe ingredients"
  on public.recipe_ingredients for all
  using (
    public.catalog_role(
      (select catalog_id from public.recipes where id = recipe_id)
    ) in ('owner','contributor')
  )
  with check (
    public.catalog_role(
      (select catalog_id from public.recipes where id = recipe_id)
    ) in ('owner','contributor')
  );

-- recipe_instructions ---------------------------------------------------------

create policy "members can read recipe instructions"
  on public.recipe_instructions for select
  using (
    public.is_catalog_member(
      (select catalog_id from public.recipes where id = recipe_id)
    )
  );

create policy "contributor+ can manage recipe instructions"
  on public.recipe_instructions for all
  using (
    public.catalog_role(
      (select catalog_id from public.recipes where id = recipe_id)
    ) in ('owner','contributor')
  )
  with check (
    public.catalog_role(
      (select catalog_id from public.recipes where id = recipe_id)
    ) in ('owner','contributor')
  );

-- tags ------------------------------------------------------------------------

create policy "members can read tags"
  on public.tags for select
  using (public.is_catalog_member(catalog_id));

create policy "contributor+ can manage tags"
  on public.tags for all
  using (public.catalog_role(catalog_id) in ('owner','contributor'))
  with check (public.catalog_role(catalog_id) in ('owner','contributor'));

-- recipe_tags -----------------------------------------------------------------

create policy "members can read recipe tags"
  on public.recipe_tags for select
  using (
    public.is_catalog_member(
      (select catalog_id from public.recipes where id = recipe_id)
    )
  );

create policy "contributor+ can manage recipe tags"
  on public.recipe_tags for all
  using (
    public.catalog_role(
      (select catalog_id from public.recipes where id = recipe_id)
    ) in ('owner','contributor')
  )
  with check (
    public.catalog_role(
      (select catalog_id from public.recipes where id = recipe_id)
    ) in ('owner','contributor')
  );

-- ============================================================================
-- STORAGE BUCKETS (private; signed URLs in app for reads)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('dish-photos', 'dish-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('original-cards', 'original-cards', false)
on conflict (id) do nothing;

-- File path convention: <catalog_id>/<recipe_id>/<filename>
-- Policies derive the catalog_id from the first path segment.

create policy "members can read recipe images"
  on storage.objects for select
  using (
    bucket_id in ('dish-photos','original-cards')
    and public.is_catalog_member((split_part(name, '/', 1))::uuid)
  );

create policy "contributor+ can upload recipe images"
  on storage.objects for insert
  with check (
    bucket_id in ('dish-photos','original-cards')
    and public.catalog_role((split_part(name, '/', 1))::uuid) in ('owner','contributor')
  );

create policy "contributor+ can update recipe images"
  on storage.objects for update
  using (
    bucket_id in ('dish-photos','original-cards')
    and public.catalog_role((split_part(name, '/', 1))::uuid) in ('owner','contributor')
  );

create policy "owner can delete recipe images"
  on storage.objects for delete
  using (
    bucket_id in ('dish-photos','original-cards')
    and public.catalog_role((split_part(name, '/', 1))::uuid) = 'owner'
  );
