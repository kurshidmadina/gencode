export type LeaderboardMetric = {
  username: string;
  xp: number;
  completed: number;
  streak: number;
  hardCompletions: number;
  extremeCompletions: number;
  insaneCompletions: number;
  noHintCompletions: number;
  speedCompletions: number;
};

export function rankLeaderboardPlayers(players: LeaderboardMetric[]) {
  return [...players]
    .sort((a, b) => {
      return (
        b.xp - a.xp ||
        b.completed - a.completed ||
        b.streak - a.streak ||
        b.insaneCompletions - a.insaneCompletions ||
        b.extremeCompletions - a.extremeCompletions ||
        b.hardCompletions - a.hardCompletions ||
        b.noHintCompletions - a.noHintCompletions ||
        b.speedCompletions - a.speedCompletions ||
        a.username.localeCompare(b.username)
      );
    })
    .map((player, index) => ({ ...player, rank: index + 1 }));
}
