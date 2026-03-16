$ErrorActionPreference = "Continue"
$env:PATH = "C:\Users\PC\AppData\Roaming\npm;C:\Program Files\nodejs;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;" + $env:PATH

$agentName = "AGENT5_RESEARCH"
$agentNum = 5
$logFile = "agent5_sessions_log.md"
$promptFile = "prompts/agent5_prompts.txt"
$sinyalDir = "sinyaller"

$dalgaAdimFaz = @{
    1 = @{ adim=1; fazlar=@("A5-1"); bekle=@() }
    2 = @{ adim=1; fazlar=@("A5-2"); bekle=@() }
    3 = @{ adim=1; fazlar=@("A5-3"); bekle=@() }
    4 = @{ adim=1; fazlar=@("A5-4"); bekle=@() }
    5 = @{ adim=1; fazlar=@("A5-5"); bekle=@() }
    6 = @{ adim=1; fazlar=@("A5-6"); bekle=@() }
    7 = @{ adim=1; fazlar=@("A5-7"); bekle=@() }
    8 = @{ adim=1; fazlar=@("A5-8"); bekle=@() }
    9 = @{ adim=1; fazlar=@("A5-9"); bekle=@() }
    10 = @{ adim=1; fazlar=@("A5-10"); bekle=@() }
    11 = @{ adim=1; fazlar=@("A5-11"); bekle=@() }
    12 = @{ adim=1; fazlar=@("A5-12"); bekle=@() }
    13 = @{ adim=1; fazlar=@("A5-13"); bekle=@() }
    14 = @{ adim=1; fazlar=@("A5-14"); bekle=@() }
    15 = @{ adim=1; fazlar=@("A5-15"); bekle=@() }
    16 = @{ adim=1; fazlar=@("A5-16"); bekle=@() }
    17 = @{ adim=1; fazlar=@("A5-17"); bekle=@() }
    18 = @{ adim=1; fazlar=@("A5-18"); bekle=@() }
}

$tumFazlar = @("A5-1","A5-2","A5-3","A5-4","A5-5","A5-6","A5-7","A5-8","A5-9","A5-10","A5-11","A5-12","A5-13","A5-14","A5-15","A5-16","A5-17","A5-18")

function Write-Log ($message) { $time = Get-Date -Format "HH:mm:ss"; Write-Host "[$time] [$agentName] $message" -ForegroundColor Cyan }
function Strip-Ansi ($line) { return $line -replace '\x1b\[[0-9;]*[a-zA-Z]', '' }
function Get-FazDalga ($fazKod) { foreach ($d in $dalgaAdimFaz.Keys | Sort-Object) { if ($dalgaAdimFaz[$d].fazlar -contains $fazKod) { return $d } }; return -1 }
function Check-DalgaGecisOnay ($dalgaNo) { $f = "agent6_orchestrator/dalga_gecis_raporu_$dalgaNo.txt"; if (Test-Path $f) { $c = Get-Content $f -Raw; if ($c -match "GECİLEBİLİR|GECILEBILIR|GECIS ONAY|KOŞULLU GEÇİŞ|KOSULLU GECIS") { return $true } }; return $false }
function Check-AdimSinyal ($dalgaNo, $adimNo, $agentNo) { return (Test-Path "$sinyalDir/dalga_${dalgaNo}_adim_${adimNo}_agent_${agentNo}_tamam.txt") }
function Yaz-Sinyal ($dalgaNo, $adimNo) {
    if (-not (Test-Path $sinyalDir)) { New-Item -ItemType Directory -Path $sinyalDir | Out-Null }
    $dosya = "$sinyalDir/dalga_${dalgaNo}_adim_${adimNo}_agent_${agentNum}_tamam.txt"
    Set-Content -Path $dosya -Value "Agent $agentNum - Dalga $dalgaNo Adim $adimNo TAMAMLANDI`nTarih: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -Encoding UTF8
    Write-Log "Sinyal: $dosya"
}
function Check-FazTamam ($fazKod) { return (Test-Path "$sinyalDir/faz_${fazKod}_tamam.txt") }
function Yaz-FazSinyal ($fazKod) {
    if (-not (Test-Path $sinyalDir)) { New-Item -ItemType Directory -Path $sinyalDir | Out-Null }
    Set-Content -Path "$sinyalDir/faz_${fazKod}_tamam.txt" -Value "FAZ $fazKod TAMAMLANDI - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -Encoding UTF8
}
function Bekle-BagimliAgent ($dalgaNo, $bekleAgentler) {
    $oncekiAdim = $dalgaAdimFaz[$dalgaNo].adim - 1
    if ($oncekiAdim -lt 1) { return }
    foreach ($ba in $bekleAgentler) {
        Write-Host "  Agent $ba Dalga $dalgaNo sinyali bekleniyor..." -ForegroundColor Yellow
        $s = 0; $bulundu = $false
        while (-not $bulundu) {
            for ($a = 1; $a -le $oncekiAdim; $a++) { if (Check-AdimSinyal $dalgaNo $a $ba) { $bulundu = $true; break } }
            if (-not $bulundu) { Start-Sleep -Seconds 30; $s++; if ($s % 4 -eq 0) { git pull origin main 2>&1 | Out-Null; Write-Host "    Bekleniyor... Agent $ba ($($s*30)sn)" -ForegroundColor DarkGray } }
        }
        Write-Host "  Agent $ba TAMAM!" -ForegroundColor Green
    }
}

Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host " $agentName - ROMA CITY BUILDER OTOMASYON " -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Yellow
Start-Sleep -Seconds 3

# KURTARMA
Write-Host "`n[KURTARMA] Yarim kalan session kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path $logFile) {
    $logIcerik = Get-Content $logFile -Raw
    $sessionMatches = [regex]::Matches($logIcerik, 'Session ID:\*\* (\d+)')
    if ($sessionMatches.Count -gt 0) {
        $sonSession = $sessionMatches[$sessionMatches.Count - 1].Groups[1].Value
        try {
            $statusOutput = cmd.exe /c "chcp 65001 >nul & C:\Users\PC\AppData\Roaming\npm\jules.cmd remote list --session 2>&1"
            $durum = "Bilinmiyor"
            foreach ($line in $statusOutput) { $s = Strip-Ansi $line; if ($s -match "\b$sonSession\b") { if ($s -match "Completed") { $durum = "Completed" } elseif ($s -match "Running") { $durum = "Running" }; break } }
            if ($durum -eq "Completed") {
                cmd.exe /c "chcp 65001 >nul & C:\Users\PC\AppData\Roaming\npm\jules.cmd remote pull --session $sonSession --apply 2>&1" | Out-Null
                Start-Sleep -Seconds 3; git add . 2>&1 | Out-Null
                $co = git commit -m "[$agentName] KURTARMA - Session $sonSession" 2>&1
                if ($co -notmatch "nothing to commit") { git push origin main 2>&1 | Out-Null }
            }
        } catch {}
    }
}
Write-Host "[KURTARMA] Tamamlandi.`n" -ForegroundColor Green

$content = Get-Content -Path $promptFile -Raw -Encoding UTF8
$oncekiDalga = 0

foreach ($fazKod in $tumFazlar) {
    $mevcutDalga = Get-FazDalga $fazKod
    $dalgaBilgi = $dalgaAdimFaz[$mevcutDalga]
    if ($mevcutDalga -gt $oncekiDalga -and $oncekiDalga -gt 0) {
        Write-Host "`n--- DALGA $oncekiDalga BITTI - Agent 6 onayi bekleniyor ---" -ForegroundColor Yellow
        $s = 0; while (-not (Check-DalgaGecisOnay $oncekiDalga)) { Start-Sleep -Seconds 30; $s++; if ($s % 4 -eq 0) { git pull origin main 2>&1 | Out-Null } }
        Write-Host "Agent 6 ONAY VERDI! Dalga $mevcutDalga basliyor.`n" -ForegroundColor Green
    }
    $dalgaIlkFaz = $dalgaBilgi.fazlar[0]
    if ($fazKod -eq $dalgaIlkFaz -and $dalgaBilgi.bekle.Count -gt 0) { Bekle-BagimliAgent $mevcutDalga $dalgaBilgi.bekle }
    $oncekiDalga = $mevcutDalga
    if (Check-FazTamam $fazKod) { Write-Host "  [ATLANDI] $fazKod zaten tamam." -ForegroundColor DarkGray; continue }

    Write-Host "`n=== $agentName - FAZ $fazKod (Dalga $mevcutDalga) ===" -ForegroundColor Magenta
    $startToken = "PROMPT $fazKod`:"; $startIndex = $content.IndexOf($startToken)
    if ($startIndex -eq -1) { Write-Log "$fazKod prompt bulunamadi!"; continue }
    $startIndex += $startToken.Length
    $nextPromptIndex = $content.IndexOf("`nPROMPT ", $startIndex)
    if ($nextPromptIndex -eq -1) { $promptText = $content.Substring($startIndex).Trim() } else { $promptText = $content.Substring($startIndex, $nextPromptIndex - $startIndex).Trim() }

    if (-not (Test-Path "tasks")) { New-Item -ItemType Directory -Path "tasks" | Out-Null }
    $taskFile = "tasks/agent${agentNum}_task_$fazKod.txt"
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText((Join-Path $PWD $taskFile), $promptText, $utf8NoBom)
    $OutputEncoding = [Console]::InputEncoding = [Console]::OutputEncoding = $utf8NoBom
    $sessionId = $null; $julesRetry = 0
    while (-not $sessionId -and $julesRetry -lt 5) {
        if ($julesRetry -gt 0) { Start-Sleep -Seconds ($julesRetry * 20) }
        $output = cmd.exe /c "chcp 65001 >nul & C:\Users\PC\AppData\Roaming\npm\jules.cmd new < `"$taskFile`" 2>&1"
        foreach ($line in $output) { $s = Strip-Ansi $line; Write-Host "  > $s" -ForegroundColor DarkGray; if ($s -match "/session/(\d+)") { $sessionId = $matches[1] } }
        $julesRetry++
    }
    if (-not $sessionId) { Write-Host "Session ID alinamadi!" -ForegroundColor Red; continue }
    Write-Log "Session ID: $sessionId"
    Add-Content -Path $logFile -Value "`n### FAZ $fazKod (Dalga $mevcutDalga)`n- **Tarih:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n- **Session ID:** $sessionId" -Encoding UTF8

    $isCompleted = $false; $retryCount = 0; $awaitingHandled = $false
    while (-not $isCompleted) {
        Start-Sleep -Seconds 30
        try { $statusOutput = cmd.exe /c "chcp 65001 >nul & C:\Users\PC\AppData\Roaming\npm\jules.cmd remote list --session" } catch { continue }
        $sessionStatus = "Bilinmiyor"
        foreach ($line in $statusOutput) { $s = Strip-Ansi $line; if ($s -match "\b$sessionId\b") { if ($s -match "Completed") { $sessionStatus = "Completed" } elseif ($s -match "Failed") { $sessionStatus = "Failed" } elseif ($s -match "Running") { $sessionStatus = "Running" } elseif ($s -match "Awaiting") { $sessionStatus = "Awaiting User" }; break } }
        Write-Host "  [$sessionStatus]" -ForegroundColor Cyan
        if ($sessionStatus -eq "Completed") { $isCompleted = $true }
        elseif ($sessionStatus -eq "Failed") { Write-Host "[HATA]" -ForegroundColor Red; break }
        elseif ($sessionStatus -eq "Awaiting User" -and -not $awaitingHandled) {
            Set-Clipboard -Value "Gorevi tamamla, onay gerekmiyor. Bitir."; Start-Process "https://jules.google.com/session/$sessionId"; Start-Sleep -Seconds 12
            Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("^v"); Start-Sleep -Milliseconds 800; [System.Windows.Forms.SendKeys]::SendWait("{ENTER}"); $awaitingHandled = $true
        } else { $retryCount++; if ($retryCount -gt 120) { Write-Host "[TIMEOUT]" -ForegroundColor Red; break } }
    }

    cmd.exe /c "chcp 65001 >nul & C:\Users\PC\AppData\Roaming\npm\jules.cmd remote pull --session $sessionId --apply"
    Start-Sleep -Seconds 5; git add .; git commit -m "[$agentName] FAZ $fazKod (Session: $sessionId)"; git push origin main
    Yaz-FazSinyal $fazKod
    if ($fazKod -eq $dalgaBilgi.fazlar[-1]) { Yaz-Sinyal $mevcutDalga $dalgaBilgi.adim; git add .; git push origin main 2>$null }
    Start-Sleep -Seconds 10
}

Write-Host "`n*** $agentName TUM FAZLAR TAMAMLANDI! ***" -ForegroundColor Green
