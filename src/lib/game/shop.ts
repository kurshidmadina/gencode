export type ShopItemDefinition = {
  slug: string;
  name: string;
  description: string;
  type: "profile-frame" | "avatar-effect" | "terminal-theme" | "dashboard-theme" | "badge-glow" | "title";
  rarity: "common" | "rare" | "epic" | "legendary";
  price: number;
  metadata: Record<string, string | number | boolean>;
};

export const shopItems: ShopItemDefinition[] = [
  {
    slug: "terminal-ghost-theme",
    name: "Terminal Ghost",
    description: "A cool cyan terminal skin for shell and Linux arenas.",
    type: "terminal-theme",
    rarity: "rare",
    price: 180,
    metadata: { accent: "#60f3ff", prompt: "ghost@arena" }
  },
  {
    slug: "sql-knight-title",
    name: "SQL Knight",
    description: "A public title for learners who want their query discipline visible.",
    type: "title",
    rarity: "rare",
    price: 240,
    metadata: { title: "SQL Knight" }
  },
  {
    slug: "kernel-monk-frame",
    name: "Kernel Monk",
    description: "A disciplined profile frame for Linux path climbers.",
    type: "profile-frame",
    rarity: "epic",
    price: 360,
    metadata: { glow: "#8bff9f", motif: "kernel" }
  },
  {
    slug: "algorithm-hunter-glow",
    name: "Algorithm Hunter",
    description: "A gold badge glow for DSA arena clears.",
    type: "badge-glow",
    rarity: "epic",
    price: 420,
    metadata: { glow: "#ffd166" }
  },
  {
    slug: "bug-slayer-avatar",
    name: "Bug Slayer",
    description: "A sharp avatar effect for debugging streaks.",
    type: "avatar-effect",
    rarity: "rare",
    price: 260,
    metadata: { effect: "scanline", accent: "#f43f5e" }
  },
  {
    slug: "gencode-legend-theme",
    name: "Gencode Legend",
    description: "A legendary dashboard skin reserved for serious coin savers.",
    type: "dashboard-theme",
    rarity: "legendary",
    price: 1200,
    metadata: { accent: "#e879f9", particles: true }
  }
];

export function getShopItem(slug: string) {
  return shopItems.find((item) => item.slug === slug) ?? null;
}
