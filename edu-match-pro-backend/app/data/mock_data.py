"""
模擬數據配置
用於演示和測試的靜態數據
"""

# 最近專案模擬數據
RECENT_PROJECTS = [
    {
        "id": "project-001",
        "title": "數位設備捐贈專案",
        "school": "台東縣太麻里國小",
        "status": "completed",
        "progress": 100,
        "studentsBenefited": 120,
        "completionDate": "2024-01-15"
    },
    {
        "id": "project-002", 
        "title": "圖書資源支援專案",
        "school": "花蓮縣秀林國中",
        "status": "in_progress",
        "progress": 75,
        "studentsBenefited": 85,
        "completionDate": None
    }
]

# 影響力故事模擬數據
IMPACT_STORIES = [
    {
        "id": "story-001",
        "title": "孩子們眼中的星星：台積電志工帶來的程式設計課",
        "schoolName": "花蓮縣秀林鄉銅門國小",
        "companyName": "台積電",
        "imageUrl": "/images/impact-stories/background-wall/01.jpg",
        "summary": "志工每週到校教學，讓山區孩子接觸最先進的程式設計知識。",
        "storyDate": "2024-12-15",
        "impact": {"studentsBenefited": 28, "equipmentDonated": "15台筆記型電腦", "duration": "6個月"}
    },
    {
        "id": "story-002",
        "title": "從山區到雲端：遠距程式課",
        "schoolName": "南投縣信義鄉羅娜國小",
        "companyName": "鴻海科技",
        "imageUrl": "/images/impact-stories/background-wall/05.jpg",
        "summary": "12 週線上課程，讓孩子們的創意在數位世界綻放。",
        "storyDate": "2024-11-20",
        "impact": {"studentsBenefited": 35, "equipmentDonated": "程式設計軟體授權", "duration": "3個月"}
    },
    {
        "id": "story-003",
        "title": "陽光下的夢想：足球隊重燃希望",
        "schoolName": "台東縣長濱鄉長濱國小",
        "companyName": "統一企業",
        "imageUrl": "/images/impact-stories/background-wall/09.jpg",
        "summary": "捐贈器材與訓練經費，助孩子們勇敢追夢。",
        "storyDate": "2024-10-30",
        "impact": {"studentsBenefited": 45, "equipmentDonated": "20顆足球 + 2個球門", "duration": "持續進行"}
    },
    {
        "id": "story-006",
        "title": "一起飛向未來：遠距英文家教進入偏鄉",
        "schoolName": "宜蘭縣大同鄉南山國小",
        "companyName": "台灣微軟",
        "imageUrl": "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1170",
        "summary": "每週口說練習，建立自信，打開國際視野。",
        "storyDate": "2024-07-05",
        "impact": {"studentsBenefited": 20, "equipmentDonated": "英文學習帳號與耳麥", "duration": "3個月"}
    },
    {
        "id": "story-007",
        "title": "綠色教室：把環保教育帶進校園",
        "schoolName": "新竹縣尖石鄉新光國小",
        "companyName": "台達電子",
        "imageUrl": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1170",
        "summary": "打造綠色教室，從回收與節能培養永續意識。",
        "storyDate": "2024-06-10",
        "impact": {"studentsBenefited": 30, "equipmentDonated": "節能燈具與回收設備", "duration": "6個月"}
    },
    {
        "id": "story-008",
        "title": "科技小農：用感測器照顧校園菜園",
        "schoolName": "苗栗縣泰安鄉象鼻國小",
        "companyName": "和碩聯合科技",
        "imageUrl": "https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=1170",
        "summary": "用 IoT 監測土壤與日照，培養科學精神與責任感。",
        "storyDate": "2024-05-22",
        "impact": {"studentsBenefited": 26, "equipmentDonated": "感測器套件與樹梅派", "duration": "4個月"}
    }
]
