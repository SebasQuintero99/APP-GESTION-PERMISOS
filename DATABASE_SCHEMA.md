# Esquema Final de Base de Datos - PERMISOSFORM

## Resumen de Tablas

La base de datos tiene **3 tablas** principales usando **Sequelize**:

### ✅ **ESQUEMA UNIFICADO**
- **Tablas Sequelize (PascalCase)**: `Users`, `Permissions`, `Approvals` 
- **Tablas SQL originales**: ❌ **ELIMINADAS** (redundantes)

## 📋 Estructura Detallada

### 1. **Users** (Tabla Sequelize)
```sql
Tabla principal de usuarios con jerarquía organizacional
┌─────────────────────┬─────────────────────────┬──────────────┐
│ Campo               │ Tipo                    │ Descripción  │
├─────────────────────┼─────────────────────────┼──────────────┤
│ id                  │ UUID (PK)              │ ID único     │
│ email               │ VARCHAR(255) UNIQUE    │ Email único  │
│ password            │ VARCHAR(255)           │ Hash bcrypt  │
│ firstName           │ VARCHAR(255)           │ Nombre       │
│ lastName            │ VARCHAR(255)           │ Apellido     │
│ employeeId          │ VARCHAR(255) UNIQUE    │ ID empleado  │
│ role                │ ENUM                   │ Rol usuario  │
│ department          │ VARCHAR(255)           │ Departamento │
│ position            │ VARCHAR(255)           │ Cargo        │
│ immediateManagerId  │ UUID (FK → Users)      │ Jefe directo │
│ areaManagerId       │ UUID (FK → Users)      │ Jefe área    │
│ isActive            │ BOOLEAN (default true) │ Estado activo│
│ signature           │ TEXT                   │ Firma digital│
│ createdAt/updatedAt │ TIMESTAMP              │ Auditoría    │
└─────────────────────┴─────────────────────────┴──────────────┘

🔗 RELACIONES:
- Auto-referencia: immediateManagerId → Users.id
- Auto-referencia: areaManagerId → Users.id
- Uno a muchos: Users → Permissions (employeeId)
- Uno a muchos: Users → Approvals (approverId)
```

### 2. **Permissions** (Tabla Sequelize)
```sql
Solicitudes de permisos laborales
┌─────────────────────┬─────────────────────────┬──────────────────┐
│ Campo               │ Tipo                    │ Descripción      │
├─────────────────────┼─────────────────────────┼──────────────────┤
│ id                  │ UUID (PK)              │ ID único         │
│ employeeId          │ UUID (FK → Users)      │ Solicitante      │
│ type                │ ENUM                   │ Tipo permiso     │
│ startDate           │ DATE                   │ Fecha inicio     │
│ endDate             │ DATE                   │ Fecha fin        │
│ totalDays           │ INTEGER                │ Días totales     │
│ reason              │ TEXT                   │ Motivo           │
│ status              │ ENUM                   │ Estado actual    │
│ rejectionReason     │ TEXT                   │ Motivo rechazo   │
│ supportingDocuments │ JSON                   │ Documentos       │
│ emergencyContact    │ JSON                   │ Contacto emerg.  │
│ workCoverage        │ TEXT                   │ Plan cobertura   │
│ createdAt/updatedAt │ TIMESTAMP              │ Auditoría        │
└─────────────────────┴─────────────────────────┴──────────────────┘

🔗 RELACIONES:
- Muchos a uno: Permissions → Users (employeeId)
- Uno a muchos: Permissions → Approvals (permissionId)
```

### 3. **Approvals** (Tabla Sequelize)
```sql
Registro de aprobaciones por nivel jerárquico
┌─────────────────┬─────────────────────────┬───────────────────┐
│ Campo           │ Tipo                    │ Descripción       │
├─────────────────┼─────────────────────────┼───────────────────┤
│ id              │ UUID (PK)              │ ID único          │
│ permissionId    │ UUID (FK → Permissions)│ Permiso asociado  │
│ approverId      │ UUID (FK → Users)      │ Quien aprueba     │
│ approverRole    │ ENUM                   │ Rol del aprobador │
│ status          │ ENUM                   │ Aprobado/Rechazado│
│ comments        │ TEXT                   │ Comentarios       │
│ signature       │ TEXT                   │ Firma digital     │
│ approvedAt      │ TIMESTAMP              │ Cuándo aprobó     │
│ createdAt/updatedAt │ TIMESTAMP          │ Auditoría         │
└─────────────────┴─────────────────────────┴───────────────────┘

🔗 RELACIONES:
- Muchos a uno: Approvals → Permissions (permissionId)
- Muchos a uno: Approvals → Users (approverId)
```

## 👥 **Usuarios de Ejemplo Incluidos**

La base de datos incluye 4 usuarios de prueba:

| Email | Nombre | Rol | Departamento |
|-------|--------|-----|--------------|
| `admin@empresa.com` | Admin Sistema | **hr** | Recursos Humanos |
| `jefe@empresa.com` | Juan Pérez | **area_manager** | Tecnología |
| `supervisor@empresa.com` | Carlos López | **immediate_supervisor** | Tecnología |
| `empleado@empresa.com` | María García | **employee** | Tecnología |

## 🏗️ Tipos ENUM Definidos

### **enum_Users_role**
- `employee` - Empleado
- `immediate_supervisor` - Supervisor inmediato  
- `area_manager` - Jefe de área
- `hr` - Recursos humanos

### **enum_Permissions_type**
- `vacation` - Vacaciones
- `medical_leave` - Permiso médico
- `personal_leave` - Permiso personal
- `maternity_leave` - Permiso maternidad
- `paternity_leave` - Permiso paternidad
- `study_permit` - Permiso estudio
- `other` - Otros

### **enum_Permissions_status**
- `pending_immediate_supervisor` - Pendiente supervisor
- `pending_area_manager` - Pendiente jefe área
- `pending_hr` - Pendiente HR
- `approved` - Aprobado
- `rejected` - Rechazado

### **enum_Approvals_approverRole**
- `immediate_supervisor` - Supervisor inmediato
- `area_manager` - Jefe de área
- `hr` - Recursos humanos

### **enum_Approvals_status**
- `approved` - Aprobado
- `rejected` - Rechazado

## ✅ **Decisiones Implementadas**

### **Arquitectura Unificada - Solo Sequelize**
1. ✅ **Eliminadas** tablas SQL originales redundantes
2. ✅ **Migrados** usuarios importantes de tablas originales
3. ✅ **Limpiado** docker-compose.yml (eliminado init.sql y version warning)
4. ✅ **Esquema consistente** usando PascalCase

### **Beneficios Obtenidos:**
- **Consistencia**: Una sola fuente de verdad
- **Tipo-seguridad**: ENUMs estrictos vs strings libres
- **Relaciones claras**: Foreign keys bien definidas
- **Mantenibilidad**: Sequelize maneja migraciones automáticamente

## 📊 Diagrama de Relaciones (Sequelize)

```
    Users (1) ←--┐
      ↑         │
      │         │ immediateManagerId
      │         │ areaManagerId  
      │ (1)     │
      │         │
   (N)│      ┌--┘
      │      │
   Permissions (N) ——→ (N) Approvals
      (1)                  ↑
      │                    │ approverId
      │                    │ (N)
      └────────────────────┘
              Users (1)
```

## 🚀 **Próximos Pasos de Desarrollo**
1. ✅ **Esquema unificado** - COMPLETADO
2. 🔄 **Implementar controladores** de autenticación y permisos
3. 🔄 **Desarrollar rutas API** faltantes (`/api/auth`, `/api/permissions`, `/api/users`)
4. 🔄 **Crear interfaz React** funcional con formularios
5. 🔄 **Implementar autenticación JWT** completa
6. 🔄 **Desarrollar flujo de aprobaciones** jerárquico
7. 🔄 **Añadir sistema de firmas** digitales

## 🧪 **Testing y Credenciales**

Para probar el sistema usa estas credenciales (password: `password123`):

- **HR Admin**: `admin@empresa.com` 
- **Jefe de Área**: `jefe@empresa.com`
- **Supervisor**: `supervisor@empresa.com` 
- **Empleado**: `empleado@empresa.com`

> **Nota**: Todos los usuarios tienen el mismo password hash de ejemplo. En producción usar bcrypt real.