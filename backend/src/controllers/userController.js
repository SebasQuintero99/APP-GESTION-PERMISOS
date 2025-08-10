const { User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: errors.array() 
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      employeeId,
      role,
      department,
      position,
      immediateManagerId,
      areaManagerId
    } = req.body;

    // Verificar que el email no esté en uso
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email },
          { employeeId }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'El email o ID de empleado ya están en uso' 
      });
    }

    // Validar que los managers existen si se proporcionan
    if (immediateManagerId) {
      const immediateManager = await User.findByPk(immediateManagerId);
      if (!immediateManager) {
        return res.status(400).json({ 
          error: 'El jefe inmediato especificado no existe' 
        });
      }
    }

    if (areaManagerId) {
      const areaManager = await User.findByPk(areaManagerId);
      if (!areaManager) {
        return res.status(400).json({ 
          error: 'El jefe de área especificado no existe' 
        });
      }
    }

    // Crear usuario
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      employeeId,
      role,
      department,
      position,
      immediateManagerId,
      areaManagerId
    });

    // Obtener usuario creado sin password
    const createdUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: User,
          as: 'immediateManager',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'areaManager',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: createdUser
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      department, 
      isActive = true,
      search 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = {};

    // Filtros
    if (role) whereClause.role = role;
    if (department) whereClause.department = department;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    // Búsqueda por nombre, email o employeeId
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { employeeId: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: User,
          as: 'immediateManager',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'areaManager',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      users: users.rows,
      pagination: {
        total: users.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(users.count / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // No permitir actualizar ciertos campos
    delete updates.password;
    delete updates.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    await user.update(updates);

    // Obtener usuario actualizado
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: User,
          as: 'immediateManager',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'areaManager',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Soft delete - marcar como inactivo
    await user.update({ isActive: false });

    res.json({
      message: 'Usuario desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

const updateSignature = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: errors.array() 
      });
    }

    const { signature } = req.body;
    
    await req.user.update({ signature });

    res.json({
      message: 'Firma actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando firma:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  updateSignature
};