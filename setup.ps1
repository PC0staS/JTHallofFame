# Script de desarrollo para la Galería de Memes

Write-Host "🎭 Galería de Memes - Setup Helper" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Instálalo desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar si las dependencias están instaladas
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
}

# Verificar archivo .env
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "💡 Copia .env.example a .env y configura tus variables" -ForegroundColor Cyan
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Archivo .env creado desde .env.example" -ForegroundColor Green
        Write-Host "🔧 Edita .env con tus keys de Clerk y Supabase" -ForegroundColor Cyan
    }
} else {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Para iniciar el servidor de desarrollo:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Para verificar la configuración:" -ForegroundColor Cyan
Write-Host "   Visita http://localhost:4321/setup" -ForegroundColor White
Write-Host ""
Write-Host "📚 Lee el README.md para instrucciones completas" -ForegroundColor Cyan
