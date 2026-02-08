# Загрузка WOFF2 шрифтов (Fontsource) в assets/fonts для локального подключения.
# Запуск: из корня репозитория: .\scripts\download-fonts.ps1

$ErrorActionPreference = 'Stop'
$baseUrl = 'https://cdn.jsdelivr.net/npm'
$fontDir = Join-Path $PSScriptRoot '..\assets\fonts'

if (-not (Test-Path $fontDir)) {
    New-Item -ItemType Directory -Path $fontDir -Force | Out-Null
}

$files = @(
    @{ pkg = '@fontsource-variable/inter@5.0.0'; file = 'inter-latin-wght-normal.woff2' },
    @{ pkg = '@fontsource-variable/inter@5.0.0'; file = 'inter-cyrillic-wght-normal.woff2' },
    @{ pkg = '@fontsource-variable/oswald@5.0.0'; file = 'oswald-latin-wght-normal.woff2' },
    @{ pkg = '@fontsource-variable/oswald@5.0.0'; file = 'oswald-cyrillic-wght-normal.woff2' },
    @{ pkg = '@fontsource-variable/jetbrains-mono@5.0.0'; file = 'jetbrains-mono-latin-wght-normal.woff2' }
)

foreach ($f in $files) {
    $url = "$baseUrl/$($f.pkg)/files/$($f.file)"
    $out = Join-Path $fontDir $f.file
    Write-Host "Downloading $($f.file)..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
        Write-Host "  OK"
    } catch {
        Write-Warning "  Failed: $_"
    }
}

Write-Host "Done. Fonts in $fontDir"
