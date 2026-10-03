$ErrorActionPreference = 'Stop'
$dnsNames = @('localhost', '127.0.0.1', '192.168.100.33')
$existing = Get-ChildItem Cert:\CurrentUser\My | Where-Object { $_.Subject -eq 'CN=Zaher Dev' -and $_.NotAfter -gt (Get-Date) } | Select-Object -First 1
if (-not $existing) {
    $existing = New-SelfSignedCertificate -Subject 'CN=Zaher Dev' -DnsName $dnsNames -CertStoreLocation 'Cert:\CurrentUser\My' -FriendlyName 'Zaher local HTTPS development'
}
$certificatePath = Join-Path $PSScriptRoot 'zaher-dev.pfx'
$password = New-Object System.Security.SecureString
Export-PfxCertificate -Cert $existing -FilePath $certificatePath -Password $password | Out-Null
Write-Host "Certificate created: $certificatePath"
Write-Host 'Use the certificate with your HTTPS-capable local server.'
Write-Host 'For production, use a trusted certificate from your hosting provider or Let''s Encrypt.'
