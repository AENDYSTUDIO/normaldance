#!/bin/bash
# Настройка Nginx для NORMALDANCE

ssh aendy@176.108.246.49 "sudo tee /etc/nginx/sites-available/dnb1st.ru > /dev/null" << 'EOF'
server {
    listen 80;
    server_name dnb1st.ru www.dnb1st.ru;
    
    access_log /var/log/nginx/dnb1st.ru.access.log;
    error_log /var/log/nginx/dnb1st.ru.error.log;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /static/ {
        alias /var/www/dnb1st.ru/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Активация сайта
ssh aendy@176.108.246.49 "sudo ln -sf /etc/nginx/sites-available/dnb1st.ru /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx"