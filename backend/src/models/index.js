// src/models/index.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'permissions_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Importar modelos
const User = require('./User')(sequelize);
const Permission = require('./Permission')(sequelize);
const Approval = require('./Approval')(sequelize);

// Configurar asociaciones
const models = {
  User,
  Permission,
  Approval
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});
//Holaaa
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
