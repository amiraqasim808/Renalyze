import { Doctor } from "../../../DB/models/doctor.model.js";
import { Review } from "../../../DB/models/review.model.js";
import { User } from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";

export const addDoctor = asyncHandler(async (req, res, next) => {
  const { name, phone, address, aboutDoctor, mapLocation, experience } =
    req.body;
  const image = req.file; // Get the image from the request

  // If image is provided, upload to Cloudinary
  let uploadedImage = null;
  if (image) {
    try {
      uploadedImage = await cloudinary.uploader.upload(image.path, {
        folder: "doctor_images", // Folder name on Cloudinary
      });
    } catch (error) {
      const cloudinaryError = new Error("Image upload failed");
      cloudinaryError.cause = 500;
      return next(cloudinaryError);
    }
  }

  // If no image is uploaded, use a default image
  const imageUrl = uploadedImage
    ? uploadedImage.secure_url
    : "https://res.cloudinary.com/dwsiotrat/image/upload/v1705480608/default-doctor.jpg";
  const imageId = uploadedImage
    ? uploadedImage.public_id
    : "defaults/default-doctor";

  // Find the user who is adding the doctor
  const user = await User.findById(req.user._id);
  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }


  // Create a new doctor
  const doctor = await Doctor.create({
    name,
    image: {
      url: imageUrl,
      id: imageId,
    },
    phoneNumber: phone,
    address,
    aboutDoctor,
    mapLocation: JSON.parse(mapLocation),
    experience
  });

  // Return success response
  return res.status(201).json({
    success: true,
    message: "Doctor added successfully",
    doctor,
  });
});

export const getDoctors = asyncHandler(async (req, res) => {
  const { address } = req.query;

  let filter = {};

  if (address) {
    filter.address = { $regex: address, $options: "i" };
  }

  const doctors = await Doctor.find(filter);

  const formattedDoctors = doctors.map((doc) => {
    const doctorObj = doc.toObject();
    doctorObj.avgRating = doctorObj.avgRating.toFixed(1); // <- changed
    return doctorObj;
  });


  res.status(200).json({ success: true, results: formattedDoctors });
});

export const getTopRatedDoctors = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const topDoctors = await Doctor.find()
    .sort({ avgRating: -1 })
    .limit(Number(limit));

  const formattedDoctors = topDoctors.map((doc) => {
    const doctorObj = doc.toObject();
    doctorObj.avgRating = doctorObj.avgRating.toFixed(1); // <- changed
    return doctorObj;
  });


  res.status(200).json({ success: true, results: formattedDoctors });
});

export const getDoctorById = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    const error = new Error("Doctor not found");
    error.cause = 404;
    return next(error);
  }

  const doctorObj = doctor.toObject();
  doctorObj.avgRating = doctorObj.avgRating.toFixed(1); // <- changed

  res.status(200).json({ success: true, doctor: doctorObj });
});


export const updateDoctor = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;
  const image = req.file; // Get the image from the request

  // Find the doctor
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    const error = new Error("Doctor not found");
    error.cause = 404;
    return next(error);
  }

  // Allow action if the user is an admin or the one who added the doctor
  if (
    req.user.role !== "admin" &&
    doctor.addedBy.toString() !== req.user._id.toString()
  ) {
    const error = new Error(
      "Unauthorized: You can only update your own doctor profile."
    );
    error.cause = 403;
    return next(error);
  }

  let updatedImage = null;
  if (image) {
    try {
      // If a new image is uploaded, upload it to Cloudinary
      updatedImage = await cloudinary.uploader.upload(image.path, {
        folder: "doctor_images",
      });
    } catch (error) {
      const cloudinaryError = new Error("Image upload failed");
      cloudinaryError.cause = 500;
      return next(cloudinaryError);
    }
  }

  // If no new image is uploaded, keep the existing one
  const imageUrl = updatedImage ? updatedImage.secure_url : doctor.image.url;
  const imageId = updatedImage ? updatedImage.public_id : doctor.image.id;

  // Update doctor details with the new image URL if it exists, otherwise, keep the old one
  const updatedDoctor = await Doctor.findByIdAndUpdate(
    id,
    { ...updates, image: { url: imageUrl, id: imageId } },
    { new: true }
  );
  if (updates.mapLocation) {
    updatedDoctor.mapLocation = JSON.parse(updates.mapLocation);
    await updatedDoctor.save();
  }
  res.status(200).json({
    success: true,
    message: "Doctor updated successfully",
    updatedDoctor,
  });
});

// ✅ Delete Doctor (Creator or Admin)
export const deleteDoctor = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    const error = new Error("Doctor not found");
    error.cause = 404;
    return next(error);
  }

  await Doctor.findByIdAndDelete(id);
 
  await Review.deleteMany({ doctor: id });

  res.status(200).json({ success: true, message: "Doctor deleted" });
});


