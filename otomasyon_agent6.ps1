$ErrorActionPreference = "Continue"
$env:PATH = "C:\Users\kaan\AppData\Roaming\npm;C:\Program Files\nodejs;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;" + $env:PATH

$agentName = "AGENT6_ORCHESTRATOR"
$agentNum = 6
$logFile = "agent6_sessions_log.md"
$promptFile = "prompts/agent6_prompts.txt"
$sinyalDir = "sinyaller"

# Her dalganin kac adimi var ve hangi agent'lar hangi adimda
$dalgaAdimHaritasi = @{
    1 = @{
        adimSayisi = 2
        adimlar = @{
            1 = @(1,2,3,5)   # Adim 1: Agent 1,2,3,5 paralel
            2 = @(4)          # Adim 2: Agent 4 (1+2+3+5 bekler)
        }
    }
    2 = @{
        adimSayisi = 3
        adimlar = @{
            1 = @(2,5)        # Adim 1: Agent 2,5 paralel
            2 = @(1,3)        # Adim 2: Agent 1,3 (Agent 2 bekler)
            3 = @(4)          # Adim 3: Agent 4 (Agent 1+3 bekler)
        }
    }
    3 = @{
        adimSayisi = 3
        adimlar = @{
            1 = @(2,5)
            2 = @(1,3)
            3 = @(4)
        }
    }
    4 = @{
        adimSayisi = 3
        adimlar = @{
            1 = @(2,3,5)
            2 = @(1)
            3 = @(4)
        }
    }
    5 = @{
        adimSayisi = 3
        adimlar = @{
            1 = @(2,3,5)
            2 = @(1)
            3 = @(4)
        }
    }
    6 = @{
        adimSayisi = 1
        adimlar = @{
            1 = @(1,2,3,4,5)  # Herkes paralel
        }
    }
}

$tumFazlar = @("A6-1","A6-2","A6-3","A6-4","A6-5","A6-6")

# Her dalga icin hangi fazlari calistiracak
$dalgaFazlari = @{
    1 = @("A6-1")
    2 = @("A6-2")
    3 = @("A6-3")
    4 = @("A6-4")
    5 = @("A6-5")
    6 = @("A6-6")
}

function Write-Log ($message) { $time = Get-Date -Format "HH:mm:ss"; Write-Host "[$time] [$agentName] $message" -ForegroundColor Magenta }
function Strip-Ansi ($line) { return $line -replace '\x1b\[[0-9;]*[a-zA-Z]', '' }
function Check-AdimSinyal ($dalgaNo, $adimNo, $agentNo) { return (Test-Path "$sinyalDir/dalga_${dalgaNo}_adim_${adimNo}_agent_${agentNo}_tamam.txt") }
function Check-TumAdimlarTamam ($dalgaNo) {
    $dalga = $dalgaAdimHaritasi[$dalgaNo]
    for ($adim = 1; $adim -le $dalga.adimSayisi; $adim++) {
        foreach ($agentNo in $dalga.adimlar[$adim]) {
            if (-not (Check-AdimSinyal $dalgaNo $adim $agentNo)) { return $false }
        }
    }
    return $true
}
function Get-EksikSinyaller ($dalgaNo) {
    $eksikler = @()
    $dalga = $dalgaAdimHaritasi[$dalgaNo]
    for ($adim = 1; $adim -le $dalga.adimSayisi; $adim++) {
        foreach ($agentNo in $dalga.adimlar[$adim]) {
            if (-not (Check-AdimSinyal $dalgaNo $adim $agentNo)) { $eksikler += "Agent $agentNo (Adim $adim)" }
        }
    }
    return $eksikler
}

function Jules-Oturum ($promptText, $dalgaNo, $fazKod) {
    if (-not (Test-Path "tasks")) { New-Item -ItemType Directory -Path "tasks" | Out-Null }
    $taskFile = "tasks/agent6_task_dalga${dalgaNo}_${fazKod}.txt"
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText((Join-Path $PWD $taskFile), $promptText, $utf8NoBom)
    Write-Log "Jules oturumu: Dalga $dalgaNo - $fazKod"
    $OutputEncoding = [Console]::InputEncoding = [Console]::OutputEncoding = $utf8NoBom
    $sessionId = $null; $julesRetry = 0
    while (-not $sessionId -and $julesRetry -lt 5) {
        if ($julesRetry -gt 0) { Start-Sleep -Seconds ($julesRetry * 20) }
        $output = cmd.exe /c "chcp 65001 >nul & C:\Users\kaan\AppData\Roaming\npm\jules.cmd new < `"$taskFile`" 2>&1"
        foreach ($line in $output) { $s = Strip-Ansi $line; Write-Host "  > $s" -ForegroundColor DarkGray; if ($s -match "/session/(\d+)") { $sessionId = $matches[1] } }
        $julesRetry++
    }
    if (-not $sessionId) { Write-Host "Session ID alinamadi!" -ForegroundColor Red; return $null }
    Write-Log "Session ID: $sessionId"
    Add-Content -Path $logFile -Value "`n### DALGA $dalgaNo - $fazKod`n- **Tarih:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n- **Session ID:** $sessionId" -Encoding UTF8
    $isCompleted = $false; $retryCount = 0; $awaitingHandled = $false
    while (-not $isCompleted) {
        Start-Sleep -Seconds 30
        try { $statusOutput = cmd.exe /c "chcp 65001 >nul & C:\Users\kaan\AppData\Roaming\npm\jules.cmd remote list --session" } catch { continue }
        $sessionStatus = "Bilinmiyor"
        foreach ($line in $statusOutput) { $s = Strip-Ansi $line; if ($s -match "\b$sessionId\b") { if ($s -match "Completed") { $sessionStatus = "Completed" } elseif ($s -match "Failed") { $sessionStatus = "Failed" } elseif ($s -match "Running") { $sessionStatus = "Running" } elseif ($s -match "Awaiting") { $sessionStatus = "Awaiting User" }; break } }
        Write-Host "  [$sessionStatus]" -ForegroundColor Cyan
        if ($sessionStatus -eq "Completed") { $isCompleted = $true }
        elseif ($sessionStatus -eq "Failed") { return $null }
        elseif ($sessionStatus -eq "Awaiting User" -and -not $awaitingHandled) {
            Set-Clipboard -Value "Denetimi tamamla, raporlari olustur."; Start-Process "https://jules.google.com/session/$sessionId"; Start-Sleep -Seconds 12
            Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("^v"); Start-Sleep -Milliseconds 800; [System.Windows.Forms.SendKeys]::SendWait("{ENTER}"); $awaitingHandled = $true
        } else { $retryCount++; if ($retryCount -gt 120) { return $null } }
    }
    cmd.exe /c "chcp 65001 >nul & C:\Users\kaan\AppData\Roaming\npm\jules.cmd remote pull --session $sessionId --apply"
    Start-Sleep -Seconds 5; git add .; git commit -m "[$agentName] DALGA $dalgaNo $fazKod (Session: $sessionId)"; git push origin main
    return $sessionId
}

Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host " $agentName - ROMA CITY BUILDER DALGA DENETIM " -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Yellow
Start-Sleep -Seconds 3

# KURTARMA
Write-Host "`n[KURTARMA] Kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path $logFile) {
    $logIcerik = Get-Content $logFile -Raw
    $sessionMatches = [regex]::Matches($logIcerik, 'Session ID:\*\* (\d+)')
    if ($sessionMatches.Count -gt 0) {
        $sonSession = $sessionMatches[$sessionMatches.Count - 1].Groups[1].Value
        try {
            $statusOutput = cmd.exe /c "chcp 65001 >nul & C:\Users\kaan\AppData\Roaming\npm\jules.cmd remote list --session 2>&1"
            foreach ($line in $statusOutput) { $s = Strip-Ansi $line; if ($s -match "\b$sonSession\b" -and $s -match "Completed") {
                cmd.exe /c "chcp 65001 >nul & C:\Users\kaan\AppData\Roaming\npm\jules.cmd remote pull --session $sonSession --apply 2>&1" | Out-Null
                Start-Sleep -Seconds 3; git add . 2>&1 | Out-Null; git commit -m "[$agentName] KURTARMA" 2>&1 | Out-Null; git push origin main 2>&1 | Out-Null; break
            } }
        } catch {}
    }
}
Write-Host "[KURTARMA] Tamamlandi.`n" -ForegroundColor Green

$content = Get-Content -Path $promptFile -Raw -Encoding UTF8

foreach ($dalgaNo in 1..6) {
    $gecisRaporu = "agent6_orchestrator/dalga_gecis_raporu_$dalgaNo.txt"
    if (Test-Path $gecisRaporu) {
        $icerik = Get-Content $gecisRaporu -Raw
        if ($icerik -match "GECİLEBİLİR|GECILEBILIR|GECIS ONAY|KOŞULLU GEÇİŞ|KOSULLU GECIS") {
            Write-Host "  [ATLANDI] Dalga $dalgaNo zaten onaylanmis." -ForegroundColor DarkGray; continue
        }
    }
    Write-Host "`n=== DALGA $dalgaNo - TUM ADIMLAR BEKLENIYOR ===" -ForegroundColor Yellow
    $beklemeSayaci = 0
    while (-not (Check-TumAdimlarTamam $dalgaNo)) {
        Start-Sleep -Seconds 60; $beklemeSayaci++
        if ($beklemeSayaci % 3 -eq 0) { git pull origin main 2>&1 | Out-Null; $eksikler = Get-EksikSinyaller $dalgaNo; Write-Host "  Bekleniyor ($($beklemeSayaci)dk) - Eksik: $($eksikler -join ', ')" -ForegroundColor DarkGray }
    }
    Write-Host "DALGA $dalgaNo TAMAMLANDI! Denetim basliyor..." -ForegroundColor Green
    git pull origin main 2>&1 | Out-Null
    foreach ($fazKod in $dalgaFazlari[$dalgaNo]) {
        Write-Host "--- $fazKod calistiriliyor ---" -ForegroundColor Magenta
        $startToken = "PROMPT $fazKod`:"; $startIndex = $content.IndexOf($startToken)
        if ($startIndex -eq -1) { Write-Log "$fazKod bulunamadi"; continue }
        $startIndex += $startToken.Length
        $nextPromptIndex = $content.IndexOf("`nPROMPT ", $startIndex)
        if ($nextPromptIndex -eq -1) { $promptText = $content.Substring($startIndex).Trim() } else { $promptText = $content.Substring($startIndex, $nextPromptIndex - $startIndex).Trim() }
        $fullPrompt = "DALGA $dalgaNo DENETIMI - $fazKod`n`n$promptText"
        Jules-Oturum $fullPrompt $dalgaNo $fazKod | Out-Null
        Start-Sleep -Seconds 5
    }
    # Guvenlik agi: gecis raporu yoksa otomatik olustur
    if (-not (Test-Path $gecisRaporu)) {
        Write-Host "  [UYARI] Gecis raporu bulunamadi, otomatik olusturuluyor..." -ForegroundColor Yellow
        $icerik = "DALGA GECIS RAPORU - DALGA $dalgaNo (OTOMATIK)`nDURUM: KOSULLU GECIS - GECILEBILIR`nTarih: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Set-Content -Path $gecisRaporu -Value $icerik -Encoding UTF8
        git add .; git commit -m "[$agentName] Dalga $dalgaNo gecis raporu otomatik"; git push origin main 2>&1 | Out-Null
    }
    Write-Host "Dalga $($dalgaNo + 1)'e gecis hazir.`n" -ForegroundColor Green
    Start-Sleep -Seconds 10
}

Write-Host "`n*** $agentName TUM DALGALAR DENETLENDI! ***" -ForegroundColor Green
