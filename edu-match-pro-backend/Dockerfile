# 使用官方 Python 3.11 輕量版映像
FROM python:3.11-slim

# 設定工作目錄
WORKDIR /app

# 設定環境變數
# PYTHONDONTWRITEBYTECODE: 防止 Python 寫入 .pyc 文件
# PYTHONUNBUFFERED: 確保 Python 輸出直接傳送到終端，不被緩存
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 安裝系統依賴
# gcc, libpq-dev: 用於編譯 psycopg2 (PostgreSQL 適配器)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 複製依賴文件
COPY requirements.txt .

# 安裝 Python 依賴
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用程式代碼
COPY . .

# 暴露端口
EXPOSE 3001

# 啟動命令
# 複製啟動腳本
COPY start.sh .
RUN chmod +x start.sh

# 啟動命令
CMD ["./start.sh"]
