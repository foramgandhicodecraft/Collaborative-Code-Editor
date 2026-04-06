import { Router } from "express";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "collabcode-avatars", transformation: [{ width: 128, height: 128, crop: "fill" }] },
        (err, r) => { if (err) reject(err); else resolve(r); }
      );
      stream.end(req.file.buffer);
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("[Upload]", err.message);
    res.status(500).json({ error: "Upload failed", url: null });
  }
});

export default router;
