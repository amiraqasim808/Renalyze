import multer, { diskStorage } from "multer";
export const filterObject = {
  image: [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/gif", // GIF images
    "image/webp", // WebP images
    "image/tiff", // TIFF images
    "image/bmp", // BMP images
    "image/x-icon", // ICO images (favicon)
    "image/svg+xml", // SVG images
    "image/heif", // HEIF images
    "image/heic", // HEIC images
  ],
  pdf: ["application/pdf"],
};


export const fileUpload = (filter) => {
  const fileFilter = (req, file, cb) => {
    if (!filter.includes(file.mimetype))
      return cb(new Error("invalid file format!"), false);
    return cb(null, true);
  };
  return multer({ storage: diskStorage({}), fileFilter });
};
