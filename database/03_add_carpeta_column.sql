-- Migration: Add carpeta (folder) column to documentos_empleado
-- This enables organizing employee documents into virtual folders

ALTER TABLE documentos_empleado
ADD COLUMN IF NOT EXISTS carpeta VARCHAR(100);

COMMENT ON COLUMN documentos_empleado.carpeta IS
  'Carpeta virtual para organizar documentos del expediente';

-- Create an index for faster folder-based queries
CREATE INDEX IF NOT EXISTS idx_docs_carpeta
ON documentos_empleado(carpeta)
WHERE carpeta IS NOT NULL;
