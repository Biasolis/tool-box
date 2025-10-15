# Use uma imagem base do Node.js
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install --only=production

# Copia o código-fonte da aplicação para o diretório de trabalho
COPY ./src ./src

# Expõe a porta que o microsserviço irá rodar (deve ser configurada via ENV)
EXPOSE 3023

# Comando para iniciar o servidor
CMD [ "node", "src/server.js" ]