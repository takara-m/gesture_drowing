# CLAUDE.md - Gesdro!

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gesdro!** is a progressive face gesture drawing learning tool with 2 learning steps. Users trace and draw faces with increasing difficulty, from tracing over photos to independent drawing.

## Development Commands

**IMPORTANT**: This is a frontend-only application located in the `frontend/` directory. You must navigate there first.

```bash
# Development
cd frontend
npm run dev          # Start Vite dev server (http://localhost:5173)
                     # Also accessible from local network (e.g., iPad on same Wi-Fi)

# Build
npm run build        # TypeScript compilation + Vite build

# Linting
npm run lint         # Run ESLint
```

### iPad/Tablet Testing

The app is configured for local network access (Vite `host: true`). To test on iPad:

1. **Start dev server on PC**:
   ```bash
   cd frontend
   npm run dev
   ```
   Note the network address shown (e.g., `http://192.168.1.100:5173`)

2. **Access from iPad**:
   - Connect iPad to same Wi-Fi network as PC
   - Open Safari or Chrome on iPad
   - Navigate to the network address from step 1

**Touch Support**: The canvas fully supports touch input (finger or Apple Pencil) with proper coordinate scaling and scroll prevention.

## Architecture

### Tech Stack
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Dexie** (IndexedDB wrapper) for client-side storage
- **Lucide React** for icons
- **Native HTML5 Canvas** for drawing (not Fabric.js)

### Data Storage (IndexedDB via Dexie)

All data is stored locally in the browser using IndexedDB:

```typescript
// src/services/db.ts (Version 3)
interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

interface Photo {
  id: string;
  folderId: string | null;  // フォルダID（nullは「全て」に表示）
  filename: string;
  dataUrl: string;          // Data URL文字列（iOS Safari対応: Blob → Data URL）
  thumbnailUrl: string;     // サムネイルもData URL文字列
  width: number;
  height: number;
  fileSize: number;
  addedAt: Date;
  tags?: string[];
}

interface Drawing {
  id: string;
  photoId: string;
  step: 1 | 2;              // Two-step system
  canvasData: any;          // Canvas ImageData
  imageUrl?: string;
  timeSpent?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Important Storage Changes**:
- **iOS Safari Compatibility**: Photos are stored as **Data URL strings** (not Blobs) to avoid iOS Safari's IndexedDB Blob corruption bug
- **Folder Organization**: Photos can be organized into user-created folders for better management
- Photos are uploaded by users and stored locally in IndexedDB, not fetched from a backend

### 2-Step Learning System

The core educational approach divides face drawing into progressive steps:

**Step 1: Tracing Mode**
- Reference photo displayed as **background** behind canvas (z-index layering)
- Canvas has `backgroundColor: 'transparent'`
- Users trace directly over the photo
- Adjustable opacity slider (always visible, positioned below canvas)
- Draw basic shapes and features on top of photo

**Step 2: Independent Drawing**
- Reference photo on left, blank canvas on right
- Canvas has `backgroundColor: 'white'`
- Optional "answer checking" overlay (toggle button below canvas)
- Draw from observation without tracing
- When answer checking is enabled, reference photo appears with adjustable opacity

### Dynamic Canvas Aspect Ratio

Critical implementation detail: Canvas dimensions must match photo aspect ratio.

```typescript
// When photo loads, calculate canvas size
const img = new Image();
img.onload = () => {
  const maxWidth = 600;
  let canvasWidth = img.width;
  let canvasHeight = img.height;

  if (img.width > maxWidth) {
    const aspectRatio = img.width / img.height;
    canvasWidth = maxWidth;
    canvasHeight = maxWidth / aspectRatio;
  }

  setImageDimensions({
    width: Math.round(canvasWidth),
    height: Math.round(canvasHeight)
  });
};
```

The canvas element then uses these dynamic dimensions:
```tsx
<canvas
  width={imageDimensions.width}
  height={imageDimensions.height}
  // ...
/>
```

## Critical Implementation Notes

### Image Constructor Naming Conflict

**CRITICAL**: There is a naming conflict between lucide-react's `Image` icon and JavaScript's native `Image` constructor.

```typescript
// ❌ WRONG - breaks new Image()
import { Image } from 'lucide-react';

// ✅ CORRECT - rename lucide icon
import { Image as ImageIcon } from 'lucide-react';
```

When using `new Image()` for loading photos, ensure lucide's `Image` is imported as `ImageIcon`.

### Canvas Drawing Implementation

Uses native HTML5 Canvas API, not Fabric.js. Supports both mouse and touch input:

```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);
const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

// Drawing state
const [isDrawing, setIsDrawing] = useState(false);
const [history, setHistory] = useState<ImageData[]>([]);

// Unified coordinate extraction (mouse + touch)
const getCoordinates = (e) => {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // Touch event
  if (e.touches && e.touches.length > 0) {
    const touch = e.touches[0];
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  }

  // Mouse event
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
};

// Event handlers
const startDrawing = (e) => {
  const { x, y } = getCoordinates(e);
  context.beginPath();
  context.moveTo(x, y);
};

// Touch handlers prevent scrolling
const handleTouchStart = (e) => {
  e.preventDefault();
  startDrawing(e);
};
```

**Canvas configuration**:
```tsx
<canvas
  onMouseDown={startDrawing}
  onMouseMove={draw}
  onMouseUp={stopDrawing}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  style={{ touchAction: 'none' }}  // Prevent default touch behaviors
/>
```

History management uses `getImageData()` / `putImageData()` for undo/redo.

### UI Layout Details

**Control Placement**: Transparency and answer-checking controls are positioned directly below the canvas (not in sidebar):
- Step 1: Opacity slider always visible below canvas
- Step 2: Answer checking toggle button below canvas (shows opacity slider when enabled)

**Photo Change Button**: Located below step buttons, with hover animation:
```tsx
className="... hover:shadow-xl hover:scale-105 transition-all duration-200"
```

**Grid Alignment**: Reference photo and drawing space use `items-start` on parent grid to align tops perfectly.

### Download Function

Images are exported with proper background compositing:

```typescript
const downloadDrawing = () => {
  // Create export canvas
  const exportCanvas = document.createElement('canvas');
  const ctx = exportCanvas.getContext('2d');

  // 1. Draw white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // 2. Include reference photo if needed
  const shouldIncludePhoto = (currentStep === 1) || (currentStep === 2 && showOverlay);

  if (shouldIncludePhoto && photoUrl) {
    // Draw photo with current opacity
    ctx.globalAlpha = overlayOpacity;
    ctx.drawImage(img, 0, 0, exportCanvas.width, exportCanvas.height);
    ctx.globalAlpha = 1.0;
  }

  // 3. Draw canvas content on top
  ctx.drawImage(canvas, 0, 0);

  // 4. Export as PNG
  const dataURL = exportCanvas.toDataURL('image/png');
  // ... download
};
```

**Download behavior**:
- Step 1: Always includes reference photo at current opacity
- Step 2: Includes reference photo only if answer checking is enabled
- Always includes white background to prevent transparent black areas

### Folder Organization System

Photos can be organized into user-created folders for better management:

**Key Features**:
- **Folder Creation**: Users can create custom folders with names (e.g., "Portraits", "Animals", "Landscapes")
- **"All Photos" View**: Special folder (folderId: null) that shows all photos regardless of folder
- **Folder Deletion**: Deleting a folder moves all photos back to "All Photos" (folderId: null)
- **Folder-based Practice**: Practice mode can be filtered by folder
- **Upload to Folder**: Photos can be assigned to a folder during upload

**Implementation**:
```typescript
// src/services/folderService.ts
export const getAllFolders = async (): Promise<Folder[]> => {
  return await db.folders.orderBy('createdAt').toArray();
};

export const createFolder = async (name: string): Promise<Folder> => {
  const folder: Folder = {
    id: uuidv4(),
    name,
    createdAt: new Date()
  };
  await db.folders.add(folder);
  return folder;
};

export const deleteFolder = async (folderId: string): Promise<void> => {
  // Move photos to "All Photos" (folderId: null)
  const photos = await db.photos.where('folderId').equals(folderId).toArray();
  for (const photo of photos) {
    await db.photos.update(photo.id!, { folderId: null });
  }
  await db.folders.delete(folderId);
};

export const getPhotosInFolder = async (folderId: string | null) => {
  if (folderId === null) {
    return await db.photos.orderBy('addedAt').reverse().toArray();
  }
  return await db.photos.where('folderId').equals(folderId).orderBy('addedAt').reverse().toArray();
};
```

**UI Layout (PhotoManager)**:
The photo management screen uses a vertical layout with three sections:
1. **Practice Start Section**: Folder selector dropdown + photo order buttons (oldest/newest/random) + start button
2. **Folder Section**: Horizontal scrollable folder buttons with photo counts, selected folder shows delete button
3. **Photo Management Section**: Add photo, backup/restore buttons, and photo grid filtered by selected folder

**Photo Grid Size**: Photos are displayed at half the previous size (grid-cols-3 md:grid-cols-4 lg:grid-cols-6) for better space utilization.

## Component Structure

```
frontend/src/
├── components/
│   ├── FaceGestureDrawingTool.tsx   # Main drawing interface
│   ├── PhotoUploader.tsx             # Multi-file upload with folder selection
│   └── PhotoGrid.tsx                 # Gallery with folder filtering
├── pages/
│   └── PhotoManager.tsx              # Photo library + folder management
├── services/
│   ├── db.ts                         # Dexie database schema (v3 with folders)
│   ├── photoService.ts               # Photo CRUD + image processing
│   └── folderService.ts              # Folder CRUD + photo filtering
├── i18n/
│   ├── index.ts                      # Translation utilities
│   ├── locales/
│   │   ├── ja.json                   # Japanese translations
│   │   └── en.json                   # English translations
│   └── contexts/
│       └── LanguageContext.tsx       # Language state management
├── App.tsx                           # Router + language provider
└── main.tsx                          # Entry point
```

### Key Components

**FaceGestureDrawingTool**: Main canvas interface with:
- Step selector (1-2 buttons)
- Photo change button (below step buttons, with hover animation)
- Reference photo display (left side)
- Drawing canvas with background photo (Step 1) or overlay (Step 2)
- Toolbar: brush size, color, eraser, undo/redo, clear
- Opacity/answer checking controls (below canvas)

**PhotoManager**: Upload and manage reference photos with folder organization
- **Practice start section** (vertical layout, top)
  - Folder dropdown selector (shows photo count per folder)
  - Photo order selection: oldest, newest, or random
  - Start button
- **Folder section** (horizontal scrollable buttons)
  - "All Photos" button (shows all photos)
  - User-created folder buttons (shows photo count)
  - Selected folder displays delete button
  - Create new folder button
- **Photo management section**
  - Upload, backup, restore buttons
  - Photo grid filtered by selected folder
  - Smaller photo thumbnails (3-4-6 column grid)
  - Delete photos (confirms before deleting)

**PhotoUploader**: Multi-file photo upload with folder assignment
- Folder selector dropdown (saves to selected folder)
- Drag & drop or file selection
- Photo preview grid before upload
- HEIC format detection and warnings

## Photo Processing

Photos are processed client-side before storage:

```typescript
// Resize to max 800x800 (maintains aspect ratio)
const resizedBlob = await resizeImage(file, 800, 800);

// Generate 200x200 thumbnail
const thumbnailBlob = await createThumbnail(file);

// Store both in IndexedDB
await db.photos.add({
  id: uuidv4(),
  blob: resizedBlob,
  thumbnail: thumbnailBlob,
  // ...
});
```

Images are converted to Data URLs for display:
```typescript
const photoUrl = await blobToDataURL(photo.blob);
```

### Photo Selection

Photos can be selected by order using `getPhotoByOrder`:

```typescript
// photoService.ts
export const getPhotoByOrder = async (order: 'oldest' | 'newest' | 'random'): Promise<Photo | undefined> => {
  if (order === 'random') {
    return getRandomPhoto();
  }

  const photos = order === 'oldest'
    ? await db.photos.orderBy('addedAt').toArray()
    : await db.photos.orderBy('addedAt').reverse().toArray();

  return photos[0];
};
```

## State Management

No global state library. Uses React's built-in state:

```typescript
// FaceGestureDrawingTool state
const [currentStep, setCurrentStep] = useState(1);
const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
const [imageDimensions, setImageDimensions] = useState({ width: 400, height: 500 });
const [overlayOpacity, setOverlayOpacity] = useState(0.3);
const [showOverlay, setShowOverlay] = useState(false);

// Canvas drawing state
const [brushSize, setBrushSize] = useState(3);
const [brushColor, setBrushColor] = useState('#000000');
const [isEraser, setIsEraser] = useState(false);
const [history, setHistory] = useState<ImageData[]>([]);
const [historyStep, setHistoryStep] = useState(-1);
```

## Common Issues & Solutions

### Canvas not matching photo aspect ratio
- Ensure `imageDimensions` state updates in photo load `useEffect`
- Verify `aspectRatio = img.width / img.height` calculation
- Check canvas `width` and `height` props use `imageDimensions` state

### Background photo not visible in Step 1
- Verify photo `<img>` is rendered **before** `<canvas>` in DOM
- Check `position: absolute` on photo, `position: relative` on container
- Ensure canvas `backgroundColor` is `'transparent'` for Step 1

### Drawing coordinates offset
- Canvas drawing uses scaled coordinates (canvas dimensions vs rendered size)
- Always calculate `scaleX = canvas.width / rect.width`
- Apply scale to all mouse event coordinates

### "Image is not a constructor" error
- lucide-react's `Image` icon conflicts with `new Image()`
- Import as `Image as ImageIcon` from 'lucide-react'
- Use `ImageIcon` in JSX, `Image` available for native constructor

### Reference photo and canvas misalignment
- Ensure parent grid uses `items-start` for top alignment
- Both title sections should have same structure (same height)
- Avoid flex containers in one title but not the other

### Photo change resets overlay visibility
- When changing photos, always call `setShowOverlay(false)` in `changePhoto` function
- This prevents answer key from showing immediately on new photo
