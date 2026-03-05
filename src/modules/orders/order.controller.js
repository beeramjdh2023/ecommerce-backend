import {
  placeOrderService, getOrderService,
  getUserOrdersService, updateOrderStatusService
} from './order.service.js'

export const placeOrderController = async (req, res) => {
  try {
    const { address_id } = req.body
    if (!address_id) {
      return res.status(400).json({ message: 'address_id is required' })
    }
    const order = await placeOrderService(req.user.id, address_id)
    res.status(201).json({ message: 'Order placed successfully', order })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getOrderController = async (req, res) => {
  try {
    const order = await getOrderService(req.params.id, req.user.id, req.user.role)
    res.status(200).json({ order })
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

export const getUserOrdersController = async (req, res) => {
  try {
    const orders = await getUserOrdersService(req.user.id)
    res.status(200).json({ orders })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateOrderStatusController = async (req, res) => {
  try {
    const { status, note } = req.body
    if (!status) {
      return res.status(400).json({ message: 'status is required' })
    }
    const result = await updateOrderStatusService(
      req.params.id, status, req.user.id, req.user.role
    )
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}