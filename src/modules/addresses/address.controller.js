import { createAddressService, getUserAddressesService, deleteAddressService } from './address.service.js'

export const createAddressController = async (req, res) => {
  try {
    const address = await createAddressService(req.user.id, req.body)
    res.status(201).json({ message: 'Address created', address })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getUserAddressesController = async (req, res) => {
  try {
    const addresses = await getUserAddressesService(req.user.id)
    res.status(200).json({ addresses })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteAddressController = async (req, res) => {
  try {
    const result = await deleteAddressService(req.params.id, req.user.id)
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}