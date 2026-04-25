import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { AppFrame } from "@/components/layout/app-frame";
import { ChallengeWorkspace } from "@/components/challenges/challenge-workspace";
import { authOptions } from "@/lib/auth";
import { getUserChallengeAccess } from "@/lib/game/access";
import { findChallenge } from "@/lib/repositories/challenges";
import { challengeCatalog } from "@/lib/game/challenge-data";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ mode?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const challenge = await findChallenge(slug);
  return {
    title: challenge ? challenge.title : "Challenge"
  };
}

export default async function ChallengePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  if (query?.mode === "immersive" || query?.mode === "vr") redirect(`/vr/${slug}`);
  const session = await getServerSession(authOptions).catch(() => null);
  const challenge = await findChallenge(slug);
  if (!challenge) notFound();
  const access = await getUserChallengeAccess(session?.user?.id, challenge);
  const sameCategory = challengeCatalog.filter((item) => item.categorySlug === challenge.categorySlug);
  const index = challengeCatalog.findIndex((item) => item.slug === challenge.slug);
  const relatedBySlug = new Map(challengeCatalog.map((item) => [item.slug, item]));
  const relatedSlugs = challenge.relatedChallenges ?? [];
  const related =
    relatedSlugs.length > 0
      ? relatedSlugs.map((relatedSlug) => relatedBySlug.get(relatedSlug)).filter((item): item is NonNullable<typeof item> => Boolean(item)).slice(0, 5)
      : sameCategory.filter((item) => item.slug !== challenge.slug).slice(0, 4);

  return (
    <AppFrame>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ChallengeWorkspace
          challenge={challenge}
          previousSlug={index > 0 ? challengeCatalog[index - 1]?.slug : undefined}
          nextSlug={index >= 0 ? challengeCatalog[index + 1]?.slug : undefined}
          related={related}
          locked={access.locked}
          lockReason={access.reason}
          missingPrerequisites={access.missingPrerequisites}
        />
      </main>
    </AppFrame>
  );
}
