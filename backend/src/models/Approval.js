// src/models/Approval.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Approval = sequelize.define('Approval', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Permissions',
        key: 'id'
      }
    },
    approverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    approverRole: {
      type: DataTypes.ENUM('immediate_supervisor', 'area_manager', 'hr'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('approved', 'rejected'),
      allowNull: false
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    signature: {
      type: DataTypes.TEXT, // Firma digital en base64
      allowNull: true
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  Approval.associate = (models) => {
    Approval.belongsTo(models.Permission, {
      as: 'permission',
      foreignKey: 'permissionId'
    });

    Approval.belongsTo(models.User, {
      as: 'approver',
      foreignKey: 'approverId'
    });
  };

  return Approval;
};