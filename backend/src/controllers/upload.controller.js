import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import pool from '../db/mysql.js'

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

// -------------------- INIT UPLOAD --------------------
export async function initUpload(req, res) {
  try {
    const { file_name, file_size } = req.body

    // Validate input
    if (!file_name || !file_size) {
      return res.status(400).json({ error: 'Missing file info' })
    }

    // Deterministic upload ID (resumable)
    const uploadId = crypto
      .createHash('sha1')
      .update(file_name + file_size)
      .digest('hex')

    const totalChunks = Math.ceil(file_size / CHUNK_SIZE)

    // Check if upload already exists
    const [existing] = await pool.query(
      'SELECT id FROM uploads WHERE upload_id = ?',
      [uploadId]
    )

    // Insert upload record if new
    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO uploads
         (upload_id, file_name, file_size, total_chunks)
         VALUES (?, ?, ?, ?)`,
        [uploadId, file_name, file_size, totalChunks]
      )
    }

    // Fetch already uploaded chunks (resume support)
    const [rows] = await pool.query(
      'SELECT chunk_index FROM chunks WHERE upload_id = ?',
      [uploadId]
    )

    res.json({
      uploadId,
      uploadedChunks: rows.map(r => r.chunk_index)
    })
  } catch (err) {
    console.error('initUpload error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// -------------------- UPLOAD CHUNK --------------------
export async function uploadChunk(req, res) {
  try {
    const uploadId = req.headers['upload-id']
    const chunkIndex = Number(req.headers['chunk-index'])

    if (!uploadId || Number.isNaN(chunkIndex)) {
      return res.status(400).send('Missing headers')
    }

    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    const filePath = path.join(UPLOAD_DIR, `${uploadId}.zip`)

    // Write chunk at correct offset
    const writeStream = fs.createWriteStream(filePath, {
  flags: 'w+',
  start: chunkIndex * CHUNK_SIZE
})


    req.pipe(writeStream)

    writeStream.on('finish', async () => {
      await pool.query(
        'INSERT IGNORE INTO chunks (upload_id, chunk_index) VALUES (?, ?)',
        [uploadId, chunkIndex]
      )
      res.sendStatus(200)
    })

    writeStream.on('error', err => {
      console.error('Chunk write error:', err)
      res.sendStatus(500)
    })
  } catch (err) {
    console.error('uploadChunk error:', err)
    res.status(500).send('Server error')
  }
}
