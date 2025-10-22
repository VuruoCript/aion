# Deploy AION Trading System na Hostinger

## Pré-requisitos

1. **Conta Hostinger** com Node.js habilitado
2. **Acesso SSH** ao servidor
3. **Domínio** configurado (opcional, mas recomendado)

## Estrutura do Projeto

O projeto tem duas partes:
- **Backend**: API Node.js + Socket.IO (porta 3001)
- **Frontend**: React + Vite (build estático)

---

## 📋 Passo 1: Preparar o Projeto Local

### 1.1 Criar arquivo de ambiente para produção

Crie o arquivo `backend/.env.production`:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://seudominio.com
```

### 1.2 Atualizar package.json do backend

Certifique-se de que o `backend/package.json` tenha os scripts corretos:

```json
{
  "scripts": {
    "dev": "tsx watch src/server-new.ts",
    "build": "tsc",
    "start": "node dist/server-new.js",
    "clean": "rimraf dist"
  }
}
```

### 1.3 Build do projeto

```bash
# Build do backend
cd backend
npm install
npm run build

# Build do frontend
cd ../frontend
npm install
npm run build
```

---

## 🚀 Passo 2: Deploy na Hostinger

### 2.1 Conectar via SSH

```bash
ssh usuario@seudominio.com
```

### 2.2 Instalar Node.js (se necessário)

A Hostinger geralmente vem com Node.js instalado. Verifique:

```bash
node --version
npm --version
```

Se não estiver instalado, use o painel da Hostinger para ativar Node.js.

### 2.3 Criar estrutura de diretórios

```bash
cd ~/
mkdir aion-trading
cd aion-trading
```

### 2.4 Upload dos arquivos

**Opção A: Via FTP/SFTP** (FileZilla, WinSCP, etc.)
- Faça upload da pasta `backend` (com `node_modules`, `dist`, etc.)
- Faça upload da pasta `frontend/dist` para `public_html` ou diretório web

**Opção B: Via Git** (Recomendado)

```bash
# No servidor
cd ~/aion-trading
git clone https://github.com/seu-usuario/iatrade.git .

# Instalar dependências do backend
cd backend
npm install --production

# Build do backend (se não fez localmente)
npm run build
```

### 2.5 Configurar variáveis de ambiente

```bash
cd ~/aion-trading/backend
nano .env
```

Adicione:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://seudominio.com
```

---

## 🔧 Passo 3: Configurar PM2 (Process Manager)

PM2 mantém o backend rodando 24/7, mesmo após reiniciar o servidor.

### 3.1 Instalar PM2

```bash
npm install -g pm2
```

### 3.2 Iniciar o backend com PM2

```bash
cd ~/aion-trading/backend
pm2 start dist/server-new.js --name "aion-backend"
```

### 3.3 Configurar PM2 para iniciar com o servidor

```bash
pm2 startup
pm2 save
```

### 3.4 Comandos úteis do PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs aion-backend

# Reiniciar
pm2 restart aion-backend

# Parar
pm2 stop aion-backend

# Deletar
pm2 delete aion-backend
```

---

## 🌐 Passo 4: Configurar Frontend

### 4.1 Atualizar URL do backend no frontend

Edite `frontend/src/hooks/useSocket.ts`:

```typescript
const newSocket = io('https://seudominio.com:3001', {
  transports: ['websocket', 'polling']
});
```

Ou melhor, use variável de ambiente:

Crie `frontend/.env.production`:

```env
VITE_API_URL=https://seudominio.com:3001
```

E atualize `useSocket.ts`:

```typescript
const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
  transports: ['websocket', 'polling']
});
```

### 4.2 Rebuild e upload do frontend

```bash
cd frontend
npm run build

# Upload da pasta dist/ para public_html via FTP/SFTP
```

---

## 🔐 Passo 5: Configurar Proxy Reverso (Nginx/Apache)

### 5.1 Nginx (Recomendado)

Crie arquivo de configuração `/etc/nginx/sites-available/aion`:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    # Frontend (arquivos estáticos)
    root /home/usuario/public_html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/aion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5.2 Configurar HTTPS (SSL/TLS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

---

## 📊 Passo 6: Configurar Firewall

Certifique-se de que as portas necessárias estão abertas:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw enable
```

---

## 🔍 Passo 7: Verificação

### 7.1 Testar backend

```bash
curl http://localhost:3001/api/health
```

Deve retornar:

```json
{
  "status": "ok",
  "timestamp": "...",
  "connections": 0,
  "engineRunning": true
}
```

### 7.2 Testar frontend

Acesse: `https://seudominio.com`

---

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Ver logs do PM2
pm2 logs aion-backend

# Ver portas em uso
netstat -tulpn | grep 3001

# Reiniciar PM2
pm2 restart aion-backend
```

### Socket.IO não conecta

1. Verifique se o Nginx está configurado corretamente
2. Certifique-se de que `FRONTEND_URL` no `.env` está correto
3. Verifique CORS no `server-new.ts`

### Frontend não carrega

1. Verifique se os arquivos estão em `public_html`
2. Verifique permissões: `chmod -R 755 public_html`
3. Verifique configuração do Nginx

---

## 📝 Manutenção

### Atualizar o sistema

```bash
# Pull das mudanças
cd ~/aion-trading
git pull

# Rebuild backend
cd backend
npm install
npm run build
pm2 restart aion-backend

# Rebuild frontend
cd ../frontend
npm install
npm run build
# Upload da pasta dist/ para public_html
```

### Backup de dados

```bash
# Backup do banco de dados (se houver)
# Backup dos dados persistidos
cp -r ~/aion-trading/backend/data ~/backups/data-$(date +%Y%m%d)
```

---

## 📞 Suporte

- Documentação Hostinger: https://www.hostinger.com.br/tutoriais/
- PM2 Docs: https://pm2.keymetrics.io/docs/usage/quick-start/
- Nginx Docs: https://nginx.org/en/docs/

---

## ✅ Checklist de Deploy

- [ ] Node.js instalado no servidor
- [ ] Backend buildado (`npm run build`)
- [ ] Frontend buildado (`npm run build`)
- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] PM2 instalado e configurado
- [ ] Backend rodando com PM2
- [ ] Frontend copiado para `public_html`
- [ ] Nginx/Apache configurado
- [ ] SSL/TLS configurado (HTTPS)
- [ ] Firewall configurado
- [ ] Testado em produção
- [ ] Monitoramento configurado (PM2)

---

**Boa sorte com o deploy! 🚀**
