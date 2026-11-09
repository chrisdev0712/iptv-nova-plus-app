Add-Type -AssemblyName System.Drawing

$solidR = 15
$solidG = 23
$solidB = 42
$solidColor = [System.Drawing.Color]::FromArgb($solidR, $solidG, $solidB) # #0F172A

# ==========================================
# 1. ICON 400x400 (STRICT FLAT SOLID BACKGROUND)
# ==========================================
$iconBmp = [System.Drawing.Bitmap]::new(400, 400)
$gIcon = [System.Drawing.Graphics]::FromImage($iconBmp)
$gIcon.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gIcon.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gIcon.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# SOLID background - absolutely no gradient
$bgBrush = [System.Drawing.SolidBrush]::new($solidColor)
$gIcon.FillRectangle($bgBrush, 0, 0, 400, 400)

# Central Emblem (Modern TV + Play Button)
# Rounded TV frame
$tvRect = [System.Drawing.Rectangle]::new(90, 45, 220, 150)
$tvInnerBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(26, 36, 60))
$gIcon.FillRectangle($tvInnerBrush, $tvRect)

$tvPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(56, 189, 248), 5)
$gIcon.DrawRectangle($tvPen, $tvRect)

# Inner screen
$scRect = [System.Drawing.Rectangle]::new(105, 58, 190, 124)
$scBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(10, 18, 35))
$gIcon.FillRectangle($scBrush, $scRect)

# Play triangle
$p1 = [System.Drawing.Point]::new(185, 95)
$p2 = [System.Drawing.Point]::new(185, 145)
$p3 = [System.Drawing.Point]::new(230, 120)
$poly = @($p1, $p2, $p3)
$playGrad = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(185, 95), [System.Drawing.Point]::new(230, 145), [System.Drawing.Color]::FromArgb(56, 189, 248), [System.Drawing.Color]::FromArgb(236, 72, 153))
$gIcon.FillPolygon($playGrad, $poly)

# TV Stand
$standPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(56, 189, 248), 5)
$gIcon.DrawLine($standPen, 185, 195, 185, 215)
$gIcon.DrawLine($standPen, 215, 195, 215, 215)
$gIcon.DrawLine($standPen, 155, 215, 245, 215)

# Typography: IPTV NOVA
$titleFont = [System.Drawing.Font]::new('Arial', [float]30, [System.Drawing.FontStyle]::Bold)
$sf = [System.Drawing.StringFormat]::new()
$sf.Alignment = [System.Drawing.StringAlignment]::Center

# White text
$gIcon.DrawString('IPTV NOVA', $titleFont, [System.Drawing.Brushes]::White, 200, 235, $sf)

# Rainbow PLUS
$plusFont = [System.Drawing.Font]::new('Arial', [float]32, [System.Drawing.FontStyle]::Bold)
$y = 285
$gIcon.DrawString('P', $plusFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(244, 63, 94)), 135, $y)
$gIcon.DrawString('L', $plusFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(250, 204, 21)), 170, $y)
$gIcon.DrawString('U', $plusFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(52, 211, 153)), 200, $y)
$gIcon.DrawString('S', $plusFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(192, 132, 252)), 235, $y)

# Subtitle
$subFont = [System.Drawing.Font]::new('Arial', [float]11, [System.Drawing.FontStyle]::Bold)
$gIcon.DrawString('SMART TV PLAYER', $subFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(148, 163, 184)), 200, 345, $sf)

$iconBmp.Save('C:\Proyectos\TV\platforms\webos\icon_400x400.png', [System.Drawing.Imaging.ImageFormat]::Png)

# Also update the inner app icons
$bmp80 = [System.Drawing.Bitmap]::new($iconBmp, 80, 80)
$bmp80.Save('C:\Proyectos\TV\platforms\webos\icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp80.Dispose()

$bmp130 = [System.Drawing.Bitmap]::new($iconBmp, 130, 130)
$bmp130.Save('C:\Proyectos\TV\platforms\webos\largeIcon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp130.Dispose()

$iconBmp.Dispose()
$gIcon.Dispose()
Write-Output 'ICON_400_SOLID_OK'


# ==========================================
# 2. SPLASH SCREEN (1920x1080)
# ==========================================
$splashBmp = [System.Drawing.Bitmap]::new(1920, 1080)
$gSplash = [System.Drawing.Graphics]::FromImage($splashBmp)
$gSplash.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gSplash.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Solid background matching tile
$gSplash.FillRectangle([System.Drawing.SolidBrush]::new($solidColor), 0, 0, 1920, 1080)

# Big Centered Logo
$titleBig = [System.Drawing.Font]::new('Segoe UI', [float]64, [System.Drawing.FontStyle]::Bold)
$sfSplash = [System.Drawing.StringFormat]::new()
$sfSplash.Alignment = [System.Drawing.StringAlignment]::Center

$gSplash.DrawString('IPTV NOVA', $titleBig, [System.Drawing.Brushes]::White, 900, 420, $sfSplash)
$gSplash.DrawString('PLUS', $titleBig, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(236, 72, 153)), 1170, 420, $sfSplash)

$subBig = [System.Drawing.Font]::new('Segoe UI', [float]22, [System.Drawing.FontStyle]::Regular)
$gSplash.DrawString('Reproductor de Contenidos Ultra HD para Smart TV', $subBig, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(148, 163, 184)), 960, 520, $sfSplash)

# Loading bar
$barBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 41, 59))
$gSplash.FillRectangle($barBg, 760, 600, 400, 8)
$barProg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(56, 189, 248))
$gSplash.FillRectangle($barProg, 760, 600, 240, 8)

$splashBmp.Save('C:\Proyectos\TV\platforms\webos\splash.png', [System.Drawing.Imaging.ImageFormat]::Png)
$splashBmp.Dispose()
$gSplash.Dispose()
Write-Output 'SPLASH_OK'


# ==========================================
# 3. LAUNCHER BACKGROUND (1920x1080)
# ==========================================
$launchBmp = [System.Drawing.Bitmap]::new(1920, 1080)
$gLaunch = [System.Drawing.Graphics]::FromImage($launchBmp)
$gLaunch.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gLaunch.FillRectangle([System.Drawing.SolidBrush]::new($solidColor), 0, 0, 1920, 1080)

# Subtle elegant brand watermark
$wmFont = [System.Drawing.Font]::new('Segoe UI', [float]48, [System.Drawing.FontStyle]::Bold)
$wmBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(25, 255, 255, 255))
$gLaunch.DrawString('IPTV NOVA PLUS', $wmFont, $wmBrush, 100, 920)

$launchBmp.Save('C:\Proyectos\TV\platforms\webos\launcher_bg.png', [System.Drawing.Imaging.ImageFormat]::Png)
$launchBmp.Dispose()
$gLaunch.Dispose()
Write-Output 'LAUNCHER_BG_OK'

Write-Output 'ALL_LG_STORE_IMAGES_DONE'

