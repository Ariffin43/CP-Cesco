import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
const ALG = 'HS256';

export async function signSession(payload, { expiresIn = '2h' } = {}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifySession(token) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
