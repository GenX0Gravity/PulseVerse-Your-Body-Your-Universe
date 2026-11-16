import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const websiteDir = path.resolve('website');

if (fs.existsSync(distDir)) {
  if (!fs.existsSync(websiteDir)) {
    fs.mkdirSync(websiteDir, { recursive: true });
  }
  fs.cpSync(distDir, websiteDir, { recursive: true, force: true });
  console.log('[sync-website] Successfully synced dist/ -> website/');
} else {
  console.warn('[sync-website] dist/ does not exist. Run vite build first.');
}
