import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser, UserRole, AsassinStatus } from '../types';

export interface UserDocument extends Omit<IUser, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
  password: string; // Required field, not optional
  // Assassin-specific fields that are in the schema
  status?: AsassinStatus;
  realName?: string;
  lastKnownLocation?: string;
  goldCoins?: number;
  skills?: string[];
  joinDate?: Date;
  completedMissions?: number;
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isAssassin(): boolean;
  isAdmin(): boolean;
}

export interface AssassinDocument extends UserDocument {
  status: AsassinStatus;
  realName?: string;
  lastKnownLocation?: string;
  goldCoins: number;
  skills: string[];
  joinDate: Date;
  completedMissions: number;
}

const UserSchema = new Schema<UserDocument>(
  {
    alias: {
      type: String,
      required: [true, 'Alias is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Alias must be at least 2 characters'],
      maxlength: [50, 'Alias cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['assassin', 'admin'],
      required: [true, 'Role is required'],
      default: 'assassin',
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    temporaryPassword: {
      type: Boolean,
      default: false,
    },
    // Assassin-specific fields
    status: {
      type: String,
      enum: ['Activo', 'Retirado', 'Excommunicado'],
      default: 'Activo',
      required: function(this: UserDocument) { return this.role === 'assassin'; },
    },
    realName: {
      type: String,
      trim: true,
      maxlength: [100, 'Real name cannot exceed 100 characters'],
    },
    lastKnownLocation: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    goldCoins: {
      type: Number,
      default: 1000,
      min: [0, 'Gold coins cannot be negative'],
      required: function(this: UserDocument) { return this.role === 'assassin'; },
    },
    skills: [{
      type: String,
      trim: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters'],
    }],
    joinDate: {
      type: Date,
      default: Date.now,
    },
    completedMissions: {
      type: Number,
      default: 0,
      min: [0, 'Completed missions cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Index for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ alias: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'role': 1, 'status': 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance methods
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.isAssassin = function(): boolean {
  return this.role === 'assassin';
};

UserSchema.methods.isAdmin = function(): boolean {
  return this.role === 'admin';
};

// Virtual for full assassin data
UserSchema.virtual('assassinData').get(function(this: UserDocument) {
  if (this.role !== 'assassin') return null;

  return {
    id: this._id.toString(),
    alias: this.alias,
    email: this.email,
    role: this.role,
    status: this.status,
    realName: this.realName,
    lastKnownLocation: this.lastKnownLocation,
    goldCoins: this.goldCoins,
    skills: this.skills,
    joinDate: this.joinDate?.toISOString(),
    completedMissions: this.completedMissions,
    isFirstLogin: this.isFirstLogin,
    temporaryPassword: this.temporaryPassword,
  };
});

export const User = mongoose.model<UserDocument>('User', UserSchema);
