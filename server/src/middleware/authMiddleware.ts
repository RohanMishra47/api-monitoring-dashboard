import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Middleware to authenticate requests using JWT
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // 1. Check for token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Unauthorized. No token provided." });
      return;
    }

    // 2. Check for JWT secret
    const jwtSecret = process.env["JWT_SECRET"];
    if (!jwtSecret) {
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    // 3. Verify token
    const decoded = jwt.verify(token, jwtSecret) as { id: string };

    // 4. Attach user to request
    req.user = { id: decoded.id };

    // 5. Continue to next middleware
    next();
  } catch (error) {
    // Catches JWT verification errors
    res.status(401).json({ error: "Unauthorized. Invalid token" });
  }
}
