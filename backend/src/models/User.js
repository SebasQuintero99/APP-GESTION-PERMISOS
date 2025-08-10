// src/models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    role: {
      type: DataTypes.ENUM('employee', 'immediate_supervisor', 'area_manager', 'hr'),
      allowNull: false,
      defaultValue: 'employee'
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    immediateManagerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    areaManagerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    signature: {
      type: DataTypes.TEXT, // Para almacenar la firma digital en base64
      allowNull: true
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Métodos de instancia
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  // Asociaciones
  User.associate = (models) => {
    // Auto-referencia para jefe inmediato
    User.belongsTo(models.User, {
      as: 'immediateManager',
      foreignKey: 'immediateManagerId'
    });

    // Auto-referencia para jefe de área
    User.belongsTo(models.User, {
      as: 'areaManager',
      foreignKey: 'areaManagerId'
    });

    // Empleados que reportan a este usuario como jefe inmediato
    User.hasMany(models.User, {
      as: 'subordinates',
      foreignKey: 'immediateManagerId'
    });

    // Empleados que reportan a este usuario como jefe de área
    User.hasMany(models.User, {
      as: 'areaSubordinates',
      foreignKey: 'areaManagerId'
    });

    // Permisos solicitados por el usuario
    User.hasMany(models.Permission, {
      as: 'requestedPermissions',
      foreignKey: 'employeeId'
    });

    // Aprobaciones realizadas por el usuario
    User.hasMany(models.Approval, {
      as: 'approvals',
      foreignKey: 'approverId'
    });
  };

  return User;
};