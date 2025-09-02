import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { signSession } from '../../../../lib/auth';

export async function POST(req) {
  const { email, password } = await req.json();

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });

  const token = await signSession({ uid: user.id, email: user.email, role: user.role }, { expiresIn: '2h' });

  const res = NextResponse.json({ message: 'ok' });
  res.cookies.set('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2,
  });
  return res;
}
