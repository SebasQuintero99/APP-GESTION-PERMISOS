-- Crear tablas iniciales
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('employee', 'manager', 'hr')),
    department VARCHAR(100),
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de formularios
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    form_fields JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de envíos de formularios
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES forms(id),
    submitted_by UUID REFERENCES users(id),
    form_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending_manager' CHECK (status IN ('pending_manager', 'pending_hr', 'approved', 'rejected')),
    manager_approval_at TIMESTAMP,
    manager_approved_by UUID REFERENCES users(id),
    hr_approval_at TIMESTAMP,
    hr_approved_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    pdf_path VARCHAR(500),
    digital_signature JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de comentarios/notas
CREATE TABLE approval_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES form_submissions(id),
    user_id UUID REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_form_submissions_status ON form_submissions(status);
CREATE INDEX idx_form_submissions_submitted_by ON form_submissions(submitted_by);
CREATE INDEX idx_users_manager_id ON users(manager_id);

-- Datos de ejemplo
INSERT INTO users (email, password_hash, first_name, last_name, role, department) VALUES
('admin@empresa.com', '$2b$10$examplehash', 'Admin', 'Sistema', 'hr', 'Recursos Humanos'),
('jefe@empresa.com', '$2b$10$examplehash', 'Juan', 'Pérez', 'manager', 'Tecnología'),
('empleado@empresa.com', '$2b$10$examplehash', 'María', 'García', 'employee', 'Tecnología');