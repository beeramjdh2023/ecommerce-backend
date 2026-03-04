import {
  getOrCreateCart, getCartWithItems, getCartItem,
  addCartItem, updateCartItemQuantity, removeCartItem, clearCart
} from './cart.repository.js'
import { getProductById } from '../products/product.repository.js'

export const getCartService = async (user_id) => {
  const cart = await getCartWithItems(user_id)

  if (!cart || cart.items.length === 0) {
    return { items: [], total: 0, total_items: 0 }
  }

  // calculate total and flag unavailable items
  let total = 0
  const items = cart.items.map(item => {
    const isAvailable = item.is_active && item.stock_quantity >= item.quantity
    const itemTotal = item.price * item.quantity
    if (isAvailable) total += itemTotal

    return {
      ...item,
      item_total: itemTotal,
      is_available: isAvailable,
      // warn user if item has stock issue
      warning: !item.is_active
        ? 'This product is no longer available'
        : item.stock_quantity === 0
        ? 'This product is out of stock'
        : item.stock_quantity < item.quantity
        ? `Only ${item.stock_quantity} left in stock`
        : null
    }
  })

  return {
    cart_id: cart.id,
    items,
    total_items: items.length,
    total
  }
}

export const addToCartService = async (user_id, { product_id, quantity }) => {

  // 1. validate product exists and is active
  const product = await getProductById(product_id)
  if (!product) {
    throw new Error('Product not found')
  }
  if (!product.is_active) {
    throw new Error('Product is not available')
  }
  if (product.stock_quantity === 0) {
    throw new Error('Product is out of stock')
  }
  if (quantity > product.stock_quantity) {
    throw new Error(`Only ${product.stock_quantity} items available in stock`)
  }

  // 2. get or create cart
  const cart = await getOrCreateCart(user_id)

  // 3. check if product already in cart
  const existingItem = await getCartItem(cart.id, product_id)

  if (existingItem) {
    // update quantity
    const newQuantity = existingItem.quantity + quantity
    if (newQuantity > product.stock_quantity) {
      throw new Error(`Cannot add more. Only ${product.stock_quantity} items available`)
    }
    await updateCartItemQuantity(cart.id, product_id, newQuantity)
    return { message: 'Cart updated successfully' }
  }

  // 4. add new item
  await addCartItem({ cart_id: cart.id, product_id, quantity })
  return { message: 'Product added to cart' }
}

export const updateCartItemService = async (user_id, product_id, quantity) => {

  // validate product stock
  const product = await getProductById(product_id)
  if (!product) {
    throw new Error('Product not found')
  }
  if (quantity > product.stock_quantity) {
    throw new Error(`Only ${product.stock_quantity} items available in stock`)
  }

  const cart = await getOrCreateCart(user_id)
  const existingItem = await getCartItem(cart.id, product_id)
  if (!existingItem) {
    throw new Error('Item not found in cart')
  }

  await updateCartItemQuantity(cart.id, product_id, quantity)
  return { message: 'Cart item updated' }
}

export const removeFromCartService = async (user_id, product_id) => {
  const cart = await getOrCreateCart(user_id)
  const existingItem = await getCartItem(cart.id, product_id)
  if (!existingItem) {
    throw new Error('Item not found in cart')
  }
  await removeCartItem(cart.id, product_id)
  return { message: 'Item removed from cart' }
}

export const clearCartService = async (user_id) => {
  const cart = await getOrCreateCart(user_id)
  await clearCart(cart.id)
  return { message: 'Cart cleared' }
}