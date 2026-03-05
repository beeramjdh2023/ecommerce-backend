import crypto from 'crypto'
import razorpay from '../../config/razorpay.js'
import {
  createPayment, getPaymentByOrderId, getPaymentByIdempotencyKey,
  updatePaymentStatus, updateOrderPaymentStatus
} from './payment.repository.js'
import { getOrderById } from '../orders/order.repository.js'

export const createPaymentOrderService = async (user_id, order_id) => {

  // 1. get order and validate
  const order = await getOrderById(order_id)
  if (!order) {
    throw new Error('Order not found')
  }
  if (order.user_id !== user_id) {
    throw new Error('Not authorized')
  }
  if (order.payment_status === 'PAID') {
    throw new Error('Order is already paid')
  }

  // 2. deterministic idempotency key — same order always same key
  const idempotency_key = `payment_${order_id}`

  // 3. check idempotency key first — prevent duplicate Razorpay orders
  const existingByKey = await getPaymentByIdempotencyKey(idempotency_key)
  if (existingByKey) {
    return {
      razorpay_order_id: existingByKey.razorpay_order_id,
      amount: existingByKey.amount,
      currency: 'INR',
      key_id: process.env.RAZORPAY_KEY_ID
    }
  }

  // 4. create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.final_amount * 100), // Razorpay uses paise
    currency: 'INR',
    receipt: order_id,
    notes: { order_id }
  })

  // 5. save payment record
  await createPayment({
    order_id,
    razorpay_order_id: razorpayOrder.id,
    amount: order.final_amount,
    idempotency_key
  })

  // 6. update order with razorpay_order_id
  await updateOrderPaymentStatus(order_id, 'PENDING', razorpayOrder.id)

  return {
    razorpay_order_id: razorpayOrder.id,
    amount: order.final_amount,
    currency: 'INR',
    key_id: process.env.RAZORPAY_KEY_ID
  }
}

export const verifyPaymentService = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }) => {

  // 1. verify signature — proves payment is genuinely from Razorpay
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    throw new Error('Invalid payment signature')
  }

  // 2. check if already paid — prevent double processing
  const order = await getOrderById(order_id)
  if (!order) {
    throw new Error('Order not found')
  }
  if (order.payment_status === 'PAID') {
    return { message: 'Payment already verified' }
  }

  // 3. update payment record
  await updatePaymentStatus({
    order_id,
    razorpay_payment_id,
    razorpay_signature,
    status: 'PAID'
  })

  // 4. update order payment status
  await updateOrderPaymentStatus(order_id, 'PAID', razorpay_order_id)

  return { message: 'Payment verified successfully' }
}

export const webhookService = async (body, signature) => {

  // 1. verify webhook signature — proves request is from Razorpay
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex')

  if (expectedSignature !== signature) {
    throw new Error('Invalid webhook signature')
  }

  const event = body.event
  const payment = body.payload.payment.entity

  // 2. idempotency check — prevent duplicate webhook processing
  const webhookKey = `webhook_${payment.id}`
  const existingWebhook = await getPaymentByIdempotencyKey(webhookKey)
  if (existingWebhook) {
    return { message: 'Already processed' }
  }

  if (event === 'payment.captured') {
    const order_id = payment.notes.order_id

    // 3. check if frontend already verified — if yes skip
    const order = await getOrderById(order_id)
    if (order && order.payment_status === 'PAID') {
      return { message: 'Already processed by frontend verification' }
    }

    // 4. process payment
    await updatePaymentStatus({
      order_id,
      razorpay_payment_id: payment.id,
      razorpay_signature: null,
      status: 'PAID',
      method: payment.method
    })

    await updateOrderPaymentStatus(order_id, 'PAID', payment.order_id)
  }

  if (event === 'payment.failed') {
    const order_id = payment.notes.order_id

    // check not already paid before marking failed
    const order = await getOrderById(order_id)
    if (order && order.payment_status !== 'PAID') {
      await updateOrderPaymentStatus(order_id, 'FAILED', payment.order_id)
    }
  }

  return { message: 'Webhook processed' }
}