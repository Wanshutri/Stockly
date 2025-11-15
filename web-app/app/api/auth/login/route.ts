import { NextResponse } from "next/server";
import { compare } from "bcrypt";
import db from '../../../../lib/pg';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const query = 'SELECT id_usuario, email, password, id_tipo FROM usuario WHERE email = $1';
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    const user = result.rows[0];

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
  } catch (err) {
    console.error('login error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
