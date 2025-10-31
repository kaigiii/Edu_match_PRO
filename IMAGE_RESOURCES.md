# 🖼️ 圖片資源清單

## 📍 基礎 URL

**GitHub Pages**: `https://kaigiii.github.io/Edu_macth_PRO`

---

## 📚 可用圖片資源

### 1️⃣ 通用背景圖片 (Needs/學校相關)

#### 本地資源 (已部署到 GitHub Pages)
```
https://kaigiii.github.io/Edu_macth_PRO/images/bg-1.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/bg-2.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/bg-3.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/bg-4.jpg
```

#### Unsplash 外部資源 (教育主題)
```
https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200  # 教室場景
https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200  # 學生學習
https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200  # 學生群像
https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1200  # 戶外學習
https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200  # 書本與學習
https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1200  # 電腦教室
https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1200  # 圖書館
https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1200  # 音樂課程
https://images.unsplash.com/photo-1571844307880-751c6d86f3f3?q=80&w=1200  # 科學實驗
https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200  # 團隊合作學習
```

---

### 2️⃣ 影響力故事圖片 (Impact Stories)

#### Featured 系列 (精選故事)
```
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/featured/featured-01.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/featured/featured-02.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/featured/featured-03.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/featured/featured-04.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/featured/featured-05.jpg
```

#### Background Wall 系列 (背景牆圖片，共 16 張)
```
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/01.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/02.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/03.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/04.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/05.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/06.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/07.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/08.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/09.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/10.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/11.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/12.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/13.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/14.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/15.jpg
https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/background-wall/16.jpg
```

#### Unsplash 外部資源 (特定主題)
```
https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200  # 英語學習場景
https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200  # 環保教育
https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=1200  # 科技農業/IoT
https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200  # 溫馨閱讀時光
https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1200  # 戶外活動/體育
```

---

### 3️⃣ 其他素材

#### 台灣地圖
```
https://kaigiii.github.io/Edu_macth_PRO/images/taiwan-map.png
https://kaigiii.github.io/Edu_macth_PRO/taiwan-map.svg
```

#### 紋理素材
```
https://kaigiii.github.io/Edu_macth_PRO/images/textures/texture-wood-dark.png
```

#### 影片資源
```
https://kaigiii.github.io/Edu_macth_PRO/videos/taiwan-education.mp4
```

---

## 🔧 使用方式

### 1️⃣ 運行更新腳本 (自動更新數據庫)

```bash
cd edu-match-pro-backend
source venv/bin/activate
python scripts/update_image_urls.py
```

這個腳本會：
- ✅ 檢查數據庫中缺少圖片的記錄
- ✅ 自動分配合適的圖片 URL
- ✅ 避免重複使用相同圖片（在同一批次內）
- ✅ 顯示更新統計和覆蓋率

### 2️⃣ 手動在程式碼中使用

#### Python (後端)
```python
# 需求圖片
need.image_url = "https://kaigiii.github.io/Edu_macth_PRO/images/bg-1.jpg"

# 影響力故事圖片
story.image_url = "https://kaigiii.github.io/Edu_macth_PRO/images/impact-stories/featured/featured-01.jpg"
```

#### TypeScript (前端)
```typescript
// 直接使用完整 URL
const imageUrl = "https://kaigiii.github.io/Edu_macth_PRO/images/bg-1.jpg";

// 或使用相對路徑（前端本地）
const imageUrl = "/images/bg-1.jpg";
```

---

## 📊 圖片統計

| 分類 | 本地資源 | 外部資源 | 總數 |
|------|---------|---------|------|
| **通用背景** | 4 張 | 10 張 | **14 張** |
| **Featured** | 5 張 | - | **5 張** |
| **Background Wall** | 16 張 | - | **16 張** |
| **特定主題** | - | 5 張 | **5 張** |
| **總計** | **25 張** | **15 張** | **40 張** |

---

## 🎯 推薦使用策略

### Needs (學校需求)
- **數位設備類**: 使用電腦教室、科技相關圖片
- **圖書/閱讀**: 使用圖書館、閱讀相關圖片
- **音樂/藝術**: 使用音樂課程圖片
- **體育/活動**: 使用戶外活動圖片
- **科學/實驗**: 使用科學實驗圖片
- **通用**: 使用 bg-1 ~ bg-4 或教室場景

### Impact Stories (影響力故事)
- **Featured 系列**: 用於首頁精選故事、重要報導
- **Background Wall 系列**: 用於一般故事列表、卡片展示
- **特定主題**: 根據故事內容選擇（英語、環保、科技等）

---

## ⚠️ 注意事項

1. **Unsplash 圖片**：
   - 免費使用，無需授權
   - 建議保留參數 `?q=80&w=1200` 以優化載入速度
   - 若圖片失效，可到 [Unsplash](https://unsplash.com) 搜尋替代圖片

2. **本地圖片**：
   - 已部署到 GitHub Pages，穩定可用
   - 如需新增圖片，放到 `edu-match-pro-frontend/public/images/` 並重新部署

3. **圖片優化**：
   - 建議圖片寬度 1200px，品質 80%
   - 使用 WebP 格式可進一步提升載入速度

---

## 🔄 更新日誌

- **2025-10-31**: 初始版本，整理所有現有圖片資源
- **2025-10-31**: 新增自動更新腳本 `update_image_urls.py`

