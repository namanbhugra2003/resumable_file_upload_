import { createChunks } from '../utils/chunkfile'
import { uploadChunk, initUpload } from '../services/api'
import { retry } from '../utils/Backoff'

const CONCURRENCY = 3

export function useChunkUploader(setChunks, setProgress, setMetrics) {
  async function uploadFile(file) {
    // ---- Handshake with backend (snake_case) ----
    const { uploadId, uploadedChunks = [] } = await initUpload({
      file_name: file.name,
      file_size: file.size
    })

    localStorage.setItem('uploadId', uploadId)

    const chunks = createChunks(file)

    // mark already uploaded chunks
    chunks.forEach(c => {
      if (uploadedChunks.includes(c.index)) {
        c.status = 'SUCCESS'
      }
    })

    setChunks([...chunks])

    let uploadedBytes = uploadedChunks.length * 5 * 1024 * 1024
    const startTime = Date.now()

    let index = 0
    const active = []

    async function next() {
      while (
        index < chunks.length &&
        chunks[index].status === 'SUCCESS'
      ) {
        index++
      }

      if (index >= chunks.length) return

      const chunk = chunks[index++]
      chunk.status = 'UPLOADING'
      setChunks([...chunks])

      const task = retry(async () => {
        await uploadChunk({
          uploadId,
          chunk: chunk.blob,
          chunkIndex: chunk.index
        })

        chunk.status = 'SUCCESS'
        uploadedBytes += chunk.blob.size

        const elapsed = (Date.now() - startTime) / 1000
        const speed = uploadedBytes / elapsed
        const remaining = file.size - uploadedBytes

        setProgress(Math.round((uploadedBytes / file.size) * 100))
        setMetrics({
          speedMB: (speed / (1024 * 1024)).toFixed(2),
          eta: Math.round(remaining / speed)
        })

        setChunks([...chunks])
      }).catch(() => {
        chunk.status = 'ERROR'
        setChunks([...chunks])
      }).finally(() => {
        active.splice(active.indexOf(task), 1)
      })

      active.push(task)

      if (active.length >= CONCURRENCY) {
        await Promise.race(active)
      }

      await next()
    }

    await next()
    await Promise.all(active)
  }

  return { uploadFile }
}
