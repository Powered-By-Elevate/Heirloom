-- People are now modeled as tags with category='person'.
-- The free-form recipes.recipe_from text column is removed in favor of tagging.

drop index if exists recipes_recipe_from_idx;
alter table public.recipes drop column if exists recipe_from;
