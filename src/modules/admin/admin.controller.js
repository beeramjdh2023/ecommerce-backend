import {
  getPlatformStatsService, getAllUsersService,
  updateUserStatusService, getSalesReportService,
  getTopProductsService
} from './admin.service.js'

export const getPlatformStatsController = async (req, res) => {
  try {
    const stats = await getPlatformStatsService()
    res.status(200).json({ stats })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsersService()
    res.status(200).json({ users })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateUserStatusController = async (req, res) => {
  try {
    const { is_active } = req.body
    if (is_active === undefined) {
      return res.status(400).json({ message: 'is_active is required' })
    }
    const user = await updateUserStatusService(req.params.id, is_active)
    res.status(200).json({
      message: `User ${is_active ? 'activated' : 'suspended'} successfully`,
      user
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getSalesReportController = async (req, res) => {
  try {
    const { from_date, to_date } = req.query
    const report = await getSalesReportService(from_date, to_date)
    res.status(200).json({ report })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getTopProductsController = async (req, res) => {
  try {
    const products = await getTopProductsService()
    res.status(200).json({ products })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}