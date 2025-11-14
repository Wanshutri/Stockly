import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id_usuario,
    email: user.email,
    role: user.id_tipo,
    token: process.env.NEXTAUTH_SECRET
  });
}
