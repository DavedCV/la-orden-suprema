import mongoose, { Document, Schema } from 'mongoose';
import { BloodMarker as IBloodMarker, BloodMarkerStatus } from '../types';

export interface BloodMarkerDocument extends Omit<IBloodMarker, 'id' | 'paidAt' | 'confirmedAt' | 'rejectedAt'>, Document {
  _id: mongoose.Types.ObjectId;
  // These are Date objects in the database but strings in the API
  paidAt?: Date;
  confirmedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  // Methods
  isPendingRequest(): boolean;
  isPending(): boolean;
  isPaidPendingConfirmation(): boolean;
  isSettled(): boolean;
  isRejected(): boolean;
  canBePaidBy(userId: string): boolean;
  canBeConfirmedBy(userId: string): boolean;
  canBeRespondedToBy(userId: string): boolean;
}

const BloodMarkerSchema = new Schema(
  {
    // The person who WANTS TO OWE the debt (person requesting to take on debt)
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester ID is required'],
    },
    // The person who will BE OWED the debt (person who will receive the favor)
    creditorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creditor ID is required'],
      validate: {
        validator: function(v: mongoose.Types.ObjectId) {
          return !(this as any).requesterId || !v.equals((this as any).requesterId);
        },
        message: 'Requester and creditor cannot be the same person',
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
    // When the debt was marked as paid by the debtor
    paidAt: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          return !['Pago Pendiente de Confirmación', 'Saldado'].includes((this as any).status) || v != null;
        },
        message: 'Payment date is required for paid blood markers',
      },
    },
    // When the payment was confirmed by the creditor
    confirmedAt: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          return (this as any).status !== 'Saldado' || v != null;
        },
        message: 'Confirmation date is required for settled blood markers',
      },
    },
    // When the request was rejected by the creditor
    rejectedAt: {
      type: Date,
      validate: {
        validator: function(v: Date) {
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

        // For API compatibility, we expose the requester as debtor since they become the debtor when accepted
        // Extract ID from populated field or use the raw ID
        if (ret.requesterId && typeof ret.requesterId === 'object') {
          // Try different possible ID field names
          if (ret.requesterId._id) {
            ret.debtorId = ret.requesterId._id.toString();
          } else if (ret.requesterId.id) {
            ret.debtorId = ret.requesterId.id;
          } else {
            ret.debtorId = ret.requesterId.toString();
          }
        } else {
          ret.debtorId = ret.requesterId;
        }

        // Handle creditorId - if it's populated, extract the id, otherwise use as-is
        if (ret.creditorId && typeof ret.creditorId === 'object') {
          // Try different possible ID field names
          if (ret.creditorId._id) {
            ret.creditorId = ret.creditorId._id.toString();
          } else if (ret.creditorId.id) {
            ret.creditorId = ret.creditorId.id;
          } else {
            ret.creditorId = ret.creditorId.toString();
          }
        }
        // If it's already a string, leave it as-is

        delete ret.requesterId;

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
BloodMarkerSchema.index({ requesterId: 1 });
BloodMarkerSchema.index({ creditorId: 1 });
BloodMarkerSchema.index({ status: 1 });
BloodMarkerSchema.index({ createdAt: -1 });
BloodMarkerSchema.index({ requesterId: 1, status: 1 });
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
BloodMarkerSchema.methods.isPendingRequest = function(): boolean {
  return this.status === 'Solicitud Pendiente';
};

BloodMarkerSchema.methods.isPending = function(): boolean {
  return this.status === 'Pendiente';
};

BloodMarkerSchema.methods.isPaidPendingConfirmation = function(): boolean {
  return this.status === 'Pago Pendiente de Confirmación';
};

BloodMarkerSchema.methods.isSettled = function(): boolean {
  return this.status === 'Saldado';
};

BloodMarkerSchema.methods.isRejected = function(): boolean {
  return this.status === 'Rechazada';
};

// The requester (who becomes debtor when accepted) can pay the debt
BloodMarkerSchema.methods.canBePaidBy = function(userId: string): boolean {
  return this.status === 'Pendiente' && this.requesterId.toString() === userId;
};

// The creditor can confirm payment
BloodMarkerSchema.methods.canBeConfirmedBy = function(userId: string): boolean {
  return this.status === 'Pago Pendiente de Confirmación' && this.creditorId.toString() === userId;
};

// The creditor can respond to pending requests
BloodMarkerSchema.methods.canBeRespondedToBy = function(userId: string): boolean {
  return this.status === 'Solicitud Pendiente' && this.creditorId.toString() === userId;
};

// Static methods
BloodMarkerSchema.statics.findByRequester = function(requesterId: string) {
  return this.find({ requesterId }).populate('creditorId', 'alias email').sort({ createdAt: -1 });
};

BloodMarkerSchema.statics.findByCreditor = function(creditorId: string) {
  return this.find({ creditorId }).populate('requesterId', 'alias email').sort({ createdAt: -1 });
};

BloodMarkerSchema.statics.findPendingRequests = function(creditorId: string) {
  return this.find({
    creditorId: creditorId,
    status: 'Solicitud Pendiente'
  }).populate('requesterId', 'alias email').sort({ createdAt: -1 });
};

BloodMarkerSchema.statics.findByUser = function(userId: string) {
  return this.find({
    $or: [
      { requesterId: userId },
      { creditorId: userId }
    ]
  })
  .populate('requesterId', 'alias email')
  .populate('creditorId', 'alias email')
  .sort({ createdAt: -1 });
};

export const BloodMarker = mongoose.model<BloodMarkerDocument>('BloodMarker', BloodMarkerSchema);
