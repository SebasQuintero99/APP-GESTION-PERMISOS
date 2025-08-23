# PERMISOSFORM - Contexto del Proyecto

## Descripción General
Sistema de gestión de permisos laborales que permite a empleados solicitar permisos y a supervisores/HR aprobarlos mediante un flujo de trabajo estructurado.

## Arquitectura del Sistema

### Stack Tecnológico
- **Backend**: Node.js + Express.js
- **Frontend**: React 19 + TypeScript
- **Base de datos**: PostgreSQL 15
- **Cache**: Redis 7
- **Containerización**: Docker + Docker Compose
- **ORM**: Sequelize
- **Autenticación**: JWT + bcryptjs

### Estructura del Proyecto
```
PERMISOSFORM/
├── backend/                 # API REST en Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/         # Modelos de Sequelize
│   │   ├── routes/         # Definición de rutas
│   │   ├── middleware/     # Middleware de autenticación
│   │   └── index.js        # Punto de entrada del servidor
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Interfaz React
│   ├── src/
│   │   └── App.tsx         # Componente principal (básico)
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql           # Script de inicialización DB
└── docker-compose.yml     # Orquestación de servicios
```

## Base de Datos

### Tablas Principales
1. **users**: Usuarios del sistema con jerarquía organizacional
2. **forms**: Formularios dinámicos (JSONB)
3. **form_submissions**: Envíos de formularios con estados de aprobación
4. **approval_comments**: Comentarios en el proceso de aprobación

### Roles de Usuario
- **employee**: Empleados que solicitan permisos
- **manager**: Supervisores que aprueban en primera instancia
- **hr**: Recursos Humanos que aprueban finalmente

### Estados de Formularios
- `pending_manager`: Esperando aprobación del supervisor
- `pending_hr`: Esperando aprobación de HR
- `approved`: Aprobado
- `rejected`: Rechazado

## Modelos de Negocio

### Usuario (User)
- Jerarquía organizacional con `immediateManagerId` y `areaManagerId`
- Roles: employee, immediate_supervisor, area_manager, hr
- Firma digital almacenada en base64
- Validación de contraseñas con bcrypt

### Permiso (Permission)
- Tipos: vacation, medical_leave, personal_leave, maternity_leave, paternity_leave, study_permit, other
- Fechas de inicio/fin y días totales
- Documentos de soporte (JSON array)
- Contacto de emergencia y plan de cobertura de trabajo

### Aprobación (Approval)
- Seguimiento del flujo de aprobaciones
- Asociada a permisos y usuarios aprobadores

## Configuración de Servicios

### Puertos
- **Frontend**: 3000
- **Backend**: 3001
- **PostgreSQL**: 5432
- **Redis**: 6379

### Variables de Entorno
- `DATABASE_URL`: Conexión a PostgreSQL
- `REDIS_URL`: Conexión a Redis
- `JWT_SECRET`: Secreto para tokens JWT
- `FRONTEND_URL`: URL del frontend para CORS

## Características de Seguridad
- Rate limiting (100 req/15min por IP)
- Helmet para headers de seguridad
- CORS configurado
- Validación de entrada con express-validator
- Hash de contraseñas con bcrypt
- Autenticación JWT

## Estado Actual del Desarrollo
- ✅ Configuración de Docker y servicios
- ✅ Estructura del backend con modelos complejos
- ✅ Sistema de autenticación y autorización
- ✅ Base de datos inicializada con esquema completo
- ⚠️ Frontend básico (solo template de React)
- ⚠️ Controladores y rutas parcialmente implementados

## Próximos Pasos Recomendados
1. Implementar controladores completos (auth, users, permissions)
2. Desarrollar interfaz React con formularios dinámicos
3. Integrar sistema de firmas digitales
4. Implementar generación de PDFs
5. Añadir notificaciones y dashboard
6. Configurar tests automatizados

## Comandos Útiles
```bash
# Desarrollo
npm run dev          # Backend
npm start           # Frontend

# Testing
npm test
npm run test:watch

# Linting
npm run lint
npm run lint:fix

# Docker
docker-compose up -d
docker-compose down
```

## Notas de Implementación
- El sistema usa formularios dinámicos almacenados en JSONB para flexibilidad
- Soporte para firmas digitales y generación de PDFs
- Flujo de aprobación jerárquico configurable
- Rate limiting y medidas de seguridad implementadas
- Diseñado para escalabilidad con Redis como cache