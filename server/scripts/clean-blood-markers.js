const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/la-orden-suprema";

// BloodMarker Schema (simplified for cleaning)
const BloodMarkerSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creditorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Solicitud Pendiente",
        "Pendiente",
        "Pago Pendiente de Confirmación",
        "Saldado",
        "Rechazada",
      ],
      default: "Solicitud Pendiente",
    },
    paidAt: Date,
    confirmedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

const BloodMarker = mongoose.model("BloodMarker", BloodMarkerSchema);

const cleanBloodMarkers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Count existing blood markers
    const count = await BloodMarker.countDocuments();
    console.log(`Found ${count} blood marker(s) in the database`);

    if (count === 0) {
      console.log("✅ No blood markers to clean");
      return;
    }

    // Delete all blood markers
    const result = await BloodMarker.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} blood marker(s)`);

    console.log("✅ Blood markers database cleaned successfully!");
  } catch (error) {
    console.error("❌ Error cleaning blood markers:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run cleaning
cleanBloodMarkers();
