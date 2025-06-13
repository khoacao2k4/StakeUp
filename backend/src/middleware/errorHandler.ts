import { Request, Response, NextFunction } from 'express'
import { HttpError } from 'http-errors'

export function errorHandler(err: HttpError, req: Request, res: Response, next: NextFunction) {
    const status = err.status || 500
    const message = err.expose ? err.message : 'Internal Server Error'
    console.log(err.stack)
  
    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
}