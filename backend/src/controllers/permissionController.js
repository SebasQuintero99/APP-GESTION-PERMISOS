// src/controllers/permissionController.js
const { Permission, User, Approval } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const createPermission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: errors.array() 
      });
    }

    const {
      type,
      startDate,
      endDate,
      reason,
      emergencyContact,
      workCoverage
    } = req.body;

    // Calcular días totales
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Crear permiso
    const permission = await Permission.create({
      employeeId: req.user.id,
      type,
      startDate,
      endDate,
      totalDays,
      reason,
      emergencyContact,
      workCoverage,
      status: 'pending_immediate_supervisor'
    });

    // Obtener el permiso con datos del empleado
    const createdPermission = await Permission.findByPk(permission.id, {
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'department']
        }
      ]
    });

    res.status(201).json({
      message: 'Solicitud de permiso creada exitosamente',
      permission: createdPermission
    });

  } catch (error) {
    console.error('Error creando permiso:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

const getMyPermissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { employeeId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const permissions = await Permission.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId']
        },
        {
          model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'approver',
              attributes: ['id', 'firstName', 'lastName', 'role']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      permissions: permissions.rows,
      pagination: {
        total: permissions.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(permissions.count / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo mis permisos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    let includeEmployee = {};

    // Determinar qué permisos debe aprobar según el rol
    switch (req.user.role) {
      case 'immediate_supervisor':
        whereClause = { status: 'pending_immediate_supervisor' };
        includeEmployee = {
          model: User,
          as: 'employee',
          where: { immediateManagerId: req.user.id },
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'department']
        };
        break;
        
      case 'area_manager':
        whereClause = { status: 'pending_area_manager' };
        includeEmployee = {
          model: User,
          as: 'employee',
          where: { areaManagerId: req.user.id },
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'department']
        };
        break;
        
      case 'hr':
        whereClause = { status: 'pending_hr' };
        includeEmployee = {
          model: User,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'department']
        };
        break;
        
      default:
        return res.status(403).json({ 
          error: 'No tienes permisos para ver aprobaciones pendientes' 
        });
    }

    const permissions = await Permission.findAndCountAll({
      where: whereClause,
      include: [
        includeEmployee,
        {
          model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'approver',
              attributes: ['id', 'firstName', 'lastName', 'role']
            }
          ]
        }
      ],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      permissions: permissions.rows,
      pagination: {
        total: permissions.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(permissions.count / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo aprobaciones pendientes:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

const approveOrRejectPermission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: errors.array() 
      });
    }

    const { permissionId } = req.params;
    const { status, comments, signature } = req.body;

    // Buscar el permiso
    const permission = await Permission.findByPk(permissionId, {
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'immediateManagerId', 'areaManagerId']
        }
      ]
    });

    if (!permission) {
      return res.status(404).json({ 
        error: 'Permiso no encontrado' 
      });
    }

    // Validar que el usuario puede aprobar este permiso
    let canApprove = false;
    let approverRole = '';

    switch (req.user.role) {
      case 'immediate_supervisor':
        canApprove = permission.employee.immediateManagerId === req.user.id && 
                    permission.status === 'pending_immediate_supervisor';
        approverRole = 'immediate_supervisor';
        break;
        
      case 'area_manager':
        canApprove = permission.employee.areaManagerId === req.user.id && 
                    permission.status === 'pending_area_manager';
        approverRole = 'area_manager';
        break;
        
      case 'hr':
        canApprove = permission.status === 'pending_hr';
        approverRole = 'hr';
        break;
    }

    if (!canApprove) {
      return res.status(403).json({ 
        error: 'No tienes permisos para aprobar esta solicitud' 
      });
    }

    // Crear registro de aprobación
    await Approval.create({
      permissionId: permission.id,
      approverId: req.user.id,
      approverRole,
      status,
      comments,
      signature
    });

    // Actualizar estado del permiso
    let newStatus;
    if (status === 'rejected') {
      newStatus = 'rejected';
    } else {
      switch (approverRole) {
        case 'immediate_supervisor':
          newStatus = 'pending_area_manager';
          break;
        case 'area_manager':
          newStatus = 'pending_hr';
          break;
        case 'hr':
          newStatus = 'approved';
          break;
      }
    }

    await permission.update({
      status: newStatus,
      rejectionReason: status === 'rejected' ? comments : null
    });

    res.json({
      message: `Permiso ${status === 'approved' ? 'aprobado' : 'rechazado'} exitosamente`,
      permission: await Permission.findByPk(permission.id, {
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId']
          },
          {
            model: Approval,
            as: 'approvals',
            include: [
              {
                model: User,
                as: 'approver',
                attributes: ['id', 'firstName', 'lastName', 'role']
              }
            ]
          }
        ]
      })
    });

  } catch (error) {
    console.error('Error procesando aprobación:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  createPermission,
  getMyPermissions,
  getPendingApprovals,
  approveOrRejectPermission
};