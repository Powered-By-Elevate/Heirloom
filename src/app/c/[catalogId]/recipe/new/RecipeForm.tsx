"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { TagPicker, type TagPickerSelection } from "@/components/TagPicker";
import { createRecipe, type RecipeInput } from "./actions";
import type { Tag } from "@/lib/types";

interface RecipeFormProps {
  catalogId: string;
  occasionTags: Tag[];
  personTags: Tag[];
}

type FormValues = {
  title: string;
  description: string;
  prep_time_minutes: string;
  cook_time_minutes: string;
  servings: string;
  notes: string;
  ingredients: { amount: string; item: string }[];
  instructions: { step: string }[];
};

function toIntOrNull(s: string): number | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  const n = Number.parseInt(trimmed, 10);
  return Number.isFinite(n) ? n : null;
}

export function RecipeForm({
  catalogId,
  occasionTags,
  personTags,
}: RecipeFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [occasions, setOccasions] = useState<TagPickerSelection>({
    selectedExistingIds: [],
    newNames: [],
  });
  const [people, setPeople] = useState<TagPickerSelection>({
    selectedExistingIds: [],
    newNames: [],
  });

  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      prep_time_minutes: "",
      cook_time_minutes: "",
      servings: "",
      notes: "",
      ingredients: [{ amount: "", item: "" }],
      instructions: [{ step: "" }],
    },
  });

  const ingredients = useFieldArray({
    control: form.control,
    name: "ingredients",
  });
  const instructions = useFieldArray({
    control: form.control,
    name: "instructions",
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);

    const cleanedIngredients = values.ingredients
      .map((i) => ({ amount: i.amount.trim(), item: i.item.trim() }))
      .filter((i) => i.item.length > 0);
    const cleanedInstructions = values.instructions
      .map((i) => ({ step: i.step.trim() }))
      .filter((i) => i.step.length > 0);

    const payload: RecipeInput = {
      catalog_id: catalogId,
      title: values.title.trim(),
      description: values.description.trim() || null,
      prep_time_minutes: toIntOrNull(values.prep_time_minutes),
      cook_time_minutes: toIntOrNull(values.cook_time_minutes),
      servings: toIntOrNull(values.servings),
      notes: values.notes.trim() || null,
      ingredients: cleanedIngredients,
      instructions: cleanedInstructions,
      occasion_tags: {
        existing_ids: occasions.selectedExistingIds,
        new_names: occasions.newNames,
      },
      person_tags: {
        existing_ids: people.selectedExistingIds,
        new_names: people.newNames,
      },
    };

    const result = await createRecipe(payload);
    setSubmitting(false);

    if (result && !result.ok) {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card className="bg-card border-border/60">
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title", { required: true })}
              placeholder="e.g. Banana Bread"
              autoFocus
            />
          </div>

          <TagPicker
            label="From"
            helpText="optional"
            existingTags={personTags}
            value={people}
            onChange={setPeople}
          />

          <TagPicker
            label="Occasions"
            helpText="optional"
            existingTags={occasionTags}
            value={occasions}
            onChange={setOccasions}
          />

          <div className="space-y-2">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground font-normal">— optional</span>
            </Label>
            <Textarea
              id="description"
              {...form.register("description")}
              rows={3}
              placeholder="A short note about this recipe."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prep_time_minutes">Prep (min)</Label>
              <Input
                id="prep_time_minutes"
                type="number"
                min={0}
                {...form.register("prep_time_minutes")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cook_time_minutes">Cook (min)</Label>
              <Input
                id="cook_time_minutes"
                type="number"
                min={0}
                {...form.register("cook_time_minutes")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min={1}
                {...form.register("servings")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/60">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl text-foreground">Ingredients</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => ingredients.append({ amount: "", item: "" })}
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {ingredients.fields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  {...form.register(`ingredients.${idx}.amount`)}
                  placeholder="2 cups"
                  className="w-32"
                />
                <Input
                  {...form.register(`ingredients.${idx}.item`)}
                  placeholder="all-purpose flour"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => ingredients.remove(idx)}
                  disabled={ingredients.fields.length === 1}
                  aria-label="Remove ingredient"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/60">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl text-foreground">Steps</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => instructions.append({ step: "" })}
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {instructions.fields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-start">
                <span className="font-serif text-lg text-muted-foreground w-6 pt-2 text-right">
                  {idx + 1}.
                </span>
                <Textarea
                  {...form.register(`instructions.${idx}.step`)}
                  placeholder="Cream the butter and sugar until pale and fluffy."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => instructions.remove(idx)}
                  disabled={instructions.fields.length === 1}
                  aria-label="Remove step"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/60">
        <CardContent className="pt-6 space-y-2">
          <Label htmlFor="notes">
            Notes{" "}
            <span className="text-muted-foreground font-normal">— optional</span>
          </Label>
          <Textarea
            id="notes"
            {...form.register("notes")}
            rows={3}
            placeholder="The trick is to use overripe bananas — the kind you'd otherwise throw out."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Saving…" : "Save recipe"}
        </Button>
      </div>
    </form>
  );
}
