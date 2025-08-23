# PERMISOSFORM - Sistema de Gestión de Permisos

Sistema web para la gestión de solicitudes de permisos laborales con flujo de aprobación jerárquico y firmas digitales.

## 🚀 Características

- **Solicitud de Permisos**: Formularios dinámicos para diferentes tipos de permisos
- **Flujo de Aprobación**: Proceso estructurado (Supervisor → Jefe de Área → Recursos Humanos)
- **Firmas Digitales**: Autenticación y aprobación con firmas electrónicas
- **Roles y Jerarquía**: Sistema de usuarios con diferentes niveles de autorización
- **Documentos de Soporte**: Adjuntar archivos relacionados con la solicitud
- **Generación de PDFs**: Exportación de formularios aprobados
- **Dashboard**: Visualización de estado de solicitudes
- **Notificaciones**: Alertas en tiempo real del estado de las solicitudes

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Base de Datos**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: Sequelize
- **Autenticación**: JWT + bcryptjs
- **Containerización**: Docker + Docker Compose

### Estructura del Proyecto
```
PERMISOSFORM/
├── backend/                 # API REST
│   ├── src/
│   │   ├── controllers/     # Lógica de controladores
│   │   ├── models/         # Modelos de base de datos
│   │   ├── routes/         # Definición de rutas API
│   │   ├── middleware/     # Middleware de autenticación
│   │   └── index.js        # Servidor principal
│   └── package.json
├── frontend/               # Aplicación React
│   ├── src/
│   │   └── App.tsx
│   └── package.json
├── database/
│   └── init.sql           # Inicialización de BD
├── docker-compose.yml     # Orquestación
└── README.md
```

## 🔧 Instalación

### Prerequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- PostgreSQL 15+ (para desarrollo local)

### Instalación con Docker (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd PERMISOSFORM
   ```

2. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env en la raíz del proyecto
   cp .env.example .env
   ```

3. **Levantar los servicios**
   ```bash
   docker-compose up -d
   ```

4. **Verificar que los servicios estén corriendo**
   ```bash
   docker-compose ps
   ```

### Instalación Local para Desarrollo

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Base de Datos**
   ```bash
   # Crear base de datos PostgreSQL
   createdb approval_system
   
   # Ejecutar script de inicialización
   psql approval_system < database/init.sql
   ```

## 🌐 Servicios y Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 3001 | http://localhost:3001/api |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

## 📋 Variables de Entorno

### Backend (.env)
```env
# Base de datos
DATABASE_URL=postgresql://admin:password123@postgres:5432/approval_system
DB_HOST=postgres
DB_PORT=5432
DB_NAME=approval_system
DB_USER=admin
DB_PASSWORD=password123

# Cache
REDIS_URL=redis://redis:6379

# Autenticación
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Aplicación
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
```

## 🗄️ Base de Datos

### Modelos Principales

#### Usuarios (users)
- Información personal y profesional
- Jerarquía organizacional (jefe inmediato, jefe de área)
- Roles: employee, immediate_supervisor, area_manager, hr
- Firma digital

#### Formularios (forms)
- Definición de formularios dinámicos
- Campos configurables en JSON
- Metadatos del formulario

#### Envíos (form_submissions)
- Solicitudes de permisos enviadas
- Datos del formulario en JSON
- Estados: pending_manager, pending_hr, approved, rejected
- Firmas digitales y timestamps

#### Comentarios (approval_comments)
- Observaciones en el proceso de aprobación
- Historial de cambios

## 🔐 Autenticación y Autorización

### Roles del Sistema
- **Employee**: Crear y ver sus propias solicitudes
- **Immediate Supervisor**: Aprobar solicitudes de subordinados directos
- **Area Manager**: Aprobar solicitudes del área
- **HR**: Aprobación final y gestión del sistema

### Flujo de Aprobación
1. **Empleado** crea solicitud → `pending_immediate_supervisor`
2. **Supervisor Inmediato** aprueba → `pending_area_manager`
3. **Jefe de Área** aprueba → `pending_hr`
4. **Recursos Humanos** aprueba → `approved`

## 🛠️ Scripts Disponibles

### Backend
```bash
npm start          # Producción
npm run dev        # Desarrollo con nodemon
npm test           # Ejecutar tests
npm run test:watch # Tests en modo watch
npm run lint       # Linter
npm run lint:fix   # Corregir lint automáticamente
```

### Frontend
```bash
npm start          # Servidor de desarrollo
npm run build      # Build de producción
npm test           # Ejecutar tests
npm run eject      # Eyectar configuración
```

### Docker
```bash
docker-compose up -d          # Levantar servicios
docker-compose down           # Detener servicios
docker-compose logs [servicio] # Ver logs
docker-compose restart [servicio] # Reiniciar servicio
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend  
cd frontend
npm test

# Tests de integración
npm run test:integration
```

## 📦 Producción

### Build
```bash
# Frontend
cd frontend
npm run build

# Backend (si se requiere transpilación)
cd backend
npm run build
```

### Deploy con Docker
```bash
# Build de imágenes de producción
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión a la base de datos**
   ```bash
   # Verificar que PostgreSQL esté corriendo
   docker-compose ps postgres
   
   # Ver logs
   docker-compose logs postgres
   ```

2. **Frontend no se conecta al backend**
   - Verificar variable `REACT_APP_API_URL`
   - Comprobar que el backend esté en puerto 3001

3. **Permisos de archivos en Docker**
   ```bash
   # En Linux/Mac, ajustar permisos
   sudo chown -R $USER:$USER .
   ```

### Logs
```bash
# Ver logs de todos los servicios
docker-compose logs

# Logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Estándares de Código
- ESLint para JavaScript/TypeScript
- Prettier para formateo
- Conventional Commits para mensajes
- Tests unitarios requeridos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre]
- **Email**: tu.email@empresa.com

## 🔗 Enlaces Útiles

- [Documentación de la API](docs/api.md)
- [Guía de Desarrollo](docs/development.md)
- [Arquitectura del Sistema](CONTEXT.md)

---

**Estado del Proyecto**: 🚧 En Desarrollo Activo

> Para más información técnica detallada, consultar [CONTEXT.md](CONTEXT.md)