import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  token: z.string().min(1).max(8192),
  userAgent: z.string().max(1024).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { token, userAgent } = parsed.data;

  await prisma.fcmWebToken.upsert({
    where: { token },
    create: {
      userId,
      token,
      userAgent: userAgent?.trim() || null,
    },
    update: {
      userId,
      userAgent: userAgent?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true });
}
