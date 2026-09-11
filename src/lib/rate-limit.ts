import "server-only";

// In-memory sliding-window limiter, keyed by caller-supplied id (e.g. IP).
// Fine for a single Node process; if the site ever runs multiple instances
// behind a load balancer, swap the Map for a shared store (Redis, etc).
const hits = new Map<string, number[]>();

export function rateLimit(key: string, { max, windowMs }: { max: number; windowMs: number }): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
