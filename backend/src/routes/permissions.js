const express = require('express');
const { body, param } = require('express-validator');
const { 
  createPermission, 
  getMyPermissions, 
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
  getPendingApprovals, 
  approveOrRejectPermission,
  getPermissionStats
} = require('../controllers/permissionController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Validaciones para crear permiso
const createPermissionValidation = [
  body('type')
    .isIn(['vacation', 'medical_leave', 'personal_leave', 'maternity_leave', 'paternity_leave', 'study_permit', 'other'])
    .withMessage('Tipo de permiso no válido'),
  body('startDate')
    .isISO8601()
    .withMessage('Fecha de inicio debe ser válida')
    .custom((value) => {
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        throw new Error('La fecha de inicio no puede ser anterior a hoy');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .withMessage('Fecha de fin debe ser válida')
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.startDate);
      if (endDate < startDate) {
        throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
      }
      return true;
    }),
  body('reason')
    .isLength({ min: 10, max: 500 })
    .withMessage('La razón debe tener entre 10 y 500 caracteres'),
  body('emergencyContact.name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre del contacto de emergencia debe tener entre 2 y 100 caracteres'),
  body('emergencyContact.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Teléfono de contacto no válido'),
  body('workCoverage')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Plan de cobertura no debe exceder 1000 caracteres')
];

// Validaciones para aprobar/rechazar
const approvalValidation = [
  param('permissionId')
    .isUUID()
    .withMessage('ID de permiso no válido'),
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Estado debe ser approved o rejected'),
  body('comments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los comentarios no deben exceder 1000 caracteres'),
  body('signature')
    .optional()
    .isBase64()
    .withMessage('La firma debe ser una cadena base64 válida')
];

// Validaciones para actualizar permiso
const updatePermissionValidation = [
  param('permissionId')
    .isUUID()
    .withMessage('ID de permiso no válido'),
  body('type')
    .optional()
    .isIn(['vacation', 'medical_leave', 'personal_leave', 'maternity_leave', 'paternity_leave', 'study_permit', 'other'])
    .withMessage('Tipo de permiso no válido'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser válida'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser válida'),
  body('reason')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('La razón debe tener entre 10 y 500 caracteres')
];

// Rutas públicas (requieren autenticación)
router.use(authenticateToken);

// Rutas para empleados
router.post('/', createPermissionValidation, createPermission);
router.get('/my-permissions', getMyPermissions);
router.put('/:permissionId', updatePermissionValidation, updatePermission);
router.delete('/:permissionId', deletePermission);

// Rutas para managers y HR
router.get('/', authorizeRole(['area_manager', 'hr']), getAllPermissions);
router.get('/stats', getPermissionStats);
router.get('/pending-approvals', 
  authorizeRole(['immediate_supervisor', 'area_manager', 'hr']), 
  getPendingApprovals
);

// Rutas específicas por ID (debe ir después de las rutas con nombres específicos)
router.get('/:permissionId', getPermissionById);
router.put('/:permissionId/approve', 
  authorizeRole(['immediate_supervisor', 'area_manager', 'hr']), 
  approvalValidation, 
  approveOrRejectPermission
);

module.exports = router;