import {
  createSellerProfileService, getMySellerProfileService, updateSellerProfileService,
  getSellerDashboardService, updateSellerStatusService, getAllSellersService
} from './seller.service.js'

export const createSellerProfileController = async (req, res) => {
  try {
    const seller = await createSellerProfileService(req.user.id, req.body)
    res.status(201).json({ message: 'Seller profile created. Pending admin approval.', seller })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getMySellerProfileController = async (req, res) => {
  try {
    const seller = await getMySellerProfileService(req.user.id)
    res.status(200).json({ seller })
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

export const updateSellerProfileController = async (req, res) => {
  try {
    const seller = await updateSellerProfileService(req.user.id, req.body)
    res.status(200).json({ message: 'Seller profile updated', seller })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getSellerDashboardController = async (req, res) => {
  try {
    const dashboard = await getSellerDashboardService(req.user.id)
    res.status(200).json({ dashboard })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const updateSellerStatusController = async (req, res) => {
  try {
    const { status } = req.body
    if (!status) {
      return res.status(400).json({ message: 'Status is required' })
    }
    const seller = await updateSellerStatusService(req.params.id, status)
    res.status(200).json({ message: `Seller ${status.toLowerCase()} successfully`, seller })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getAllSellersController = async (req, res) => {
  try {
    const sellers = await getAllSellersService()
    res.status(200).json({ sellers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}