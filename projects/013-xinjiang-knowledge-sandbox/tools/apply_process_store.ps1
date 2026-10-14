param([Parameter(Mandatory=$true)][string]$PlanPath)
$ErrorActionPreference = 'Stop'
$plan = Get-Content -LiteralPath $PlanPath -Raw | ConvertFrom-Json
$processRoot = [IO.Path]::GetFullPath('F:\codex_project\1009_codex_project\projects\013-xinjiang-knowledge-sandbox\process')
$storeRoot = Join-Path $processRoot '.store'
$externalParent = 'D:\codex\home\visualizations\2026\10\09\01a1212d-d384-7f03-b5af-6df833913d8b'
$externalRoots = @((Join-Path $externalParent 'xinjiang-retained-process'), (Join-Path $externalParent 'xinjiang-retained-checkpoints'))
if ($plan.process -ne $processRoot -or $plan.store -ne $storeRoot) { throw 'Unexpected process store' }

function Check-Path([string]$path, [string[]]$roots) {
    $full = [IO.Path]::GetFullPath($path)
    $allowed = $false
    foreach ($root in $roots) {
        if ($full.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase)) { $allowed = $true }
    }
    if (-not $allowed) { throw "Path outside authorized roots: $full" }
    $item = Get-Item -LiteralPath $full -Force
    $cursor = $item
    while ($cursor.FullName -notin $roots) {
        if ($cursor.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Unexpected reparse point: $($cursor.FullName)" }
        $cursor = Get-Item -LiteralPath ([IO.Path]::GetDirectoryName($cursor.FullName)) -Force
    }
    return $full
}
function Check-Hash([string]$path, [string]$sha, [long]$bytes) {
    $file = Get-Item -LiteralPath $path -Force
    if ($file.Length -ne $bytes -or (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $sha) {
        throw "Content changed or unavailable: $path"
    }
}

# All originals and all replacement views are checked before any removal.
Write-Output 'Verifying all original records before replacement.'
foreach ($f in $plan.allOriginalFiles) {
    $path = Check-Path $f.physical (@($processRoot) + $externalRoots)
    Check-Hash $path $f.sha256 $f.bytes
}
foreach ($v in $plan.externalViews) {
    $source = Check-Path $v.physical $externalRoots
    $view = Check-Path $v.view @($storeRoot)
    $name = [IO.Path]::GetFileName($source)
    if ($name -notmatch '^round-(15|16|17|18|19)$' -and $name -ne '2026-10-10-connected-stage') {
        throw 'Unexpected external directory'
    }
    $originalItems = @(Get-ChildItem -LiteralPath $source -Recurse -Force)
    if ($originalItems | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }) { throw 'Nested junction in original directory' }
    if (@($originalItems | Where-Object { -not $_.PSIsContainer -and $_.FullName -notmatch '[\\/]__pycache__[\\/]' }).Count -ne $v.originalFiles.Count) { throw 'External original inventory changed' }
    foreach ($f in $v.expectedFiles) {
        $target = Check-Path (Join-Path $view $f.path) @($view)
        Check-Hash $target $f.sha256 $f.bytes
    }
}
foreach ($f in $plan.localLinks) {
    Check-Path $f.physical @($processRoot) | Out-Null
    $obj = Check-Path $f.object @($storeRoot)
    if ([IO.Path]::GetFileName($obj) -ne $f.sha256) { throw 'Unexpected object target' }
    if ((Get-Item -LiteralPath $obj).Length -ne $f.bytes) { throw 'Object size differs' }
}
foreach ($a in $plan.localArchives) {
    Check-Path $a.physical @($processRoot) | Out-Null
    $sidecar = [IO.Path]::GetFullPath((Join-Path $processRoot $a.sidecar))
    if (-not $sidecar.StartsWith($processRoot + '\', [StringComparison]::OrdinalIgnoreCase) -or (Test-Path -LiteralPath $sidecar)) { throw 'Unexpected archive sidecar target' }
    Check-Path (Join-Path $processRoot $a.manifest) @($storeRoot) | Out-Null
}

$actions = @()
$logPath = Join-Path ([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($PlanPath))) 'apply-actions.ndjson'
function Record-Action($action) {
    $action | ConvertTo-Json -Compress | Add-Content -LiteralPath $logPath -Encoding utf8
}
Write-Output 'Replacing duplicate ordinary files with links to immutable objects.'
foreach ($f in $plan.localLinks) {
    $source = [IO.Path]::GetFullPath($f.physical)
    $temporary = $source + '.dedupe-' + [Guid]::NewGuid().ToString('N')
    New-Item -ItemType HardLink -Path $temporary -Value $f.object | Out-Null
    Remove-Item -LiteralPath $source -Force
    Move-Item -LiteralPath $temporary -Destination $source
    Record-Action @{kind='shared-file';path=$source;sha256=$f.sha256}
}
Write-Output 'Replacing full ZIP containers with verified member manifests.'
foreach ($a in $plan.localArchives) {
    $sidecar = Join-Path $processRoot $a.sidecar
    New-Item -ItemType HardLink -Path $sidecar -Value (Join-Path $processRoot $a.manifest) | Out-Null
    Remove-Item -LiteralPath $a.physical -Force
    Record-Action @{kind='archive-manifest';path=$a.physical;manifest=$sidecar;originalSHA256=$a.sha256}
}
Write-Output 'Switching old external directories to fully verified shared views.'
foreach ($v in $plan.externalViews) {
    # Recheck the exact resolved paths immediately before the recursive removal.
    $source = Check-Path $v.physical $externalRoots
    $view = Check-Path $v.view @($storeRoot)
    if ($source -eq $view -or $source.StartsWith($storeRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid directory replacement' }
    Remove-Item -LiteralPath $source -Recurse -Force
    New-Item -ItemType Junction -Path $source -Value $view | Out-Null
    Record-Action @{kind='shared-directory';path=$source;view=$view;logical=$v.logical}
}
$result = @{pass=$true;completedAt=[DateTime]::UtcNow.ToString('o');sharedFiles=$plan.localLinks.Count;retiredLocalArchives=$plan.localArchives.Count;externalViews=$plan.externalViews.Count}
$result | ConvertTo-Json | Set-Content -LiteralPath (Join-Path ([IO.Path]::GetDirectoryName($logPath)) 'apply-result.json') -Encoding utf8
$result | ConvertTo-Json
