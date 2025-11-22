# gesdro! 背景デザイン

お絵描きアプリ「gesdro!」のための背景スタイル

## デザイン仕様

- **ベースカラー**: `#152f56` (深い青)
- **アクセントカラー**: `#e5e84a` (黄色)
- **テクスチャ**: キャンバス風グリッド（4px × 4px）
- **アニメーション**: 3つの円がゆっくり移動

## ファイル構成

```
gesdro-background.css    # メインのCSSファイル
index.html              # 使用例（HTML）
usage-examples.jsx      # React/React Nativeでの使用例
```

## 使い方

### HTML/CSS

```html
<div class="background">
  <div class="circle"></div>
  <div class="circle"></div>
  <div class="circle"></div>
  
  <!-- ここにコンテンツ -->
</div>
```

### React

```jsx
import './gesdro-background.css';

function App() {
  return (
    <div className="background">
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
      {/* コンテンツ */}
    </div>
  );
}
```

### React Native

React Nativeでは、`usage-examples.jsx` の実装例を参照してください。
`react-native-linear-gradient` または `expo-linear-gradient` が必要です。

## カスタマイズ

### 円の数を変更

CSSの `.circle:nth-child(n)` セレクタを追加/削除

### アニメーション速度を変更

```css
animation: moveCircle1 15s ease-in-out infinite;
                      ^^^
                      この秒数を変更
```

### 色を変更

```css
background-color: #152f56;  /* ベース背景色 */
rgba(229, 232, 74, 0.15)    /* 円とテクスチャの色 */
```

### テクスチャの粗さを変更

```css
background-size: 4px 4px;  /* グリッドのサイズ */
```

## 注意事項

- 円は `pointer-events: none` が設定されているため、クリックイベントを妨げません
- アニメーションはGPUアクセラレーションを使用（`transform`）
- React Nativeでは、キャンバステクスチャを背景画像として別途実装する必要があります

## ライセンス

gesdro! プロジェクト用
