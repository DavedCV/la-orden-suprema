import mongoose, { Document, Schema } from 'mongoose';
import { BloodMarker as IBloodMarker, BloodMarkerStatus } from '../types';

export interface BloodMarkerDocument extends Omit<IBloodMarker, 'id' | 'paidAt' | 'confirmedAt'>, Document {
  _id: mongoose.Types.ObjectId;
  // These are Date objects in the database but strings in the API
  paidAt?: Date;
  confirmedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  // Methods
  isPending(): boolean;
  isPaid(): boolean;
  isSettled(): boolean;
  canBePaidBy(userId: string): boolean;
  canBeConfirmedBy(userId: string): boolean;
}

const BloodMarkerSchema = new Schema(
  {
    debtorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Debtor ID is required'],
    },
    creditorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creditor ID is required'],
      validate: {
        validator: function(v: mongoose.Types.ObjectId) {
          return !(this as any).debtorId || !v.equals((this as any).debtorId);
        },
        message: 'Creditor and debtor cannot be the same person',
      },
    },
    description: {
      type: String,
      required: [true, 'Blood marker description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Solicitud Pendiente', 'Pendiente', 'Pago Pendiente de Confirmación', 'Saldado', 'Rechazada'],
      default: 'Solicitud Pendiente',
      required: [true, 'Blood marker status is required'],
    },
    paidAt: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          // If status is paid pending confirmation or settled, paidAt should be set
          return !['Pago Pendiente de Confirmación', 'Saldado'].includes((this as any).status) || v != null;
        },
        message: 'Payment date is required for paid blood markers',
      },
    },
    confirmedAt: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          // If status is settled, confirmedAt should be set
          return (this as any).status !== 'Saldado' || v != null;
        },
        message: 'Confirmation date is required for settled blood markers',
      },
    },
    rejectedAt: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          // If status is rejected, rejectedAt should be set
          return (this as any).status !== 'Rechazada' || v != null;
        },
        message: 'Rejection date is required for rejected blood markers',
      },
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [200, 'Rejection reason cannot exceed 200 characters'],
      validate: {
        validator: function(v: string) {
          // If status is rejected, rejection reason should be provided
          return (this as any).status !== 'Rechazada' || Boolean(v && v.length > 0);
        },
        message: 'Rejection reason is required for rejected blood markers',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret: any) {
        ret.id = ret._id?.toString();
        ret.createdAt = ret.createdAt?.toISOString ? ret.createdAt.toISOString() : ret.createdAt;

        if (ret.paidAt) {
          ret.paidAt = ret.paidAt.toISOString ? ret.paidAt.toISOString() : ret.paidAt;
        }
        if (ret.confirmedAt) {
          ret.confirmedAt = ret.confirmedAt.toISOString ? ret.confirmedAt.toISOString() : ret.confirmedAt;
        }
        if (ret.rejectedAt) {
          ret.rejectedAt = ret.rejectedAt.toISOString ? ret.rejectedAt.toISOString() : ret.rejectedAt;
        }

        delete ret._id;
        delete ret.__v;
        if (ret.updatedAt) {
          delete ret.updatedAt;
        }
        return ret;
      },
    },
  }
);

// Indexes for better query performance
BloodMarkerSchema.index({ debtorId: 1 });
BloodMarkerSchema.index({ creditorId: 1 });
BloodMarkerSchema.index({ status: 1 });
BloodMarkerSchema.index({ createdAt: -1 });
BloodMarkerSchema.index({ debtorId: 1, status: 1 });
BloodMarkerSchema.index({ creditorId: 1, status: 1 });

// Pre-save middleware for status transitions
BloodMarkerSchema.pre('save', function(next) {
  const now = new Date();
  const self = this as any;

  // Auto-set paidAt when status changes to payment pending
  if (this.isModified('status') && self.status === 'Pago Pendiente de Confirmación' && !self.paidAt) {
    self.paidAt = now;
  }

  // Auto-set confirmedAt when status changes to settled
  if (this.isModified('status') && self.status === 'Saldado' && !self.confirmedAt) {
    self.confirmedAt = now;
  }

  // Auto-set rejectedAt when status changes to rejected
  if (this.isModified('status') && self.status === 'Rechazada' && !self.rejectedAt) {
    self.rejectedAt = now;
  }

  next();
});

// Instance methods
BloodMarkerSchema.methods.isPending = function(): boolean {
  return this.status === 'Pendiente';
};

BloodMarkerSchema.methods.isPaid = function(): boolean {
  return this.status === 'Pago Pendiente de Confirmación';
};

BloodMarkerSchema.methods.isSettled = function(): boolean {
  return this.status === 'Saldado';
};

BloodMarkerSchema.methods.canBePaidBy = function(userId: string): boolean {
  return this.status === 'Pendiente' && this.debtorId.toString() === userId;
};

BloodMarkerSchema.methods.canBeConfirmedBy = function(userId: string): boolean {
  return this.status === 'Pago Pendiente de Confirmación' && this.creditorId.toString() === userId;
};

BloodMarkerSchema.methods.canBeRespondedBy = function(userId: string): boolean {
  return this.status === 'Solicitud Pendiente' && this.creditorId.toString() === userId;
};

// Static methods
BloodMarkerSchema.statics.findByDebtor = function(debtorId: string) {
  return this.find({ debtorId }).populate('creditorId', 'alias email').sort({ createdAt: -1 });
};

BloodMarkerSchema.statics.findByCreditor = function(creditorId: string) {
  return this.find({ creditorId }).populate('debtorId', 'alias email').sort({ createdAt: -1 });
};

BloodMarkerSchema.statics.findPendingRequests = function(userId: string) {
  return this.find({
    creditorId: userId,
    status: 'Solicitud Pendiente'
  }).populate('debtorId', 'alias email').sort({ createdAt: -1 });
};

BloodMarkerSchema.statics.findByUser = function(userId: string) {
  return this.find({
    $or: [
      { debtorId: userId },
      { creditorId: userId }
    ]
  })
  .populate('debtorId', 'alias email')
  .populate('creditorId', 'alias email')
  .sort({ createdAt: -1 });
};

export const BloodMarker = mongoose.model<BloodMarkerDocument>('BloodMarker', BloodMarkerSchema);
