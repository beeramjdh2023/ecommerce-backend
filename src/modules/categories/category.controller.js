import {
  createCategoryService, getAllCategoriesService, getCategoryService,
  updateCategoryService, deleteCategoryService
} from './category.service.js'

export const createCategoryController = async (req, res) => {
  try {
    const { name, image_url, parent_id } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' })
    }
    const category = await createCategoryService({ name, image_url, parent_id })
    res.status(201).json({ message: 'Category created', category })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await getAllCategoriesService()
    res.status(200).json({ categories })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getCategoryController = async (req, res) => {
  try {
    const category = await getCategoryService(req.params.id)
    res.status(200).json({ category })
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

export const updateCategoryController = async (req, res) => {
  try {
    const { name, image_url, parent_id } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' })
    }
    const category = await updateCategoryService(req.params.id, { name, image_url, parent_id })
    res.status(200).json({ message: 'Category updated', category })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const deleteCategoryController = async (req, res) => {
  try {
    const result = await deleteCategoryService(req.params.id)
    res.status(200).json(result)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}