# Gesdro! API - Vercel Serverless Functions

## 概要

このディレクトリには、Gesdro! テンプレートストアのStripe決済処理を行うバックエンドAPIが含まれています。

## エンドポイント

### POST /api/create-checkout-session

Stripe Checkout Sessionを作成し、決済ページのURLを返します。

**リクエスト:**
```json
{
  "priceId": "price_xxxxxxxxxxxxx",
  "packId": "pack-portrait-pro"
}
```

**レスポンス:**
```json
{
  "sessionId": "cs_test_xxxxxxxxxxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxxxxxxxxxx"
}
```

### POST /api/webhook

Stripeからのwebhookイベントを受信・処理します。

- `checkout.session.completed`: 決済完了時の処理
- `checkout.session.expired`: セッション期限切れ時の処理

## 環境変数の設定

### ローカル開発

プロジェクトルートに `.env` ファイルを作成し、以下の環境変数を設定してください:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Vercel デプロイ

Vercelダッシュボードで環境変数を設定してください:

1. Vercelプロジェクトを開く
2. **Settings** → **Environment Variables** へ移動
3. 以下の環境変数を追加:

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `STRIPE_SECRET_KEY` | `sk_test_xxxxxxxxxxxxx` (テスト環境)<br>`sk_live_xxxxxxxxxxxxx` (本番環境) | Production, Preview, Development |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxxxxxxxxxx` | Production |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxxxxxxxxxxxx` (テスト環境)<br>`pk_live_xxxxxxxxxxxxx` (本番環境) | Production, Preview, Development |

#### Stripe Webhook Secret の取得方法

1. [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks) にアクセス
2. **Developers** → **Webhooks** を開く
3. **Add endpoint** をクリック
4. Endpoint URL: `https://your-domain.vercel.app/api/webhook`
5. イベントを選択: `checkout.session.completed`, `checkout.session.expired`
6. エンドポイント作成後、**Signing secret** をコピー
7. Vercelの環境変数 `STRIPE_WEBHOOK_SECRET` に設定

## ローカルでのテスト

### 1. Vercel CLI のインストール

```bash
npm install -g vercel
```

### 2. ログイン

```bash
vercel login
```

### 3. プロジェクトをリンク

```bash
vercel link
```

### 4. 環境変数をプル

```bash
vercel env pull
```

これにより、Vercelに設定された環境変数が `.env` ファイルにダウンロードされます。

### 5. ローカル開発サーバーを起動

```bash
vercel dev
```

これにより、`http://localhost:3000` でローカルサーバーが起動します。

**注意**: フロントエンドの開発サーバー (`npm run dev`) も別のターミナルで起動してください。

### 6. Stripe Webhookのローカルテスト

Stripe CLIを使用してwebhookをローカルでテストできます:

```bash
# Stripe CLI のインストール (初回のみ)
# Windows: https://github.com/stripe/stripe-cli/releases/latest
# Mac: brew install stripe/stripe-cli/stripe

# Stripe にログイン
stripe login

# Webhookイベントを転送
stripe listen --forward-to localhost:3000/api/webhook
```

別のターミナルでテストイベントをトリガー:

```bash
stripe trigger checkout.session.completed
```

## デプロイ

```bash
vercel --prod
```

または、GitHubにプッシュすると自動デプロイされます（GitHub連携済みの場合）。

## トラブルシューティング

### API が 404 エラーを返す

- `vercel.json` の設定を確認
- `api/` フォルダが正しい場所にあるか確認
- デプロイログでビルドエラーがないか確認

### Webhook signature verification failed

- `STRIPE_WEBHOOK_SECRET` が正しく設定されているか確認
- Stripeダッシュボードで設定したエンドポイントURLが正しいか確認
- 本番環境では必ずHTTPSを使用

### CORS エラー

- `vercel.json` の `rewrites` 設定を確認
- フロントエンドとAPIが同じドメインでホストされていることを確認

## Phase 4 (将来の拡張)

現在、購入履歴はフロントエンドの localStorage に保存されています。
Phase 4では以下の機能を実装予定:

- データベース連携（Vercel Postgres / Supabase）
- ユーザー認証（メールアドレスベース）
- 購入履歴の永続化
- ダウンロード履歴の管理
- マルチデバイス対応
