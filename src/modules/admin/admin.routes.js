import express from 'express'
import {
  getPlatformStatsController,
  getAllUsersController,
  updateUserStatusController,
  getSalesReportController,
  getTopProductsController
} from './admin.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/role.middleware.js'

const router = express.Router()

// all admin routes — must be logged in AND be admin
router.use(authenticate)
router.use(authorize('ADMIN'))

router.get('/stats', getPlatformStatsController)
router.get('/users', getAllUsersController)
router.patch('/users/:id/status', updateUserStatusController)
router.get('/reports/sales', getSalesReportController)
router.get('/reports/top-products', getTopProductsController)

export default router