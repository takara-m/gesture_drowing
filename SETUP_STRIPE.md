# Stripe決済機能のセットアップガイド

このガイドでは、Gesdro! テンプレートストアのStripe決済機能をセットアップする手順を説明します。

## 前提条件

- ✅ Stripeアカウント作成済み
- ✅ Vercelプロジェクト作成済み
- ✅ Stripe製品とPrice ID登録済み

## Phase 3 完了内容

以下のファイルが実装されました:

```
api/
├── create-checkout-session.ts  # Checkout Session作成API
├── webhook.ts                   # Stripeイベント受信
├── package.json                 # API依存関係
└── README.md                    # API詳細ドキュメント

vercel.json                      # Vercel設定（API追加）
frontend/src/services/stripeService.ts  # フロントエンド更新
```

## セットアップ手順

### ステップ1: 環境変数の準備

#### 1.1 Stripe Secret Keyの取得

1. [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) にアクセス
2. **Developers** → **API keys** を開く
3. **Secret key** の値をコピー（`sk_test_...` で始まる）

#### 1.2 Stripe Webhook Secretの取得

1. [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks) にアクセス
2. **Developers** → **Webhooks** を開く
3. **Add endpoint** をクリック
4. 以下を設定:
   - **Endpoint URL**: `https://あなたのドメイン.vercel.app/api/webhook`
   - **Events to send**:
     - `checkout.session.completed`
     - `checkout.session.expired`
5. **Add endpoint** をクリック
6. 作成されたエンドポイントの詳細ページで **Signing secret** をコピー（`whsec_...` で始まる）

### ステップ2: Vercelに環境変数を設定

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトを選択
3. **Settings** → **Environment Variables** を開く
4. 以下の環境変数を追加:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_xxxxx` | Production, Preview, Development |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxx` | Production, Preview, Development |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxxxx` | Production, Preview, Development |

**注意**: すでに `VITE_STRIPE_PUBLISHABLE_KEY` が設定されている場合はスキップしてください。

### ステップ3: Vercelへデプロイ

#### 方法A: GitHubプッシュで自動デプロイ（推奨）

```bash
git add .
git commit -m "Add Stripe backend API (Phase 3)"
git push origin main
```

Vercelが自動的にデプロイを開始します。

#### 方法B: Vercel CLIで手動デプロイ

```bash
vercel --prod
```

### ステップ4: デプロイ確認

1. Vercelダッシュボードでデプロイが成功したことを確認
2. デプロイログで以下を確認:
   - ✅ `api/` フォルダがビルドされている
   - ✅ エラーがない

### ステップ5: Webhook URLの更新（初回のみ）

デプロイ後、実際のドメインが決まったら、Stripe DashboardのWebhook URLを更新:

1. [Stripe Dashboard - Webhooks](https://dashboard.stripe.com/test/webhooks) を開く
2. 作成したエンドポイントをクリック
3. **...** メニュー → **Update details** をクリック
4. **Endpoint URL** を実際のVercelドメインに変更:
   ```
   https://あなたの実際のドメイン.vercel.app/api/webhook
   ```
5. **Update endpoint** をクリック

### ステップ6: 動作確認

1. デプロイされたサイトにアクセス
2. `/templates` ページを開く
3. 有料パックの「購入する」ボタンをクリック
4. Stripe Checkoutページにリダイレクトされることを確認
5. テストカード番号を使用して決済テスト:
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来の日付
   - CVC: 任意の3桁
6. 決済完了後、`/templates/success` ページにリダイレクトされることを確認

## ローカル開発

ローカル環境で開発・テストする場合は以下の手順を実施してください。

### 1. Vercel CLIのインストール

```bash
npm install -g vercel
```

### 2. Vercelにログイン

```bash
vercel login
```

### 3. プロジェクトをリンク

```bash
vercel link
```

プロジェクト名、スコープ、ディレクトリを選択します。

### 4. 環境変数をダウンロード

```bash
vercel env pull
```

これにより、Vercelに設定された環境変数が `.env` ファイルにダウンロードされます。

### 5. ローカルサーバーを起動

#### ターミナル1: Vercel Dev（バックエンド）

```bash
vercel dev
```

`http://localhost:3000` でバックエンドAPIが起動します。

#### ターミナル2: Vite Dev（フロントエンド）

```bash
cd frontend
npm run dev
```

`http://localhost:5173` でフロントエンドが起動します。

### 6. プロキシ設定の追加（ローカル開発用）

ローカル開発時、フロントエンド(`localhost:5173`)からバックエンドAPI(`localhost:3000`)へのリクエストをプロキシする必要があります。

`frontend/vite.config.ts` に以下を追加:

```typescript
export default defineConfig({
  // ...既存の設定
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### 7. Stripeローカルwebhookテスト（オプション）

Stripe CLIを使用してローカルでwebhookをテストできます:

```bash
# Stripe CLIのインストール
# Windows: https://github.com/stripe/stripe-cli/releases/latest
# Mac: brew install stripe/stripe-cli/stripe

# Stripeにログイン
stripe login

# Webhookイベントを転送
stripe listen --forward-to localhost:3000/api/webhook

# 別のターミナルでテストイベントをトリガー
stripe trigger checkout.session.completed
```

## トラブルシューティング

### ❌ 購入ボタンをクリックしてもStripeに遷移しない

**原因**: バックエンドAPIが動作していない

**解決策**:
1. Vercelデプロイログを確認
2. ブラウザの開発者ツール → Networkタブで `/api/create-checkout-session` のレスポンスを確認
3. 500エラーの場合、Vercelのログを確認（Function Logs）

### ❌ Webhook signature verification failed

**原因**: `STRIPE_WEBHOOK_SECRET` が間違っている、または設定されていない

**解決策**:
1. Stripe Dashboardで正しいWebhook Secretをコピー
2. Vercelの環境変数を確認・更新
3. 再デプロイ

### ❌ CORS エラー

**原因**: API のリクエストが別ドメインとして扱われている

**解決策**:
1. `vercel.json` の `rewrites` 設定を確認
2. フロントエンドとAPIが同じVercelプロジェクトにデプロイされていることを確認

### ❌ Cannot find module '@vercel/node'

**原因**: API依存関係がインストールされていない

**解決策**:
```bash
cd api
npm install
git add api/package-lock.json
git commit -m "Add API dependencies"
git push
```

## 本番環境への移行

現在はテストモード(`sk_test_`, `pk_test_`)で動作しています。
本番環境に移行する際は:

1. Stripe Dashboardで本番モードに切り替え
2. 本番用のAPI Keyを取得
3. 本番用のWebhookエンドポイントを作成
4. Vercelの環境変数を本番用に更新:
   - `STRIPE_SECRET_KEY`: `sk_live_xxxxx`
   - `VITE_STRIPE_PUBLISHABLE_KEY`: `pk_live_xxxxx`
   - `STRIPE_WEBHOOK_SECRET`: 本番Webhookのシークレット

## 次のステップ（Phase 4）

現在、購入履歴はフロントエンドのlocalStorageに保存されています。
Phase 4では以下の機能を実装予定:

- [ ] データベース連携（Vercel Postgres / Supabase）
- [ ] ユーザー認証
- [ ] 購入履歴の永続化
- [ ] テンプレートパックのダウンロード機能
- [ ] マルチデバイス対応

## サポート

問題が発生した場合は、以下を確認してください:

1. Vercel Function Logs
2. ブラウザの開発者ツール（Console & Network）
3. Stripe Dashboard Logs（Developers → Events）

---

Phase 3完了！ 🎉
