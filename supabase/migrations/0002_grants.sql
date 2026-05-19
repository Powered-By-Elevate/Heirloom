-- Fix for "permission denied for table ..." errors.
-- RLS policies act ON TOP OF table-level GRANTs. Without these grants the
-- authenticated role can't see the tables at all, so RLS never runs.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.catalogs            to authenticated;
grant select, insert, update, delete on public.catalog_members     to authenticated;
grant select, insert, update, delete on public.recipes             to authenticated;
grant select, insert, update, delete on public.recipe_ingredients  to authenticated;
grant select, insert, update, delete on public.recipe_instructions to authenticated;
grant select, insert, update, delete on public.tags                to authenticated;
grant select, insert, update, delete on public.recipe_tags         to authenticated;

-- Helper functions need to be callable by authenticated users.
grant execute on function public.is_catalog_member(uuid) to authenticated;
grant execute on function public.catalog_role(uuid)      to authenticated;
