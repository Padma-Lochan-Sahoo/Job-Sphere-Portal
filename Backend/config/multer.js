import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Set storage path
const uploadPath = path.join(process.cwd(), '../frontend/public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Save files temporarily in frontend/public/uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

export default upload;
