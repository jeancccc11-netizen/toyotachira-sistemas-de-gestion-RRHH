-- Migration: Add numero_cuenta and banco columns to empleados
-- Necesario para el recibo de pago (N° DE CUENTA A DEPOSITAR + banco)

ALTER TABLE empleados
ADD COLUMN IF NOT EXISTS numero_cuenta VARCHAR(30),
ADD COLUMN IF NOT EXISTS banco VARCHAR(80);

COMMENT ON COLUMN empleados.numero_cuenta IS
  'Número de cuenta bancaria del empleado para depósito de nómina';
COMMENT ON COLUMN empleados.banco IS
  'Banco de la cuenta del empleado';
