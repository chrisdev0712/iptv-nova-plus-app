Add-Type -AssemblyName System.Drawing

$width = 400
$height = 400
$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Background gradient
$rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
$c1 = [System.Drawing.Color]::FromArgb(255, 6, 10, 20)
$c2 = [System.Drawing.Color]::FromArgb(255, 13, 22, 42)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 45.0
$g.FillRectangle($brush, $rect)

# Inner rounded circle
$innerRect = New-Object System.Drawing.Rectangle 40, 40, 320, 320
$iconBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $innerRect, ([System.Drawing.Color]::FromArgb(255, 6, 182, 212)), ([System.Drawing.Color]::FromArgb(255, 59, 130, 246)), 45.0
$g.FillEllipse($iconBrush, $innerRect)

# Text "NP"
$font = New-Object System.Drawing.Font "Arial", 110, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g.DrawString("NP", $font, $whiteBrush, 200, 200, $sf)

$bmp.Save("platforms/webos/icon_400x400.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host "Generated platforms/webos/icon_400x400.png"
