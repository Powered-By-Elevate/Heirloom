export type CatalogRole = "owner" | "contributor" | "viewer";
export type TagCategory = "occasion" | "meal_type" | "person" | "custom";

export interface Catalog {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  owner_id: string;
  invite_code: string;
  created_at: string;
}

export interface CatalogMember {
  id: string;
  catalog_id: string;
  user_id: string;
  role: CatalogRole;
  joined_at: string;
}

export interface Recipe {
  id: string;
  catalog_id: string;
  title: string;
  description: string | null;
  contributed_by: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  notes: string | null;
  original_card_image_url: string | null;
  dish_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TagSelection {
  existingId?: string;
  newName?: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  position: number;
  amount: string | null;
  item: string;
}

export interface RecipeInstruction {
  id: string;
  recipe_id: string;
  position: number;
  step: string;
}

export interface Tag {
  id: string;
  catalog_id: string;
  name: string;
  category: TagCategory;
}

export const DEFAULT_OCCASION_TAGS = [
  "Christmas",
  "Thanksgiving",
  "Easter",
  "Sunday Dinner",
  "Birthday",
  "Fourth of July",
  "Halloween",
  "New Year's",
] as const;
