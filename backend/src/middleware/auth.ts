import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import createError from 'http-errors'
dotenv.config()

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError(401, 'Missing or invalid Authorization header', { expose: true }));
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return next(createError(401, 'Unauthorized'));
  }
  console.log(token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    res.locals.user = decoded;
    return next();
  } catch (err) {
    return next(err);
  }
}
