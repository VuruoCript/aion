# 🚀 Deploy Rápido - AION Trading System na Hostinger

## ⚡ Resumo Executivo

1. **Build Local** → 2. **Upload Arquivos** → 3. **Executar Script** → 4. **Configurar Domínio**

---

## 📦 Passo 1: Build Local (no seu computador)

```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd ../frontend
npm install
npm run build
```

**Importante**: Edite `frontend/.env.production` e `backend/.env.production` com seu domínio ANTES do build do frontend!

---

## 📤 Passo 2: Upload para Hostinger

### Via FTP/SFTP:

Upload das seguintes pastas/arquivos:

```
Hostinger (~/aion-trading/):
├── backend/
│   ├── dist/           ← Build do backend
│   ├── node_modules/   ← Dependências
│   ├── package.json
│   ├── .env            ← Criar com suas configs
│   └── src/
├── ecosystem.config.js
├── deploy.sh
└── logs/ (criar pasta vazia)

Hostinger (~/public_html/):
└── (conteúdo de frontend/dist/)
    ├── index.html
    ├── assets/
    └── ...
```

### Via SSH + Git (Recomendado):

```bash
# No servidor Hostinger
cd ~/
git clone https://github.com/seu-usuario/iatrade.git aion-trading
cd aion-trading
```

---

## ⚙️ Passo 3: Executar Deploy Script

### 3.1 Conectar via SSH

```bash
ssh usuario@seudominio.com
cd ~/aion-trading
```

### 3.2 Configurar .env

```bash
nano backend/.env
```

Adicione:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://seudominio.com
```

### 3.3 Executar Script de Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

O script vai:
- ✅ Instalar dependências
- ✅ Buildar o backend
- ✅ Instalar PM2
- ✅ Iniciar a aplicação
- ✅ Configurar auto-start

---

## 🌐 Passo 4: Configurar Nginx (Hostinger)

### 4.1 Criar arquivo de configuração

```bash
sudo nano /etc/nginx/sites-available/aion
```

Cole:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    root /home/usuario/public_html;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API & Socket.IO
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

### 4.2 Ativar e recarregar

```bash
sudo ln -s /etc/nginx/sites-available/aion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.3 SSL (HTTPS)

```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

---

## ✅ Verificação

### Testar Backend

```bash
curl http://localhost:3001/api/health
```

Esperado:
```json
{"status":"ok","timestamp":"...","connections":0,"engineRunning":true}
```

### Testar Frontend

Abra no navegador: `https://seudominio.com`

---

## 🔧 Comandos PM2 Úteis

```bash
pm2 status              # Ver status
pm2 logs aion-backend   # Ver logs em tempo real
pm2 restart aion-backend # Reiniciar
pm2 stop aion-backend   # Parar
pm2 monit               # Monitor interativo
```

---

## 🐛 Problemas Comuns

### 1. Backend não inicia

```bash
pm2 logs aion-backend
# Verifique se a porta 3001 está livre:
netstat -tulpn | grep 3001
```

### 2. Socket.IO não conecta

- Verifique CORS no backend (`server-new.ts`)
- Certifique-se que `FRONTEND_URL` no `.env` está correto
- Verifique configuração do Nginx

### 3. Frontend mostra página em branco

- Verifique console do navegador (F12)
- Verifique se `VITE_API_URL` no `.env.production` está correto
- Rebuild: `cd frontend && npm run build`

---

## 🔄 Atualizar Aplicação

```bash
# No servidor
cd ~/aion-trading
git pull                      # Se usando Git

cd backend
npm install
npm run build
pm2 restart aion-backend

cd ../frontend
npm install
npm run build
# Copiar dist/ para public_html
cp -r dist/* ~/public_html/
```

---

## 📞 Checklist Final

- [ ] Backend buildado e rodando com PM2
- [ ] Frontend em `public_html`
- [ ] Nginx configurado
- [ ] SSL configurado
- [ ] Firewall configurado (portas 80, 443)
- [ ] Testado em produção
- [ ] PM2 salvo e configurado para auto-start

---

**Pronto! Sua aplicação está no ar! 🎉**

Documentação completa: `DEPLOYMENT_HOSTINGER.md`
