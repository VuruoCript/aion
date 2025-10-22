# Comandos para Deploy na Hostinger

## Conexão SSH
```bash
ssh -p 65002 u487955202@77.37.34.88
```

---

## 1️⃣ Preparar Diretórios

```bash
# Verificar diretório atual
pwd

# Criar estrutura
mkdir -p ~/aion-trading/backend/src
mkdir -p ~/aion-trading/logs
mkdir -p ~/public_html

# Navegar
cd ~/aion-trading
```

---

## 2️⃣ Upload de Arquivos

**IMPORTANTE:** Você precisará fazer upload via SFTP/FTP dos seguintes arquivos:

### Via SFTP (use FileZilla ou WinSCP):
- **Host:** 77.37.34.88
- **Porta:** 65002
- **Usuário:** u487955202
- **Protocolo:** SFTP

**Upload para `~/aion-trading/backend/`:**
- Toda a pasta `src/`
- `package.json`
- `.env.production` (renomear para `.env`)

**Upload para `~/aion-trading/`:**
- `ecosystem.config.js`
- `deploy.sh`

**Upload para `~/public_html/`:**
- Todo conteúdo de `frontend/dist/` (index.html, assets/, logo.png)

---

## 3️⃣ Criar arquivo .env

```bash
cd ~/aion-trading/backend
nano .env
```

Cole este conteúdo:
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://aionapp.xyz
```

Salvar: `Ctrl+O`, Enter, `Ctrl+X`

---

## 4️⃣ Instalar Node.js (se necessário)

```bash
# Verificar versão do Node.js
node --version
npm --version

# Se não estiver instalado, use o painel Hostinger para ativar Node.js
# Ou instale via NVM:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

---

## 5️⃣ Instalar Dependências

```bash
cd ~/aion-trading/backend
npm install
```

---

## 6️⃣ Instalar PM2

```bash
npm install -g pm2
```

---

## 7️⃣ Iniciar Aplicação

```bash
cd ~/aion-trading

# Dar permissão ao script
chmod +x deploy.sh

# Executar deploy (recomendado)
./deploy.sh
```

**OU manualmente:**

```bash
cd ~/aion-trading
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 8️⃣ Verificar Status

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs aion-backend

# Testar API
curl http://localhost:3001/api/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"...","connections":0,"engineRunning":true}
```

---

## 9️⃣ Configurar Nginx/Apache

### Se Nginx:

```bash
sudo nano /etc/nginx/sites-available/aion
```

Cole:
```nginx
server {
    listen 80;
    server_name aionapp.xyz www.aionapp.xyz;

    root /home/u487955202/public_html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ ^/(api|socket\.io) {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/aion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Se Apache (Hostinger geralmente usa):

Crie `.htaccess` no `public_html`:

```bash
nano ~/public_html/.htaccess
```

Cole:
```apache
RewriteEngine On

# Frontend - SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(api|socket\.io)
RewriteRule ^ index.html [L]

# Proxy para backend API
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Proxy para Socket.IO
RewriteCond %{REQUEST_URI} ^/socket\.io
RewriteRule ^socket\.io/(.*)$ http://localhost:3001/socket.io/$1 [P,L]
```

---

## 🔟 SSL (HTTPS)

```bash
# Certbot para SSL
sudo certbot --apache -d aionapp.xyz -d www.aionapp.xyz

# OU se nginx:
sudo certbot --nginx -d aionapp.xyz -d www.aionapp.xyz
```

---

## 🔧 Comandos Úteis

```bash
# Reiniciar aplicação
pm2 restart aion-backend

# Parar aplicação
pm2 stop aion-backend

# Ver logs
pm2 logs aion-backend

# Monitor
pm2 monit

# Deletar do PM2
pm2 delete aion-backend

# Ver processos Node.js
ps aux | grep node

# Matar processo na porta 3001
lsof -ti:3001 | xargs kill -9

# Ver portas em uso
netstat -tulpn | grep 3001
```

---

## 🐛 Troubleshooting

### Backend não inicia:
```bash
pm2 logs aion-backend --lines 50
cd ~/aion-trading/backend
npm start
```

### Socket.IO não conecta:
```bash
# Verificar se porta está aberta
curl http://localhost:3001/socket.io/

# Verificar CORS
nano ~/aion-trading/backend/src/server-new.ts
# Ajustar cors origin se necessário
```

### Frontend não carrega:
```bash
# Verificar arquivos
ls -la ~/public_html/

# Verificar permissões
chmod -R 755 ~/public_html/

# Verificar .htaccess
cat ~/public_html/.htaccess
```

---

## ✅ Checklist Final

- [ ] Node.js instalado (`node --version`)
- [ ] Arquivos enviados via SFTP
- [ ] `.env` criado no backend
- [ ] Dependências instaladas (`npm install`)
- [ ] PM2 instalado (`pm2 --version`)
- [ ] Backend rodando (`pm2 status`)
- [ ] Frontend em `public_html`
- [ ] Nginx/Apache configurado
- [ ] SSL configurado
- [ ] Testado: `https://aionapp.xyz`

---

**Sucesso! 🚀**
