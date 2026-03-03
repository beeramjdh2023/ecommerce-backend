
import { registerService, verifyOTPService, loginService, refreshTokenService, logoutService } from './auth.services.js'



export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // basic validation
    if (!name || !email || !password) {
        console.log(name,email,password);
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const result = await registerService({ name, email, password })
    res.status(200).json(result)

  } catch (err) {
    const statuscode=err.message.includes("already") ? 409:400;
    res.status(statuscode).json({ message: err.message })
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' })
    }

    const result = await verifyOTPService({ email, otp })
    res.status(201).json(result)

  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}




export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const result = await loginService({ email, password })

    // send refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,       // JS cannot access this cookie
      secure: false,        // set true in production (HTTPS only)
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in ms
    })

    res.status(200).json({
      message: 'Login successful',
      accessToken: result.accessToken,
      user: result.user
    })

  } catch (err) {
    res.status(401).json({ message: err.message })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken

    if (!token) {
      return res.status(401).json({ message: 'Refresh token not found' })
    }

    const result = await refreshTokenService(token)
    res.status(200).json(result)

  } catch (err) {
    res.status(401).json({ message: err.message })
  }
}

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken

    if (token) {
      await logoutService(token)
    }

    res.clearCookie('refreshToken')
    res.status(200).json({ message: 'Logged out successfully' })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}