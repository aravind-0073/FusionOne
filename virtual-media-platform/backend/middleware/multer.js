const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['./uploads', './uploads/videos', './uploads/music', './uploads/thumbnails'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = './uploads/';
    if (file.fieldname === 'video') {
      dest += 'videos/';
    } else if (file.fieldname === 'music') {
      dest += 'music/';
    } else if (file.fieldname === 'thumbnail') {
      dest += 'thumbnails/';
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'video/mp4', 'video/mkv', 'video/quicktime', // videos
    'audio/mpeg', 'audio/mp3', 'audio/wav', // music/podcasts
    'image/jpeg', 'image/png', 'image/webp' // thumbnails
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only videos, audio, and images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024 // 5GB max file size
  }
});

module.exports = upload;
