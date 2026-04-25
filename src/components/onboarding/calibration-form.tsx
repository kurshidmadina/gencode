"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BrainCircuit, Check, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const categoryOptions = ["linux", "sql", "algorithms", "data-structures", "python", "javascript", "typescript", "git", "apis", "debugging", "security", "devops"];
const weaknessOptions = ["shell confidence", "joins", "graphs", "dynamic programming", "async code", "debugging", "system design", "security", "deployments"];
const goalPresets = [
  "Get interview-ready without random grinding",
  "Become confident in Linux and production debugging",
  "Level up SQL for analytics and backend work",
  "Build a broad full-stack technical foundation"
];

export function CalibrationForm() {
  const router = useRouter();
  const [targetGoal, setTargetGoal] = useState(goalPresets[0]);
  const [preferredCategories, setPreferredCategories] = useState<string[]>(["linux", "sql"]);
  const [weakestTopics, setWeakestTopics] = useState<string[]>(["graphs"]);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    const payload = {
      experienceLevel: String(formData.get("experienceLevel") ?? "intermediate"),
      targetGoal: String(formData.get("targetGoal") ?? "Become stronger technically"),
      preferredCategories,
      weakestTopics,
      preparingFor: String(formData.get("preparingFor") ?? "job"),
      minutesPerDay: Number(formData.get("minutesPerDay") ?? 30),
      preferredLanguage: String(formData.get("preferredLanguage") ?? "typescript")
    };

    const response = await fetch("/api/onboarding/calibration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json().catch(() => null)) as { recommendedPathSlug?: string; error?: string } | null;
    setLoading(false);

    if (!response.ok || !data?.recommendedPathSlug) {
      toast.error(data?.error ?? "Calibration failed.");
      return;
    }

    toast.success("Calibration locked. Your path is ready.");
    router.push(`/onboarding/path?path=${data.recommendedPathSlug}`);
  }

  function toggle(list: string[], value: string, setter: (value: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  return (
    <form action={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="holo-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BrainCircuit className="h-6 w-6 text-cyan-100" />
            Calibrate Your Training Build
          </CardTitle>
          <p className="text-sm leading-6 text-slate-400">
            Gencode uses this to recommend a path, tune dashboard missions, and give Genie better context.
          </p>
        </CardHeader>
        <CardContent className="grid gap-5">
          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Experience level
            <Select name="experienceLevel" defaultValue="intermediate">
              <option value="new">New to coding</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Target goal
            <Input name="targetGoal" value={targetGoal} onChange={(event) => setTargetGoal(event.target.value)} />
          </label>
          <div className="grid gap-2">
            <div className="text-sm font-bold text-slate-200">Quick goals</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {goalPresets.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setTargetGoal(goal)}
                  className={`rounded-md border p-3 text-left text-sm font-semibold leading-6 transition ${
                    targetGoal === goal
                      ? "border-lime-200 bg-lime-300/15 text-lime-50"
                      : "border-white/10 bg-white/6 text-slate-300 hover:border-lime-300/35"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <div className="text-sm font-bold text-slate-200">Preferred arenas</div>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggle(preferredCategories, category, setPreferredCategories)}
                  className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                    preferredCategories.includes(category)
                      ? "border-cyan-200 bg-cyan-300/20 text-cyan-50"
                      : "border-white/10 bg-white/6 text-slate-300 hover:border-cyan-300/40"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <div className="text-sm font-bold text-slate-200">Weakest topics</div>
            <div className="flex flex-wrap gap-2">
              {weaknessOptions.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggle(weakestTopics, topic, setWeakestTopics)}
                  className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                    weakestTopics.includes(topic)
                      ? "border-pink-200 bg-pink-300/20 text-pink-50"
                      : "border-white/10 bg-white/6 text-slate-300 hover:border-pink-300/40"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Preparing for
              <Select name="preparingFor" defaultValue="interview">
                <option value="interview">Interviews</option>
                <option value="job">Current job</option>
                <option value="career-switch">Career switch</option>
                <option value="school">School</option>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Minutes/day
              <Input name="minutesPerDay" type="number" min={10} max={180} defaultValue={30} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Main language
              <Select name="preferredLanguage" defaultValue="typescript">
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="javascript">JavaScript</option>
                <option value="sql">SQL</option>
              </Select>
            </label>
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-fit">
            <Check className="h-4 w-4" />
            {loading ? "Forging path..." : "Forge My Path"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-yellow-200" />
              What changes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-6 text-slate-300">
            <p>Your dashboard recommendations prioritize your path before generic missions.</p>
            <p>Genie gets better context for hints, debugging guidance, and interview drills.</p>
            <p>Daily quests remain broad, but weekly goals push your chosen arena harder.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-200" />
              Training rhythm
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-slate-300">
            A good Gencode session is 20-45 minutes: one warmup, one serious challenge, one Genie review, and one next-action note.
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
