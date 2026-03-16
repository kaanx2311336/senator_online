$ErrorActionPreference = "Continue"
$env:PATH = "C:\Users\kaan\AppData\Roaming\npm;C:\Program Files\nodejs;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;" + $env:PATH

Write-Host "=================================================================" -ForegroundColor Yellow
Write-Host " ROMA CITY BUILDER - 6 AGENT PARALEL OTOMASYON MASTER SCRIPTI   " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "DALGA SIRASI:" -ForegroundColor Magenta
Write-Host "  Dalga 1: Sahne Iskeleti + Temel Nesneler"
Write-Host "  Dalga 2: Ana Binalar + Detayli Modeller"
Write-Host "  Dalga 3: Etkilesim + Animasyon"
Write-Host "  Dalga 4: Kaynak Sistemi + Yukseltmeler"
Write-Host "  Dalga 5: Gorsel Iyilestirme + Detay"
Write-Host "  Dalga 6: Optimizasyon + Mobil + Final"
Write-Host ""

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$baslangicDalga = 1
if ($args.Count -gt 0) {
    $baslangicDalga = [int]$args[0]
    Write-Host "Baslangic dalgasi: $baslangicDalga" -ForegroundColor Green
}

Write-Host "5 saniye icinde 6 agent penceresi acilacak..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n[BASLATILIYOR] Agent 1: SCENE_MASTER" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-File","$scriptDir\otomasyon_agent1.ps1" -WorkingDirectory $scriptDir
Start-Sleep -Seconds 15

Write-Host "[BASLATILIYOR] Agent 2: OBJECT_ENGINE" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-File","$scriptDir\otomasyon_agent2.ps1" -WorkingDirectory $scriptDir
Start-Sleep -Seconds 15

Write-Host "[BASLATILIYOR] Agent 3: UI_DESIGNER" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-File","$scriptDir\otomasyon_agent3.ps1" -WorkingDirectory $scriptDir
Start-Sleep -Seconds 15

Write-Host "[BASLATILIYOR] Agent 4: INTERACTION" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-File","$scriptDir\otomasyon_agent4.ps1" -WorkingDirectory $scriptDir
Start-Sleep -Seconds 15

Write-Host "[BASLATILIYOR] Agent 5: RESEARCHER_QA" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-File","$scriptDir\otomasyon_agent5.ps1" -WorkingDirectory $scriptDir
Start-Sleep -Seconds 15

Write-Host "[BASLATILIYOR] Agent 6: ORCHESTRATOR" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-File","$scriptDir\otomasyon_agent6.ps1" -WorkingDirectory $scriptDir

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host " TUM 6 AGENT BASLATILDI!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Her agent kendi penceresinde calisiyor." -ForegroundColor Cyan
Write-Host "Bu pencereyi kapatabilirsiniz." -ForegroundColor Yellow
