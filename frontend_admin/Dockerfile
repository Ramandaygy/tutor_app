FROM node:18-alpine AS build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --force
COPY . .

# 🔧 FIX izin file react-scripts
RUN chmod +x node_modules/.bin/*

RUN npm run build

FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
