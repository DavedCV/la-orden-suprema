import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages,
      });
      return;
    }

    next();
  };
};

// Common validation schemas
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
});

export const createAssassinSchema = Joi.object({
  alias: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'Alias must be at least 2 characters long',
      'string.max': 'Alias cannot exceed 50 characters',
      'any.required': 'Alias is required',
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  realName: Joi.string()
    .max(100)
    .trim()
    .required()
    .messages({
      'string.max': 'Real name cannot exceed 100 characters',
      'any.required': 'Real name is required',
    }),
  skills: Joi.array()
    .items(Joi.string().max(50).trim())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one skill is required',
      'any.required': 'Skills are required',
    }),
  initialGoldCoins: Joi.number()
    .min(0)
    .max(1000000)
    .default(1000)
    .messages({
      'number.min': 'Initial gold coins cannot be negative',
      'number.max': 'Initial gold coins cannot exceed 1,000,000',
    }),
  initialStatus: Joi.string()
    .valid('Activo', 'Retirado', 'Excommunicado')
    .default('Activo'),
  temporaryPassword: Joi.string()
    .min(6)
    .max(50)
    .optional(),
});

export const createMissionSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Mission title must be at least 5 characters long',
      'string.max': 'Mission title cannot exceed 100 characters',
      'any.required': 'Mission title is required',
    }),
  targetName: Joi.string()
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.max': 'Target name cannot exceed 100 characters',
    }),
  description: Joi.string()
    .min(10)
    .max(1000)
    .trim()
    .required()
    .messages({
      'string.min': 'Mission description must be at least 10 characters long',
      'string.max': 'Mission description cannot exceed 1000 characters',
      'any.required': 'Mission description is required',
    }),
  reward: Joi.number()
    .min(100)
    .max(100000)
    .required()
    .messages({
      'number.min': 'Mission reward must be at least 100 gold coins',
      'number.max': 'Mission reward cannot exceed 100,000 gold coins',
      'any.required': 'Mission reward is required',
    }),
  deadline: Joi.date()
    .greater('now')
    .required()
    .messages({
      'date.greater': 'Mission deadline must be in the future',
      'any.required': 'Mission deadline is required',
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .default('medium'),
});

export const updateMissionSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(100)
    .trim()
    .optional(),
  targetName: Joi.string()
    .max(100)
    .trim()
    .optional(),
  description: Joi.string()
    .min(10)
    .max(1000)
    .trim()
    .optional(),
  reward: Joi.number()
    .min(100)
    .max(100000)
    .optional(),
  deadline: Joi.date()
    .optional(), // Remove the 'greater than now' requirement for updates - let the controller handle this
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional(),
  status: Joi.string()
    .valid('No Asignada', 'Asignada', 'En Progreso', 'Completada', 'Fallida', 'in_progress')
    .optional(),
});

export const createBloodMarkerSchema = Joi.object({
  debtorId: Joi.string()
    .required()
    .messages({
      'any.required': 'Debtor ID is required',
    }),
  creditorId: Joi.string()
    .required()
    .messages({
      'any.required': 'Creditor ID is required',
    }),
  description: Joi.string()
    .min(10)
    .max(500)
    .trim()
    .required()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 500 characters',
      'any.required': 'Description is required',
    }),
});

export const respondToBloodMarkerSchema = Joi.object({
  accepted: Joi.boolean()
    .required()
    .messages({
      'any.required': 'Response (accepted/rejected) is required',
    }),
  rejectionReason: Joi.string()
    .max(200)
    .trim()
    .when('accepted', {
      is: false,
      then: Joi.required().messages({
        'any.required': 'Rejection reason is required when declining a blood marker request',
      }),
      otherwise: Joi.optional(),
    }),
});

export const updateProfileSchema = Joi.object({
  alias: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional(),
  realName: Joi.string()
    .max(100)
    .trim()
    .optional(),
  lastKnownLocation: Joi.string()
    .max(200)
    .trim()
    .optional(),
  skills: Joi.array()
    .items(Joi.string().max(50).trim())
    .optional(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required',
    }),
});

// Query parameter validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
});

export const searchSchema = Joi.object({
  q: Joi.string().max(100).trim().required(),
});
