import multer, { diskStorage } from "multer";
export const filterObject = {
  image: ["image/png", "image/jpg", "image/jpeg"],
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
