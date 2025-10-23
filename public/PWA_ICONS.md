# PWA Icons Setup

The app needs PWA icons for installation. You can:

## Option 1: Use a PWA Asset Generator

```bash
# Install the PWA asset generator
npm install -g @vite-pwa/assets-generator

# Create a source icon (512x512 or larger) and place it in public/icon.svg or public/icon.png

# Generate all PWA icons
pwa-assets-generator --preset minimal public/icon.png public
```

## Option 2: Manual Creation

Create these files in the `public/` directory:

1. **pwa-192x192.png** - 192x192px icon
2. **pwa-512x512.png** - 512x512px icon
3. **apple-touch-icon.png** - 180x180px for iOS
4. **favicon.ico** - 32x32px favicon

## Quick Icon Design Tips

For BravoLearn, consider using:
- Primary color: #22c55e (green)
- A book or graduation cap icon
- Clear, simple design that works at small sizes

## Online Tools

You can use these online tools to generate icons:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://maskable.app/ (for maskable icons)

## Current Status

The PWA configuration is ready in `vite.config.js`. Once you add the icon files, the app will be fully installable!
