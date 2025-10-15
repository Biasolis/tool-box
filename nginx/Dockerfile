FROM nginx:stable-alpine

# Remove a configuração padrão que vem com a imagem
RUN rm /etc/nginx/conf.d/default.conf

# A configuração será montada através de um volume do docker-compose
# Este Dockerfile é minimalista e apenas usa a imagem base.