# Backup de Postgres para SI-GHR en Windows (sin depender de pg_dump instalado).
# Usa el contenedor Docker sighr-db si existe; si no, pg_dump.exe del PATH.
#
# Programar con el Programador de tareas (ejecutar como el usuario que corre Docker):
#   schtasks /Create /TN "SI-GHR Backup" /SC DAILY /ST 02:00 ^
#     /TR "powershell -ExecutionPolicy Bypass -File D:\Proyectos\Toyotachira\database\backup-windows.ps1"
param(
  [string]$DestDir = "$env:USERPROFILE\Backups\sighr",
  [int]$MaxFiles = 30
)

$ErrorActionPreference = 'Stop'
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
$out = Join-Path $DestDir "sighr_$stamp.sql"

$inContainer = docker ps --format '{{.Names}}' 2>$null | Select-String -Quiet '^sighr-db$'
if ($inContainer) {
  docker exec sighr-db pg_dump -U postgres -d postgres > $out
} elseif (Get-Command pg_dump -ErrorAction SilentlyContinue) {
  $envFile = Join-Path $PSScriptRoot '..\backend\.env'
  if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
      if ($_ -match '^\s*([A-Z_]+)\s*=\s*(.*)\s*$') { Set-Item -Path "env:$($Matches[1])" -Value $Matches[2] }
    }
  }
  $env:PGPASSWORD = $env:DB_PASSWORD
  pg_dump -h $env:DB_HOST -p $env:DB_PORT -U $env:DB_USER -d $env:DB_NAME > $out
} else {
  Write-Error "Ni el contenedor sighr-db ni pg_dump estan disponibles"
}

if ((Get-Item $out).Length -eq 0) {
  Remove-Item $out
  Write-Error "Backup vacio, se elimino: $out"
}

# Compresion y limpieza de .sql temporal
$gz = "$out.gz"
if (Get-Command gzip -ErrorAction SilentlyContinue) {
  gzip -f $out
} else {
  Compress-Archive -Path $out -DestinationPath $gz -Force
  Remove-Item $out
}

Write-Host "Backup creado: $gz"
Get-ChildItem $DestDir -Filter 'sighr_*.sql.gz' |
  Sort-Object LastWriteTime -Descending |
  Select-Object -Skip $MaxFiles |
  Remove-Item -Force
