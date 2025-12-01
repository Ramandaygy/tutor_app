# ===== STAGE 1: Build React App =====
FROM node:18-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Salin file package.json & package-lock.json
COPY package*.json ./

# Install dependencies (pakai --force agar tetap lanjut meski ada warning)
RUN npm ci --force

# Salin semua source code
COPY . .

# 🔧 Perbaiki izin eksekusi untuk react-scripts
RUN chmod +x node_modules/.bin/*

# Build React app (hasilnya di folder /build)
RUN npm run build


# ===== STAGE 2: Setup Nginx untuk Serving Frontend =====
FROM nginx:alpine

# Hapus konfigurasi default bawaan Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Salin hasil build React dari stage pertama
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Salin konfigurasi custom Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Buka port 80 untuk akses web
EXPOSE 80

# Jalankan Nginx
CMD ["nginx", "-g", "daemon off;"]
