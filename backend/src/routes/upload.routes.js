import express from 'express'
import {
  initUpload,
  uploadChunk
} from '../controllers/upload.controller.js'

const router = express.Router()

// Handshake (resumability)
router.post('/init', initUpload)

// Chunk upload
router.post('/chunk', uploadChunk)

export default router
