# Fix all auth parameter issues
Get-ChildItem -Path "app/api" -Recurse -Filter "*.ts" -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Fix getSession(req) where parameter is named 'request'
        $content = $content -replace '(?<=async function \w+\([^)]*request[^)]*\)[^{]*\{[^}]*?)getSession\(req\)', 'getSession(request)'
        
        # Fix getSession(request) where parameter is named 'req'  
        $content = $content -replace '(?<=async function \w+\([^)]*\breq\b[^)]*\)[^{]*\{[^}]*?)getSession\(request\)', 'getSession(req)'
        
        # Fix missing getSession import and wrong variable usage in communities
        if ($_.FullName -like "*communities*") {
            $content = $content -replace 'const session = await getSession', 'const user = await getUserFromRequest'
            $content = $content -replace 'if \(!user\?\.userId\)', 'if (!user?.userId)'
        }
        
        Set-Content $_.FullName -Value $content -NoNewline
    }
}

Write-Host "Auth fixes applied!"
