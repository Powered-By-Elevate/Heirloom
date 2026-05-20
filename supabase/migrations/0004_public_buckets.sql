-- Make recipe-image buckets public.
-- Paths use UUIDs (<catalog_id>/<recipe_id>/<filename>) which are not
-- enumerable, so the URL itself acts as the capability. RLS on uploads
-- still restricts WHO can put files there (members of the catalog).

update storage.buckets
set public = true
where id in ('dish-photos', 'original-cards');
