// src/routes/users.js
const express = require('express');
const { body } = require('express-validator');
const { 
  createUser, 
  getUsers, 
  updateUser, 
  deleteUser,
  updateSignature 
} = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Validaciones para crear usuario
const createUserValidation = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('firstName')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  body('lastName')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  body('employeeId')
    .isLength({ min: 3, max: 20 })
    .withMessage('El ID de empleado debe tener entre 3 y 20 caracteres')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('El ID de empleado solo puede contener letras, números y guiones'),
  body('role')
    .isIn(['employee', 'immediate_supervisor', 'area_manager', 'hr'])
    .withMessage('Rol no válido'),
  body('department')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El departamento debe tener entre 2 y 100 caracteres'),
  body('position')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El cargo debe tener entre 2 y 100 caracteres'),
  body('immediateManagerId')
    .optional()
    .isUUID()
    .withMessage('ID del jefe inmediato debe ser un UUID válido'),
  body('areaManagerId')
    .optional()
    .isUUID()
    .withMessage('ID del jefe de área debe ser un UUID válido')
];

// Validaciones para actualizar firma
const signatureValidation = [
  body('signature')
    .isBase64()
    .withMessage('La firma debe ser una cadena base64 válida')
];

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas solo para HR
router.post('/', authorizeRole(['hr']), createUserValidation, createUser);
router.get('/', authorizeRole(['hr', 'area_manager']), getUsers);
router.put('/:userId', authorizeRole(['hr']), updateUser);
router.delete('/:userId', authorizeRole(['hr']), deleteUser);

// Ruta para actualizar firma (todos los usuarios autenticados)
router.put('/signature', signatureValidation, updateSignature);

module.exports = router;