import { createPaymentOrderService, verifyPaymentService, webhookService } from './payment.service.js'

export const createPaymentOrderController = async (req, res) => {
  try {
    const { order_id } = req.body
    if (!order_id) {
      return res.status(400).json({ message: 'order_id is required' })
    }
    const result = await createPaymentOrderService(req.user.id, order_id)
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const verifyPaymentController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return res.status(400).json({ message: 'All payment fields are required' })
    }
    const result = await verifyPaymentService({ razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id })
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const webhookController = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature']
    const result = await webhookService(req.body, signature)
    res.status(200).json(result)
  } catch (err) {
    // always return 200 to Razorpay even on error
    // otherwise Razorpay keeps retrying
    res.status(200).json({ message: 'Webhook received' })
  }
}