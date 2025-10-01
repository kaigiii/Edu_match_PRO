# 後端 API 規格文檔

## 基礎配置
- **Base URL**: `http://localhost:3001`
- **Content-Type**: `application/json`
- **CORS**: 允許前端域名

## API 端點規格

### 1. 健康檢查
```http
GET /health
```
**響應**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 2. 學校需求 API

#### 獲取所有需求
```http
GET /school_needs
```
**響應**:
```json
[
  {
    "id": "need-001",
    "schoolName": "台東縣太麻里國小",
    "title": "急需平板電腦支援數位教學",
    "description": "偏鄉學校缺乏數位設備，影響學生學習效果...",
    "category": "硬體設備",
    "location": "台東縣太麻里鄉",
    "studentCount": 120,
    "imageUrl": "/images/impact-stories/background-wall/01.jpg",
    "urgency": "high",
    "sdgs": [4, 10]
  }
]
```

#### 獲取單個需求
```http
GET /school_needs/:id
```
**響應**: 單個 SchoolNeed 對象

#### 創建需求
```http
POST /school_needs
Content-Type: application/json

{
  "schoolName": "新學校",
  "title": "新需求標題",
  "description": "需求描述",
  "category": "硬體設備",
  "location": "台北市",
  "studentCount": 100,
  "imageUrl": "/images/default.jpg",
  "urgency": "medium",
  "sdgs": [4]
}
```

#### 更新需求
```http
PUT /school_needs/:id
Content-Type: application/json

{
  "title": "更新的標題",
  "description": "更新的描述"
}
```

#### 刪除需求
```http
DELETE /school_needs/:id
```
**響應**: `{ "success": true }`

### 3. 儀表板統計 API

#### 企業儀表板統計
```http
GET /company_dashboard_stats
```
**響應**:
```json
{
  "completedProjects": 15,
  "studentsHelped": 1250,
  "volunteerHours": 320,
  "totalDonation": 500000,
  "avgProjectDuration": 45,
  "successRate": 85.5,
  "sdgContributions": {
    "4": 8,
    "10": 5,
    "17": 2
  }
}
```

#### 學校儀表板統計
```http
GET /school_dashboard_stats
```
**響應**:
```json
{
  "totalNeeds": 12,
  "activeNeeds": 8,
  "completedNeeds": 4,
  "studentsBenefited": 480,
  "avgResponseTime": 7.5,
  "successRate": 75.0
}
```

### 4. 推薦和項目 API

#### AI 推薦需求
```http
GET /ai_recommended_needs
```
**響應**: SchoolNeed 數組（與 /school_needs 相同格式）

#### 最近專案
```http
GET /recent_projects
```
**響應**:
```json
[
  {
    "id": "project-001",
    "title": "數位設備捐贈專案",
    "school": "台東縣太麻里國小",
    "status": "completed",
    "progress": 100,
    "studentsBenefited": 120,
    "completionDate": "2024-01-15"
  }
]
```

### 5. 影響力故事 API

#### 影響力故事列表
```http
GET /impact_stories
```
**響應**:
```json
[
  {
    "id": "story-001",
    "title": "數位教育改變偏鄉學童未來",
    "schoolName": "台東縣太麻里國小",
    "companyName": "科技公司",
    "imageUrl": "/images/impact-stories/background-wall/01.jpg",
    "summary": "透過平板電腦捐贈，提升偏鄉學童數位學習能力...",
    "storyDate": "2024-01-01",
    "impact": {
      "studentsBenefited": 120,
      "equipmentDonated": "平板電腦 50 台",
      "duration": "3 個月"
    }
  }
]
```

### 6. 用戶相關 API

#### 我的需求
```http
GET /my_needs
```
**響應**: SchoolNeed 數組（當前用戶的需求）

#### 企業捐贈記錄
```http
GET /company_donations
```
**響應**:
```json
[
  {
    "id": "donation-001",
    "needId": "need-001",
    "needTitle": "急需平板電腦支援數位教學",
    "schoolName": "台東縣太麻里國小",
    "donationDate": "2024-01-01",
    "status": "已完成",
    "type": "硬體設備",
    "description": "捐贈平板電腦 20 台"
  }
]
```

#### 最近活動
```http
GET /recent_activity
```
**響應**:
```json
[
  {
    "id": "activity-001",
    "type": "需求創建",
    "title": "新增需求：急需平板電腦",
    "timestamp": "2024-01-01T10:00:00Z",
    "status": "success"
  }
]
```

## 錯誤處理

所有 API 都應該返回標準的錯誤格式：

```json
{
  "error": "錯誤訊息",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

常見 HTTP 狀態碼：
- `200`: 成功
- `201`: 創建成功
- `400`: 請求錯誤
- `404`: 資源不存在
- `500`: 服務器錯誤

## 認證（可選）

如果需要認證，可以添加：
```http
Authorization: Bearer <token>
```

## 分頁（可選）

對於列表 API，可以支持分頁：
```http
GET /school_needs?page=1&limit=10
```

響應格式：
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```
