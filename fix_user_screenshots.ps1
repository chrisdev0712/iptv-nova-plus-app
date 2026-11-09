Add-Type -AssemblyName System.Drawing

function Convert-To1080p($srcPath, $destPath) {
    $srcImg = [System.Drawing.Image]::FromFile($srcPath)
    $destBmp = [System.Drawing.Bitmap]::new(1920, 1080)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Dark background fill
    $g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(15, 23, 42)), 0, 0, 1920, 1080)

    # Scale to fill exactly 1920x1080
    $g.DrawImage($srcImg, 0, 0, 1920, 1080)

    $srcImg.Dispose()
    $destBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBmp.Dispose()
    $g.Dispose()
    Write-Output "Resized $destPath to 1920x1080"
}

Convert-To1080p 'C:\Proyectos\TV\platforms\webos\screenshot1.png' 'C:\Proyectos\TV\platforms\webos\screenshot1_1080p.png'
Convert-To1080p 'C:\Proyectos\TV\platforms\webos\screenshot2.png' 'C:\Proyectos\TV\platforms\webos\screenshot2_1080p.png'
Convert-To1080p 'C:\Proyectos\TV\platforms\webos\screenshot3.png' 'C:\Proyectos\TV\platforms\webos\screenshot3_1080p.png'

# Also overwrite screenshot1.png, 2, 3 so whatever file the user grabs works!
Copy-Item 'C:\Proyectos\TV\platforms\webos\screenshot1_1080p.png' 'C:\Proyectos\TV\platforms\webos\screenshot1.png' -Force
Copy-Item 'C:\Proyectos\TV\platforms\webos\screenshot2_1080p.png' 'C:\Proyectos\TV\platforms\webos\screenshot2.png' -Force
Copy-Item 'C:\Proyectos\TV\platforms\webos\screenshot3_1080p.png' 'C:\Proyectos\TV\platforms\webos\screenshot3.png' -Force

Write-Output 'ALL_SCREENSHOTS_FIXED_TO_1080P'

