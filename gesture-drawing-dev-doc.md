# 顔ジェスチャードローイング学習ツール - 開発ドキュメント

## 📋 プロジェクト概要

段階的な学習ステップで顔の描画スキルを向上させるWebアプリケーション。
前のステップの描画を参考にしながら、徐々に詳細度を上げていく学習システム。

### 主要機能
- 4段階の学習ステップ（ベース形 → パーツ追加 → 自力描画 → 詳細仕上げ）
- Canvas描画機能（ブラシ、消しゴム、Undo/Redo）
- 答え合わせ機能（半透明オーバーレイ）
- 描画データの保存・読み込み
- 進捗管理とギャラリー表示
- 複数の顔写真データベース

---

## 🛠 技術スタック

### フロントエンド
- **React 18+** (Vite)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (状態管理)
- **React Router** (ルーティング)
- **Fabric.js** または **Konva.js** (Canvas描画)
- **Lucide React** (アイコン)

### バックエンド
- **Node.js + Express**
- **PostgreSQL** (メインDB)
- **Prisma** (ORM)
- **AWS S3** または **Cloudinary** (画像ストレージ)
- **JWT** (認証)

### 画像処理
- **Python 3.10+**
- **OpenCV** (顔検出・切り抜き)
- **PIL/Pillow** (画像処理)
- **FastAPI** (画像処理API)

### インフラ
- **Docker** (開発環境)
- **Vercel** または **Netlify** (フロントエンド)
- **Railway** または **Render** (バックエンド)

---

## 📁 ディレクトリ構造

```
gesture-drawing-app/
├── frontend/                    # React フロントエンド
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas/
│   │   │   │   ├── DrawingCanvas.tsx
│   │   │   │   ├── CanvasToolbar.tsx
│   │   │   │   └── OverlayController.tsx
│   │   │   ├── Gallery/
│   │   │   │   ├── DrawingGallery.tsx
│   │   │   │   └── ProgressChart.tsx
│   │   │   ├── Photos/
│   │   │   │   ├── PhotoDisplay.tsx
│   │   │   │   └── PhotoSelector.tsx
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   └── Common/
│   │   │       ├── Button.tsx
│   │   │       ├── Modal.tsx
│   │   │       └── Loader.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Practice.tsx
│   │   │   ├── Gallery.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   │   ├── useCanvas.ts
│   │   │   ├── useDrawing.ts
│   │   │   └── useAuth.ts
│   │   ├── store/
│   │   │   ├── drawingStore.ts
│   │   │   ├── photoStore.ts
│   │   │   └── userStore.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── storage.ts
│   │   │   └── auth.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── canvas.ts
│   │   │   └── helpers.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                     # Express バックエンド
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── drawingController.ts
│   │   │   ├── photoController.ts
│   │   │   └── userController.ts
│   │   ├── routes/
│   │   │   ├── drawings.ts
│   │   │   ├── photos.ts
│   │   │   └── users.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── services/
│   │   │   ├── drawingService.ts
│   │   │   ├── photoService.ts
│   │   │   └── storageService.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
│
├── image-processor/             # Python 画像処理
│   ├── scripts/
│   │   ├── fetch_photos.py
│   │   ├── crop_faces.py
│   │   └── batch_process.py
│   ├── api/
│   │   └── main.py              # FastAPI
│   ├── utils/
│   │   ├── face_detector.py
│   │   └── image_utils.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🎯 学習ステップ詳細

### Step 1: 顔のベース形
- **目的**: 顔の原形理解
- **描画内容**: 円形(○)または四角形(□)
- **描画方法**: 参考写真の上に半透明で描く
- **評価基準**: 顔の輪郭がベース形に収まっているか

### Step 2: ベース + 主要パーツ
- **目的**: パーツのバランス感覚
- **描画内容**: ベース形 + 目・鼻・口・耳（大まか）
- **描画方法**: 参考写真の上に描く
- **評価基準**: パーツの位置関係が正確か

### Step 3: 自力でバランス確認
- **目的**: 記憶と観察力の向上
- **描画内容**: ベース + パーツ（大まか）
- **描画方法**: 写真の隣スペースに自力で描く
- **評価基準**: Step2の描画と比較して精度チェック

### Step 4: 詳細仕上げ
- **目的**: デッサン全体の完成度
- **描画内容**: ベース + パーツ + 髪型・眉毛・影など
- **描画方法**: Step3同様に自力で描く
- **評価基準**: 完成度と表現力

---

## 🗄 データベース設計

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  drawings  Drawing[]
  progress  Progress[]
}

model Photo {
  id          String   @id @default(uuid())
  fileName    String   @unique
  storageUrl  String
  thumbnailUrl String?
  source      String?  // "unsplash", "generated", "custom"
  metadata    Json?    // 画像サイズ、タグなど
  createdAt   DateTime @default(now())
  
  drawings    Drawing[]
}

model Drawing {
  id          String   @id @default(uuid())
  userId      String
  photoId     String
  step        Int      // 1, 2, 3, 4
  canvasData  Json     // Fabric.js または Konva.js のJSON
  imageUrl    String?  // 保存された画像URL
  timeSpent   Int?     // 秒単位
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  photo       Photo    @relation(fields: [photoId], references: [id])
  
  @@index([userId, photoId, step])
}

model Progress {
  id              String   @id @default(uuid())
  userId          String
  totalDrawings   Int      @default(0)
  completedPhotos Int      @default(0)
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastPracticeAt  DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@unique([userId])
}
```

---

## 🔌 API設計

### RESTful Endpoints

#### 認証
```
POST   /api/auth/register          # ユーザー登録
POST   /api/auth/login             # ログイン
POST   /api/auth/logout            # ログアウト
GET    /api/auth/me                # 現在のユーザー情報
```

#### 写真
```
GET    /api/photos                 # 写真一覧
GET    /api/photos/:id             # 写真詳細
GET    /api/photos/random          # ランダムに写真取得
POST   /api/photos                 # 写真アップロード（管理者）
```

#### 描画
```
GET    /api/drawings               # 自分の描画一覧
GET    /api/drawings/:id           # 描画詳細
POST   /api/drawings               # 描画保存
PUT    /api/drawings/:id           # 描画更新
DELETE /api/drawings/:id           # 描画削除
GET    /api/drawings/photo/:photoId # 特定写真の全ステップ取得
```

#### 進捗
```
GET    /api/progress               # 進捗情報取得
GET    /api/progress/stats         # 統計情報
POST   /api/progress/complete      # 練習完了記録
```

### リクエスト/レスポンス例

#### POST /api/drawings
```json
// Request
{
  "photoId": "photo-uuid",
  "step": 2,
  "canvasData": {
    "version": "5.3.0",
    "objects": [...]
  },
  "timeSpent": 300
}

// Response
{
  "id": "drawing-uuid",
  "photoId": "photo-uuid",
  "step": 2,
  "imageUrl": "https://storage.../drawing.png",
  "createdAt": "2025-10-15T12:00:00Z"
}
```

#### GET /api/photos/random
```json
// Response
{
  "id": "photo-uuid",
  "fileName": "face_001.jpg",
  "storageUrl": "https://storage.../face_001.jpg",
  "thumbnailUrl": "https://storage.../face_001_thumb.jpg"
}
```

---

## 🎨 フロントエンド実装

### 主要コンポーネント

#### 1. DrawingCanvas.tsx
```typescript
import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

interface DrawingCanvasProps {
  photoUrl: string;
  step: number;
  showOverlay: boolean;
  overlayOpacity: number;
  onSave: (canvasData: any) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  photoUrl,
  step,
  showOverlay,
  overlayOpacity,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 800,
        isDrawingMode: true
      });
      
      canvas.freeDrawingBrush.width = 3;
      canvas.freeDrawingBrush.color = '#000000';
      
      setFabricCanvas(canvas);
      
      return () => {
        canvas.dispose();
      };
    }
  }, []);

  const handleSave = () => {
    if (fabricCanvas) {
      const json = fabricCanvas.toJSON();
      onSave(json);
    }
  };

  return (
    <div className="relative">
      <canvas ref={canvasRef} />
      {showOverlay && (
        <img
          src={photoUrl}
          alt="overlay"
          className="absolute top-0 left-0 pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
};
```

#### 2. Zustand Store (drawingStore.ts)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DrawingState {
  currentPhotoId: string | null;
  currentStep: number;
  drawings: Map<string, any>; // photoId_step -> canvasData
  
  setCurrentPhoto: (photoId: string) => void;
  setCurrentStep: (step: number) => void;
  saveDrawing: (photoId: string, step: number, data: any) => void;
  getDrawing: (photoId: string, step: number) => any;
}

export const useDrawingStore = create<DrawingState>()(
  persist(
    (set, get) => ({
      currentPhotoId: null,
      currentStep: 1,
      drawings: new Map(),

      setCurrentPhoto: (photoId) => set({ currentPhotoId: photoId }),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      saveDrawing: (photoId, step, data) => {
        const key = `${photoId}_${step}`;
        const newDrawings = new Map(get().drawings);
        newDrawings.set(key, data);
        set({ drawings: newDrawings });
      },
      
      getDrawing: (photoId, step) => {
        const key = `${photoId}_${step}`;
        return get().drawings.get(key);
      }
    }),
    {
      name: 'drawing-storage'
    }
  )
);
```

---

## 🐍 Python画像処理

### 顔写真収集スクリプト

#### fetch_photos.py
```python
import requests
import os
from dotenv import load_dotenv

load_dotenv()

UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY')
OUTPUT_DIR = './raw_photos'

def fetch_unsplash_photos(count=50):
    """Unsplash APIから顔写真を取得"""
    url = "https://api.unsplash.com/photos/random"
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for i in range(count):
        params = {
            'query': 'portrait face headshot',
            'orientation': 'portrait',
            'client_id': UNSPLASH_ACCESS_KEY
        }
        
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            image_url = data['urls']['regular']
            
            # 画像ダウンロード
            img_response = requests.get(image_url)
            filename = f"{OUTPUT_DIR}/unsplash_{i+1:03d}.jpg"
            
            with open(filename, 'wb') as f:
                f.write(img_response.content)
            
            print(f"Downloaded: {filename}")
        else:
            print(f"Error fetching image {i+1}")

if __name__ == "__main__":
    fetch_unsplash_photos(100)
```

#### crop_faces.py
```python
import cv2
import os
from pathlib import Path

INPUT_DIR = './raw_photos'
OUTPUT_DIR = './processed_photos'

def crop_face(image_path, output_path):
    """顔部分を検出して切り抜き"""
    
    # Haar Cascade分類器の読み込み
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    
    # 画像読み込み
    img = cv2.imread(str(image_path))
    if img is None:
        print(f"Failed to load: {image_path}")
        return False
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 顔検出
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(100, 100)
    )
    
    if len(faces) == 0:
        print(f"No face detected: {image_path}")
        return False
    
    # 最大の顔を選択
    (x, y, w, h) = max(faces, key=lambda f: f[2] * f[3])
    
    # マージンを追加（顔の30%）
    margin = int(w * 0.3)
    x1 = max(0, x - margin)
    y1 = max(0, y - margin)
    x2 = min(img.shape[1], x + w + margin)
    y2 = min(img.shape[0], y + h + margin)
    
    # 切り抜き
    face_img = img[y1:y2, x1:x2]
    
    # 標準サイズにリサイズ（600x800）
    face_img = cv2.resize(face_img, (600, 800))
    
    # 保存
    cv2.imwrite(str(output_path), face_img)
    print(f"Processed: {output_path}")
    return True

def batch_process():
    """一括処理"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    input_path = Path(INPUT_DIR)
    success_count = 0
    
    for i, img_file in enumerate(sorted(input_path.glob('*.jpg')), 1):
        output_file = Path(OUTPUT_DIR) / f"face_{i:03d}.jpg"
        if crop_face(img_file, output_file):
            success_count += 1
    
    print(f"\nProcessed: {success_count} images")

if __name__ == "__main__":
    batch_process()
```

---

## 🚀 セットアップ手順

### 1. リポジトリ作成
```bash
mkdir gesture-drawing-app
cd gesture-drawing-app
git init
```

### 2. フロントエンド初期化
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npm install zustand fabric lucide-react react-router-dom
npx tailwindcss init -p
```

### 3. バックエンド初期化
```bash
mkdir backend
cd backend
npm init -y
npm install express prisma @prisma/client
npm install -D typescript @types/node @types/express tsx
npm install dotenv cors jsonwebtoken bcrypt
npm install -D @types/cors @types/jsonwebtoken @types/bcrypt

npx prisma init
```

### 4. Python環境セットアップ
```bash
mkdir image-processor
cd image-processor
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install opencv-python pillow requests python-dotenv
pip install fastapi uvicorn
```

### 5. 環境変数設定
```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/gesture_drawing"
JWT_SECRET="your-secret-key"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
S3_BUCKET_NAME="gesture-drawing-photos"
UNSPLASH_ACCESS_KEY="your-unsplash-key"
```

---

## 📝 実装順序

### Phase 1: 基盤構築（1-2週間）
1. ✅ Prismaスキーマ作成とマイグレーション
2. ✅ 基本的なExpressサーバーセットアップ
3. ✅ ユーザー認証システム（JWT）
4. ✅ Reactプロジェクト初期化とルーティング
5. ✅ Tailwind CSS設定

### Phase 2: Canvas描画機能（1週間）
1. ✅ Fabric.js統合
2. ✅ 描画ツール実装（ブラシ、消しゴム、色選択）
3. ✅ Undo/Redo機能
4. ✅ Canvas保存・読み込み

### Phase 3: 写真管理（1週間）
1. ✅ Python画像処理スクリプト
2. ✅ 顔写真の収集と前処理
3. ✅ S3/Cloudinaryアップロード
4. ✅ 写真APIエンドポイント
5. ✅ フロントエンド写真表示

### Phase 4: 学習システム（1-2週間）
1. ✅ ステップ管理ロジック
2. ✅ 答え合わせオーバーレイ機能
3. ✅ 描画データの保存API
4. ✅ 前ステップ描画の取得と表示
5. ✅ タイマー機能

### Phase 5: 進捗管理とギャラリー（1週間）
1. ✅ 進捗データの記録
2. ✅ ギャラリーページ
3. ✅ 統計グラフ（Chart.js / Recharts）
4. ✅ 連続練習日数カウント

### Phase 6: 改善とデプロイ（1週間）
1. ✅ レスポンシブ対応
2. ✅ パフォーマンス最適化
3. ✅ エラーハンドリング
4. ✅ テスト追加
5. ✅ デプロイ（Vercel + Railway）

---

## 🎨 UI/UX改善アイデア

### 即座に実装すべき機能
- ⏱️ **タイマー機能**: 1分、5分、10分の制限時間
- 🎯 **グリッド表示**: 比率確認用のオーバーレイグリッド
- 🎨 **カラーパレット**: よく使う色のプリセット
- 📱 **タッチ対応**: iPad/タブレットでの描画
- ⌨️ **ショートカット**: Ctrl+Z（Undo）、Ctrl+S（保存）など

### 将来的な拡張
- 🤖 **AIフィードバック**: 顔の比率チェック
- 👥 **コミュニティ機能**: 他のユーザーの描画閲覧
- 🏆 **チャレンジモード**: 日替わり課題
- 📊 **詳細分析**: 描画時間の分析、改善点の提案
- 🎬 **プロセス録画**: 描画過程の再生機能

---

## 🧪 テスト戦略

### フロントエンド
- **Jest + React Testing Library**: コンポーネントテスト
- **Cypress**: E2Eテスト

### バックエンド
- **Jest + Supertest**: APIテスト
- **Prisma Studio**: データベース確認

### 画像処理
- **pytest**: Python関数テスト

---

## 📦 デプロイメント

### フロントエンド (Vercel)
```bash
cd frontend
vercel --prod
```

### バックエンド (Railway)
```bash
railway login
railway init
railway up
```

### データベース (Supabase / Railway)
- PostgreSQLのマネージドサービスを利用
- 自動バックアップ設定

---

## 🔐 セキュリティ考慮事項

1. **認証**: JWTトークンのHTTPOnly Cookie保存
2. **画像アップロード**: ファイルタイプとサイズの検証
3. **Rate Limiting**: API呼び出し制限
4. **CORS設定**: 許可されたオリジンのみ
5. **環境変数**: 機密情報の適切な管理

---

## 📚 参考リソース

- [Fabric.js Documentation](http://fabricjs.com/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [OpenCV Face Detection](https://docs.opencv.org/4.x/db/d28/tutorial_cascade_classifier.html)
- [Unsplash API](https://unsplash.com/documentation)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

---

## 🎯 次のアクション

1. Claude Codeでプロジェクトディレクトリを作成
2. `frontend/` と `backend/` の初期化
3. Prismaスキーマの実装
4. 基本的なCanvas描画機能のプロトタイプ作成

Claude Codeで「このドキュメントに基づいてプロジェクトを初期化してください」と指示すれば、段階的に実装できます！

---

## 📝 実装済み機能ログ

### 2026-06-12 セキュリティアップデート & 描画設定の永続化

#### 🔐 セキュリティ脆弱性対応
**実施日**: 2026-06-12

**内容**:
- `npm audit fix` で 13個の脆弱性を完全解決
- **主要アップデート**:
  - react-router-dom: 7.9.6 → 7.17.0 (XSS/RCE/CSRF 修正)
  - vite: 7.1.7 → 7.3.5 (Path Traversal/任意ファイル読み取り 修正)
  - postcss: 8.5.6 → 8.5.15 (XSS 修正)
  - uuid: 13.0.0 → 13.0.2 (Buffer 境界チェック 修正)
  - 他 9つの脆弱性を自動修正

**結果**: 脆弱性 0個、ビルド成功 ✅

**コミット**: `36d0b1c` - fix: Update npm dependencies to resolve security vulnerabilities

---

#### 🌍 ブラウザ互換性データ更新

**実施日**: 2026-06-12

**内容**:
- baseline-browser-mapping を最新版へ更新
- caniuse-lite を最新版へ更新（7ヶ月古いデータを解消）
- browserslist DB を最新化

**結果**: ビルド警告が解消 ✅

**コミット**: `6140481` - chore: Update browser compatibility data

---

#### 💾 Drawing 画面の設定を localStorage に永続保存

**実施日**: 2026-06-12

**実装内容**:

##### 新規ファイル
- `frontend/src/hooks/useDrawingSettings.ts`
  - localStorage ベースの設定管理カスタム hook
  - 自動保存・復元機能

##### 修正ファイル
- `frontend/src/components/FaceGestureDrawingTool.tsx`
  - useDrawingSettings hook を導入
  - useState → useDrawingSettings に置き換え

##### 保存される設定値
```typescript
{
  brushSize: number;          // ペンサイズ
  brushColor: string;         // ペン色
  showGrid: boolean;          // グリッド表示/非表示
  gridSize: number;           // グリッドサイズ
  gridOpacity: number;        // グリッド濃さ
  currentStep: 1 | 2;         // 現在のステップ
}
```

##### 動作確認
- ✅ ページ更新（F5）→ 設定を復元
- ✅ ページ切替（GesdroApp ↔ PhotoManager など）→ 設定を復元
- ✅ Step 1 ↔ Step 2 切り替え →設定を保持
- ✅ 永続保存 → 次回訪問時も反映
- ✅ TypeScript コンパイル成功
- ✅ Vite ビルド成功

**コミット**: `e5cf3ce` - feat: Add persistent drawing settings storage

---

### 📊 セッションサマリー

| 項目 | 対応前 | 対応後 |
|------|--------|--------|
| **セキュリティ脆弱性** | 13個 | 0個 ✅ |
| **npm パッケージ** | 古い | 最新 ✅ |
| **ブラウザ互換性データ** | 7ヶ月古い | 最新 ✅ |
| **描画設定の保持** | なし | localStorage で永続保存 ✅ |
| **ビルド状態** | 成功 | 成功 ✅ |

---