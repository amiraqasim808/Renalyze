import { Schema, model } from "mongoose";

const doctorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      min: 3,
      max: 50,
    },
    image: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dwsiotrat/image/upload/v1705480608/default-doctor.jpg",
      },
      id: {
        type: String,
        default: "defaults/default-doctor",
      },
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    aboutDoctor: {
      type: String,
      required: true,
      min: 10,
      max: 1000,
    },
    mapLocation: {
      lng: { type: String },
      lat: { type: String },
    },
    avgRating: { type: Number, min: 0, max: 5, default: 0 },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Doctor = model("Doctor", doctorSchema);
