---
name: material-design
description: GoogleのMaterial Design 3ガイドラインに従ったUI/UXデザインを作成。カラーシステム、タイポグラフィ、間隔（8dpグリッド）、エレベーション、コンポーネント、モーションを含む。インターフェース設計、色・フォント選択、Materialコンポーネント実装、Material Design準拠確認時に使用。
---

# Material Design 3 (Material You)

GoogleのMaterial Design 3原則とガイドラインに従ったインターフェース作成のための包括的ガイド。

## このスキルを使用するタイミング

以下の場合に使用：
- 新しいUIコンポーネントやレイアウトの設計
- カラーパレットとテーマの選択
- タイポグラフィシステムの実装
- 間隔とレイアウトグリッドの設定
- エレベーションと影の追加
- モーションとアニメーションの作成
- アクセシビリティ準拠の確保
- 既存デザインのMaterial Design化
- React、React Native、WebでのMaterial Designコンポーネント実装

## Material Designの基本原則

### 1. Material Foundation（マテリアルの基礎）
- **触覚的な表面**: UI表面は物理的な素材のように振る舞う
- **ダイナミックカラー**: ユーザーの壁紙から生成されるパーソナライズされた配色
- **エレベーション**: 異なる高さの表面が影を落とす

### 2. Bold, Graphic, Intentional（大胆、グラフィカル、意図的）
- **印刷デザインの影響**: タイポグラフィ、グリッド、空間、スケール、色の重視
- **視覚的階層**: 意図的なデザイン選択でユーザーの注意を誘導
- **目的のある画像**: すべての要素に目的がある

### 3. Motion Provides Meaning（動きが意味を提供）
- **レスポンシブなインタラクション**: アニメーションがユーザー入力に応答
- **自然なイージング**: 動きが有機的で自然に感じる
- **目的のある遷移**: アニメーションが関係性の理解を助ける

## カラーシステム

Material Design 3はキーカラーに基づく動的カラーシステムを使用。

### キーカラーの役割

```css
/* Primary - メインブランドカラー、主要アクション */
--md-sys-color-primary: #6750A4;
--md-sys-color-on-primary: #FFFFFF;
--md-sys-color-primary-container: #EADDFF;
--md-sys-color-on-primary-container: #21005D;

/* Secondary - アクセントカラー、控えめなアクション */
--md-sys-color-secondary: #625B71;
--md-sys-color-on-secondary: #FFFFFF;
--md-sys-color-secondary-container: #E8DEF8;
--md-sys-color-on-secondary-container: #1D192B;

/* Tertiary - コントラストを持つアクセント */
--md-sys-color-tertiary: #7D5260;
--md-sys-color-on-tertiary: #FFFFFF;
--md-sys-color-tertiary-container: #FFD8E4;
--md-sys-color-on-tertiary-container: #31111D;

/* Error - エラー状態と破壊的アクション */
--md-sys-color-error: #B3261E;
--md-sys-color-on-error: #FFFFFF;
--md-sys-color-error-container: #F9DEDC;
--md-sys-color-on-error-container: #410E0B;

/* Surface - 背景色 */
--md-sys-color-surface: #FFFBFE;
--md-sys-color-on-surface: #1C1B1F;
--md-sys-color-surface-variant: #E7E0EC;
--md-sys-color-on-surface-variant: #49454F;

/* Outline - 境界線と区切り線 */
--md-sys-color-outline: #79747E;
--md-sys-color-outline-variant: #CAC4D0;
```

### カラー使用ガイドライン

- **Primary**: FAB、目立つボタン、アクティブ状態、強調テキスト
- **Secondary**: 控えめなボタン、フィルターチップ、進捗インジケーター
- **Tertiary**: 入力、選択コントロールのコントラストアクセント
- **Error**: エラーテキスト、エラーアイコン、破壊的アクション
- **Surface**: 背景、カード、シート、ダイアログ
- **Outline**: 境界線、区切り線、アウトラインボタン

## タイポグラフィスケール

Material Design 3は15段階のタイプスケールを使用。

```css
/* Display - 最大テキスト、短い/重要なテキスト */
--md-sys-typescale-display-large: 57px/64px Roboto 400;
--md-sys-typescale-display-medium: 45px/52px Roboto 400;
--md-sys-typescale-display-small: 36px/44px Roboto 400;

/* Headline - 強調テキスト、本文より短い */
--md-sys-typescale-headline-large: 32px/40px Roboto 400;
--md-sys-typescale-headline-medium: 28px/36px Roboto 400;
--md-sys-typescale-headline-small: 24px/32px Roboto 400;

/* Title - 中程度の強調、セクションヘッダー */
--md-sys-typescale-title-large: 22px/28px Roboto 400;
--md-sys-typescale-title-medium: 16px/24px Roboto 500;
--md-sys-typescale-title-small: 14px/20px Roboto 500;

/* Body - メインコンテンツテキスト */
--md-sys-typescale-body-large: 16px/24px Roboto 400;
--md-sys-typescale-body-medium: 14px/20px Roboto 400;
--md-sys-typescale-body-small: 12px/16px Roboto 400;

/* Label - ボタン、タブ、ラベル */
--md-sys-typescale-label-large: 14px/20px Roboto 500;
--md-sys-typescale-label-medium: 12px/16px Roboto 500;
--md-sys-typescale-label-small: 11px/16px Roboto 500;
```

### タイポグラフィガイドライン

- 本文には**Roboto**または**Noto Sans**を使用
- コードスニペットには**Roboto Mono**を使用
- 一貫した行の高さを維持（通常、本文はフォントサイズの1.5倍）
- 読みやすさのため行の長さを60-80文字に制限

## 間隔システム（8dpグリッド）

Material Designは間隔とサイズに**8dpの基本単位**を使用。

### 間隔スケール

```
4dp  - コンポーネント内のタイトな間隔
8dp  - 要素間の標準間隔
12dp - 快適な間隔
16dp - 標準パディング
24dp - ゆとりのあるパディング
32dp - セクション間隔
48dp - 大きなセクション間隔
64dp - 主要レイアウト間隔
```

### レイアウトグリッド

- **カラム数**: 4（モバイル）、8（タブレット）、12（デスクトップ）
- **ガター**: 16dp（モバイル）、24dp（タブレット/デスクトップ）
- **マージン**: 16dp（モバイル）、24dp（タブレット）、最大200dp（デスクトップ）

```css
/* 間隔ユーティリティの例 */
.m-1 { margin: 4px; }   /* 4dp */
.m-2 { margin: 8px; }   /* 8dp */
.m-3 { margin: 12px; }  /* 12dp */
.m-4 { margin: 16px; }  /* 16dp */
.m-6 { margin: 24px; }  /* 24dp */
.m-8 { margin: 32px; }  /* 32dp */

.p-1 { padding: 4px; }
.p-2 { padding: 8px; }
.p-4 { padding: 16px; }
.p-6 { padding: 24px; }
```

## エレベーションシステム

エレベーションは**密度非依存ピクセル（dp）**で測定され、影を通じて深さを作成。

### エレベーションレベル

```css
/* レベル 0 - 表面にフラット */
box-shadow: none;

/* レベル 1 - わずかに浮き上がる（カード、検索バー） */
box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3),
            0px 1px 3px 1px rgba(0, 0, 0, 0.15);

/* レベル 2 - ホバー状態 */
box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3),
            0px 2px 6px 2px rgba(0, 0, 0, 0.15);

/* レベル 3 - FAB、ボタン、モーダルダイアログ */
box-shadow: 0px 4px 8px 3px rgba(0, 0, 0, 0.15),
            0px 1px 3px rgba(0, 0, 0, 0.3);

/* レベル 4 - ナビゲーションドロワー */
box-shadow: 0px 6px 10px 4px rgba(0, 0, 0, 0.15),
            0px 2px 3px rgba(0, 0, 0, 0.3);

/* レベル 5 - モーダルボトムシート */
box-shadow: 0px 8px 12px 6px rgba(0, 0, 0, 0.15),
            0px 4px 4px rgba(0, 0, 0, 0.3);
```

### エレベーション使用法

- **0dp**: ボタン、デフォルト状態のカード
- **1dp**: カード、検索バー
- **2dp**: ホバー/フォーカス状態
- **3dp**: FAB、レイズドボタン、モーダルダイアログ
- **4dp**: ナビゲーションドロワー
- **5dp**: モーダルボトムシート、ピッカー

## コンポーネントパターン

### ボタン

```tsx
// Filledボタン（Primary）
<button className="
  bg-primary text-on-primary
  rounded-full px-6 py-2.5
  font-medium text-sm
  shadow-md hover:shadow-lg
  transition-all duration-200
">
  アクション
</button>

// Outlinedボタン
<button className="
  border-2 border-outline text-primary
  rounded-full px-6 py-2.5
  font-medium text-sm
  hover:bg-primary/8
  transition-all duration-200
">
  アクション
</button>

// Textボタン
<button className="
  text-primary
  rounded-full px-3 py-2
  font-medium text-sm
  hover:bg-primary/8
  transition-all duration-200
">
  アクション
</button>
```

### カード

```tsx
<div className="
  bg-surface-container
  rounded-xl p-4
  shadow-sm hover:shadow-md
  transition-shadow duration-200
">
  <h3 className="text-title-large text-on-surface mb-2">
    カードタイトル
  </h3>
  <p className="text-body-medium text-on-surface-variant">
    カードコンテンツがここに入ります
  </p>
</div>
```

### テキストフィールド（Outlined）

```tsx
<div className="relative">
  <input
    type="text"
    className="
      w-full px-4 py-3.5
      border border-outline rounded
      text-body-large
      focus:border-primary focus:outline-none
      transition-colors duration-200
    "
    placeholder=" "
  />
  <label className="
    absolute left-4 -top-2.5 px-1
    bg-surface
    text-body-small text-on-surface-variant
  ">
    ラベル
  </label>
</div>
```

### FAB（フローティングアクションボタン）

```tsx
<button className="
  fixed bottom-4 right-4
  w-14 h-14
  bg-primary-container text-on-primary-container
  rounded-2xl
  shadow-lg hover:shadow-xl
  flex items-center justify-center
  transition-all duration-200
">
  <PlusIcon className="w-6 h-6" />
</button>
```

## モーションガイドライン

### 継続時間

```css
/* シンプルな遷移 */
--md-sys-motion-duration-short1: 50ms;   /* マイクロインタラクション */
--md-sys-motion-duration-short2: 100ms;  /* 小さな変化 */
--md-sys-motion-duration-short3: 150ms;  /* ボタン、スイッチ */
--md-sys-motion-duration-short4: 200ms;  /* ホバー、フォーカス */

/* 中程度の遷移 */
--md-sys-motion-duration-medium1: 250ms; /* カード、ダイアログ表示 */
--md-sys-motion-duration-medium2: 300ms; /* ナビゲーション */
--md-sys-motion-duration-medium3: 350ms; /* 大きな要素 */
--md-sys-motion-duration-medium4: 400ms; /* 画面遷移 */

/* 長い遷移 */
--md-sys-motion-duration-long1: 450ms;   /* ボトムシート */
--md-sys-motion-duration-long2: 500ms;   /* 大きな拡張 */
--md-sys-motion-duration-long3: 550ms;   /* 複雑なアニメーション */
--md-sys-motion-duration-long4: 600ms;   /* フルスクリーン遷移 */
```

### イージング

```css
/* Standard - 最も一般的、画面への入場 */
--md-sys-motion-easing-standard: cubic-bezier(0.2, 0.0, 0, 1.0);

/* Emphasized - 重要な遷移、要素拡張 */
--md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0.0, 0, 1.0);

/* Decelerated - 要素が画面から退出 */
--md-sys-motion-easing-decelerated: cubic-bezier(0.0, 0.0, 0, 1.0);

/* Accelerated - 要素が画面に入場 */
--md-sys-motion-easing-accelerated: cubic-bezier(0.3, 0.0, 1, 1.0);
```

## アクセシビリティガイドライン

### 最小タッチターゲット

- **48x48dp**の最小タッチターゲットサイズ
- 視覚的要素が小さい場合はパディングを追加

### カラーコントラスト

- **通常テキスト**: 最低4.5:1のコントラスト比
- **大きなテキスト**（18pt以上）: 最低3:1のコントラスト比
- **UIコンポーネント**: 最低3:1のコントラスト比

### フォーカスインジケーター

```css
/* 見える フォーカスリング */
.focusable:focus {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}
```

### スクリーンリーダーサポート

- セマンティックHTMLを使用（`<button>`、`<nav>`、`<main>`など）
- アイコンのみのボタンに`aria-label`を追加
- 動的コンテンツ更新に`aria-live`を使用
- 画像に代替テキストを提供

## 実装例

### Material Designカードコンポーネント（React + Tailwind）

```tsx
import { FC, ReactNode } from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  elevated?: boolean;
}

export const MaterialCard: FC<CardProps> = ({
  title,
  subtitle,
  children,
  actions,
  elevated = false
}) => {
  return (
    <div className={`
      bg-surface rounded-xl overflow-hidden
      ${elevated ? 'shadow-md' : 'shadow-sm'}
      hover:shadow-lg transition-shadow duration-200
    `}>
      {/* ヘッダー */}
      <div className="p-4 pb-3">
        <h2 className="text-title-large text-on-surface mb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-body-medium text-on-surface-variant">
            {subtitle}
          </p>
        )}
      </div>

      {/* コンテンツ */}
      <div className="px-4 pb-4 text-body-medium text-on-surface">
        {children}
      </div>

      {/* アクション */}
      {actions && (
        <div className="px-4 pb-4 flex gap-2 justify-end">
          {actions}
        </div>
      )}
    </div>
  );
};

// 使用例
<MaterialCard
  title="カードタイトル"
  subtitle="サポートテキスト"
  elevated
  actions={
    <>
      <button className="text-primary px-3 py-2 rounded-full hover:bg-primary/8">
        アクション1
      </button>
      <button className="bg-primary text-on-primary px-6 py-2 rounded-full shadow-sm">
        アクション2
      </button>
    </>
  }
>
  <p>Material Designスタイリングが適用されたカードコンテンツ。</p>
</MaterialCard>
```

### Material Designボトムシート（React）

```tsx
import { FC, ReactNode } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const MaterialBottomSheet: FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* スクリム/オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/32 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* ボトムシート */}
      <div className="
        fixed bottom-0 left-0 right-0 z-50
        bg-surface rounded-t-3xl
        shadow-2xl
        max-h-[90vh] overflow-y-auto
        transition-transform duration-400
        ease-emphasized
      ">
        {/* ドラッグハンドル */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-on-surface-variant/40 rounded-full" />
        </div>

        {/* コンテンツ */}
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </>
  );
};
```

## ベストプラクティス

### カラー

- ✅ セマンティックカラートークン（primary、secondary、error）を使用、生のhex値は使わない
- ✅ テキストに4.5:1のコントラスト比を確保
- ✅ ライトとダークテーマの両方を提供
- ❌ 純粋な黒（#000000）を使わない - on-surfaceを使用
- ❌ 色をハードコードしない - デザイントークンを使用

### タイポグラフィ

- ✅ タイプスケールを一貫して使用
- ✅ 1画面あたり2-3のフォントサイズに制限
- ✅ 階層にフォントウェイトを使用（400、500、700）
- ❌ 多すぎるフォントサイズを使わない
- ❌ 本文に装飾的なフォントを使わない

### 間隔

- ✅ 8dpの増分を使用（4、8、16、24、32など）
- ✅ コンポーネント間でパディング/マージンを一貫させる
- ✅ 間隔を使って視覚的階層を作成
- ❌ 任意の間隔値を使わない（13px、27pxなど）
- ❌ 要素を詰め込みすぎない - 余白を持たせる

### レイアウト

- ✅ デスクトップは12カラムグリッドに従う
- ✅ モバイルでは要素を縦に積み重ねる
- ✅ レスポンシブブレークポイントを使用（600dp、1240dp、1440dp）
- ❌ グリッド配置を崩さない
- ❌ モバイルレイアウトを無視しない

### モーション

- ✅ 適切な継続時間を使用（ほとんどの遷移は200-400ms）
- ✅ standard/emphasizedイージング曲線を使用
- ✅ 意味のあるプロパティをアニメーション（transform、opacity）
- ❌ リニアイージングを使わない
- ❌ アニメーションを長すぎにしない（>600ms）

## AIアシスタント向け指示

このスキルが呼び出されたとき：

### 1. デザインタスクの特定
- どのコンポーネントやレイアウトを設計しているか理解
- 新規デザインかMaterial Design変換かを判断
- プラットフォーム（web、React Native、Flutterなど）を特定

### 2. Material Design原則の適用
- セマンティックトークンでカラーシステムを使用
- タイポグラフィスケールを適切に適用
- 8dp間隔システムを厳守
- 適切なエレベーション/影を追加
- 正しい継続時間とイージングでモーションを含める

### 3. アクセシビリティの確保
- カラーコントラスト比を確認
- 48dpの最小タッチターゲットを確保
- 適切なARIAラベルとセマンティックHTMLを追加
- フォーカス状態を含める

### 4. 完全な例を提供
- コンポーネントコードと使用例の両方を含める
- 関連する場合、ライトとダークテーマのバリエーションを表示
- レスポンシブ動作を示す
- 適切なTypeScript型を含める

### 5. プラットフォームの慣例に従う
- web用: Tailwind CSSまたはCSSカスタムプロパティを使用
- React Native用: StyleSheetまたはstyled-componentsを使用
- Flutter用: Material 3ウィジェットを使用
- 既存のコードベーススタイルに合わせる

### 常に：
- Material Design 3を使用（Material Design 2ではない）
- セマンティックカラートークンを提供、ハードコードされた色は使わない
- 8dp間隔の増分を使用
- アクセシビリティ機能を含める
- 適切な遷移とアニメーションを追加
- 不確かな場合は公式Material Designガイドラインを参照

### 決して：
- 8dpシステム外の任意の間隔値を使用しない
- カラーコントラスト要件を無視しない
- 48dp未満のタッチターゲットを作成しない
- アニメーションにリニアイージングを使用しない
- テーマカラーをハードコードしない
- レスポンシブデザインの考慮をスキップしない

## 追加リソース

- [Material Design 3 公式ドキュメント](https://m3.material.io/)
- [Material Theme Builder](https://m3.material.io/theme-builder)
- [Material Design Icons](https://fonts.google.com/icons)
- [Material Components Web](https://github.com/material-components/material-web)
- [React Material UI (MUI)](https://mui.com/material-ui/)
- [Flutter Material 3](https://docs.flutter.dev/ui/design/material)
