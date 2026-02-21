$baseUrl = "http://localhost:9099"

Write-Output "=== THEATERS ==="
$theaters = Invoke-RestMethod -Uri "$baseUrl/theater/all" -Method Get
foreach ($t in $theaters) {
    Write-Output "ID: $($t.id) | Name: $($t.name) | City: $($t.city)"
}

Write-Output "`n=== MOVIES ==="
$movies = Invoke-RestMethod -Uri "$baseUrl/movie/all" -Method Get
foreach ($m in $movies) {
    Write-Output "ID: $($m.id) | Title: $($m.title)"
}

Write-Output "`n=== SHOWS IN MADURAI ==="
try {
    $shows = Invoke-RestMethod -Uri "$baseUrl/show/search?city=Madurai" -Method Get
    Write-Output "Total Shows: $($shows.Count)"
    foreach ($s in $shows) {
        Write-Output "Show ID: $($s.id) | Time: $($s.showTime) | Movie: $($s.movieResource.title) | Theater: $($s.theaterResource.name)"
    }
}
catch {
    Write-Output "Error: $($_.Exception.Message)"
}
