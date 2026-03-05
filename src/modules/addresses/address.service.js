import { createAddress, getUserAddresses, getAddressById, deleteAddress } from './address.repository.js'

export const createAddressService = async (user_id, data) => {
  const { full_name, phone, street, city, state, pincode } = data
  if (!full_name || !phone || !street || !city || !state || !pincode) {
    throw new Error('All address fields are required')
  }
  return await createAddress({ ...data, user_id })
}

export const getUserAddressesService = async (user_id) => {
  return await getUserAddresses(user_id)
}

export const deleteAddressService = async (id, user_id) => {
  const address = await getAddressById(id, user_id)
  if (!address) {
    throw new Error('Address not found')
  }
  await deleteAddress(id, user_id)
  return { message: 'Address deleted successfully' }
}