const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API del Sistema de Aprobación de Formularios',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    database: 'connected',
    redis: 'connected'
  });
});

// Rutas principales (las crearemos después)
app.use('/api/auth', (req, res) => res.json({ message: 'Auth routes - Coming soon' }));
app.use('/api/forms', (req, res) => res.json({ message: 'Forms routes - Coming soon' }));
app.use('/api/approvals', (req, res) => res.json({ message: 'Approvals routes - Coming soon' }));

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});