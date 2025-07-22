import mongoose, { Document, Schema } from 'mongoose';
import { Mission as IMission, MissionStatus } from '../types';

export interface MissionDocument extends Omit<IMission, 'id' | 'deadline'>, Document {
  _id: mongoose.Types.ObjectId;
  deadline: Date;
  isAssigned(): boolean;
  isCompleted(): boolean;
  isAvailable(): boolean;
  canBeAssignedTo(assassinId: string): boolean;
}

const MissionSchema = new Schema<MissionDocument>(
  {
    title: {
      type: String,
      required: [true, 'Mission title is required'],
      trim: true,
      minlength: [5, 'Mission title must be at least 5 characters'],
      maxlength: [100, 'Mission title cannot exceed 100 characters'],
    },
    targetName: {
      type: String,
      trim: true,
      maxlength: [100, 'Target name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Mission description is required'],
      trim: true,
      minlength: [10, 'Mission description must be at least 10 characters'],
      maxlength: [1000, 'Mission description cannot exceed 1000 characters'],
    },
    reward: {
      type: Number,
      required: [true, 'Mission reward is required'],
      min: [100, 'Mission reward must be at least 100 gold coins'],
      max: [100000, 'Mission reward cannot exceed 100,000 gold coins'],
    },
    deadline: {
      type: Date,
      required: [true, 'Mission deadline is required'],
      validate: {
        validator: function(v: Date) {
          return v > new Date();
        },
        message: 'Mission deadline must be in the future',
      },
    },
    status: {
      type: String,
      enum: ['No Asignada', 'Asignada', 'En Progreso', 'Completada', 'Fallida', 'in_progress'],
      default: 'No Asignada',
      required: [true, 'Mission status is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      validate: {
        validator: function(v: mongoose.Types.ObjectId) {
          // If mission is assigned, it must have an assignedTo
          return this.status === 'No Asignada' || v != null;
        },
        message: 'Assigned missions must have an assignee',
      },
    },
    assignedAt: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          // If assignedTo is set, assignedAt should also be set
          return !this.assignedTo || v != null;
        },
        message: 'Assignment date is required when mission is assigned',
      },
    },
    completedAt: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          // If status is completed, completedAt should be set
          return this.status !== 'Completada' || v != null;
        },
        message: 'Completion date is required for completed missions',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mission creator is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc: any, ret: any) {
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        ret.deadline = ret.deadline.toISOString();

        if (ret.assignedAt) {
          ret.assignedAt = ret.assignedAt.toISOString();
        }
        if (ret.completedAt) {
          ret.completedAt = ret.completedAt.toISOString();
        }

        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
MissionSchema.index({ status: 1 });
MissionSchema.index({ assignedTo: 1 });
MissionSchema.index({ createdBy: 1 });
MissionSchema.index({ deadline: 1 });
MissionSchema.index({ priority: 1, status: 1 });
MissionSchema.index({ createdAt: -1 });

// Pre-save middleware for status transitions
MissionSchema.pre('save', function(next) {
  const doc = this as any;

  // Auto-set assignedAt when mission is assigned
  if (this.isModified('assignedTo') && doc.assignedTo && !doc.assignedAt) {
    doc.assignedAt = new Date();
  }

  // Auto-set completedAt when mission is completed
  if (this.isModified('status') && doc.status === 'Completada' && !doc.completedAt) {
    doc.completedAt = new Date();
  }

  // Clear assignedTo and assignedAt if status is reset to unassigned
  if (this.isModified('status') && doc.status === 'No Asignada') {
    doc.assignedTo = undefined;
    doc.assignedAt = undefined;
  }

  next();
});

// Instance methods
MissionSchema.methods.isAssigned = function(): boolean {
  return this.assignedTo != null && ['Asignada', 'En Progreso', 'in_progress'].includes(this.status);
};

MissionSchema.methods.isCompleted = function(): boolean {
  return this.status === 'Completada';
};

MissionSchema.methods.isAvailable = function(): boolean {
  return this.status === 'No Asignada' && new Date(this.deadline) > new Date();
};

MissionSchema.methods.canBeAssignedTo = function(assassinId: string): boolean {
  return this.isAvailable() && !this.assignedTo;
};

// Static methods
MissionSchema.statics.findAvailable = function() {
  return this.find({
    status: 'No Asignada',
    deadline: { $gt: new Date() }
  }).sort({ priority: -1, deadline: 1 });
};

MissionSchema.statics.findByAssassin = function(assassinId: string) {
  return this.find({ assignedTo: assassinId }).sort({ deadline: 1 });
};

export const Mission = mongoose.model<MissionDocument>('Mission', MissionSchema);
