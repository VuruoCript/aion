# 🚀 Passos Finais - Deploy AION Trading

## ✅ Frontend Reconstruído!

O frontend agora está configurado para conectar via proxy (sem porta :3001).

---

## 📤 **1. Upload do Novo Frontend**

### Via SFTP (WinSCP/FileZilla):
1. Conecte em: **77.37.34.88:65002**
2. Navegue até: `/home/u487955202/public_html/`
3. **DELETE** todos os arquivos antigos (index.html, assets/)
4. **UPLOAD** todo conteúdo de: `C:\Projetos\iatrade\frontend\dist\`
   - index.html
   - assets/
   - logo.png

### OU via SCP (PowerShell/Git Bash no seu PC):
```bash
cd C:\Projetos\iatrade\frontend

# Deletar arquivos antigos (no SSH do servidor primeiro)
# ssh -p 65002 u487955202@77.37.34.88
# rm -rf ~/public_html/*
# exit

# Upload novo build
scp -P 65002 -r dist/* u487955202@77.37.34.88:public_html/
```

---

## 🔧 **2. Limpar PM2 no Servidor**

No SSH do servidor, execute:

```bash
# Deletar instância duplicada (ID 1)
pm2 delete 1

# Verificar
pm2 status

# Deve mostrar apenas:
# │ 0  │ aion-backend  │ fork  │ 0  │ online  │ 0%  │ 56.3mb │

# Salvar configuração
pm2 save
```

---

## 🌐 **3. Configurar .htaccess (Proxy)**

No SSH do servidor:

```bash
nano ~/public_html/.htaccess
```

**Cole este conteúdo:**

```apache
# Habilitar Rewrite
RewriteEngine On

# WebSocket e Socket.IO
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^socket\.io/(.*)$ http://localhost:3001/socket.io/$1 [P,L]

# API Routes
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Socket.IO (polling fallback)
RewriteCond %{REQUEST_URI} ^/socket\.io/ [NC]
RewriteRule ^socket\.io/(.*)$ http://localhost:3001/socket.io/$1 [P,L]

# Frontend SPA - todas as outras rotas
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(api|socket\.io) [NC]
RewriteRule ^ index.html [L]

# Configuração de Proxy (Apache)
<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyRequests Off

    # WebSocket Support
    ProxyPass /socket.io http://localhost:3001/socket.io upgrade=websocket
    ProxyPassReverse /socket.io http://localhost:3001/socket.io

    # API
    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api
</IfModule>
```

**Salvar:** `Ctrl+O`, Enter, `Ctrl+X`

---

## 🧪 **4. Testar**

### No SSH:
```bash
# Verificar backend
curl http://localhost:3001/api/health

# Deve retornar:
# {"status":"ok","timestamp":"...","connections":0,"engineRunning":true}

# Ver logs do PM2
pm2 logs aion-backend --lines 20
```

### No Navegador:
1. Abra: **https://aionapp.xyz**
2. Abra DevTools (F12) → Console
3. **NÃO** deve ter erros de WebSocket
4. Deve conectar e mostrar traders ativos

---

## 🔄 **5. Se o Proxy não Funcionar**

### Alternativa - Atualizar backend CORS:

No SSH:
```bash
nano ~/aion-trading/backend/src/server-new.ts
```

Encontre a linha com `cors` (aproximadamente linha 20) e atualize:

```typescript
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['https://aionapp.xyz', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

Salvar e reiniciar:
```bash
pm2 restart aion-backend
pm2 logs aion-backend
```

---

## ✅ **Checklist Final**

- [ ] Frontend uploadado (`dist/` → `public_html/`)
- [ ] PM2 com apenas 1 instância rodando
- [ ] `.htaccess` configurado com proxy
- [ ] Backend respondendo (`curl localhost:3001/api/health`)
- [ ] Site abrindo (`https://aionapp.xyz`)
- [ ] WebSocket conectando (sem erros no console)
- [ ] Traders aparecendo na tela
- [ ] Live feed funcionando

---

## 🆘 **Troubleshooting**

### WebSocket ainda não conecta:

1. **Verificar módulos Apache:**
```bash
# Ver módulos carregados
apachectl -M | grep proxy
```

Deve ter:
- proxy_module
- proxy_http_module
- proxy_wstunnel_module

2. **Verificar logs Apache:**
```bash
tail -f /var/log/apache2/error.log
# OU
tail -f ~/logs/error_log
```

3. **Testar proxy manualmente:**
```bash
curl https://aionapp.xyz/api/health
```

Deve retornar o mesmo resultado de `localhost:3001/api/health`

---

## 📞 **Contato Hostinger**

Se os módulos proxy não estiverem habilitados, abra ticket para a Hostinger:
- Solicitar habilitação de: `mod_proxy`, `mod_proxy_http`, `mod_proxy_wstunnel`
- Ou upgrade para VPS se necessário

---

**Boa sorte! 🚀**
