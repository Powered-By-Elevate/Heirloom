"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  TagPicker,
  type TagPickerSelection,
} from "@/components/TagPicker";
import { updateRecipeTags } from "./actions";
import type { Tag } from "@/lib/types";

interface RecipeTagsEditorProps {
  recipeId: string;
  catalogId: string;
  canEdit: boolean;
  currentOccasions: Tag[];
  currentPeople: Tag[];
  allOccasionTags: Tag[];
  allPersonTags: Tag[];
}

export function RecipeTagsEditor({
  recipeId,
  catalogId,
  canEdit,
  currentOccasions,
  currentPeople,
  allOccasionTags,
  allPersonTags,
}: RecipeTagsEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [occasions, setOccasions] = useState<TagPickerSelection>({
    selectedExistingIds: currentOccasions.map((t) => t.id),
    newNames: [],
  });
  const [people, setPeople] = useState<TagPickerSelection>({
    selectedExistingIds: currentPeople.map((t) => t.id),
    newNames: [],
  });

  function onCancel() {
    setOccasions({
      selectedExistingIds: currentOccasions.map((t) => t.id),
      newNames: [],
    });
    setPeople({
      selectedExistingIds: currentPeople.map((t) => t.id),
      newNames: [],
    });
    setEditing(false);
  }

  async function onSave() {
    setSaving(true);
    const result = await updateRecipeTags({
      recipe_id: recipeId,
      catalog_id: catalogId,
      occasion_tags: {
        existing_ids: occasions.selectedExistingIds,
        new_names: occasions.newNames,
      },
      person_tags: {
        existing_ids: people.selectedExistingIds,
        new_names: people.newNames,
      },
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Tags updated");
    setEditing(false);
    router.refresh();
  }

  const hasAnyTags =
    currentOccasions.length > 0 || currentPeople.length > 0;

  if (!editing) {
    if (!hasAnyTags && !canEdit) return null;
    return (
      <div className="flex flex-wrap items-center gap-2 mt-6">
        {currentOccasions.map((t) => (
          <Badge key={t.id} variant="secondary">
            {t.name}
          </Badge>
        ))}
        {currentOccasions.length === 0 && currentPeople.length === 0 ? (
          <span className="text-sm text-muted-foreground">No tags yet.</span>
        ) : null}
        {canEdit ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="ml-1"
          >
            <Pencil className="size-3.5" />
            {hasAnyTags ? "Edit tags" : "Add tags"}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <Card className="mt-6 bg-card border-border/60">
      <CardContent className="pt-6 space-y-5">
        <TagPicker
          label="From"
          helpText="optional"
          existingTags={allPersonTags}
          value={people}
          onChange={setPeople}
        />
        <TagPicker
          label="Occasions"
          helpText="optional"
          existingTags={allOccasionTags}
          value={occasions}
          onChange={setOccasions}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save tags"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
