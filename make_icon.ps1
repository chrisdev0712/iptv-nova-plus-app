Add-Type -AssemblyName System.Drawing

$width = 400
$height = 400
$bmp = [System.Drawing.Bitmap]::new($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# 1. Background gradient
$pStart = [System.Drawing.Point]::new(0, 0)
$pEnd = [System.Drawing.Point]::new(0, $height)
$cTop = [System.Drawing.Color]::FromArgb(10, 15, 30)
$cBottom = [System.Drawing.Color]::FromArgb(22, 33, 62)
$bgBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($pStart, $pEnd, $cTop, $cBottom)
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

# 2. Outer glowing subtle border
$borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(59, 130, 246), 4)
$g.DrawRectangle($borderPen, 2, 2, ($width - 4), ($height - 4))

# 3. Ambient center glow (Nova glow)
$path = [System.Drawing.Drawing2D.GraphicsPath]::new()
$path.AddEllipse(60, 40, 280, 200)
$pthBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($path)
$pthBrush.CenterColor = [System.Drawing.Color]::FromArgb(90, 59, 130, 246)
$pthBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 10, 15, 30))
$g.FillEllipse($pthBrush, 60, 40, 280, 200)

# 4. Central TV Monitor frame
$tvRect = [System.Drawing.Rectangle]::new(110, 50, 180, 130)
$tvBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.FillRectangle($tvBrush, $tvRect)

$tvPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(96, 165, 250), 4)
$g.DrawRectangle($tvPen, $tvRect)

# Screen inside TV
$screenRect = [System.Drawing.Rectangle]::new(120, 60, 160, 110)
$pS1 = [System.Drawing.Point]::new(120, 60)
$pS2 = [System.Drawing.Point]::new(280, 170)
$screenBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($pS1, $pS2, [System.Drawing.Color]::FromArgb(30, 41, 75), [System.Drawing.Color]::FromArgb(15, 23, 42))
$g.FillRectangle($screenBrush, $screenRect)

# Glowing Play Button (gradient cyan to violet)
$pt1 = [System.Drawing.Point]::new(185, 90)
$pt2 = [System.Drawing.Point]::new(185, 140)
$pt3 = [System.Drawing.Point]::new(228, 115)
$poly = @($pt1, $pt2, $pt3)

$playStart = [System.Drawing.Point]::new(185, 90)
$playEnd = [System.Drawing.Point]::new(228, 140)
$playBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($playStart, $playEnd, [System.Drawing.Color]::FromArgb(56, 189, 248), [System.Drawing.Color]::FromArgb(168, 85, 247))
$g.FillPolygon($playBrush, $poly)

# TV Stand
$standPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(96, 165, 250), 4)
$g.DrawLine($standPen, 185, 180, 185, 195)
$g.DrawLine($standPen, 215, 180, 215, 195)
$g.DrawLine($standPen, 165, 195, 235, 195)

# 5. "IPTV NOVA" text
$titleFont = [System.Drawing.Font]::new('Arial', [float]30, [System.Drawing.FontStyle]::Bold)
$titleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(160, 0, 0, 0))
$sf = [System.Drawing.StringFormat]::new()
$sf.Alignment = [System.Drawing.StringAlignment]::Center

$g.DrawString('IPTV NOVA', $titleFont, $shadowBrush, 202, 222, $sf)
$g.DrawString('IPTV NOVA', $titleFont, $titleBrush, 200, 220, $sf)

# 6. Rainbow "PLUS"
$plusFont = [System.Drawing.Font]::new('Arial', [float]32, [System.Drawing.FontStyle]::Bold)
$y = 280

# P (Coral Red)
$g.DrawString('P', $plusFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(244, 63, 94)), 135, $y)
# L (Amber Yellow)
$g.DrawString('L', $plusFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(250, 204, 21)), 170, $y)
# U (Emerald Green)
$g.DrawString('U', $plusFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(52, 211, 153)), 200, $y)
# S (Electric Violet)
$g.DrawString('S', $plusFont, [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(192, 132, 252)), 235, $y)

# 7. Subtitle badge
$tagFont = [System.Drawing.Font]::new('Arial', [float]11, [System.Drawing.FontStyle]::Bold)
$tagBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(148, 163, 184))
$g.DrawString('SMART TV PLAYER', $tagFont, $tagBrush, 200, 345, $sf)

# Save to destination
$dest = 'C:\Proyectos\TV\platforms\webos\icon_400x400.png'
$bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)

# Also update the smaller app icons for packaging
$bmp80 = [System.Drawing.Bitmap]::new($bmp, 80, 80)
$bmp80.Save('C:\Proyectos\TV\platforms\webos\icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp80.Dispose()

$bmp130 = [System.Drawing.Bitmap]::new($bmp, 130, 130)
$bmp130.Save('C:\Proyectos\TV\platforms\webos\largeIcon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp130.Dispose()

$bmp.Dispose()
$g.Dispose()

Write-Output 'SUCCESS_ICON_GENERATED'
