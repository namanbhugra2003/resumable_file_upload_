import '../styles/progressBar.css'

export default function ProgressBar({ progress }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ width: '100%', background: '#eee', height: 20 }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'green'
          }}
        />
      </div>
      <p>{progress}%</p>
    </div>
  )
}
