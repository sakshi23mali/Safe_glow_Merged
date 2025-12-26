import jwt from "jsonwebtoken";

export function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const err = new Error("JWT_SECRET is required");
      err.statusCode = 500;
      throw err;
    }

    const payload = jwt.verify(token, secret);
    req.auth = { userId: payload.id };

    next();
  } catch (e) {
    const err = e instanceof Error ? e : new Error("Unauthorized");
    if (!err.statusCode) err.statusCode = 401;
    next(err);
  }
}

