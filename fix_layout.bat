@echo off
pushd "%~dp0\..\..\.."
setlocal enabledelayedexpansion
set "TARGET=frontend\src\app\layout.tsx"
if not exist frontend\src\app mkdir frontend\src\app >nul 2>&1
del /f /q "%TARGET%" >nul 2>&1
echo import type { Metadata } from 'next'; > "%TARGET%"
echo import './globals.css'; >> "%TARGET%"
echo export const metadata: Metadata = { title: 'Search Helix', description: 'Plateforme de recherche' }; >> "%TARGET%"
echo export default function RootLayout({ children }: { children: React.ReactNode }) { >> "%TARGET%"
echo   return ( >> "%TARGET%"
echo     ^<html lang='fr'^> >> "%TARGET%"
echo       ^<body className='min-h-screen bg-[#0B0F19] text-[#E2E8F0] antialiased'^>{children}^</body^> >> "%TARGET%"
echo     ^</html^> >> "%TARGET%"
echo   ); >> "%TARGET%"
echo } >> "%TARGET%"
popd
endlocal
