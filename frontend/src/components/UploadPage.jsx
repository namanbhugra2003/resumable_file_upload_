import { useState } from 'react'
import { useChunkUploader } from '../hooks/useChunkUploader'
import ProgressBar from './ProgressBar'
import ChunkGrid from './ChunkGrid'
import '../styles/uploadPage.css'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [chunks, setChunks] = useState([])
  const [progress, setProgress] = useState(0)
  const [metrics, setMetrics] = useState({ speedMB: 0, eta: 0 })

  const { uploadFile } = useChunkUploader(
    setChunks,
    setProgress,
    setMetrics
  )

  async function handleUpload() {
    if (!file) return
    await uploadFile(file)
  }

  return (
    <div className="upload-card">
      <h1>Resumable ZIP Upload</h1>

      {/* File Picker */}
      <label className="file-button">
        {file ? file.name : 'Choose ZIP file'}
        <input
          type="file"
          accept=".zip"
          onChange={e => setFile(e.target.files[0])}
        />
      </label>

      {/* Upload Button */}
      <div className="upload-actions">
        <button onClick={handleUpload} disabled={!file}>
          Upload ZIP
        </button>
      </div>

      {/* Progress + Metrics */}
      <div className="section">
        <ProgressBar progress={progress} />

        <div className="metrics">
          <p><strong>Speed:</strong> {metrics.speedMB} MB/s</p>
          <p><strong>ETA:</strong> {metrics.eta} seconds</p>
        </div>
      </div>

      {/* Chunk Grid */}
      <div className="section">
        <h3>Chunk Status</h3>
        <ChunkGrid chunks={chunks} />
      </div>
    </div>
  )
}
