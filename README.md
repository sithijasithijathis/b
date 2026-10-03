# ST TV Desktop Application

## Prerequisites
1. Install Node.js (v18 or v20 recommended) from https://nodejs.org/
2. Ensure you have `npm` available in your command prompt or PowerShell.

## Build Instructions

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd C:\Users\User\.gemini\antigravity\scratch\st-tv
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start Development Mode (Optional, for testing):
   ```powershell
   npm run dev
   ```

4. Build the Production Windows Installer (.exe):
   ```powershell
   npm run build:win
   ```

The final installer (`ST TV Setup 1.0.0.exe`) will be located in the `release` folder:
`C:\Users\User\.gemini\antigravity\scratch\st-tv\release\`

## Note on App Icon
The build script is configured to use the default Electron icon because `electron-builder` strictly requires a `.ico` file or a 256x256 `.png` file. If you have the logo in `.ico` format, place it in `public/icon.ico` and update `package.json`'s `build.win.icon` path before running `npm run build:win`.

## Features Implemented
- Real API integration with `api.viulk.xyz`
- Dynamic channel loading and metadata parsing (logos, categories, EPG info)
- HLS Video Playback support via `hls.js` and native HTML5 video
- Favorites persistence (using Zustand + localStorage)
- Recently watched history
- Desktop UI (Sidebar, Dark Theme, Custom Scrollbars, Fullscreen Video)
- Secure Electron integration (Context Isolation, Preload scripts)

## Troubleshooting
- If video streams do not load, they may require Widevine DRM or specific CORS headers that require deeper Electron proxying.
- The catch-up URLs provided by the API require replacing `:userid` and `:eventmo`. The codebase handles parsing this logic, but if streams fail, the API may require specific tokens or a newer User-Agent.
