# Build a static, non-transactional preview for owner-only Sites hosting.
$env:NEXT_PUBLIC_STATIC_PREVIEW = 'true'
try { npm.cmd run build; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
finally { Remove-Item Env:NEXT_PUBLIC_STATIC_PREVIEW -ErrorAction SilentlyContinue }
