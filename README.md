# Resumable ZIP File Upload System

This project implements a **resumable, fault-tolerant ZIP file upload system** using **React.js (frontend)**, **Node.js + Express (backend)**, and **MySQL (database)**. The system is designed to handle large file uploads reliably under real-world conditions such as unstable networks, out-of-order chunk delivery, and server restarts.

---

## 🧩 Architecture Overview

- **Frontend (React.js)**
  - Splits files into fixed-size chunks using `Blob.slice()`
  - Uploads chunks with a maximum concurrency of 3
  - Displays real-time progress, speed, ETA, and per-chunk status
  - Implements retry logic with exponential backoff

- **Backend (Node.js + Express)**
  - Accepts chunked uploads
  - Writes chunks using random-access file offsets
  - Persists upload state in MySQL

- **Database (MySQL)**
  - Tracks upload metadata (`uploads` table)
  - Tracks uploaded chunks (`chunks` table)

---

## 🔐 File Integrity Handling (Hashing)

File integrity is ensured using a **deterministic hashing strategy**:

- During upload initialization, the backend generates an `upload_id` by hashing the combination of `file_name` and `file_size` using **SHA-1**.
- This hash uniquely identifies an upload session and ensures that the same file always maps to the same upload state.
- Because chunks are written at exact byte offsets and tracked in the database, the final assembled file preserves correct byte ordering and integrity.

This approach ensures consistency, supports resumability, and avoids duplicate upload sessions for the same file.

---

## ⏸️ Pause / Resume Logic

The system supports **automatic pause and resume** without requiring any special action from the user:

- Each successfully uploaded chunk is recorded in the `chunks` table in MySQL.
- If the upload is interrupted (browser refresh, network failure, or server crash), the frontend re-initiates the upload by calling `/upload/init`.
- The backend responds with a list of already uploaded chunk indices.
- The frontend skips these chunks and resumes uploading only the missing ones.

Because upload state is persisted in the database and file data is written incrementally to disk, the system can recover reliably from interruptions.

---

## ⚖️ Known Trade-offs

The following trade-offs were made consciously during implementation:

1. **No Client-Side Encryption**  
   Files are not encrypted before upload. This keeps the implementation focused on resumability and reliability rather than security layers.

2. **Single-File Upload Scope**  
   The system currently handles one file per upload session. Multi-file batch uploads can be added as an enhancement.

3. **Implicit Finalization**  
   Upload completion is inferred when all chunks are uploaded. A dedicated finalize endpoint could further strengthen completion guarantees.

4. **Local Disk Storage**  
   Uploaded files are stored on the local filesystem rather than cloud storage (e.g., S3), to keep the system simple and self-contained.

---

## 🚀 Future Enhancements

Several improvements can be made to extend this project:

- **Explicit Finalization Endpoint**  
  Add an idempotent `/upload/finalize` endpoint to explicitly mark uploads as completed.

- **Checksum Validation**  
  Compute and compare full-file checksums after upload to further guarantee integrity.

- **Cloud Storage Integration**  
  Store uploaded files in cloud object storage (AWS S3, GCP, Azure) for scalability.

- **Authentication & Authorization**  
  Secure uploads using user authentication and access control.

- **Dynamic Chunk Size**  
  Adjust chunk size dynamically based on network conditions.

- **Upload Pause Button**  
  Add an explicit pause/resume control in the UI.

---

## 🐳 Docker Support

The repository includes Dockerfiles for both frontend and backend, along with a `docker-compose.yml` file to orchestrate the frontend, backend, and MySQL services. Docker is used for **environment orchestration only** and is not involved in the upload logic itself.

---

## ✅ Conclusion

This project demonstrates a **production-grade approach to large file uploads**, handling unreliable networks, out-of-order delivery, retries, and crash recovery. The design emphasizes reliability, simplicity, and clear separation of concerns, fulfilling all assignment requirements.

