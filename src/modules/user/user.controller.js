import { Diagnosis } from "../../../DB/models/diagnosis.model.js";
import { User } from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";

// get user data
export const userData = asyncHandler(async (req, res, next) => {
  // Fetch the user from the database using the user ID from the token (req.user._id)
  const user = await User.findById(
    req.user._id, 
    "userName email profileImage  -_id" // Select fields to return
  );

  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }

  return res.json({
    success: true,
    results: { user }
  });
});

// Update user profile 
export const updateUserProfile = asyncHandler(async (req, res, next) => {
  const { userName } = req.body;
  const image = req.file; 
  let updatedProfileImage = null;
  // If a new image is uploaded, upload to Cloudinary
  if (image) {
    try {
      const uploadedImage = await cloudinary.uploader.upload(image.path, {
        folder: "user_profiles", // Folder name on Cloudinary
      });

      updatedProfileImage = {
        url: uploadedImage.secure_url,
        id: uploadedImage.public_id
      };
    } catch (error) {
      const cloudinaryError = new Error("Image upload failed");
      cloudinaryError.cause = 500;
      return next(cloudinaryError);
    }
  }

  // Find the user and update profile details
  const user = await User.findById(req.user._id);
  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }

  // Update the user document
  user.userName = userName;
  if (updatedProfileImage) {
    user.profileImage = updatedProfileImage;
  }

  await user.save(); 

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: { userName: user.userName, profileImage: user.profileImage }
  });
});

//  AI Diagnosis for Kidney Scan and Save Diagnosis
export const getKidneyScanDiagnosis = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    const error = new Error("Upload kidney scan!");
    error.status = 400; // Bad request status
    return next(error);
  }

  // Upload the scan file to Cloudinary
  let scanFileData = null;
  try {
    const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
      folder: "kidney_scans", // Folder name on Cloudinary
    });

    scanFileData = {
      url: uploadedImage.secure_url,
      id: uploadedImage.public_id,
    };
  } catch (error) {
    const cloudinaryError = new Error("Image upload failed");
    cloudinaryError.status = 500; // Internal server error
    return next(cloudinaryError);
  }

  // Randomly selecting diagnosis
  const diagnoses = ["Normal", "Stone", "Cyst", "Tumor"];
  const randomDiagnosis =
    diagnoses[Math.floor(Math.random() * diagnoses.length)];

  let diagnosisDetails = {
    Diagnosis: randomDiagnosis,
    Condition: "",
    Details: "",
    Recommendations: "",
  };

  // Simulate detailed message for each diagnosis
  if (randomDiagnosis === "Normal") {
    diagnosisDetails.Condition =
      "The analysis of the uploaded scan/test results shows no signs of abnormalities in the kidney.";
    diagnosisDetails.Details =
      "The kidneys appear healthy with no signs of stones, cysts, or tumors.";
    diagnosisDetails.Recommendations =
      "Continue to maintain a healthy lifestyle and get regular check-ups.";
  } else if (randomDiagnosis === "Stone") {
    diagnosisDetails.Condition =
      "The analysis of the uploaded scan/test results confirms the presence of a kidney stone.";
    diagnosisDetails.Details =
      "The presence of a kidney stone was detected. Further assessment may be needed.";
    diagnosisDetails.Recommendations =
      "Drink plenty of water, limit salt intake, and avoid foods high in oxalates. Consult with a healthcare professional for further management.";
  } else if (randomDiagnosis === "Cyst") {
    diagnosisDetails.Condition =
      "A kidney cyst has been detected. This is a fluid-filled sac that can form in the kidneys.";
    diagnosisDetails.Details =
      "A cyst was detected in the kidney. Further monitoring may be recommended.";
    diagnosisDetails.Recommendations =
      "Regular monitoring through ultrasound is recommended. Avoid excessive salt and stay hydrated.";
  } else if (randomDiagnosis === "Tumor") {
    diagnosisDetails.Condition =
      "The analysis indicates the presence of a kidney tumor.";
    diagnosisDetails.Details =
      "A tumor was detected in the kidney. Further investigation is necessary to determine its nature.";
    diagnosisDetails.Recommendations =
      "Seek immediate medical advice for further investigation. A biopsy or imaging tests may be required for accurate diagnosis.";
  }

  // Store diagnosis in the database with Cloudinary file data
  const diagnosis = new Diagnosis({
    userId: req.user._id,
    scanFile: scanFileData,
    diagnosis: randomDiagnosis,
    condition: diagnosisDetails.Condition,
    details: diagnosisDetails.Details,
    recommendations: diagnosisDetails.Recommendations,
  });

  await diagnosis.save();

  // Return the diagnosis details
  return res.json({
    success: true,
    results: diagnosisDetails,
  });
});

// Get Past Kidney Scan Diagnoses
export const getPastKidneyScanDiagnoses = asyncHandler(async (req, res, next) => {
  // Fetch all past diagnoses for the user
  const diagnoses = await Diagnosis.find({ userId: req.user._id }).sort({ createdAt: -1 });

  if (!diagnoses || diagnoses.length === 0) {
    const error = new Error("No past diagnoses found");
    error.cause = 404;
    return next(error);
  }

  return res.json({
    success: true,
    results: diagnoses,
  });
});
