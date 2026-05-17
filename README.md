# SEO Editor — AI 文章審查工具

四位 AI SEO 編輯，各自獨立審查你的 Markdown 文章，提出修改建議。

## 編輯角色

| 編輯 | 審查角度 |
|------|---------|
| 九宮格寫作法 | 自問自答、7W3H、資訊/感受雙引擎、文章結構 |
| 取材編輯 | 內容三角、稀有性、鏡射性、結構強韌性 |
| 定位編輯 | 讀者心智位置、搜尋意圖、差異化 |
| 品牌文案 | 品牌承諾、目標受眾、感覺承諾、轉行測試 |

## 技術棧

- React 19 + TypeScript + Vite
- GLM-5-Turbo (智譜 AI)
- Psychiatry-brain 暖色系設計
- GitHub Pages 部署

## 使用方式

1. 在頁面上方輸入你的智譜 AI API Key
2. 貼上或上傳 Markdown 文章
3. 點擊「開始審查」
4. 切換 Tab 查看四位編輯的建議
5. 各自複製到剪貼簿

## 開發

```bash
npm install
npm run dev
```

## 環境變數

建立 `.env` 時可參考 `.env.example`：

```bash
VITE_ZP_API_ENDPOINT=https://open.bigmodel.cn/api/coding/paas/v4/chat/completions
VITE_ZP_MAX_TOKENS=8192
```

`VITE_ZP_MAX_TOKENS` 控制每次請求的 completion 上限。它不是越大越好，實際可輸出長度仍受 GLM 模型與供應商服務端限制。程式會把它限制在 `256~16384`，超過範圍會在開發模式 console 顯示 requested/clamped 資訊。

## 長輸出穩定性

四位編輯現在使用固定章節切分，而不是「第 N/4」比例切分。每段回覆要求模型輸出 `[[END_OF_PART]]` 結尾標記；如果服務端因 token 上限截斷，續寫只帶最後一段上下文，避免把已產出全文塞回 prompt 造成再次截斷。
