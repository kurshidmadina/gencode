import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { getChallengeBySlug } from "@/lib/game/challenge-data";

describe("challenge card", () => {
  it("renders challenge metadata", () => {
    const challenge = getChallengeBySlug("linux-easy-permissions-audit");
    expect(challenge).toBeTruthy();
    render(<ChallengeCard challenge={challenge!} />);
    expect(screen.getByRole("heading", { name: /deployment directory/i })).toBeInTheDocument();
    expect(screen.getByText(`${challenge!.xpReward} XP`)).toBeInTheDocument();
    expect(screen.getByText(/NOT STARTED/i)).toBeInTheDocument();
  });
});
