import {
  getCartService, addToCartService, updateCartItemService,
  removeFromCartService, clearCartService
} from './cart.service.js'

export const getCartController = async (req, res) => {
  try {
    const cart = await getCartService(req.user.id)
    res.status(200).json({ cart })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addToCartController = async (req, res) => {
  try {
    const { product_id, quantity } = req.body
    if (!product_id || !quantity) {
      return res.status(400).json({ message: 'product_id and quantity are required' })
    }
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' })
    }
    const result = await addToCartService(req.user.id, { product_id, quantity })
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const updateCartItemController = async (req, res) => {
  try {
    const { quantity } = req.body
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' })
    }
    const result = await updateCartItemService(req.user.id, req.params.productId, quantity)
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const removeFromCartController = async (req, res) => {
  try {
    const result = await removeFromCartService(req.user.id, req.params.productId)
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const clearCartController = async (req, res) => {
  try {
    const result = await clearCartService(req.user.id)
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}