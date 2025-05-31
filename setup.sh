#!/bin/bash

# Script de desarrollo para la Galería de Memes

echo "🎭 Galería de Memes - Setup Helper"
echo "================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instálalo desde https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js instalado: $(node --version)"

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
else
    echo "✅ Dependencias ya instaladas"
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "💡 Copia .env.example a .env y configura tus variables"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Archivo .env creado desde .env.example"
        echo "🔧 Edita .env con tus keys de Clerk y Supabase"
    fi
else
    echo "✅ Archivo .env encontrado"
fi

echo ""
echo "🚀 Para iniciar el servidor de desarrollo:"
echo "   npm run dev"
echo ""
echo "🔧 Para verificar la configuración:"
echo "   Visita http://localhost:4321/setup"
echo ""
echo "📚 Lee el README.md para instrucciones completas"
