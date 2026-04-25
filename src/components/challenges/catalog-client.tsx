"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ChallengeAccessState } from "@/lib/game/access";
import { categories, challengeTypes, difficulties, type GeneratedChallenge } from "@/lib/game/types";
import { filterChallenges } from "@/lib/game/filtering";

const pageSize = 60;

export function CatalogClient({
  challenges,
  accessBySlug = {}
}: {
  challenges: GeneratedChallenge[];
  accessBySlug?: Record<string, ChallengeAccessState>;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [type, setType] = useState("all");
  const [tag, setTag] = useState("all");
  const [maxXp, setMaxXp] = useState("all");
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const filtered = useMemo(
    () => filterChallenges(challenges, { query, category, difficulty, type, tag, maxXp: maxXp === "all" ? undefined : maxXp }),
    [category, challenges, difficulty, maxXp, query, tag, type]
  );

  const tags = useMemo(
    () =>
      Array.from(new Set(challenges.flatMap((challenge) => challenge.tags)))
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 120),
    [challenges]
  );

  const visibleChallenges = filtered.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [category, difficulty, maxXp, query, tag, type]);

  const easyCount = useMemo(
    () => filtered.filter((challenge) => challenge.difficulty === "EASY").length,
    [filtered]
  );

  return (
    <div className="grid gap-6">
      <div className="holo-panel grid gap-3 rounded-lg p-4 md:grid-cols-[minmax(220px,1fr)_180px_150px_180px_180px_140px]">
        <label className="relative">
          <span className="sr-only">Search challenges</span>
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
            placeholder="Search Linux, SQL, DP, regex..."
          />
        </label>
        <Select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} aria-label="Difficulty">
          <option value="all">All difficulties</option>
          {difficulties.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={type} onChange={(event) => setType(event.target.value)} aria-label="Challenge type">
          <option value="all">All types</option>
          {challengeTypes.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </Select>
        <Select value={tag} onChange={(event) => setTag(event.target.value)} aria-label="Tag">
          <option value="all">All tags</option>
          {tags.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={maxXp} onChange={(event) => setMaxXp(event.target.value)} aria-label="XP reward">
          <option value="all">Any XP</option>
          <option value="100">100 XP or less</option>
          <option value="180">180 XP or less</option>
          <option value="260">260 XP or less</option>
          <option value="380">380 XP or less</option>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/62 px-4 py-3 text-sm text-slate-300">
        <span>
          Showing {visibleChallenges.length} of {filtered.length} matches across {challenges.length} missions.
        </span>
        <span>{easyCount} warmup gates in view. Harder tiers stay previewable while progression catches up.</span>
      </div>

      {filtered.length === 0 ? (
        <div className="holo-panel rounded-lg p-10 text-center text-slate-300">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
            <Search className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-white">No mission matches that loadout.</h2>
          <p className="mt-2 text-sm text-slate-400">Clear one filter or search by a concrete skill like awk, joins, graph, regex, or debugging.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.slug}
                challenge={challenge}
                locked={accessBySlug[challenge.slug]?.locked ?? false}
                lockReason={accessBySlug[challenge.slug]?.reason}
                upgradeHref={accessBySlug[challenge.slug]?.upgradeHref}
              />
            ))}
          </div>
          {visibleChallenges.length < filtered.length ? (
            <div className="flex justify-center">
              <Button type="button" variant="secondary" onClick={() => setVisibleCount((current) => current + pageSize)}>
                Load more missions
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
