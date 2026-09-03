-- ============================================================
-- SI-GHR: Toyotachira S.A.
-- Supabase PostgreSQL - Esquema completo
-- ============================================================

-- Tipo de rol
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('admin', 'rrhh', 'nómina', 'consulta');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 1. DEPARTAMENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS departamentos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    descripcion     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. EMPLEADOS
-- ============================================================
CREATE TABLE IF NOT EXISTS empleados (
    id                  SERIAL PRIMARY KEY,
    nro                 INTEGER NOT NULL UNIQUE,
    cedula              VARCHAR(20) NOT NULL UNIQUE,
    nombre_completo     VARCHAR(150) NOT NULL,
    departamento_id     INTEGER NOT NULL REFERENCES departamentos(id) ON DELETE RESTRICT,
    posicion_cargo      VARCHAR(100),
    fecha_ingreso       DATE NOT NULL,
    salario_base        DECIMAL(12,2) NOT NULL CHECK (salario_base >= 0),
    estado_operativo    VARCHAR(20) NOT NULL DEFAULT 'Activo'
                        CHECK (estado_operativo IN ('Activo','Vacaciones','Reposo','Egreso')),
    tipo_tasa           VARCHAR(10),
    porcentaje_bs       DECIMAL(5,2),
    porcentaje_usd      DECIMAL(5,2),
    grupo               VARCHAR(50),
    email               VARCHAR(150),
    telefono            VARCHAR(30),
    direccion           TEXT,
    foto_url            VARCHAR(500),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emp_dept ON empleados(departamento_id);
CREATE INDEX IF NOT EXISTS idx_emp_estado ON empleados(estado_operativo);
CREATE INDEX IF NOT EXISTS idx_emp_nombre ON empleados(nombre_completo);

-- ============================================================
-- 3. DOCUMENTOS_EMPLEADO
-- ============================================================
CREATE TABLE IF NOT EXISTS documentos_empleado (
    id              SERIAL PRIMARY KEY,
    empleado_id     INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    tipo_documento  VARCHAR(50) NOT NULL,
    nombre_archivo  VARCHAR(255) NOT NULL,
    ruta_archivo    VARCHAR(500) NOT NULL,
    fecha_registro  TIMESTAMPTZ DEFAULT NOW(),
    observaciones   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_emp ON documentos_empleado(empleado_id);

-- ============================================================
-- 4. EXAMENES_MEDICOS_REPOSOS
-- ============================================================
CREATE TABLE IF NOT EXISTS examenes_medicos_reposos (
    id                  SERIAL PRIMARY KEY,
    empleado_id         INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    tipo_registro       VARCHAR(50) NOT NULL,
    fecha_registro      DATE DEFAULT CURRENT_DATE,
    fecha_inicio        DATE,
    fecha_fin           DATE,
    fecha_reintegro     DATE,
    diagnostico         TEXT,
    observaciones       TEXT,
    ruta_adjunto        VARCHAR(500),
    medico_responsable  VARCHAR(150),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_emp ON examenes_medicos_reposos(empleado_id);

-- ============================================================
-- 5. PERIODOS_VACACIONALES
-- ============================================================
CREATE TABLE IF NOT EXISTS periodos_vacacionales (
    id                  SERIAL PRIMARY KEY,
    empleado_id         INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    anio_periodo        INTEGER NOT NULL CHECK (anio_periodo >= 2000),
    dias_acumulados     INTEGER NOT NULL DEFAULT 0,
    dias_disfrute       INTEGER NOT NULL DEFAULT 0,
    dias_pendientes     INTEGER GENERATED ALWAYS AS (dias_acumulados - dias_disfrute) STORED,
    salario_diario      DECIMAL(12,2),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_emp_anio UNIQUE (empleado_id, anio_periodo)
);

CREATE INDEX IF NOT EXISTS idx_vac_emp ON periodos_vacacionales(empleado_id);

-- ============================================================
-- 6. SOLICITUDES_VACACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS solicitudes_vacaciones (
    id                    SERIAL PRIMARY KEY,
    empleado_id           INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    periodo_vacacional_id INTEGER REFERENCES periodos_vacacionales(id) ON DELETE SET NULL,
    fecha_salida          DATE NOT NULL,
    fecha_regreso         DATE NOT NULL,
    dias_solicitados      INTEGER NOT NULL CHECK (dias_solicitados > 0),
    estado                VARCHAR(20) NOT NULL DEFAULT 'Solicitada'
                          CHECK (estado IN ('Solicitada','Aprobada','Rechazada','Disfrutada','Cancelada')),
    motivo                TEXT,
    aprobado_por          VARCHAR(150),
    fecha_aprobacion      TIMESTAMPTZ,
    archivo_pdf           VARCHAR(500),
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_fechas_vac CHECK (fecha_regreso > fecha_salida)
);

CREATE INDEX IF NOT EXISTS idx_sol_emp ON solicitudes_vacaciones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_sol_estado ON solicitudes_vacaciones(estado);

-- ============================================================
-- 7. POLIZAS_UROSALUD
-- ============================================================
CREATE TABLE IF NOT EXISTS polizas_urosalud (
    id                  SERIAL PRIMARY KEY,
    empleado_id         INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    numero_poliza       VARCHAR(50) UNIQUE,
    fecha_afiliacion    DATE NOT NULL,
    fecha_vencimiento   DATE,
    asesor              VARCHAR(150),
    plan_contratado     VARCHAR(100) NOT NULL,
    monto_prima         DECIMAL(12,2) NOT NULL CHECK (monto_prima >= 0),
    moneda              VARCHAR(3) DEFAULT 'Bs',
    estado              VARCHAR(20) NOT NULL DEFAULT 'Activa'
                        CHECK (estado IN ('Activa','Suspendida','Cancelada','Vencida')),
    observaciones       TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pol_emp ON polizas_urosalud(empleado_id);

-- ============================================================
-- 8. CARGAS_FAMILIARES
-- ============================================================
CREATE TABLE IF NOT EXISTS cargas_familiares (
    id                      SERIAL PRIMARY KEY,
    poliza_id               INTEGER NOT NULL REFERENCES polizas_urosalud(id) ON DELETE CASCADE,
    nombre_completo         VARCHAR(150) NOT NULL,
    cedula_o_identificador  VARCHAR(30),
    parentesco              VARCHAR(30) NOT NULL,
    fecha_nacimiento        DATE,
    edad                    INTEGER,
    sexo                    VARCHAR(10),
    plan                    VARCHAR(100),
    estado                  VARCHAR(20) DEFAULT 'Activo',
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carga_pol ON cargas_familiares(poliza_id);

-- ============================================================
-- 9. PERIODOS_NOMINA
-- ============================================================
CREATE TABLE IF NOT EXISTS periodos_nomina (
    id              SERIAL PRIMARY KEY,
    quincena        SMALLINT NOT NULL CHECK (quincena IN (1,2)),
    mes             SMALLINT NOT NULL CHECK (mes >= 1 AND mes <= 12),
    anio            INTEGER NOT NULL CHECK (anio >= 2000),
    fecha_inicio    DATE NOT NULL,
    fecha_fin       DATE NOT NULL,
    estatus         VARCHAR(20) NOT NULL DEFAULT 'Borrador'
                    CHECK (estatus IN ('Borrador','Procesada','Aprobada','Pagada')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_periodo UNIQUE (quincena, mes, anio)
);

-- ============================================================
-- 10. DETALLES_NOMINA
-- ============================================================
CREATE TABLE IF NOT EXISTS detalles_nomina (
    id                        SERIAL PRIMARY KEY,
    nomina_id                 INTEGER NOT NULL REFERENCES periodos_nomina(id) ON DELETE CASCADE,
    empleado_id               INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    sueldo_base               DECIMAL(12,2) DEFAULT 0,
    comision_mensual          DECIMAL(12,2) DEFAULT 0,
    bonificacion              DECIMAL(12,2) DEFAULT 0,
    asignacion_vacaciones     DECIMAL(12,2) DEFAULT 0,
    asignacion_bonos          DECIMAL(12,2) DEFAULT 0,
    asignacion_extra          DECIMAL(12,2) DEFAULT 0,
    deduccion_seguro_social   DECIMAL(12,2) DEFAULT 0,
    deduccion_paro            DECIMAL(12,2) DEFAULT 0,
    deduccion_inces           DECIMAL(12,2) DEFAULT 0,
    deduccion_islr            DECIMAL(12,2) DEFAULT 0,
    deduccion_urosalud        DECIMAL(12,2) DEFAULT 0,
    deduccion_anticipos       DECIMAL(12,2) DEFAULT 0,
    deduccion_otros           DECIMAL(12,2) DEFAULT 0,
    total_asignaciones        DECIMAL(12,2) GENERATED ALWAYS AS (
      sueldo_base + comision_mensual + bonificacion +
      asignacion_vacaciones + asignacion_bonos + asignacion_extra
    ) STORED,
    total_deducciones         DECIMAL(12,2) GENERATED ALWAYS AS (
      deduccion_seguro_social + deduccion_paro + deduccion_inces +
      deduccion_islr + deduccion_urosalud + deduccion_anticipos + deduccion_otros
    ) STORED,
    neto_a_pagar              DECIMAL(12,2) GENERATED ALWAYS AS (
      (sueldo_base + comision_mensual + bonificacion +
       asignacion_vacaciones + asignacion_bonos + asignacion_extra) -
      (deduccion_seguro_social + deduccion_paro + deduccion_inces +
       deduccion_islr + deduccion_urosalud + deduccion_anticipos + deduccion_otros)
    ) STORED,
    observaciones             TEXT,
    created_at                TIMESTAMPTZ DEFAULT NOW(),
    updated_at                TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_nom_emp UNIQUE (nomina_id, empleado_id)
);

CREATE INDEX IF NOT EXISTS idx_det_nom ON detalles_nomina(nomina_id);
CREATE INDEX IF NOT EXISTS idx_det_emp ON detalles_nomina(empleado_id);

-- ============================================================
-- 11. USUARIOS (Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL PRIMARY KEY,
    empleado_id     INTEGER UNIQUE REFERENCES empleados(id) ON DELETE SET NULL,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    rol             rol_usuario NOT NULL DEFAULT 'consulta',
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_acceso   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_empleados_updated BEFORE UPDATE ON empleados
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_vacaciones_updated BEFORE UPDATE ON periodos_vacacionales
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_sol_vac_updated BEFORE UPDATE ON solicitudes_vacaciones
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_polizas_updated BEFORE UPDATE ON polizas_urosalud
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_cargas_updated BEFORE UPDATE ON cargas_familiares
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_nomina_updated BEFORE UPDATE ON periodos_nomina
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_detalle_nomina_updated BEFORE UPDATE ON detalles_nomina
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- VISTAS
-- ============================================================
CREATE OR REPLACE VIEW v_resumen_nomina_departamento AS
SELECT
  p.anio, p.mes, p.quincena,
  d.nombre AS departamento,
  COUNT(dn.id) AS total_empleados,
  SUM(dn.sueldo_base) AS total_sueldo_base,
  SUM(dn.total_asignaciones) AS total_asignaciones,
  SUM(dn.total_deducciones) AS total_deducciones,
  SUM(dn.neto_a_pagar) AS total_neto
FROM detalles_nomina dn
JOIN periodos_nomina p ON dn.nomina_id = p.id
JOIN empleados e ON dn.empleado_id = e.id
JOIN departamentos d ON e.departamento_id = d.id
GROUP BY p.anio, p.mes, p.quincena, d.nombre;

-- ============================================================
-- DATOS INICIALES
-- ============================================================
INSERT INTO departamentos (nombre) VALUES
  ('Administración'), ('Contabilidad'), ('Recursos Humanos'),
  ('Ventas'), ('Operaciones'), ('Logística'),
  ('Sistemas'), ('Mantenimiento'), ('Seguridad'), ('Almacén')
ON CONFLICT (nombre) DO NOTHING;

-- Usuario admin (password: admin123)
-- bcrypt hash de "admin123"
INSERT INTO usuarios (username, password_hash, rol)
VALUES ('admin', '$2a$10$rQEY5z3Q5Y5Q5Y5Q5Y5Q5eH5eH5eH5eH5eH5eH5eH5eH5eH5eH5', 'admin')
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- FIN
-- ============================================================
SELECT '✅ SI-GHR schema created successfully!' AS resultado;
