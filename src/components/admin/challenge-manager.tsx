"use client";

import { Archive, EyeOff, Plus, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { challengeTypes, difficulties, type GeneratedChallenge } from "@/lib/game/types";
import { slugify } from "@/lib/utils";

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
};

export function ChallengeManager({
  challenges,
  categories
}: {
  challenges: GeneratedChallenge[];
  categories: AdminCategory[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [difficulty, setDifficulty] = useState("EASY");
  const [type, setType] = useState("CODING");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tags, setTags] = useState("admin,custom");
  const [saving, setSaving] = useState(false);
  const dbReady = categories.some((category) => category.id);

  const visibleChallenges = useMemo(() => challenges.slice(0, 18), [challenges]);

  function updateTitle(nextTitle: string) {
    setTitle(nextTitle);
    if (!slug) setSlug(slugify(nextTitle));
  }

  async function createChallenge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        categoryId,
        difficulty,
        type,
        description,
        story,
        instructions,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        xpReward: difficulty === "EASY" ? 100 : difficulty === "MEDIUM" ? 180 : difficulty === "HARD" ? 320 : 520,
        coinReward: 25,
        estimatedTime: difficulty === "EASY" ? 15 : 35,
        hints: ["Start with the invariant.", "Handle the smallest case.", "Check hidden edge cases."],
        explanation: "Admin-created mission with explicit validation metadata ready for judge extension."
      })
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setSaving(false);

    if (!response.ok) {
      toast.error(data?.error ?? "Could not create challenge.");
      return;
    }

    toast.success("Challenge created.");
    setTitle("");
    setSlug("");
    setDescription("");
    setStory("");
    setInstructions("");
    router.refresh();
  }

  async function updateChallenge(challenge: GeneratedChallenge, action: "feature" | "hide" | "archive") {
    if (action === "archive" && !window.confirm(`Archive "${challenge.title}"? This removes it from the published catalog.`)) {
      return;
    }

    const response =
      action === "archive"
        ? await fetch(`/api/challenges/${challenge.slug}`, { method: "DELETE" })
        : await fetch(`/api/challenges/${challenge.slug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action === "feature" ? { featured: !challenge.featured } : { status: "HIDDEN" })
          });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      toast.error(data?.error ?? "Challenge update failed.");
      return;
    }
    toast.success(action === "archive" ? "Challenge archived." : "Challenge updated.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-arena-glow" />
            Create Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!dbReady ? (
            <div className="rounded-md border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50">
              Start Postgres and run the seed before creating persistent admin content.
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={createChallenge}>
              <Input value={title} onChange={(event) => updateTitle(event.target.value)} placeholder="Challenge title" required />
              <Input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} placeholder="url-safe-slug" required />
              <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} aria-label="Category">
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} aria-label="Difficulty">
                  {difficulties.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
                <Select value={type} onChange={(event) => setType(event.target.value)} aria-label="Type">
                  {challengeTypes.map((item) => (
                    <option key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </option>
                  ))}
                </Select>
              </div>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short useful description" required />
              <Textarea value={story} onChange={(event) => setStory(event.target.value)} placeholder="Scenario/story" required />
              <Textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Precise instructions" required />
              <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="comma,separated,tags" />
              <Button disabled={saving} type="submit">
                {saving ? "Creating..." : "Create Challenge"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Published Challenge Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {visibleChallenges.map((challenge) => (
            <div key={challenge.slug} className="grid gap-3 rounded-md border border-white/10 bg-white/6 p-4 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white">{challenge.title}</span>
                  <Badge variant="cyan">{challenge.categorySlug}</Badge>
                  <Badge variant="gold">{challenge.difficulty}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">{challenge.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => updateChallenge(challenge, "feature")}>
                  <Star className="h-4 w-4" />
                  {challenge.featured ? "Unfeature" : "Feature"}
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => updateChallenge(challenge, "hide")}>
                  <EyeOff className="h-4 w-4" />
                  Hide
                </Button>
                <Button type="button" size="sm" variant="danger" onClick={() => updateChallenge(challenge, "archive")}>
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
