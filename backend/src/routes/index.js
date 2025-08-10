// src/routes/index.js
const express = require('express');
const authRoutes = require('./auth');
const permissionRoutes = require('./permissions');
const userRoutes = require('./users');

const router = express.Router();

// Rutas de la API
router.use('/auth', authRoutes);
router.use('/permissions', permissionRoutes);
router.use('/users', userRoutes);

// Ruta de salud de la API
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;