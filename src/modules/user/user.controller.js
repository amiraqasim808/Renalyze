import { Diagnosis } from "../../../DB/models/diagnosis.model.js";
import { User } from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// get user data
export const userData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(
    req.user._id,
    "userName email profileImage "
  ).populate({
    path: "posts",
    select: "content media tag likesCount commentCount createdAt", // Select relevant fields
    populate: [{ path: "likesCount" }, { path: "commentCount" }],
  });

  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }

  return res.json({
    success: true,
    results: { user },
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
        id: uploadedImage.public_id,
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
    user: { userName: user.userName, profileImage: user.profileImage },
  });
});

// AI kidney diagnosis
export const getKidneyScanDiagnosis = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("Upload kidney scan!", { status: 400 }));
  }

  // Upload the scan file to Cloudinary
  let scanFileData = null;
  try {
    const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
      folder: "kidney_scans",
    });

    scanFileData = {
      url: uploadedImage.secure_url,
      id: uploadedImage.public_id,
    };
  } catch (error) {
    return next(new Error("Image upload failed", { status: 500 }));
  }

  // Send the image to the AI model for diagnosis
  let aiPrediction;
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(req.file.path);

    formData.append("file", fileBuffer, {
      filename: req.file.originalname,
    });

    const { data } = await axios.post(
      "https://3laaSayed-kidneytest2.hf.space/predict",
      formData,
      { headers: formData.getHeaders() }
    );

    aiPrediction = data;
  } catch (error) {
    return next(new Error("AI diagnosis failed", { status: 500 }));
  }

  // Match AI result with detailed diagnosis information
  const diagnosisMapping = {
    Normal: {
      Condition: "No abnormalities detected in the kidney scan.",
      Details:
        "The kidney appears structurally healthy, with no indications of stones, cysts, or tumors. No unusual masses or obstructions were found.",
      Recommendations:
        "Maintain a balanced diet, stay hydrated, and undergo routine check-ups to ensure continued kidney health.",
    },
    Stone: {
      Condition: "Kidney stone detected in the scan.",
      Details:
        "A kidney stone has been identified, which may vary in size and composition. Small stones might pass naturally, but larger stones may require medical intervention.",
      Recommendations:
        "Increase water intake to help pass small stones naturally. Limit sodium and oxalate-rich foods such as spinach, chocolate, and nuts. If symptoms worsen, consult a healthcare professional for treatment options such as medication or lithotripsy.",
    },
    Cyst: {
      Condition: "Presence of a kidney cyst detected.",
      Details:
        "A fluid-filled sac has been found in the kidney. While most kidney cysts are benign and do not cause symptoms, monitoring may be required for any changes in size or structure.",
      Recommendations:
        "Regularly monitor the cyst with ultrasound scans as advised by a healthcare provider. Maintain a healthy diet, stay hydrated, and avoid excessive salt intake. Seek medical advice if pain, swelling, or other symptoms develop.",
    },
    Tumor: {
      Condition: "Possible kidney tumor detected.",
      Details:
        "An abnormal mass has been identified in the kidney. Further medical evaluation is required to determine whether the tumor is benign or malignant.",
      Recommendations:
        "Immediate medical consultation is recommended. A healthcare provider may suggest further imaging (CT scan, MRI) or a biopsy to assess the tumor’s nature. Treatment options may include surgery, targeted therapy, or other medical interventions.",
    },
  };

  if (aiPrediction.error) {
    return res.status(400).json({
      success: false,
      message: aiPrediction.error, // Return the error from the AI response
    });
  }

  const aiDiagnosis = aiPrediction.prediction;
  const confidence = aiPrediction.confidence;

  const diagnosisDetails = {
    Diagnosis: aiDiagnosis,
    Confidence: confidence,
    Condition: diagnosisMapping[aiDiagnosis].Condition,
    Details: diagnosisMapping[aiDiagnosis].Details,
    Recommendations: diagnosisMapping[aiDiagnosis].Recommendations,
  };

  // Generate PDF with Improved Styles
  const pdfPath = path.join(__dirname, `diagnosis_${req.user._id}.pdf`);
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Title
  doc
    .font("Helvetica-Bold")
    .fontSize(18) // Reduced font size
    .text("Kidney Scan Diagnosis Report", { align: "center" });
  doc.moveDown(1);

  // Add Image (if available)
  if (scanFileData && scanFileData.url) {
    try {
      const response = await axios.get(scanFileData.url, {
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(response.data, "binary");

      const pageWidth = doc.page.width;
      const imageWidth = 300; // Reduced image size
      const xPosition = (pageWidth - imageWidth) / 2; // Center horizontally

      doc.image(imageBuffer, {
        fit: [imageWidth, 225], // Smaller image
        x: xPosition,
        align: "center",
      });
      doc.moveDown(0.5);
    } catch (error) {
      console.error("Failed to load image:", error.message);
    }
  }

  // Diagnosis Section
  doc
    .font("Helvetica-Bold")
    .fontSize(14) // Smaller section title
    .text("Diagnosis Result", { underline: true });
  doc.moveDown(0.3);
  doc
    .font("Helvetica")
    .fontSize(12) // Smaller body text
    .text(`Diagnosis: ${diagnosisDetails.Diagnosis}`);
  doc.text(`Confidence: ${diagnosisDetails.Confidence}%`);
  doc.moveDown(0.8);

  // Condition Summary
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Condition Summary", { underline: true });
  doc.moveDown(0.3);
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(diagnosisDetails.Condition, { align: "justify" });
  doc.moveDown(0.8);

  // Detailed Analysis
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Detailed Analysis", { underline: true });
  doc.moveDown(0.3);
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(diagnosisDetails.Details, { align: "justify" });
  doc.moveDown(0.8);

  // Recommendations
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Medical Recommendations", { underline: true });
  doc.moveDown(0.3);
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(diagnosisDetails.Recommendations, { align: "justify" });
  doc.moveDown(1.5);

  // Disclaimer
  doc
    .font("Helvetica-Oblique")
    .fontSize(10) // Smaller disclaimer text
    .fillColor("red")
    .text(
      "This AI-generated report is for informational purposes only and does not replace professional medical advice.",
      { align: "center" }
    );

  // End PDF
  doc.end();

  // Upload PDF to Cloudinary
  let pdfUrl;
  try {
    const uploadedPDF = await cloudinary.uploader.upload(pdfPath, {
      folder: "kidney_diagnosis_pdfs",
      resource_type: "raw",
    });
    pdfUrl = uploadedPDF.secure_url;
  } catch (error) {
    return next(new Error("PDF upload failed", { status: 500 }));
  }

  // Store diagnosis in the database
  const diagnosis = new Diagnosis({
    userId: req.user._id,
    scanFile: scanFileData,
    diagnosis: aiDiagnosis,
    confidence: confidence,
    condition: diagnosisDetails.Condition,
    details: diagnosisDetails.Details,
    recommendations: diagnosisDetails.Recommendations,
    pdfUrl: pdfUrl, // Store PDF URL in DB
  });

  await diagnosis.save();

  // Return the diagnosis details with PDF link
  return res.json({
    success: true,
    results: diagnosis,
    // Provide PDF download link
  });
});

// Get Past Kidney Scan Diagnoses
export const getPastKidneyScanDiagnoses = asyncHandler(
  async (req, res, next) => {
    // Fetch all past diagnoses for the user
    const diagnoses = await Diagnosis.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    if (!diagnoses || diagnoses.length === 0) {
      const error = new Error("No past diagnoses found");
      error.cause = 404;
      return next(error);
    }

    return res.json({
      success: true,
      results: diagnoses,
    });
  }
);
export const getSpecificKidneyScanDiagnosis = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

      const diagnosis = await Diagnosis.findOne({
        _id: id,
        userId: req.user._id,
      });

      if (!diagnosis) {
        return next(new Error("Diagnosis not found", { status: 404 }));
      }
      
      return res.json({
        success: true,
        result: diagnosis,
      });
  }
);

