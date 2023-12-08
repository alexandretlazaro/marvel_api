FROM node:20.9.0-alpine3.17

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie o arquivo package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código-fonte para o diretório de trabalho
COPY . .

# Exponha a porta 4200, que é a porta padrão para aplicativos Node.js
EXPOSE 4200

# Comando para iniciar a aplicação
CMD ["npm", "start"]