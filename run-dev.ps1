[CmdletBinding()]
param(
    [switch]$ApplyMigrations
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = Join-Path $ProjectRoot 'backend'
$FrontendPath = Join-Path $ProjectRoot 'frontend'
$Python = 'python'
$BackendProcess = $null
$FrontendProcess = $null

function Assert-Command([string]$Name, [string]$InstallHint) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name tidak ditemukan. $InstallHint"
    }
}

function Invoke-Checked([string]$File, [string[]]$Arguments, [string]$WorkingDirectory) {
    Push-Location $WorkingDirectory
    try {
        & $File @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "Perintah gagal: $File $($Arguments -join ' ')"
        }
    }
    finally {
        Pop-Location
    }
}

function Test-PythonDependencies {
    Push-Location $BackendPath
    try {
        & $Python -c "import django, environ, pymysql, rest_framework, django_filters, corsheaders, drf_spectacular"
        return $LASTEXITCODE -eq 0
    }
    finally {
        Pop-Location
    }
}

function Stop-ChildProcesses {
    foreach ($Process in @($BackendProcess, $FrontendProcess)) {
        if ($null -ne $Process -and -not $Process.HasExited) {
            Write-Host "Menghentikan process $($Process.Id)..." -ForegroundColor Yellow
            Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
        }
    }
}

function Assert-PortAvailable([int]$Port) {
    $Connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $Connection) {
        $Owner = Get-Process -Id $Connection.OwningProcess -ErrorAction SilentlyContinue
        $OwnerName = if ($null -ne $Owner) { $Owner.ProcessName } else { 'unknown process' }
        throw "Port $Port sedang digunakan oleh $OwnerName (PID $($Connection.OwningProcess)). Hentikan process tersebut atau gunakan terminal yang sudah berjalan."
    }
}

try {
    Assert-Command 'node' 'Install Node.js LTS terlebih dahulu.'
    Assert-Command 'npm' 'Install Node.js LTS terlebih dahulu.'
    Assert-Command 'python' 'Install Python 3.11+ dan tambahkan ke PATH, atau ubah variabel $Python di script.'

    if (-not (Test-Path (Join-Path $BackendPath '.env'))) {
        throw "backend/.env tidak ditemukan. Salin backend/.env.example menjadi backend/.env lalu isi konfigurasi database."
    }

    Write-Host '[1/6] Memeriksa dependency backend...' -ForegroundColor Cyan
    if (-not (Test-PythonDependencies)) {
        Write-Host 'Dependency backend belum lengkap. Menjalankan pip install...' -ForegroundColor Yellow
        Invoke-Checked $Python @('-m', 'pip', 'install', '-r', 'requirements.txt') $BackendPath
    }
    else {
        Write-Host 'Dependency backend sudah tersedia.' -ForegroundColor Green
    }

    Write-Host '[2/6] Memeriksa dependency frontend...' -ForegroundColor Cyan
    $NodeModulesPath = Join-Path $FrontendPath 'node_modules'
    $FrontendDependenciesReady = $false
    if (Test-Path $NodeModulesPath) {
        Push-Location $FrontendPath
        try {
            & npm ls --depth=0 --silent *> $null
            $FrontendDependenciesReady = $LASTEXITCODE -eq 0
        }
        finally {
            Pop-Location
        }
    }
    if (-not $FrontendDependenciesReady) {
        Write-Host 'Dependency frontend belum tersedia. Menjalankan npm install...' -ForegroundColor Yellow
        Invoke-Checked 'npm' @('install') $FrontendPath
    }
    else {
        Write-Host 'Dependency frontend sudah tersedia.' -ForegroundColor Green
    }

    Write-Host '[3/6] Memeriksa port aplikasi...' -ForegroundColor Cyan
    Assert-PortAvailable 8000
    Assert-PortAvailable 5000

    Write-Host '[4/6] Memeriksa konfigurasi Django dan koneksi database...' -ForegroundColor Cyan
    Invoke-Checked $Python @('manage.py', 'check', '--database', 'default') $BackendPath

    if ($ApplyMigrations) {
        Write-Host '[5/6] Menerapkan migration Django...' -ForegroundColor Cyan
        Invoke-Checked $Python @('manage.py', 'migrate') $BackendPath
    }
    else {
        Write-Host '[5/6] Migration dilewati. Gunakan -ApplyMigrations jika memang diperlukan.' -ForegroundColor Yellow
    }

    Write-Host '[6/6] Menjalankan backend dan frontend...' -ForegroundColor Cyan
    $BackendProcess = Start-Process -FilePath $Python -ArgumentList @('manage.py', 'runserver', '127.0.0.1:8000') -WorkingDirectory $BackendPath -PassThru -NoNewWindow
    $FrontendProcess = Start-Process -FilePath 'npm.cmd' -ArgumentList @('run', 'dev') -WorkingDirectory $FrontendPath -PassThru -NoNewWindow

    Write-Host ''
    Write-Host 'Backend : http://127.0.0.1:8000' -ForegroundColor Green
    Write-Host 'API     : http://127.0.0.1:8000/api/' -ForegroundColor Green
    Write-Host 'Frontend: http://localhost:5000' -ForegroundColor Green
    Write-Host 'Tekan Ctrl+C untuk menghentikan keduanya.' -ForegroundColor Yellow

    while (-not $BackendProcess.HasExited -and -not $FrontendProcess.HasExited) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Stop-ChildProcesses
}
