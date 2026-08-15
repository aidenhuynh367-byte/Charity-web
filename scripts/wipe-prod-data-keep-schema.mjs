/**
 * Truncate all public tables in production. Does not modify schema.
 * Requires Cloud SQL Auth Proxy on 127.0.0.1:5433.
 */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const raw = execSync(
  "npx -y firebase-tools@latest apphosting:secrets:access charityWebDatabaseUrl --project charity-link-f61ff",
  { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
).trim();

const match = raw.match(/^postgresql:\/\/([^:]+):([^@]+)@/);
if (!match) throw new Error("Could not parse production database URL");
const [, user, pass] = match;
const dbMatch = raw.match(/\/([^/?]+)(?:\?|$)/);
const db = dbMatch ? dbMatch[1] : "charityweb";
const databaseUrl = `postgresql://${user}:${encodeURIComponent(decodeURIComponent(pass))}@127.0.0.1:5433/${db}?schema=public`;

process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient();

try {
  console.log("Truncating all public tables (CASCADE)...");
  await prisma.$executeRawUnsafe(`
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;
`);
  console.log("TRUNCATE_OK");

  const users = await prisma.user.count();
  const accounts = await prisma.account.count();
  const sessions = await prisma.session.count();
  const profiles = await prisma.profile.count();
  const lists = await prisma.donationList.count();
  const items = await prisma.donationListItem.count();
  const images = await prisma.charityImage.count();
  const tokens = await prisma.verificationToken.count();

  console.log(
    `VERIFY users=${users} accounts=${accounts} sessions=${sessions} profiles=${profiles} donationLists=${lists} donationListItems=${items} charityImages=${images} verificationTokens=${tokens}`,
  );
} finally {
  await prisma.$disconnect();
}
