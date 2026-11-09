Add-Type -AssemblyName System.Drawing

$bmp = [System.Drawing.Bitmap]::new(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Background
$bgBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(11, 15, 25))
$g.FillRectangle($bgBrush, 0, 0, 1920, 1080)

# Header
$titleFont = [System.Drawing.Font]::new('Segoe UI', [float]32, [System.Drawing.FontStyle]::Bold)
$g.DrawString('IPTV NOVA', $titleFont, [System.Drawing.Brushes]::White, 830, 80)
$plusFont = [System.Drawing.Font]::new('Segoe UI', [float]32, [System.Drawing.FontStyle]::Bold)
$g.DrawString('PLUS', $plusFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(236, 72, 153)), 1040, 80)

$subFont = [System.Drawing.Font]::new('Segoe UI', [float]14, [System.Drawing.FontStyle]::Regular)
$g.DrawString('Administrador de Usuarios - Xtream Codes API', $subFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(148, 163, 184)), 830, 140)

# Login Card in center
$cardRect = [System.Drawing.Rectangle]::new(660, 200, 600, 720)
$cardBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(17, 24, 39))
$g.FillRectangle($cardBrush, $cardRect)
$g.DrawRectangle([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(51, 65, 85), 2), $cardRect)

$cardHeadFont = [System.Drawing.Font]::new('Segoe UI', [float]20, [System.Drawing.FontStyle]::Bold)
$g.DrawString('AGREGAR NUEVA CUENTA', $cardHeadFont, [System.Drawing.Brushes]::White, 700, 240)

# Field 1: Usuario
$lblFont = [System.Drawing.Font]::new('Segoe UI', [float]13, [System.Drawing.FontStyle]::Bold)
$g.DrawString('1. USUARIO', $lblFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(56, 189, 248)), 700, 310)
$g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 41, 59)), 700, 340, 520, 50)
$g.DrawString('demo', [System.Drawing.Font]::new('Segoe UI', [float]15, [System.Drawing.FontStyle]::Regular), [System.Drawing.Brushes]::White, 720, 352)

# Field 2: Password
$g.DrawString('2. PASSWORD', $lblFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(56, 189, 248)), 700, 420)
$g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 41, 59)), 700, 450, 520, 50)
$g.DrawString('********', [System.Drawing.Font]::new('Segoe UI', [float]15, [System.Drawing.FontStyle]::Regular), [System.Drawing.Brushes]::White, 720, 462)

# Field 3: URL Servidor
$g.DrawString('3. URL DEL SERVIDOR / HOST', $lblFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(56, 189, 248)), 700, 530)
$g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 41, 59)), 700, 560, 520, 50)
$g.DrawString('http://demo-server.com:8080', [System.Drawing.Font]::new('Segoe UI', [float]15, [System.Drawing.FontStyle]::Regular), [System.Drawing.Brushes]::White, 720, 572)

# Connect Button
$btnBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(700, 640), [System.Drawing.Point]::new(1220, 700), [System.Drawing.Color]::FromArgb(6, 182, 212), [System.Drawing.Color]::FromArgb(37, 99, 235))
$g.FillRectangle($btnBrush, 700, 640, 520, 55)
$g.DrawString('CONECTAR CON SERVIDOR', [System.Drawing.Font]::new('Segoe UI', [float]15, [System.Drawing.FontStyle]::Bold), [System.Drawing.Brushes]::White, 840, 655)

# Demo Mode Button
$demoBtn = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 41, 59))
$g.FillRectangle($demoBtn, 700, 725, 520, 50)
$g.DrawRectangle([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(56, 189, 248), 1), 700, 725, 520, 50)
$g.DrawString('Probar en MODO DEMO (Acceso Directo Sin Servidor)', [System.Drawing.Font]::new('Segoe UI', [float]13, [System.Drawing.FontStyle]::Bold), [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(56, 189, 248)), 750, 740)

# Badges 1 2 3 4
$circBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(239, 68, 68))
$g.FillEllipse($circBrush, 660, 345, 30, 30)
$g.DrawString('1', [System.Drawing.Font]::new('Arial', [float]13, [System.Drawing.FontStyle]::Bold), [System.Drawing.Brushes]::White, 668, 350)

$g.FillEllipse($circBrush, 660, 455, 30, 30)
$g.DrawString('2', [System.Drawing.Font]::new('Arial', [float]13, [System.Drawing.FontStyle]::Bold), [System.Drawing.Brushes]::White, 668, 460)

$g.FillEllipse($circBrush, 660, 565, 30, 30)
$g.DrawString('3', [System.Drawing.Font]::new('Arial', [float]13, [System.Drawing.FontStyle]::Bold), [System.Drawing.Brushes]::White, 668, 570)

$g.FillEllipse($circBrush, 660, 735, 30, 30)
$g.DrawString('4', [System.Drawing.Font]::new('Arial', [float]13, [System.Drawing.FontStyle]::Bold), [System.Drawing.Brushes]::White, 668, 740)

$bmp.Save('C:\Proyectos\TV\platforms\webos\screenshot_login_ux.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$g.Dispose()

Write-Output 'LOGIN_UX_IMG_OK'
