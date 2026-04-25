import { redirect } from "next/navigation";

export default async function ShortPublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  redirect(`/profile/${encodeURIComponent(username)}`);
}
