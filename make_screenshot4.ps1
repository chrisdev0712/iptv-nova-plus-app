Add-Type -AssemblyName System.Drawing

$bmp = [System.Drawing.Bitmap]::new(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# 1. Dark player video screen background (Space / Movie scene mockup)
$grad = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(0, 0), [System.Drawing.Point]::new(1920, 1080), [System.Drawing.Color]::FromArgb(10, 15, 30), [System.Drawing.Color]::FromArgb(2, 6, 23))
$g.FillRectangle($grad, 0, 0, 1920, 1080)

# Big movie title watermark in center
$centerTitle = [System.Drawing.Font]::new('Segoe UI', [float]48, [System.Drawing.FontStyle]::Bold)
$g.DrawString('Avatar: El Camino del Agua (4K UHD)', $centerTitle, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(120, 255, 255, 255)), 450, 420)

# 2. Top OSD Bar (Back, Title, Live/VOD badge)
$topOsd = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, 15, 23, 42))
$g.FillRectangle($topOsd, 0, 0, 1920, 110)

$titleFont = [System.Drawing.Font]::new('Segoe UI', [float]24, [System.Drawing.FontStyle]::Bold)
$g.DrawString('<- Volver', [System.Drawing.Font]::new('Segoe UI', [float]18, [System.Drawing.FontStyle]::Regular), [System.Drawing.Brushes]::LightGray, 60, 38)
$g.DrawString('Avatar: El Camino del Agua', $titleFont, [System.Drawing.Brushes]::White, 200, 32)

$badgeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(37, 99, 235))
$g.FillRectangle($badgeBrush, 1680, 32, 180, 45)
$g.DrawString('ULTRA HD 4K', [System.Drawing.Font]::new('Segoe UI', [float]14, [System.Drawing.FontStyle]::Bold), [System.Drawing.Brushes]::White, 1705, 44)

# 3. Settings Gear Modal / OSD Drawer on the right (Audio, Subtitles, Aspect Ratio, Speed)
$drawerRect = [System.Drawing.Rectangle]::new(1280, 110, 640, 830)
$drawerBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(240, 17, 24, 39))
$g.FillRectangle($drawerBrush, $drawerRect)
$g.DrawRectangle([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(51, 65, 85), 2), $drawerRect)

$drawerTitleFont = [System.Drawing.Font]::new('Segoe UI', [float]22, [System.Drawing.FontStyle]::Bold)
$g.DrawString('Ajustes del Reproductor', $drawerTitleFont, [System.Drawing.Brushes]::White, 1320, 140)

$sectionFont = [System.Drawing.Font]::new('Segoe UI', [float]15, [System.Drawing.FontStyle]::Bold)
$itemFont = [System.Drawing.Font]::new('Segoe UI', [float]14, [System.Drawing.FontStyle]::Regular)
$cyanBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(56, 189, 248))
$grayBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(148, 163, 184))

# Section: Audio
$g.DrawString('PISTA DE AUDIO', $sectionFont, $cyanBrush, 1320, 200)
$g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 58, 138)), 1320, 230, 560, 45)
$g.DrawString('* Espanol Latino (Dolby Digital 5.1)', $itemFont, [System.Drawing.Brushes]::White, 1340, 242)
$g.DrawString('  Ingles Original (Dolby Atmos)', $itemFont, $grayBrush, 1340, 290)

# Section: Subtitles
$g.DrawString('SUBTITULOS', $sectionFont, $cyanBrush, 1320, 360)
$g.DrawString('  Desactivados', $itemFont, $grayBrush, 1340, 395)
$g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 58, 138)), 1320, 435, 560, 45)
$g.DrawString('* Espanol (Completos)', $itemFont, [System.Drawing.Brushes]::White, 1340, 447)
$g.DrawString('  Ingles (CC)', $itemFont, $grayBrush, 1340, 495)

# Section: Relacion de Aspecto
$g.DrawString('RELACION DE ASPECTO', $sectionFont, $cyanBrush, 1320, 565)
$g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 58, 138)), 1320, 600, 170, 45)
$g.DrawString('* 16:9 Estandar', $itemFont, [System.Drawing.Brushes]::White, 1335, 612)

$g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 41, 59)), 1510, 600, 170, 45)
$g.DrawString('Ajustar a Pantalla', $itemFont, $grayBrush, 1520, 612)

$g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 41, 59)), 1700, 600, 170, 45)
$g.DrawString('Zoom', $itemFont, $grayBrush, 1750, 612)

# Section: Velocidad
$g.DrawString('VELOCIDAD DE REPRODUCCION', $sectionFont, $cyanBrush, 1320, 680)
$g.DrawString('1.0x (Normal) | 1.25x | 1.5x', $itemFont, [System.Drawing.Brushes]::White, 1320, 715)

# 4. Bottom Player Controls Bar
$botOsd = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, 15, 23, 42))
$g.FillRectangle($botOsd, 0, 940, 1920, 140)

# Progress Bar
$progBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(51, 65, 85))
$g.FillRectangle($progBg, 60, 965, 1800, 8)
$progFill = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(56, 189, 248))
$g.FillRectangle($progFill, 60, 965, 780, 8)

# Time code
$timeFont = [System.Drawing.Font]::new('Segoe UI', [float]14, [System.Drawing.FontStyle]::Bold)
$g.DrawString('01:14:22 / 03:12:00', $timeFont, [System.Drawing.Brushes]::White, 60, 990)

# Controls hints
$hintFont = [System.Drawing.Font]::new('Segoe UI', [float]13, [System.Drawing.FontStyle]::Regular)
$g.DrawString('[OK] Pausa/Reanudar   [◀◀ ▶▶] Saltar 10s   [Arriba] Menu Ajustes   [Atras] Salir', $hintFont, $grayBrush, 1280, 990)

# Save
$dest = 'C:\Proyectos\TV\platforms\tizen\screenshot4_player.png'
$bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
# Also copy to webos
Copy-Item $dest 'C:\Proyectos\TV\platforms\webos\screenshot4_player.png' -Force

$bmp.Dispose()
$g.Dispose()
Write-Output 'SCREENSHOT4_OK'

