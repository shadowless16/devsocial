import { Router } from 'express'
import reportsRoutes from './reports.routes'

const router = Router()

// Mod routes are currently centered around reports
router.use('/reports', reportsRoutes)

export default router
