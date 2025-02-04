import { Schema, model } from "mongoose";

// Diagnosis Schema
const diagnosisSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scanFile: {
      url: { type: String, required: true }, 
      id: { type: String, required: true }, 
    },
    diagnosis: {
      type: String, 
      required: true,
    },
    condition: { type: String, required: true },
    details: { type: String, required: true },
    recommendations: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Diagnosis = model("Diagnosis", diagnosisSchema);
