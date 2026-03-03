import slugify from 'slugify'
import {
  createCategory, getAllCategories, getCategoryById,
  getCategoryBySlug, updateCategory, deleteCategory, getSubcategories
} from './category.repository.js'

export const createCategoryService = async ({ name, image_url, parent_id }) => {
  // auto generate slug from name
  const slug = slugify(name, { lower: true, strict: true })

  // check slug is unique
  const existing = await getCategoryBySlug(slug)
  if (existing) {
    throw new Error('Category with this name already exists')
  }

  // if parent_id provided check it exists
  if (parent_id) {
    const parent = await getCategoryById(parent_id)
    if (!parent) {
      throw new Error('Parent category not found')
    }
  }

  return await createCategory({ name, slug, image_url, parent_id })
}

export const getAllCategoriesService = async () => {
  const categories = await getAllCategories()

  // build tree structure
  const map = {}
  const roots = []

  categories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] }
  })

  categories.forEach(cat => {
    if (cat.parent_id) {
      if (map[cat.parent_id]) {
        map[cat.parent_id].children.push(map[cat.id])
      }
    } else {
      roots.push(map[cat.id])
    }
  })

  return roots
}

export const getCategoryService = async (id) => {
  const category = await getCategoryById(id)
  if (!category) {
    throw new Error('Category not found')
  }

  // also get subcategories
  const subcategories = await getSubcategories(id)
  return { ...category, subcategories }
}

export const updateCategoryService = async (id, data) => {
  const category = await getCategoryById(id)
  if (!category) {
    throw new Error('Category not found')
  }

  const slug = slugify(data.name, { lower: true, strict: true })

  // check slug not taken by another category
  const existing = await getCategoryBySlug(slug)
  if (existing && existing.id !== id) {
    throw new Error('Category with this name already exists')
  }

  return await updateCategory(id, { ...data, slug })
}

export const deleteCategoryService = async (id) => {
  const category = await getCategoryById(id)
  if (!category) {
    throw new Error('Category not found')
  }
  await deleteCategory(id)
  return { message: 'Category deleted successfully' }
}