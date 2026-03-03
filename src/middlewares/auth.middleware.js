import { verifyAccessToken } from '../config/jwt.js'

export const authenticate = (req, res, next) => {
  try {
    // 1. get token from header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token required' })
    }

    // 2. extract token
    const token = authHeader.split(' ')[1]

    // 3. verify token
    const decoded = verifyAccessToken(token)

    // 4. attach user to request
    req.user = decoded

    next()

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired' })
    }
    return res.status(401).json({ message: 'Invalid access token' })
  }
}


