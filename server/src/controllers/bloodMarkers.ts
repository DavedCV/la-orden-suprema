import { Response } from 'express';
import { User } from '../models/User';
import { BloodMarker } from '../models/BloodMarker';
import { handleError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { AuthRequest, ApiResponse, CreateBloodMarkerForm, RespondToBloodMarkerForm } from '../types';

export const getBloodMarkers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    let bloodMarkers;

    if (req.user.role === 'admin') {
      // Admins can see all blood markers
      bloodMarkers = await BloodMarker.find()
        .populate('requesterId', 'alias email')
        .populate('creditorId', 'alias email')
        .sort({ createdAt: -1 });
    } else {
      // Assassins can only see their own blood markers (where they're either requester or creditor)
      const userId = (req.user as any)._id?.toString() || req.user.id;

      bloodMarkers = await BloodMarker.find({
        $or: [
          { requesterId: userId },
          { creditorId: userId },
        ],
      })
        .populate('requesterId', 'alias email')
        .populate('creditorId', 'alias email')
        .sort({ createdAt: -1 });
    }

    const response: ApiResponse<any[]> = {
      success: true,
      data: bloodMarkers.map(marker => marker.toJSON()),
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const createBloodMarker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'assassin') {
      throw new ForbiddenError('Assassin access required');
    }

    const markerData: CreateBloodMarkerForm = req.body;

    // The current user is requesting to take on a debt towards the specified creditor
    const requesterId = (req.user as any)._id?.toString() || req.user.id;
    const creditorId = markerData.creditorId;

    // Remove debug logging

    // Validate that requester and creditor are different
    if (requesterId === creditorId) {
      throw new ValidationError('Cannot create a blood marker to yourself');
    }

    // Validate that the creditor exists and is an assassin
    const creditor = await User.findOne({ _id: creditorId, role: 'assassin' });
    if (!creditor) {
      throw new NotFoundError('Creditor not found or is not an assassin');
    }

    // Validate that the requester (current user) exists and is an assassin
    const requester = await User.findOne({ _id: requesterId, role: 'assassin' });
    if (!requester) {
      throw new NotFoundError('Requester not found or is not an assassin');
    }

    // Users validated successfully

    // Check that both assassins are active
    if (requester.status === 'Excommunicado' || creditor.status === 'Excommunicado') {
      throw new ValidationError('Cannot create blood marker involving excommunicated assassins');
    }

    // Check for existing pending request between the same users
    const existingRequest = await BloodMarker.findOne({
      requesterId: requesterId,
      creditorId: creditorId,
      status: 'Solicitud Pendiente'
    });

    // Check completed

    if (existingRequest) {
      throw new ConflictError('You already have a pending blood marker request to this assassin');
    }

    const newBloodMarker = new BloodMarker({
      requesterId: requesterId,
      creditorId: creditorId,
      description: markerData.description,
      status: 'Solicitud Pendiente',
    });

    await newBloodMarker.save();
    await newBloodMarker.populate([
      { path: 'requesterId', select: 'alias email' },
      { path: 'creditorId', select: 'alias email' }
    ]);

    // Blood marker created successfully

    const response: ApiResponse<any> = {
      success: true,
      data: newBloodMarker.toJSON(),
      message: `Blood marker request sent to ${creditor.alias}. You are requesting to owe them a favor. Awaiting their acceptance.`,
    };

    res.status(201).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const respondToBloodMarkerRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'assassin') {
      throw new ForbiddenError('Assassin access required');
    }

    const { markerId } = req.params;
    const { accepted, rejectionReason }: RespondToBloodMarkerForm = req.body;

    const bloodMarker = await BloodMarker.findById(markerId);
    if (!bloodMarker) {
      throw new NotFoundError('Blood marker not found');
    }

    // Only the creditor can respond to pending requests
    const userId = (req.user as any)._id?.toString() || req.user.id;
    if (bloodMarker.creditorId.toString() !== userId) {
      throw new ForbiddenError('Only the creditor can respond to this request');
    }

    // Only pending requests can be responded to
    if (bloodMarker.status !== 'Solicitud Pendiente') {
      throw new ConflictError('This blood marker request has already been responded to');
    }

    if (accepted) {
      bloodMarker.status = 'Pendiente';
    } else {
      bloodMarker.status = 'Rechazada';
      if (rejectionReason) {
        bloodMarker.rejectionReason = rejectionReason;
      }
    }

    await bloodMarker.save();
    await bloodMarker.populate([
      { path: 'requesterId', select: 'alias email' },
      { path: 'creditorId', select: 'alias email' }
    ]);

    const requesterName = ((bloodMarker as any).requesterId as any).alias;
    const response: ApiResponse<any> = {
      success: true,
      data: bloodMarker.toJSON(),
      message: accepted
        ? `Blood marker request accepted. ${requesterName} now owes you a favor.`
        : `Blood marker request from ${requesterName} has been rejected.`,
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const payBloodMarker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'assassin') {
      throw new ForbiddenError('Assassin access required');
    }

    const { markerId } = req.params;

    const bloodMarker = await BloodMarker.findById(markerId);
    if (!bloodMarker) {
      throw new NotFoundError('Blood marker not found');
    }

    // Only the requester (who became the debtor) can pay their debt
    const userId = (req.user as any)._id?.toString() || req.user.id;
    if ((bloodMarker as any).requesterId.toString() !== userId) {
      throw new ForbiddenError('Only the debtor can pay this blood marker');
    }

    // Only pending blood markers can be paid
    if (bloodMarker.status !== 'Pendiente') {
      throw new ConflictError('This blood marker cannot be paid');
    }

    bloodMarker.status = 'Pago Pendiente de Confirmación';
    bloodMarker.paidAt = new Date();

    await bloodMarker.save();
    await bloodMarker.populate([
      { path: 'requesterId', select: 'alias email' },
      { path: 'creditorId', select: 'alias email' }
    ]);

    const creditorName = (bloodMarker.creditorId as any).alias;
    const response: ApiResponse<any> = {
      success: true,
      data: bloodMarker.toJSON(),
      message: `Blood marker marked as paid. Awaiting confirmation from ${creditorName}.`,
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const confirmBloodMarkerPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'assassin') {
      throw new ForbiddenError('Assassin access required');
    }

    const { markerId } = req.params;

    const bloodMarker = await BloodMarker.findById(markerId);
    if (!bloodMarker) {
      throw new NotFoundError('Blood marker not found');
    }

    // Only the creditor can confirm payment
    const userId = (req.user as any)._id?.toString() || req.user.id;
    if (bloodMarker.creditorId.toString() !== userId) {
      throw new ForbiddenError('Only the creditor can confirm payment of this blood marker');
    }

    // Only payment pending markers can be confirmed
    if (bloodMarker.status !== 'Pago Pendiente de Confirmación') {
      throw new ConflictError('This blood marker payment cannot be confirmed');
    }

    bloodMarker.status = 'Saldado';
    bloodMarker.confirmedAt = new Date();

    await bloodMarker.save();
    await bloodMarker.populate([
      { path: 'requesterId', select: 'alias email' },
      { path: 'creditorId', select: 'alias email' }
    ]);

    const debtorName = ((bloodMarker as any).requesterId as any).alias;
    const response: ApiResponse<any> = {
      success: true,
      data: bloodMarker.toJSON(),
      message: `Blood marker payment confirmed. The debt from ${debtorName} has been settled.`,
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const getBloodMarkersByUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const { userId } = req.params;

    // Users can only view their own blood markers unless they're admin
    const currentUserId = (req.user as any)._id?.toString() || req.user.id;
    if (req.user.role !== 'admin' && currentUserId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    // Validate that the user exists and is an assassin
    const user = await User.findOne({ _id: userId, role: 'assassin' });
    if (!user) {
      throw new NotFoundError('Assassin not found');
    }

    const bloodMarkers = await BloodMarker.find({
      $or: [
        { requesterId: userId },
        { creditorId: userId },
      ],
    })
      .populate('requesterId', 'alias email')
      .populate('creditorId', 'alias email')
      .sort({ createdAt: -1 });

    // Separate into categories for easier frontend handling
    const categorized = {
      // Debts where this user is the debtor (they requested to owe)
      debtsOwed: bloodMarkers.filter(marker =>
        ((marker as any).requesterId as any)._id?.toString() === userId &&
        ['Pendiente', 'Pago Pendiente de Confirmación'].includes(marker.status)
      ),
      // Debts where this user is owed (they are the creditor)
      debtsOwing: bloodMarkers.filter(marker =>
        (marker.creditorId as any)._id?.toString() === userId &&
        ['Pendiente', 'Pago Pendiente de Confirmación'].includes(marker.status)
      ),
      // Pending requests where this user needs to respond (they are the creditor)
      pendingRequests: bloodMarkers.filter(marker =>
        (marker.creditorId as any)._id?.toString() === userId &&
        marker.status === 'Solicitud Pendiente'
      ),
      // Requests this user sent that are still pending
      sentRequests: bloodMarkers.filter(marker =>
        ((marker as any).requesterId as any)._id?.toString() === userId &&
        marker.status === 'Solicitud Pendiente'
      ),
      // Settled debts involving this user
      settledDebts: bloodMarkers.filter(marker =>
        marker.status === 'Saldado'
      ),
      // Rejected requests involving this user
      rejectedRequests: bloodMarkers.filter(marker =>
        marker.status === 'Rechazada'
      ),
    };

    const response: ApiResponse<any> = {
      success: true,
      data: {
        all: bloodMarkers.map(marker => marker.toJSON()),
        categorized: {
          debtsOwed: categorized.debtsOwed.map(marker => marker.toJSON()),
          debtsOwing: categorized.debtsOwing.map(marker => marker.toJSON()),
          pendingRequests: categorized.pendingRequests.map(marker => marker.toJSON()),
          sentRequests: categorized.sentRequests.map(marker => marker.toJSON()),
          settledDebts: categorized.settledDebts.map(marker => marker.toJSON()),
          rejectedRequests: categorized.rejectedRequests.map(marker => marker.toJSON()),
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const deleteBloodMarker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const { markerId } = req.params;

    const bloodMarker = await BloodMarker.findById(markerId);
    if (!bloodMarker) {
      throw new NotFoundError('Blood marker not found');
    }

    // Only allow deletion of settled or rejected markers
    if (!['Saldado', 'Rechazada'].includes(bloodMarker.status)) {
      throw new ConflictError('Can only delete settled or rejected blood markers');
    }

    await BloodMarker.findByIdAndDelete(markerId);

    const response: ApiResponse = {
      success: true,
      message: 'Blood marker deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};
