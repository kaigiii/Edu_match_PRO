#!/bin/bash
# 更新 GitHub Pages 使用的 ngrok 後端地址
# 使用方式: ./update_ngrok_backend.sh <新的ngrok網址>
# 範例: ./update_ngrok_backend.sh https://your-new-subdomain.ngrok-free.dev

# 檢查是否提供了新的 ngrok 網址
if [ -z "$1" ]; then
  echo "❌ 請提供新的 ngrok 網址"
  echo "使用方式: ./update_ngrok_backend.sh <新的ngrok網址>"
  echo "範例: ./update_ngrok_backend.sh https://your-subdomain.ngrok-free.dev"
  exit 1
fi

NEW_NGROK_URL="$1"
API_CONFIG_FILE="edu-match-pro-frontend/src/config/api.ts"

# 檢查檔案是否存在
if [ ! -f "$API_CONFIG_FILE" ]; then
  echo "❌ 找不到檔案: $API_CONFIG_FILE"
  exit 1
fi

# 取得當前的 ngrok 網址
CURRENT_URL=$(grep -o "https://[a-z-]*\.ngrok-free\.dev" "$API_CONFIG_FILE" | head -1)

if [ -z "$CURRENT_URL" ]; then
  echo "❌ 找不到當前的 ngrok 網址"
  exit 1
fi

echo "📝 當前 ngrok 網址: $CURRENT_URL"
echo "🔄 新的 ngrok 網址: $NEW_NGROK_URL"
echo ""

# 確認是否要更新
read -p "確定要更新嗎？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 已取消"
  exit 0
fi

# 替換 ngrok 網址
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s|$CURRENT_URL|$NEW_NGROK_URL|g" "$API_CONFIG_FILE"
else
  # Linux
  sed -i "s|$CURRENT_URL|$NEW_NGROK_URL|g" "$API_CONFIG_FILE"
fi

echo "✅ 已更新 API 配置檔案"
echo ""

# 詢問是否要提交並推送
read -p "是否要提交並推送到 GitHub？(y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  git add "$API_CONFIG_FILE"
  git commit -m "🔧 更新 ngrok 後端地址: $NEW_NGROK_URL"
  git push origin main
  echo "✅ 已推送到 GitHub，GitHub Actions 將自動部署"
  echo "🌐 部署完成後，前端將使用新的後端地址"
else
  echo "⚠️  記得手動提交並推送變更"
fi

echo ""
echo "✨ 完成！"

