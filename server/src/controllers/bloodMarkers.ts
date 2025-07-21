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
        .populate('debtorId', 'alias email')
        .populate('creditorId', 'alias email')
        .sort({ createdAt: -1 });
    } else {
      // Assassins can only see their own blood markers
      bloodMarkers = await BloodMarker.find({
        $or: [
          { debtorId: req.user.id },
          { creditorId: req.user.id },
        ],
      })
        .populate('debtorId', 'alias email')
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

    // Validate that debtor and creditor are different
    if (markerData.debtorId === markerData.creditorId) {
      throw new ValidationError('Debtor and creditor cannot be the same person');
    }

    // Validate that both users exist and are assassins
    const [debtor, creditor] = await Promise.all([
      User.findOne({ _id: markerData.debtorId, role: 'assassin' }),
      User.findOne({ _id: markerData.creditorId, role: 'assassin' }),
    ]);

    if (!debtor) {
      throw new NotFoundError('Debtor not found');
    }

    if (!creditor) {
      throw new NotFoundError('Creditor not found');
    }

    // Check that both assassins are active
    if (debtor.status === 'Excommunicado' || creditor.status === 'Excommunicado') {
      throw new ValidationError('Cannot create blood marker involving excommunicated assassins');
    }

    // Only allow the requestor to be either the debtor or creditor
    if (req.user.id !== markerData.debtorId && req.user.id !== markerData.creditorId) {
      throw new ForbiddenError('You can only create blood markers involving yourself');
    }

    const newBloodMarker = new BloodMarker({
      debtorId: markerData.debtorId,
      creditorId: markerData.creditorId,
      description: markerData.description,
      status: 'Solicitud Pendiente', // All new markers start as pending requests
    });

    await newBloodMarker.save();
    await newBloodMarker.populate([
      { path: 'debtorId', select: 'alias email' },
      { path: 'creditorId', select: 'alias email' }
    ]);

    const response: ApiResponse<any> = {
      success: true,
      data: newBloodMarker.toJSON(),
      message: 'Blood marker request sent successfully. Awaiting acceptance from the other party.',
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
    if (bloodMarker.creditorId.toString() !== req.user.id) {
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
      { path: 'debtorId', select: 'alias email' },
      { path: 'creditorId', select: 'alias email' }
    ]);

    const response: ApiResponse<any> = {
      success: true,
      data: bloodMarker.toJSON(),
      message: accepted
        ? 'Blood marker request accepted. The debt is now active.'
        : 'Blood marker request rejected.',
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

    // Only the debtor can pay their debt
    if (bloodMarker.debtorId.toString() !== req.user.id) {
      throw new ForbiddenError('Only the debtor can pay this blood marker');
    }

    // Only pending blood markers can be paid
    if (bloodMarker.status !== 'Pendiente') {
      throw new ConflictError('This blood marker cannot be paid');
    }

    bloodMarker.status = 'Pago Pendiente de Confirmación';
    (bloodMarker as any).paidAt = new Date().toISOString();

    await bloodMarker.save();
    await bloodMarker.populate([
      { path: 'debtorId', select: 'alias email' },
      { path: 'creditorId', select: 'alias email' }
    ]);

    const response: ApiResponse<any> = {
      success: true,
      data: bloodMarker.toJSON(),
      message: 'Blood marker marked as paid. Awaiting confirmation from the creditor.',
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
    if (bloodMarker.creditorId.toString() !== req.user.id) {
      throw new ForbiddenError('Only the creditor can confirm payment of this blood marker');
    }

    // Only payment pending markers can be confirmed
    if (bloodMarker.status !== 'Pago Pendiente de Confirmación') {
      throw new ConflictError('This blood marker payment cannot be confirmed');
    }

    bloodMarker.status = 'Saldado';
    (bloodMarker as any).confirmedAt = new Date().toISOString();

    await bloodMarker.save();
    await bloodMarker.populate([
      { path: 'debtorId', select: 'alias email' },
      { path: 'creditorId', select: 'alias email' }
    ]);

    const response: ApiResponse<any> = {
      success: true,
      data: bloodMarker.toJSON(),
      message: 'Blood marker payment confirmed. The debt has been settled.',
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
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      throw new ForbiddenError('Access denied');
    }

    // Validate that the user exists and is an assassin
    const user = await User.findOne({ _id: userId, role: 'assassin' });
    if (!user) {
      throw new NotFoundError('Assassin not found');
    }

    const bloodMarkers = await BloodMarker.find({
      $or: [
        { debtorId: userId },
        { creditorId: userId },
      ],
    })
      .populate('debtorId', 'alias email')
      .populate('creditorId', 'alias email')
      .sort({ createdAt: -1 });

    // Separate into categories for easier frontend handling
    const categorized = {
      debtsOwed: bloodMarkers.filter(marker =>
        (marker.debtorId as any)._id?.toString() === userId &&
        ['Pendiente', 'Pago Pendiente de Confirmación'].includes(marker.status)
      ),
      debtsOwing: bloodMarkers.filter(marker =>
        (marker.creditorId as any)._id?.toString() === userId &&
        ['Pendiente', 'Pago Pendiente de Confirmación'].includes(marker.status)
      ),
      pendingRequests: bloodMarkers.filter(marker =>
        (marker.creditorId as any)._id?.toString() === userId &&
        marker.status === 'Solicitud Pendiente'
      ),
      settledDebts: bloodMarkers.filter(marker =>
        marker.status === 'Saldado'
      ),
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
