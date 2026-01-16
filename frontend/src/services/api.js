const BASE_URL = 'http://localhost:4000'

// ---------------- INIT UPLOAD ----------------
export async function initUpload({ file_name, file_size }) {
  const res = await fetch(`${BASE_URL}/upload/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ file_name, file_size })
  })

  if (!res.ok) {
    throw new Error('Init upload failed')
  }

  return res.json()
}

// ---------------- UPLOAD CHUNK ----------------
export async function uploadChunk({
  uploadId,
  chunk,
  chunkIndex
}) {
  const res = await fetch(`${BASE_URL}/upload/chunk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'upload-id': uploadId,
      'chunk-index': chunkIndex
    },
    body: chunk
  })

  if (!res.ok) {
    throw new Error('Chunk upload failed')
  }
}
