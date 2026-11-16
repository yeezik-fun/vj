// Crea index.html (un unico file, con JS e CSS dentro) a partire da src/
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('dist', { recursive: true });
await build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  jsx: 'automatic',
  target: ['es2020', 'safari15'],
  define: { 'process.env.NODE_ENV': '"production"' },
  outdir: 'dist',
  logLevel: 'warning'
});

const js = readFileSync('dist/main.js', 'utf8').replace(/<\/script/g, '<\\/script');
const css = readFileSync('dist/main.css', 'utf8');
const html = `<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Yeezik LED Wall</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Michroma&family=Inter+Tight:wght@500;700;900&display=swap" rel="stylesheet">
<style>${css}</style></head><body><div id="root"></div>
<!-- Backgrounds: React Bits by David Haz (reactbits.dev), MIT + Commons Clause -->
<script>${js}</script></body></html>`;
writeFileSync('index.html', html);
console.log('index.html creato:', Math.round(html.length / 1024), 'KB');
