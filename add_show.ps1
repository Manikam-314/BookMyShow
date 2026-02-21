$movieId = Read-Host "Enter Movie ID (default 1)"
if ([string]::IsNullOrWhiteSpace($movieId)) { $movieId = 1 }

$theaterId = Read-Host "Enter Theater ID (default 1)"
if ([string]::IsNullOrWhiteSpace($theaterId)) { $theaterId = 1 }

$showTime = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")

$body = @{
    showTime = $showTime
    movieId = $movieId
    theaterId = $theaterId
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/show/add" -Method Post -Body $body -ContentType "application/json"
Write-Host "Show added successfully for Movie ID $movieId and Theater ID $theaterId at $showTime"
