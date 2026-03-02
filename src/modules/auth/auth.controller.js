import { registerService, verifyOTPService } from './auth.services.js'

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