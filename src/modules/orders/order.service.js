import { placeOrder, getOrderById, getUserOrders, updateOrderStatus } from './order.repository.js'
import { getCartWithItems } from '../cart/cart.repository.js'
import { getAddressById } from '../addresses/address.repository.js'

// valid status transitions — state machine
const STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
  CANCELLED: [],
  RETURNED: []
}

export const placeOrderService = async (user_id, address_id) => {

  // 1. validate address belongs to user
  const address = await getAddressById(address_id, user_id)
  if (!address) {
    throw new Error('Address not found')
  }

  // 2. get cart items
  const cart = await getCartWithItems(user_id)
  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty')
  }

  // 3. check all items are available
  const unavailableItems = cart.items.filter(
    item => !item.is_active || item.stock_quantity < item.quantity
  )
  if (unavailableItems.length > 0) {
    throw new Error(`Some items are unavailable: ${unavailableItems.map(i => i.name).join(', ')}`)
  }

  // 4. place order inside transaction
  const order_id = await placeOrder(user_id, address_id, cart.items)

  // 5. get full order details
  const order = await getOrderById(order_id)

  return order
}

export const getOrderService = async (order_id, user_id, role) => {
  const order = await getOrderById(order_id)
  if (!order) {
    throw new Error('Order not found')
  }

  // customer can only see their own orders
  if (role === 'CUSTOMER' && order.user_id !== user_id) {
    throw new Error('You are not authorized to view this order')
  }

  return order
}

export const getUserOrdersService = async (user_id) => {
  return await getUserOrders(user_id)
}

export const updateOrderStatusService = async (order_id, new_status, user_id, role) => {
  const order = await getOrderById(order_id)
  if (!order) {
    throw new Error('Order not found')
  }

  // validate state machine transition
  const allowedTransitions = STATUS_TRANSITIONS[order.status]
  if (!allowedTransitions.includes(new_status)) {
    throw new Error(`Cannot change status from ${order.status} to ${new_status}`)
  }

  // only customer can request return or cancel their own order
  if (['CANCELLED', 'RETURN_REQUESTED'].includes(new_status)) {
    if (order.user_id !== user_id) {
      throw new Error('Not authorized')
    }
  }

  // only admin or seller can confirm, ship, deliver
  if (['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'RETURNED'].includes(new_status)) {
    if (role === 'CUSTOMER') {
      throw new Error('Not authorized to perform this action')
    }
  }

  await updateOrderStatus(order_id, new_status, `Status changed to ${new_status}`)
  return { message: `Order status updated to ${new_status}` }
}