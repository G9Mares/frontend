param(
  [string]$ListenAddress = '0.0.0.0',
  [ValidateRange(1, 65535)]
  [int]$Port = 4200
)

$ErrorActionPreference = 'Stop'
$nodeVersion = '24.15.0'
$nvmExecutable = Join-Path $env:LOCALAPPDATA 'nvm\nvm.exe'
$nodeDirectory = Join-Path $env:LOCALAPPDATA "nvm\v$nodeVersion"
$npxExecutable = Join-Path $nodeDirectory 'npx.cmd'
$projectDirectory = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path -LiteralPath $nvmExecutable)) {
  throw "NVM was not found at $nvmExecutable."
}

if (-not (Test-Path -LiteralPath $npxExecutable)) {
  throw "Node.js $nodeVersion is not installed through NVM. Run: nvm install $nodeVersion"
}

& $nvmExecutable use $nodeVersion
Set-Location -LiteralPath $projectDirectory

& $npxExecutable ng serve --host $ListenAddress --port $Port
exit $LASTEXITCODE
