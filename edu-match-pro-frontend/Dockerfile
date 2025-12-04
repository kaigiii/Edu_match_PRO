# 直接使用 Nginx 服務靜態文件
FROM nginx:alpine

# 複製本地構建的 dist 目錄到 Nginx 服務目錄
COPY dist /usr/share/nginx/html

# 複製自定義 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
