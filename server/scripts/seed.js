const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/la-orden-suprema";

// User Schema (simplified for seeding)
const UserSchema = new mongoose.Schema(
  {
    alias: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["assassin", "admin"], default: "assassin" },
    isFirstLogin: { type: Boolean, default: true },
    temporaryPassword: { type: Boolean, default: false },

    // Assassin-specific fields
    status: {
      type: String,
      enum: ["Activo", "Retirado", "Excommunicado"],
      default: "Activo",
    },
    realName: { type: String },
    lastKnownLocation: { type: String },
    goldCoins: { type: Number, default: 1000 },
    skills: [{ type: String }],
    joinDate: { type: Date, default: Date.now },
    completedMissions: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

// Seed data
const seedUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing users (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 12);
    const johnPassword = await bcrypt.hash("wick123", 12);
    const helenPassword = await bcrypt.hash("shadow123", 12);

    // Create admin user
    const admin = new User({
      alias: "El Director",
      email: "admin@laorden.com",
      password: adminPassword,
      role: "admin",
      isFirstLogin: false,
      temporaryPassword: false,
    });

    // Create test assassins
    const johnWick = new User({
      alias: "Baba Yaga",
      email: "john@laorden.com",
      password: johnPassword,
      role: "assassin",
      status: "Activo",
      realName: "John Wick",
      lastKnownLocation: "New York Continental Hotel",
      goldCoins: 50000,
      skills: [
        "Eliminación de alto perfil",
        "Combate cuerpo a cuerpo",
        "Armas de fuego",
      ],
      completedMissions: 127,
      isFirstLogin: false,
      temporaryPassword: false,
    });

    const helenParker = new User({
      alias: "La Sombra",
      email: "helen@laorden.com",
      password: helenPassword,
      role: "assassin",
      status: "Activo",
      realName: "Helen Parker",
      lastKnownLocation: "Paris Continental",
      goldCoins: 35000,
      skills: ["Infiltración", "Espionaje", "Venenos", "Sigilo"],
      completedMissions: 89,
      isFirstLogin: false,
      temporaryPassword: false,
    });
    ``;

    // Save users
    const users = [admin, johnWick, helenParker];

    for (const user of users) {
      try {
        await user.save();
        console.log(
          `Created user: ${user.alias} (${user.email}) - Role: ${user.role}`
        );
      } catch (error) {
        if (error.code === 11000) {
          console.log(`User ${user.alias} already exists, skipping...`);
        } else {
          console.error(`Error creating user ${user.alias}:`, error.message);
        }
      }
    }

    console.log("\n🎉 Database seeding completed!");
    console.log("\n📝 Login credentials:");
    console.log("Admin:");
    console.log("  Email: admin@laorden.com");
    console.log("  Password: admin123");
    console.log("\nTest Assassins:");
    console.log("  John Wick - Email: john@laorden.com, Password: wick123");
    console.log("  Helen Parker - Email: n, Password: shadow123");
    console.log(
      "\n🚀 You can now start the application and test the integration!"
    );
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run seeding
seedUsers();
