import {
  createProductService, getProductsService, getProductService,
  updateProductService, deleteProductService
} from './product.service.js'

export const createProductController = async (req, res) => {
  try {
    const product = await createProductService(req.user.id, req.body)
    res.status(201).json({ message: 'Product created', product })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getProductsController = async (req, res) => {
  try {
    const result = await getProductsService(req.query)
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getProductController = async (req, res) => {
  try {
    const product = await getProductService(req.params.id)
    res.status(200).json({ product })
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

export const updateProductController = async (req, res) => {
  try {
    const product = await updateProductService(req.params.id, req.user.id, req.body)
    res.status(200).json({ message: 'Product updated', product })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const deleteProductController = async (req, res) => {
  try {
    const result = await deleteProductService(req.params.id, req.user.id, req.user.role)
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}