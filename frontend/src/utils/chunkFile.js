export function createChunks(file, chunkSize = 5 * 1024 * 1024) {
  const chunks = []
  let index = 0

  while (index * chunkSize < file.size) {
    chunks.push({
      index,
      blob: file.slice(
        index * chunkSize,
        (index + 1) * chunkSize
      ),
      status: 'PENDING'
    })
    index++
  }

  return chunks
}
