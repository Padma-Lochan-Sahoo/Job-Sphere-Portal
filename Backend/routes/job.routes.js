import express from 'express'
import { getJobById, getJobs } from '../controller/job.controller.js'

const router = express.Router()

// Route to get all Jobs data
// http://localhost:4000/api/jobs
router.get("/",getJobs)


// Route to get a single job by id
// http://localhost:4000/api/jobs
router.get('/:id',getJobById)


export default router