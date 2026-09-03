# SI-GHR Database Schema - Toyotachira S.A.

## Descripción

Esquema de base de datos PostgreSQL para el **Sistema Integral de Gestión de Recursos Humanos y Expediente Digital (SI-GHR)**.

## Estructura de Tablas

### Módulo de Expedientes y Personal
| Tabla | Descripción |
|-------|-------------|
| `departamentos` | Catálogo de departamentos |
| `empleados` | Información maestra del personal |
| `documentos_empleado` | Archivos digitalizados del expediente |
| `examenes_medicos_reposos` | Control médico y reposos |

### Módulo de Vacaciones
| Tabla | Descripción |
|-------|-------------|
| `periodos_vacacionales` | Días acumulados/disfrutados por año |
| `solicitudes_vacaciones` | Solicitudes con exportación a PDF |

### Módulo Seguro Médico Urosalud
| Tabla | Descripción |
|-------|-------------|
| `polizas_urosalud` | Pólizas de seguro médico |
| `cargas_familiares` | Beneficiarios de la póliza |

### Módulo de Nómina
| Tabla | Descripción |
|-------|-------------|
| `periodos_nomina` | Períodos quincenales (1ra/2da) |
| `detalles_nomina` | Asignaciones y deducciones por empleado |

### Auditoría
| Tabla | Descripción |
|-------|-------------|
| `auditoria_cambios` | Log de cambios para trazabilidad |

## Vistas

- `v_resumen_nomina_departamento`: Resumen de nómina agrupado por departamento
- `v_estado_vacacional`: Estado vacacional por empleado
- `v_resumen_urosalud`: Resumen de pólizas con cargas familiares

## Instalación

### Prerrequisitos
- PostgreSQL 14+
- Permisos de creación de esquemas

### Pasos

```bash
# 1. Conectar a PostgreSQL
psql -U postgres -d tu_base_de_datos

# 2. Ejecutar el schema
\i database/sighr_schema.sql

# 3. Verificar tablas creadas
\dt sighr.*
```

### Para Docker / Coolify

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sighr
      POSTGRES_USER: sighr_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/sighr_schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Relaciones

```
departamentos (1) ──→ (N) empleados
empleados (1) ──→ (N) documentos_empleado
empleados (1) ──→ (N) examenes_medicos_reposos
empleados (1) ──→ (N) periodos_vacacionales
empleados (1) ──→ (N) solicitudes_vacaciones
empleados (1) ──→ (N) polizas_urosalud
polizas_urosalud (1) ──→ (N) cargas_familiares
periodos_nomina (1) ──→ (N) detalles_nomina
empleados (1) ──→ (N) detalles_nomina
```

## Funcionalidades

- **Generated Columns**: Totales calculados automáticamente en `detalles_nomina` y `periodos_vacacionales`
- **Triggers**: Actualización automática de `updated_at`
- **Constraints**: Validación de datos a nivel de base de datos
- **Índices**: Optimización para búsquedas frecuentes
- **Auditoría**: Log completo de cambios

## Mapeo con Archivos Excel

| Archivo Excel | Tabla(s) Relacionada(s) |
|---------------|-------------------------|
| Nomina 1ra y 2da Quincena | `periodos_nomina`, `detalles_nomina` |
| Nomina Por Departamento | `v_resumen_nomina_departamento` |
| Vacaciones | `periodos_vacacionales`, `solicitudes_vacaciones` |
| Hojas de Vida | `empleados`, `documentos_empleado` |

## Notas

- El esquema utiliza `sighr` como namespace para aislar las tablas
- Las columnas GENERATED calculan automáticamente totales
- Las fechas de reposo tienen constraints de coherencia
- La nómina soporta moneda dual (Bs/USD)
