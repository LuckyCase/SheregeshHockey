# Создаёт favicon.ico (32x32) в корне проекта — золотое кольцо как в favicon.svg.
# Запуск: .\scripts\make-favicon.ico.ps1

Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
$outPath = Join-Path $root "favicon.ico"

$size = 32
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)
$gold = [System.Drawing.Color]::FromArgb(255, 212, 168, 67)
$pen = New-Object System.Drawing.Pen($gold, 2)
$brush = New-Object System.Drawing.SolidBrush($gold)
$g.DrawEllipse($pen, 2, 2, $size - 4, $size - 4)
$g.FillEllipse($brush, 10, 10, 12, 12)
$icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
try {
    $fs = [System.IO.File]::Create($outPath)
    $icon.Save($fs)
    $fs.Close()
    Write-Host "Created: $outPath"
} finally {
    $bmp.Dispose()
    $g.Dispose()
}
