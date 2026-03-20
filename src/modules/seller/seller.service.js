import {
  createSellerProfile, getSellerProfileByUserId, getSellerProfileById,
  updateSellerProfile, updateSellerStatus, getAllSellers, getSellerDashboard
} from './seller.repository.js'

export const createSellerProfileService = async (user_id, data) => {

  // check if seller profile already exists
  const existing = await getSellerProfileByUserId(user_id)
  if (existing) {
    throw new Error('Seller profile already exists')
  }

  if (!data.shop_name) {
    throw new Error('Shop name is required')
  }

  const seller = await createSellerProfile({ ...data, user_id })

   // update user role to SELLER
  await pool.execute(
    'UPDATE users SET role = ? WHERE id = ?',
    ['SELLER', user_id]
  )

  
  return seller
}

export const getMySellerProfileService = async (user_id) => {
  const seller = await getSellerProfileByUserId(user_id)
  if (!seller) {
    throw new Error('Seller profile not found')
  }
  return seller
}

export const updateSellerProfileService = async (user_id, data) => {
  const seller = await getSellerProfileByUserId(user_id)
  if (!seller) {
    throw new Error('Seller profile not found')
  }
  if (!data.shop_name) {
    throw new Error('Shop name is required')
  }
  return await updateSellerProfile(user_id, data)
}

export const getSellerDashboardService = async (user_id) => {
  const seller = await getSellerProfileByUserId(user_id)
  if (!seller) {
    throw new Error('Seller profile not found')
  }
  if (seller.status !== 'APPROVED') {
    throw new Error('Your seller account is not approved yet')
  }
  return await getSellerDashboard(seller.id)
}

export const updateSellerStatusService = async (id, status) => {
  const seller = await getSellerProfileById(id)
  if (!seller) {
    throw new Error('Seller not found')
  }

  const validStatuses = ['APPROVED', 'SUSPENDED', 'REJECTED']
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status')
  }

  return await updateSellerStatus(id, status)
}

export const getAllSellersService = async () => {
  return await getAllSellers()
}