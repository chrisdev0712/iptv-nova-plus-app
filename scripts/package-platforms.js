import fs from 'fs';
import path from 'path';

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Prepare Tizen Build
const tizenOut = path.resolve('platforms/tizen/build');
fs.rmSync(tizenOut, { recursive: true, force: true });
copyDir('dist', tizenOut);
fs.copyFileSync('platforms/tizen/config.xml', path.join(tizenOut, 'config.xml'));
if (fs.existsSync('platforms/tizen/icon.png')) {
  fs.copyFileSync('platforms/tizen/icon.png', path.join(tizenOut, 'icon.png'));
}
console.log('✔ Samsung Tizen package bundle prepared in platforms/tizen/build');

// 2. Prepare LG webOS Build
const webosOut = path.resolve('platforms/webos/build');
fs.rmSync(webosOut, { recursive: true, force: true });
copyDir('dist', webosOut);
fs.copyFileSync('platforms/webos/appinfo.json', path.join(webosOut, 'appinfo.json'));
if (fs.existsSync('platforms/webos/icon.png')) {
  fs.copyFileSync('platforms/webos/icon.png', path.join(webosOut, 'icon.png'));
}
if (fs.existsSync('platforms/webos/largeIcon.png')) {
  fs.copyFileSync('platforms/webos/largeIcon.png', path.join(webosOut, 'largeIcon.png'));
}
if (fs.existsSync('platforms/webos/splash.png')) {
  fs.copyFileSync('platforms/webos/splash.png', path.join(webosOut, 'splash.png'));
}
if (fs.existsSync('platforms/webos/resources')) {
  copyDir('platforms/webos/resources', path.join(webosOut, 'resources'));
}
console.log('✔ LG webOS package bundle prepared in platforms/webos/build');

