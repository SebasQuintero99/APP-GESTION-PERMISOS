const express = require('express');
const { body, param } = require('express-validator');
const { 
  createPermission, 
  getMyPermissions, 
  getPendingApprovals, 
  approveOrRejectPermission 
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

// Rutas públicas (requieren autenticación)
router.use(authenticateToken);

// Rutas para empleados
router.post('/', createPermissionValidation, createPermission);
router.get('/my-permissions', getMyPermissions);

// Rutas para supervisores, jefes de área y RRHH
router.get('/pending-approvals', 
  authorizeRole(['immediate_supervisor', 'area_manager', 'hr']), 
  getPendingApprovals
);

router.put('/:permissionId/approve', 
  authorizeRole(['immediate_supervisor', 'area_manager', 'hr']), 
  approvalValidation, 
  approveOrRejectPermission
);

module.exports = router;