import { getWishlistService, addToWishlistService, removeFromWishlistService } from './wishlist.service.js'

export const getWishlistController = async (req, res) => {
  try {
    const wishlist = await getWishlistService(req.user.id)
    res.status(200).json({ wishlist })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addToWishlistController = async (req, res) => {
  try {
    const { product_id } = req.body
    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' })
    }
    const result = await addToWishlistService(req.user.id, product_id)
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const removeFromWishlistController = async (req, res) => {
  try {
    const result = await removeFromWishlistService(req.user.id, req.params.productId)
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}