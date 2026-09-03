-- ============================================================
-- TABLA: USUARIOS (para autenticación JWT)
-- Se agrega al esquema existente de SI-GHR
-- ============================================================

-- Crear tipo de rol
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('admin', 'rrhh', 'nómina', 'consulta');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS sighr.usuarios (
    id              SERIAL PRIMARY KEY,
    empleado_id     INTEGER UNIQUE REFERENCES sighr.empleados(id) ON DELETE SET NULL,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    rol             rol_usuario NOT NULL DEFAULT 'consulta',
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_acceso   TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE sighr.usuarios IS 'Usuarios del sistema para autenticación JWT';

CREATE INDEX IF NOT EXISTS idx_usuarios_username ON sighr.usuarios(username);

-- Usuario admin inicial (password: admin123 - cambiar en producción)
INSERT INTO sighr.usuarios (username, password_hash, rol)
VALUES ('admin', '$2a$10$YQ8G5u3e5Z3Q5Y5Q5Y5Q5eH5eH5eH5eH5eH5eH5eH5eH5eH5eH5', 'admin')
ON CONFLICT (username) DO NOTHING;
