#!/bin/bash

# AION Trading System - Deploy Script
# Execute este script no servidor após fazer upload dos arquivos

echo "========================================="
echo "  AION Trading System - Deploy Script"
echo "========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir em verde
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Função para imprimir em amarelo
info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Função para imprimir em vermelho
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar se está na pasta correta
if [ ! -f "ecosystem.config.js" ]; then
    error "ecosystem.config.js não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

# 1. Instalar dependências do backend
info "Instalando dependências do backend..."
cd backend
npm install --production
if [ $? -eq 0 ]; then
    success "Dependências do backend instaladas"
else
    error "Erro ao instalar dependências do backend"
    exit 1
fi

# 2. Build do backend
info "Buildando backend..."
npm run build
if [ $? -eq 0 ]; then
    success "Backend buildado com sucesso"
else
    error "Erro ao buildar backend"
    exit 1
fi

cd ..

# 3. Criar diretórios necessários
info "Criando diretórios..."
mkdir -p logs
mkdir -p backend/data
success "Diretórios criados"

# 4. Verificar se PM2 está instalado
info "Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    info "PM2 não encontrado. Instalando..."
    npm install -g pm2
    if [ $? -eq 0 ]; then
        success "PM2 instalado"
    else
        error "Erro ao instalar PM2"
        exit 1
    fi
else
    success "PM2 já está instalado"
fi

# 5. Parar aplicação se estiver rodando
info "Parando aplicação anterior (se houver)..."
pm2 delete aion-backend 2>/dev/null || true
success "Aplicação anterior parada"

# 6. Iniciar aplicação com PM2
info "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js
if [ $? -eq 0 ]; then
    success "Aplicação iniciada"
else
    error "Erro ao iniciar aplicação"
    exit 1
fi

# 7. Salvar configuração PM2
info "Salvando configuração PM2..."
pm2 save
success "Configuração PM2 salva"

# 8. Configurar PM2 para iniciar no boot
info "Configurando PM2 para iniciar no boot..."
pm2 startup | tail -n 1 | bash
success "PM2 configurado para iniciar no boot"

# 9. Mostrar status
echo ""
info "Status da aplicação:"
pm2 status

echo ""
success "========================================="
success "  Deploy concluído com sucesso!"
success "========================================="
echo ""
info "Comandos úteis:"
echo "  - Ver logs: pm2 logs aion-backend"
echo "  - Reiniciar: pm2 restart aion-backend"
echo "  - Parar: pm2 stop aion-backend"
echo "  - Status: pm2 status"
echo ""
info "API rodando em: http://localhost:3001"
info "Health check: curl http://localhost:3001/api/health"
echo ""
