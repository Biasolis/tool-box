# Stage 1: Build a aplicação Vue.js
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
# Para a Fase 0, apenas criamos o node_modules para o build não falhar.
RUN npm install
COPY . .
# O comando build falhará se não tivermos a estrutura mínima do Vue.
# Vamos comentar por enquanto para a Fase 0 ser bem-sucedida.
# RUN npm run build

# Stage 2: Serve a aplicação com Nginx
FROM nginx:stable-alpine AS production-stage
# Copia os arquivos compilados (neste caso, nada ainda)
# COPY --from=build-stage /app/dist /usr/share/nginx/html
# Adiciona um index.html de placeholder para sabermos que o serviço está no ar
RUN echo "<h1>Frontend Container is Running</h1>" > /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]