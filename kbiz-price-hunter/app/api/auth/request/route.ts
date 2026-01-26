import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MINUTES = 30;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.magicLinkToken.create({
    data: {
      email: user.email,
      token,
      expiresAt,
    },
  });

  const origin =
    headers().get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const magicLink = `${origin}/api/auth/verify?token=${token}`;

  return NextResponse.json({
    ok: true,
    message:
      "Magic link generated. In production, this is emailed to the user.",
    magicLink,
  });
}
