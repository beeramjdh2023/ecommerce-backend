import slugify from 'slugify'
import {
  createProduct, getProducts, getProductsCount, getProductById,
  getProductImages, updateProduct, deleteProduct, getSellerProfile
} from './product.repository.js'
import { getCategoryById } from '../categories/category.repository.js'

export const createProductService = async (user_id, data) => {
  const seller = await getSellerProfile(user_id)
  if (!seller) {
    throw new Error('Seller profile not found. Please create a seller profile first')
  }
  if (seller.status !== 'APPROVED') {
    throw new Error('Your seller account is not approved yet')
  }

  const category = await getCategoryById(data.category_id)
  if (!category) {
    throw new Error('Category not found')
  }

  const slug = slugify(data.name, { lower: true, strict: true })

  return await createProduct({ ...data, seller_id: seller.id, slug })
}

export const getProductsService = async (query) => {
  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 10

  const filters = {
    category_id: query.category_id || null,
    min_price: query.min_price || null,
    max_price: query.max_price || null,
    search: query.search || null,
    sort: query.sort || 'newest',
    page,
    limit
  }

  const [products, total] = await Promise.all([
    getProducts(filters),
    getProductsCount(filters)
  ])

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      has_next: page < Math.ceil(total / limit),
      has_prev: page > 1
    }
  }
}

export const getProductService = async (id) => {
  const product = await getProductById(id)
  if (!product) {
    throw new Error('Product not found')
  }
  const images = await getProductImages(id)
  return { ...product, images }
}

export const updateProductService = async (id, user_id, data) => {
  const product = await getProductById(id)
  if (!product) {
    throw new Error('Product not found')
  }

  const seller = await getSellerProfile(user_id)
  if (!seller || product.seller_id !== seller.id) {
    throw new Error('You are not authorized to update this product')
  }

  const slug = slugify(data.name, { lower: true, strict: true })
  return await updateProduct(id, { ...data, slug })
}

export const deleteProductService = async (id, user_id, role) => {
  const product = await getProductById(id)
  if (!product) {
    throw new Error('Product not found')
  }

  if (role !== 'ADMIN') {
    const seller = await getSellerProfile(user_id)
    if (!seller || product.seller_id !== seller.id) {
      throw new Error('You are not authorized to delete this product')
    }
  }

  await deleteProduct(id)
  return { message: 'Product deleted successfully' }
}