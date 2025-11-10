# Gesdro!

**Gesdro!** is a progressive face gesture drawing learning tool designed to help users improve their portrait drawing skills through a structured 2-step learning system.

## Features

### 2-Step Learning System

**Step 1: Tracing Mode**
- Draw directly over reference photos
- Adjustable photo opacity for gradual difficulty increase
- Build muscle memory and understand facial proportions

**Step 2: Independent Drawing Mode**
- Draw next to the reference photo without tracing
- Optional answer-checking overlay with adjustable opacity
- Develop observation and free-hand drawing skills

### Drawing Tools
- **Pen Tool**: Freehand drawing with customizable brush size and color
- **Line Tool**: Draw straight lines for construction and guidelines
- **Ellipse Tool**: Create ellipses and circles for facial features
- **Eraser**: Remove mistakes with adjustable eraser size
- **Undo/Redo**: Full drawing history management

### Photo Management
- **Upload Photos**: Drag & drop or select multiple photos at once
- **Folder Organization**: Create custom folders to organize reference photos
- **Practice Mode**: Select photos by oldest, newest, or random order
- **Folder Filtering**: Practice with photos from specific folders
- **Backup & Restore**: Export/import all photos and folders as JSON

### Additional Features
- **Multi-language Support**: Japanese and English
- **iPad/Tablet Support**: Touch-friendly interface with Apple Pencil support
- **Local Storage**: All data stored in browser (IndexedDB)
- **Download Drawings**: Save your completed drawings as PNG

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Dexie.js** - IndexedDB wrapper for data storage
- **Lucide React** - Icon library
- **HTML5 Canvas** - Native drawing API

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### iPad/Tablet Testing

To test on iPad or other devices on the same network:

1. Start the dev server (it's configured with `--host 0.0.0.0`)
2. Note the network address shown in the terminal (e.g., `http://192.168.1.100:5173`)
3. Connect your iPad to the same Wi-Fi network
4. Open Safari/Chrome on iPad and navigate to the network address

### Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── FaceGestureDrawingTool.tsx  # Main drawing interface
│   │   ├── PhotoUploader.tsx           # Photo upload component
│   │   └── PhotoGrid.tsx               # Photo gallery
│   ├── pages/               # Page components
│   │   ├── PhotoManager.tsx            # Photo management page
│   │   └── FAQ.tsx                     # FAQ page
│   ├── services/            # Business logic
│   │   ├── db.ts                       # Dexie database schema
│   │   ├── photoService.ts             # Photo CRUD operations
│   │   └── folderService.ts            # Folder operations
│   ├── i18n/                # Internationalization
│   │   ├── locales/
│   │   │   ├── ja.json                 # Japanese translations
│   │   │   └── en.json                 # English translations
│   │   └── contexts/
│   │       └── LanguageContext.tsx     # Language state
│   ├── assets/              # Static assets (logo, images)
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Public assets
└── package.json
```

## Key Technical Details

### Canvas Drawing
- Uses native HTML5 Canvas API (not Fabric.js)
- Supports both mouse and touch input
- Dynamic canvas sizing to match photo aspect ratio
- Drawing history with undo/redo functionality

### Data Storage
- All photos stored as Data URLs (iOS Safari compatible)
- IndexedDB via Dexie.js for persistent storage
- No backend required - fully client-side

### Photo Organization
- User-created folders with custom names
- Special "All Photos" view showing unorganized photos
- Photo count displayed for each folder
- Bulk photo operations (move, delete)

## License

This project is private and not licensed for public use.

## Development Notes

For detailed technical documentation and development guidelines, see [CLAUDE.md](../CLAUDE.md).
