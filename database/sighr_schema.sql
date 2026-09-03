-- ============================================================
-- SISTEMA INTEGRAL DE GESTIÓN DE RECURSOS HUMANOS (SI-GHR)
-- Toyotachira S.A.
-- PostgreSQL Schema DDL
-- ============================================================

-- Crear esquema dedicado para el sistema
CREATE SCHEMA IF NOT EXISTS sighr;

-- Establecer search path
SET search_path TO sighr, public;

-- ============================================================
-- TABLA: DEPARTAMENTOS
-- Catálogo de departamentos de la empresa
-- ============================================================
CREATE TABLE departamentos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    descripcion     TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE departamentos IS 'Catálogo de departamentos de Toyotachira S.A.';

-- ============================================================
-- TABLA: EMPLEADOS
-- Información maestra del personal (datos base de nómina + hojas de vida)
-- ============================================================
CREATE TABLE empleados (
    id                  SERIAL PRIMARY KEY,
    nro                 INTEGER NOT NULL UNIQUE,  -- Número de empleado/registro
    cedula              VARCHAR(20) NOT NULL UNIQUE,  -- Cédula de identidad
    nombre_completo     VARCHAR(150) NOT NULL,
    departamento_id     INTEGER NOT NULL REFERENCES departamentos(id) ON DELETE RESTRICT,
    posicion_cargo      VARCHAR(100),  -- Cargo o posición
    fecha_ingreso       DATE NOT NULL,
    salario_base        DECIMAL(12, 2) NOT NULL CHECK (salario_base >= 0),
    estado_operativo    VARCHAR(20) NOT NULL DEFAULT 'Activo'
                        CHECK (estado_operativo IN ('Activo', 'Vacaciones', 'Reposo', 'Egreso')),
    tipo_tasa           VARCHAR(10),  -- Bs, USD, etc.
    porcentaje_bs       DECIMAL(5, 2),  -- % en Bolívares
    porcentaje_usd      DECIMAL(5, 2),  -- % en Dólares
    grupo               VARCHAR(50),  -- Grupo de empleado
    email               VARCHAR(150),
    telefono            VARCHAR(30),
    direccion           TEXT,
    foto_url            VARCHAR(500),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE empleados IS 'Información maestra del personal de Toyotachira S.A.';
COMMENT ON COLUMN empleados.estado_operativo IS 'Estado: Activo, Vacaciones, Reposo, Egreso';
COMMENT ON COLUMN empleados.tipo_tasa IS 'Tipo de tasa salarial: Bs o USD';

-- Índices para búsquedas frecuentes
CREATE INDEX idx_empleados_departamento ON empleados(departamento_id);
CREATE INDEX idx_empleados_estado ON empleados(estado_operativo);
CREATE INDEX idx_empleados_nombre ON empleados(nombre_completo);

-- ============================================================
-- TABLA: DOCUMENTOS_EMPLEADO
-- Repositorio digitalizado de archivos obligatorios
-- ============================================================
CREATE TABLE documentos_empleado (
    id              SERIAL PRIMARY KEY,
    empleado_id     INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    tipo_documento  VARCHAR(50) NOT NULL
                    CHECK (tipo_documento IN (
                        'Cédula', 'RIF', 'Título', 'Contrato',
                        'Hoja de Vida', 'Certificado Médico',
                        'Constancia de Salario', 'Otros'
                    )),
    nombre_archivo  VARCHAR(255) NOT NULL,
    ruta_archivo    VARCHAR(500) NOT NULL,  -- Ruta o URL del archivo
    fecha_registro  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observaciones   TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE documentos_empleado IS 'Archivos digitalizados del expediente del empleado';

CREATE INDEX idx_docs_empleado ON documentos_empleado(empleado_id);
CREATE INDEX idx_docs_tipo ON documentos_empleado(tipo_documento);

-- ============================================================
-- TABLA: EXAMENES_MEDICOS_REPOSOS
-- Control médico y ausencias laborales
-- ============================================================
CREATE TABLE examenes_medicos_reposos (
    id                  SERIAL PRIMARY KEY,
    empleado_id         INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    tipo_registro       VARCHAR(50) NOT NULL
                        CHECK (tipo_registro IN (
                            'Examen Ocupacional',
                            'Laboratorio',
                            'Reposo Médico',
                            'Control Periódico',
                            'Otro'
                        )),
    fecha_registro      DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_inicio        DATE,  -- Fecha inicio de reposo (si aplica)
    fecha_fin           DATE,  -- Fecha fin de reposo
    fecha_reintegro     DATE,  -- Fecha de reintegro al trabajo
    diagnostico         TEXT,
    observaciones       TEXT,
    ruta_adjunto        VARCHAR(500),  -- URL/ruta del documento escaneado
    medico_responsable  VARCHAR(150),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Validar coherencia de fechas
    CONSTRAINT chk_fechas_reposo CHECK (
        fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio
    ),
    CONSTRAINT chk_reintegro CHECK (
        fecha_reintegro IS NULL OR fecha_inicio IS NULL OR fecha_reintegro >= fecha_inicio
    )
);

COMMENT ON TABLE examenes_medicos_reposos IS 'Registro de exámenes médicos, control y reposos del empleado';

CREATE INDEX idx_examenes_empleado ON examenes_medicos_reposos(empleado_id);
CREATE INDEX idx_examenes_tipo ON examenes_medicos_reposos(tipo_registro);
CREATE INDEX idx_examenes_fechas ON examenes_medicos_reposos(fecha_inicio, fecha_reintegro);

-- ============================================================
-- TABLA: PERIODOS_VACACIONALES
-- Cálculo de días acumulados y disfrutados por año
-- ============================================================
CREATE TABLE periodos_vacacionales (
    id                  SERIAL PRIMARY KEY,
    empleado_id         INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    anio_periodo        INTEGER NOT NULL CHECK (anio_periodo >= 2000 AND anio_periodo <= 2100),
    dias_acumulados     INTEGER NOT NULL DEFAULT 0 CHECK (dias_acumulados >= 0),
    dias_disfrute       INTEGER NOT NULL DEFAULT 0 CHECK (dias_disfrute >= 0),
    dias_pendientes     INTEGER GENERATED ALWAYS AS (dias_acumulados - dias_disfrute) STORED,
    salario_diario      DECIMAL(12, 2),  -- Salario diario para cálculo de vacaciones
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Un solo registro por empleado por año
    CONSTRAINT uq_empleado_anio UNIQUE (empleado_id, anio_periodo),
    CONSTRAINT chk_dias CHECK (dias_disfrute <= dias_acumulados)
);

COMMENT ON TABLE periodos_vacacionales IS 'Control de días vacacionales por empleado y año';
COMMENT ON COLUMN periodos_vacacionales.dias_pendientes IS 'Días pendientes calculados automáticamente (acumulados - disfrutados)';

CREATE INDEX idx_vacaciones_empleado ON periodos_vacacionales(empleado_id);
CREATE INDEX idx_vacaciones_anio ON periodos_vacacionales(anio_periodo);

-- ============================================================
-- TABLA: SOLICITUDES_VACACIONES
-- Registro y control de solicitudes (exportación a PDF para firmas)
-- ============================================================
CREATE TABLE solicitudes_vacaciones (
    id                  SERIAL PRIMARY KEY,
    empleado_id         INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    periodo_vacacional_id INTEGER REFERENCES periodos_vacacionales(id) ON DELETE SET NULL,
    fecha_salida        DATE NOT NULL,
    fecha_regreso       DATE NOT NULL,
    dias_solicitados    INTEGER NOT NULL CHECK (dias_solicitados > 0),
    estado              VARCHAR(20) NOT NULL DEFAULT 'Solicitada'
                        CHECK (estado IN ('Solicitada', 'Aprobada', 'Rechazada', 'Disfrutada', 'Cancelada')),
    motivo              TEXT,
    aprobado_por        VARCHAR(150),
    fecha_aprobacion    TIMESTAMP WITH TIME ZONE,
    archivo_pdf         VARCHAR(500),  -- Ruta del PDF generado
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Validar que regreso sea después de salida
    CONSTRAINT chk_fechas_vacaciones CHECK (fecha_regreso > fecha_salida)
);

COMMENT ON TABLE solicitudes_vacaciones IS 'Solicitudes de vacaciones con exportación a PDF para firmas';

CREATE INDEX idx_sol_vac_empleado ON solicitudes_vacaciones(empleado_id);
CREATE INDEX idx_sol_vac_estado ON solicitudes_vacaciones(estado);
CREATE INDEX idx_sol_vac_fechas ON solicitudes_vacaciones(fecha_salida, fecha_regreso);

-- ============================================================
-- TABLA: POLIZAS_UROSALUD
-- Panel administrativo de pólizas de seguro médico
-- ============================================================
CREATE TABLE polizas_urosalud (
    id                  SERIAL PRIMARY KEY,
    empleado_id         INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    numero_poliza       VARCHAR(50) UNIQUE,
    fecha_afiliacion    DATE NOT NULL,
    fecha_vencimiento   DATE,
    asesor              VARCHAR(150),  -- Asesor comercial de Urosalud
    plan_contratado     VARCHAR(100) NOT NULL,  -- Ej: Plan Platinum 2, Plan Plus
    monto_prima         DECIMAL(12, 2) NOT NULL CHECK (monto_prima >= 0),
    moneda              VARCHAR(3) DEFAULT 'Bs' CHECK (moneda IN ('Bs', 'USD')),
    estado              VARCHAR(20) NOT NULL DEFAULT 'Activa'
                        CHECK (estado IN ('Activa', 'Suspendida', 'Cancelada', 'Vencida')),
    observaciones       TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE polizas_urosalud IS 'Pólizas de seguro médico Urosalud asociadas a empleados';

CREATE INDEX idx_polizas_empleado ON polizas_urosalud(empleado_id);
CREATE INDEX idx_polizas_estado ON polizas_urosalud(estado);
CREATE INDEX idx_polizas_plan ON polizas_urosalud(plan_contratado);

-- ============================================================
-- TABLA: CARGAS_FAMILIARES
-- Beneficiarios asociados a la póliza del titular
-- ============================================================
CREATE TABLE cargas_familiares (
    id                      SERIAL PRIMARY KEY,
    poliza_id               INTEGER NOT NULL REFERENCES polizas_urosalud(id) ON DELETE CASCADE,
    nombre_completo         VARCHAR(150) NOT NULL,
    cedula_o_identificador  VARCHAR(30),  -- Cédula o pasaporte
    parentesco              VARCHAR(30) NOT NULL
                            CHECK (parentesco IN (
                                'Hijo/a', 'Cónyuge', 'Concubino/a',
                                'Padre', 'Madre', 'Hermano/a', 'Otro'
                            )),
    fecha_nacimiento        DATE,
    edad                    INTEGER CHECK (edad >= 0 AND edad <= 120),
    sexo                    VARCHAR(10) CHECK (sexo IN ('M', 'F')),
    plan                    VARCHAR(100),  -- Plan asignado (puede diferir del titular)
    estado                  VARCHAR(20) DEFAULT 'Activo'
                            CHECK (estado IN ('Activo', 'Inactivo')),
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE cargas_familiares IS 'Beneficiarios (cargas familiares) de la póliza Urosalud';

CREATE INDEX idx_cargas_poliza ON cargas_familiares(poliza_id);
CREATE INDEX idx_cargas_parentesco ON cargas_familiares(parentesco);

-- ============================================================
-- TABLA: PERIODOS_NOMINA
-- Control quincenal de nómina (1ra y 2da quincena)
-- ============================================================
CREATE TABLE periodos_nomina (
    id              SERIAL PRIMARY KEY,
    quincena        SMALLINT NOT NULL CHECK (quincena IN (1, 2)),  -- 1ra o 2da
    mes             SMALLINT NOT NULL CHECK (mes >= 1 AND mes <= 12),
    anio            INTEGER NOT NULL CHECK (anio >= 2000 AND anio <= 2100),
    fecha_inicio    DATE NOT NULL,
    fecha_fin       DATE NOT NULL,
    estatus         VARCHAR(20) NOT NULL DEFAULT 'Borrador'
                    CHECK (estatus IN ('Borrador', 'Procesada', 'Aprobada', 'Pagada')),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Un solo registro por quincena/mes/año
    CONSTRAINT uq_periodo_nomina UNIQUE (quincena, mes, anio),
    CONSTRAINT chk_fechas_nomina CHECK (fecha_fin > fecha_inicio)
);

COMMENT ON TABLE periodos_nomina IS 'Períodos quincenales de nómina';

CREATE INDEX idx_nomina_periodo ON periodos_nomina(anio, mes, quincena);
CREATE INDEX idx_nomina_estatus ON periodos_nomina(estatus);

-- ============================================================
-- TABLA: DETALLES_NOMINA
-- Registro de asignaciones y deducciones por empleado por período
-- ============================================================
CREATE TABLE detalles_nomina (
    id                      SERIAL PRIMARY KEY,
    nomina_id               INTEGER NOT NULL REFERENCES periodos_nomina(id) ON DELETE CASCADE,
    empleado_id             INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    -- ASIGNACIONES
    sueldo_base             DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (sueldo_base >= 0),
    comision_mensual        DECIMAL(12, 2) DEFAULT 0 CHECK (comision_mensual >= 0),
    bonificacion            DECIMAL(12, 2) DEFAULT 0 CHECK (bonificacion >= 0),
    asignacion_vacaciones    DECIMAL(12, 2) DEFAULT 0 CHECK (asignacion_vacaciones >= 0),
    asignacion_bonos        DECIMAL(12, 2) DEFAULT 0 CHECK (asignacion_bonos >= 0),
    asignacion_extra        DECIMAL(12, 2) DEFAULT 0 CHECK (asignacion_extra >= 0),
    -- DEDUCCIONES DE LEY
    deduccion_seguro_social DECIMAL(12, 2) DEFAULT 0 CHECK (deduccion_seguro_social >= 0),
    deduccion_paro          DECIMAL(12, 2) DEFAULT 0 CHECK (deduccion_paro >= 0),
    deduccion_inces         DECIMAL(12, 2) DEFAULT 0 CHECK (deduccion_inces >= 0),
    deduccion_islr          DECIMAL(12, 2) DEFAULT 0 CHECK (deduccion_islr >= 0),
    -- OTRAS DEDUCCIONES
    deduccion_urosalud      DECIMAL(12, 2) DEFAULT 0 CHECK (deduccion_urosalud >= 0),
    deduccion_anticipos     DECIMAL(12, 2) DEFAULT 0 CHECK (deduccion_anticipos >= 0),
    deduccion_otros         DECIMAL(12, 2) DEFAULT 0 CHECK (deduccion_otros >= 0),
    -- TOTALES CALCULADOS
    total_asignaciones      DECIMAL(12, 2) GENERATED ALWAYS AS (
                                sueldo_base + comision_mensual + bonificacion +
                                asignacion_vacaciones + asignacion_bonos + asignacion_extra
                            ) STORED,
    total_deducciones       DECIMAL(12, 2) GENERATED ALWAYS AS (
                                deduccion_seguro_social + deduccion_paro +
                                deduccion_inces + deduccion_islr +
                                deduccion_urosalud + deduccion_anticipos + deduccion_otros
                            ) STORED,
    neto_a_pagar            DECIMAL(12, 2) GENERATED ALWAYS AS (
                                (sueldo_base + comision_mensual + bonificacion +
                                 asignacion_vacaciones + asignacion_bonos + asignacion_extra) -
                                (deduccion_seguro_social + deduccion_paro +
                                 deduccion_inces + deduccion_islr +
                                 deduccion_urosalud + deduccion_anticipos + deduccion_otros)
                            ) STORED,
    observaciones           TEXT,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Un solo detalle por empleado por nómina
    CONSTRAINT uq_nomina_empleado UNIQUE (nomina_id, empleado_id)
);

COMMENT ON TABLE detalles_nomina IS 'Detalle de nómina: asignaciones y deducciones por empleado por período';
COMMENT ON COLUMN detalles_nomina.total_asignaciones IS 'Suma automática de todas las asignaciones';
COMMENT ON COLUMN detalles_nomina.total_deducciones IS 'Suma automática de todas las deducciones';
COMMENT ON COLUMN detalles_nomina.neto_a_pagar IS 'Monto neto calculado: asignaciones - deducciones';

CREATE INDEX idx_detalle_nomina ON detalles_nomina(nomina_id);
CREATE INDEX idx_detalle_empleado ON detalles_nomina(empleado_id);
CREATE INDEX idx_detalle_neto ON detalles_nomina(neto_a_pagar);

-- ============================================================
-- TABLA: AUDITORIA_CAMBIOS
-- Registro de cambios importantes para trazabilidad
-- ============================================================
CREATE TABLE auditoria_cambios (
    id              SERIAL PRIMARY KEY,
    tabla_afectada  VARCHAR(50) NOT NULL,
    registro_id     INTEGER NOT NULL,
    accion          VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
    datos_anteriores JSONB,
    datos_nuevos    JSONB,
    usuario         VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE auditoria_cambios IS 'Log de auditoría para trazabilidad de cambios';

CREATE INDEX idx_auditoria_tabla ON auditoria_cambios(tabla_afectada);
CREATE INDEX idx_auditoria_registro ON auditoria_cambios(registro_id);
CREATE INDEX idx_auditoria_fecha ON auditoria_cambios(created_at);

-- ============================================================
-- FUNCIONES TRIGGER
-- ============================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at a las tablas relevantes
CREATE TRIGGER trg_empleados_updated
    BEFORE UPDATE ON empleados
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_examenes_updated
    BEFORE UPDATE ON examenes_medicos_reposos
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_vacaciones_updated
    BEFORE UPDATE ON periodos_vacacionales
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_sol_vacaciones_updated
    BEFORE UPDATE ON solicitudes_vacaciones
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_polizas_updated
    BEFORE UPDATE ON polizas_urosalud
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_cargas_updated
    BEFORE UPDATE ON cargas_familiares
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_periodos_nomina_updated
    BEFORE UPDATE ON periodos_nomina
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_detalles_nomina_updated
    BEFORE UPDATE ON detalles_nomina
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================
-- VISTA: RESUMEN NÓMINA POR DEPARTAMENTO
-- Equivalente al reporte "Por Departamento" de los Excel
-- ============================================================
CREATE VIEW v_resumen_nomina_departamento AS
SELECT
    p.anio,
    p.mes,
    p.quincena,
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
GROUP BY p.anio, p.mes, p.quincena, d.nombre
ORDER BY p.anio, p.mes, p.quincena, d.nombre;

COMMENT ON VIEW v_resumen_nomina_departamento IS 'Resumen de nómina agrupado por departamento (equivalente a reporte Excel)';

-- ============================================================
-- VISTA: ESTADO VACACIONAL POR EMPLEADO
-- ============================================================
CREATE VIEW v_estado_vacacional AS
SELECT
    e.id AS empleado_id,
    e.nro,
    e.nombre_completo,
    d.nombre AS departamento,
    pv.anio_periodo,
    pv.dias_acumulados,
    pv.dias_disfrute,
    pv.dias_pendientes,
    e.estado_operativo
FROM empleados e
JOIN departamentos d ON e.departamento_id = d.id
LEFT JOIN periodos_vacacionales pv ON e.id = pv.empleado_id
WHERE e.estado_operativo != 'Egreso'
ORDER BY e.nombre_completo, pv.anio_periodo DESC;

COMMENT ON VIEW v_estado_vacacional IS 'Estado vacacional consolidado por empleado';

-- ============================================================
-- VISTA: RESUMEN POLIZAS UROSALUD
-- ============================================================
CREATE VIEW v_resumen_urosalud AS
SELECT
    e.nro,
    e.nombre_completo,
    d.nombre AS departamento,
    p.numero_poliza,
    p.plan_contratado,
    p.monto_prima,
    p.moneda,
    p.fecha_afiliacion,
    p.estado AS estado_poliza,
    COUNT(cf.id) AS total_cargas,
    p.asesor
FROM polizas_urosalud p
JOIN empleados e ON p.empleado_id = e.id
JOIN departamentos d ON e.departamento_id = d.id
LEFT JOIN cargas_familiares cf ON p.id = cf.poliza_id AND cf.estado = 'Activo'
GROUP BY e.nro, e.nombre_completo, d.nombre, p.id
ORDER BY e.nombre_completo;

COMMENT ON VIEW v_resumen_urosalud IS 'Resumen de pólizas Urosalud con conteo de cargas familiares';

-- ============================================================
-- DATOS INICIALES: DEPARTAMENTOS (ejemplo basado en archivos Excel)
-- ============================================================
INSERT INTO departamentos (nombre) VALUES
    ('Administración'),
    ('Contabilidad'),
    ('Recursos Humanos'),
    ('Ventas'),
    ('Operaciones'),
    ('Logística'),
    ('Sistemas'),
    ('Mantenimiento'),
    ('Seguridad'),
    ('Almacén');

-- ============================================================
-- FIN DEL SCHEMA SI-GHR
-- ============================================================
