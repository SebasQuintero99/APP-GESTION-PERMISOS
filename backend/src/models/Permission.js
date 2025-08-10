// src/models/Permission.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'vacation', 
        'medical_leave', 
        'personal_leave', 
        'maternity_leave', 
        'paternity_leave',
        'study_permit',
        'other'
      ),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    totalDays: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'pending_immediate_supervisor',
        'pending_area_manager', 
        'pending_hr',
        'approved',
        'rejected'
      ),
      defaultValue: 'pending_immediate_supervisor'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    supportingDocuments: {
      type: DataTypes.JSON, // Array de URLs de documentos
      allowNull: true
    },
    emergencyContact: {
      type: DataTypes.JSON, // {name, phone, relationship}
      allowNull: true
    },
    workCoverage: {
      type: DataTypes.TEXT, // Plan de cobertura del trabajo
      allowNull: true
    }
  });

  Permission.associate = (models) => {
    Permission.belongsTo(models.User, {
      as: 'employee',
      foreignKey: 'employeeId'
    });

    Permission.hasMany(models.Approval, {
      as: 'approvals',
      foreignKey: 'permissionId'
    });
  };

  return Permission;
};
