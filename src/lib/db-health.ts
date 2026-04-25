import net from "node:net";

let cached: { reachable: boolean; checkedAt: number } | null = null;

export async function canReachDatabase() {
  if (!process.env.DATABASE_URL) return false;
  const now = Date.now();
  if (cached && now - cached.checkedAt < 30_000) return cached.reachable;

  let url: URL;
  try {
    url = new URL(process.env.DATABASE_URL);
  } catch {
    cached = { reachable: false, checkedAt: now };
    return false;
  }

  const reachable = await new Promise<boolean>((resolve) => {
    const socket = net.createConnection({
      host: url.hostname,
      port: Number(url.port || 5432),
      timeout: 180
    });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
  });

  cached = { reachable, checkedAt: now };
  return reachable;
}
