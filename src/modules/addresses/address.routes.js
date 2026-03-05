import express from 'express'
import { createAddressController, getUserAddressesController, deleteAddressController } from './address.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.use(authenticate)

router.get('/', getUserAddressesController)
router.post('/', createAddressController)
router.delete('/:id', deleteAddressController)

export default router