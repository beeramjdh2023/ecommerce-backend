import {
  getPlatformStats, getAllUsers, getUserById,
  updateUserStatus, getSalesReport, getTopProducts
} from './admin.repository.js'

export const getPlatformStatsService = async () => {
  return await getPlatformStats()
}

export const getAllUsersService = async () => {
  return await getAllUsers()
}

export const updateUserStatusService = async (id, is_active) => {
  const user = await getUserById(id)
  if (!user) {
    throw new Error('User not found')
  }
  if (user.role === 'ADMIN') {
    throw new Error('Cannot deactivate admin accounts')
  }
  return await updateUserStatus(id, is_active)
}

export const getSalesReportService = async (from_date, to_date) => {
  if (!from_date || !to_date) {
    throw new Error('from_date and to_date are required')
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(from_date) || !dateRegex.test(to_date)) {
    throw new Error('Date format must be YYYY-MM-DD')
  }

  if (new Date(from_date) > new Date(to_date)) {
    throw new Error('from_date cannot be after to_date')
  }

  return await getSalesReport(from_date, to_date)
}

export const getTopProductsService = async () => {
  return await getTopProducts()
}