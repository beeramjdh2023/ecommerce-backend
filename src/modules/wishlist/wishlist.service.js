import { getOrCreateWishlist, getWishlistWithItems, getWishlistItem, addWishlistItem, removeWishlistItem } from './wishlist.repository.js'
import { getProductById } from '../products/product.repository.js'

export const getWishlistService = async (user_id) => {
  const wishlist = await getWishlistWithItems(user_id)
  if (!wishlist || wishlist.items.length === 0) {
    return { items: [], total: 0 }
  }
  return { items: wishlist.items, total: wishlist.items.length }
}

export const addToWishlistService = async (user_id, product_id) => {

  // check product exists
  const product = await getProductById(product_id)
  if (!product) throw new Error('Product not found')

  const wishlist = await getOrCreateWishlist(user_id)

  // check not already in wishlist
  const existing = await getWishlistItem(wishlist.id, product_id)
  if (existing) throw new Error('Product already in wishlist')

  await addWishlistItem(wishlist.id, product_id)
  return { message: 'Product added to wishlist' }
}

export const removeFromWishlistService = async (user_id, product_id) => {
  const wishlist = await getOrCreateWishlist(user_id)
  const existing = await getWishlistItem(wishlist.id, product_id)
  if (!existing) throw new Error('Product not in wishlist')

  await removeWishlistItem(wishlist.id, product_id)
  return { message: 'Product removed from wishlist' }
}