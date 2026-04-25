"use client";

import { Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/lib/game/types";

export function SettingsForm() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [bio, setBio] = useState("");
  const [genieMode, setGenieMode] = useState("mentor");
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(["linux", "sql", "algorithms"]);
  const [publicProfile, setPublicProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  function toggleCategory(slug: string) {
    setFavoriteCategories((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      return [...current, slug].slice(0, 8);
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/settings/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, genieMode, favoriteCategories, publicProfile })
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setSaving(false);

    if (!response.ok) {
      toast.error(data?.error ?? "Could not save settings.");
      return;
    }

    await update({ name });
    toast.success("Settings saved.");
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm font-semibold text-slate-300">
        Display name
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Display name" required />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-slate-300">
        Bio
        <Textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="What are you training for?" />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-slate-300">
        Default Genie mode
        <Select value={genieMode} onChange={(event) => setGenieMode(event.target.value)}>
          <option value="mentor">Mentor</option>
          <option value="interviewer">Interviewer</option>
          <option value="coach">Coach</option>
          <option value="debugging">Debugging</option>
          <option value="concept">Concept explanation</option>
        </Select>
      </label>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold text-slate-300">Favorite categories</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {categories.slice(0, 12).map((category) => (
            <label
              key={category.slug}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/6 p-3 text-sm text-slate-200"
            >
              <input
                type="checkbox"
                checked={favoriteCategories.includes(category.slug)}
                onChange={() => toggleCategory(category.slug)}
                className="h-4 w-4 accent-cyan-300"
              />
              {category.name}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-3 rounded-md border border-white/10 bg-white/6 p-3 text-sm font-semibold text-slate-200">
        <input
          type="checkbox"
          checked={publicProfile}
          onChange={(event) => setPublicProfile(event.target.checked)}
          className="h-4 w-4 accent-cyan-300"
        />
        Public profile visible
      </label>

      <Button disabled={saving} type="submit">
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
