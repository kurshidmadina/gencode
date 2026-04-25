import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";
import { seedDemoShowcase } from "./demo-showcase";

nextEnv.loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

seedDemoShowcase(prisma)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
