import { describe, expect, it } from "vitest";
import { isAdmin } from "@/lib/auth";

describe("authorization helpers", () => {
  it("allows only admin role into admin surfaces", () => {
    expect(isAdmin({ user: { role: "ADMIN" } })).toBe(true);
    expect(isAdmin({ user: { role: "USER" } })).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});
