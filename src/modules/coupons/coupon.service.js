import {
  createCoupon, getCouponByCode, getAllCoupons,
  getCouponUsageByUser, recordCouponUsage, deactivateCoupon
} from './coupon.repository.js'

export const createCouponService = async (data) => {
  const { code, type, value } = data

  if (!code || !type || !value) {
    throw new Error('code, type and value are required')
  }

  if (!['FLAT', 'PERCENTAGE'].includes(type)) {
    throw new Error('Type must be FLAT or PERCENTAGE')
  }

  if (type === 'PERCENTAGE' && value > 100) {
    throw new Error('Percentage discount cannot exceed 100')
  }

  // check code not already taken
  const existing = await getCouponByCode(code)
  if (existing) {
    throw new Error('Coupon code already exists')
  }

  return await createCoupon(data)
}

export const validateCouponService = async (code, user_id, order_amount) => {
  // 1. get coupon
  const coupon = await getCouponByCode(code)
  if (!coupon) {
    throw new Error('Invalid or expired coupon code')
  }

  // 2. check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw new Error('Coupon has expired')
  }

  // 3. check usage limit
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    throw new Error('Coupon usage limit reached')
  }

  // 4. check minimum order amount
  if (order_amount < coupon.min_order_amount) {
    throw new Error(`Minimum order amount of ₹${coupon.min_order_amount} required`)
  }

  // 5. check if user already used this coupon
  const alreadyUsed = await getCouponUsageByUser(coupon.id, user_id)
  if (alreadyUsed) {
    throw new Error('You have already used this coupon')
  }

  // 6. calculate discount
  let discount_amount = 0
  if (coupon.type === 'FLAT') {
    discount_amount = coupon.value
  } else {
    // percentage
    discount_amount = (order_amount * coupon.value) / 100
    // apply max discount cap if set
    if (coupon.max_discount) {
      discount_amount = Math.min(discount_amount, coupon.max_discount)
    }
  }

  // discount cannot exceed order amount
  discount_amount = Math.min(discount_amount, order_amount)

  const final_amount = order_amount - discount_amount

  return {
    coupon_id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    discount_amount,
    final_amount
  }
}

export const getAllCouponsService = async () => {
  return await getAllCoupons()
}

export const deactivateCouponService = async (id) => {
  await deactivateCoupon(id)
  return { message: 'Coupon deactivated successfully' }
}

export const recordCouponUsageService = async ({ coupon_id, user_id, order_id }) => {
  await recordCouponUsage({ coupon_id, user_id, order_id })
}