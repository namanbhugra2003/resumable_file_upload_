import '../styles/chunkGrid.css'
export default function ChunkGrid({ chunks }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 5 }}>
      {chunks.map(chunk => (
        <div
          key={chunk.index}
          style={{
            padding: 8,
            textAlign: 'center',
            background:
              chunk.status === 'SUCCESS'
                ? '#4caf50'
                : chunk.status === 'UPLOADING'
                ? '#ff9800'
                : chunk.status === 'ERROR'
                ? '#f44336'
                : '#ccc'
          }}
        >
          {chunk.index}
        </div>
      ))}
    </div>
  )
}
