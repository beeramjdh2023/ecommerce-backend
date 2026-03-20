import {
  createCouponService, validateCouponService,
  getAllCouponsService, deactivateCouponService
} from './coupon.service.js'

export const createCouponController = async (req, res) => {
  try {
    const coupon = await createCouponService(req.body)
    res.status(201).json({ message: 'Coupon created', coupon })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const validateCouponController = async (req, res) => {
  try {
    const { code, order_amount } = req.body
    if (!code || !order_amount) {
      return res.status(400).json({ message: 'code and order_amount are required' })
    }
    const result = await validateCouponService(code, req.user.id, order_amount)
    res.status(200).json({ message: 'Coupon applied successfully', ...result })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getAllCouponsController = async (req, res) => {
  try {
    const coupons = await getAllCouponsService()
    res.status(200).json({ coupons })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deactivateCouponController = async (req, res) => {
  try {
    const result = await deactivateCouponService(req.params.id)
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}