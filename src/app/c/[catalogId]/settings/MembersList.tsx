"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { X } from "lucide-react";
import { removeMember, updateMemberRole } from "./actions";
import type { CatalogRole } from "@/lib/types";

export interface MemberRow {
  id: string;
  user_id: string;
  email: string;
  role: CatalogRole;
  joined_at: string;
  is_self: boolean;
}

interface MembersListProps {
  catalogId: string;
  members: MemberRow[];
}

const ROLE_LABEL: Record<CatalogRole, string> = {
  owner: "Owner",
  contributor: "Contributor",
  viewer: "Viewer",
};

export function MembersList({ catalogId, members }: MembersListProps) {
  const router = useRouter();
  const [working, setWorking] = useState<string | null>(null);

  async function onRemove(member: MemberRow) {
    if (
      !confirm(
        `Remove ${member.email} from this cookbook? They'll lose access.`,
      )
    ) {
      return;
    }
    setWorking(member.id);
    const result = await removeMember({
      catalog_id: catalogId,
      member_id: member.id,
    });
    setWorking(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${member.email} removed`);
    router.refresh();
  }

  async function onRoleChange(member: MemberRow, role: CatalogRole) {
    if (role === member.role) return;
    if (role === "owner") {
      toast.error("Use ownership transfer (coming soon) for that.");
      return;
    }
    setWorking(member.id);
    const result = await updateMemberRole({
      catalog_id: catalogId,
      member_id: member.id,
      role,
    });
    setWorking(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${member.email} is now a ${ROLE_LABEL[role].toLowerCase()}`);
    router.refresh();
  }

  return (
    <Card className="bg-card border-border/60">
      <CardContent className="pt-6">
        <h2 className="font-serif text-2xl text-foreground">Members</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {members.length === 1
            ? "Just you for now."
            : `${members.length} people in this cookbook.`}
        </p>

        <ul className="mt-5 divide-y divide-border/60">
          {members.map((m) => (
            <li
              key={m.id}
              className="py-3 flex items-center gap-3 flex-wrap"
            >
              <div className="flex-1 min-w-0">
                <p className="text-foreground truncate">
                  {m.email}
                  {m.is_self ? (
                    <span className="text-muted-foreground"> (you)</span>
                  ) : null}
                </p>
              </div>

              {m.role === "owner" ? (
                <Badge>Owner</Badge>
              ) : (
                <Select
                  value={m.role}
                  onValueChange={(v) =>
                    onRoleChange(m, v as CatalogRole)
                  }
                  disabled={working === m.id}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {m.role !== "owner" ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(m)}
                  disabled={working === m.id}
                  aria-label={`Remove ${m.email}`}
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
