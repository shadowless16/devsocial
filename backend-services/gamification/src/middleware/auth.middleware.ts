import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
  user?: {
    id: string
    username: string
    role: string
  }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      id: string
      username: string
      role: string
    }
    
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' })
  }
}
