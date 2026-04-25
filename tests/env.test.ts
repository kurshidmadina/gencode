import { describe, expect, it } from "vitest";
import { validateServerEnv } from "@/lib/env";

describe("server environment validation", () => {
  it("rejects weak production secrets", () => {
    expect(() =>
      validateServerEnv({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://gencode:gencode@localhost:55432/gencode",
        NEXTAUTH_SECRET: "development-secret",
        ASSISTANT_PROVIDER: "mock"
      } as NodeJS.ProcessEnv)
    ).toThrow(/NEXTAUTH_SECRET/);
  });

  it("requires OpenAI-compatible keys only when selected", () => {
    expect(() =>
      validateServerEnv({
        NODE_ENV: "development",
        ASSISTANT_PROVIDER: "openai-compatible",
        NEXTAUTH_SECRET: "strong-enough-for-local-development-123"
      } as NodeJS.ProcessEnv)
    ).toThrow(/OPENAI_COMPATIBLE_API_KEY/);

    expect(
      validateServerEnv({
        NODE_ENV: "development",
        ASSISTANT_PROVIDER: "mock",
        NEXTAUTH_SECRET: "strong-enough-for-local-development-123"
      } as NodeJS.ProcessEnv).ASSISTANT_PROVIDER
    ).toBe("mock");
  });
});

