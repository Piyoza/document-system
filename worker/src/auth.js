import { jwtVerify } from "jose";

export async function verifyToken(request, env) {

  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");

  try {

    const secret = new TextEncoder()
      .encode(env.JWT_SECRET);

    const { payload } = await jwtVerify(
      token,
      secret
    );

    return payload;

  } catch (error) {

    return null;

  }
}