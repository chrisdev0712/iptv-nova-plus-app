from PIL import Image
import os

os.makedirs('electron', exist_ok=True)
src_path = r'C:\Proyectos\TV\platforms\webos\icon_400x400.png'
dest_path = r'C:\Proyectos\TV\electron\icon.ico'

img = Image.open(src_path)
icon_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
img.save(dest_path, format='ICO', sizes=icon_sizes)
print("SUCCESS_ICO_CREATED:", dest_path)

