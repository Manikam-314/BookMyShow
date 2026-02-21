$baseUrl = "http://localhost:9099"

Write-Output "1. Fetching All Theaters to check City..."
$theaters = Invoke-RestMethod -Uri "$baseUrl/theater/all" -Method Get
$theaters | Format-Table id, name, city

Write-Output "2. Fetching All Movies..."
$movies = Invoke-RestMethod -Uri "$baseUrl/movie/all" -Method Get
$movies | Format-Table id, title

Write-Output "3. Fetching All Shows in 'Madurai'..."
# Fetching shows for Madurai to see if 'Ritzy' shows appear
try {
    $shows = Invoke-RestMethod -Uri "$baseUrl/show/search?city=Madurai" -Method Get
    Write-Output "Count: $($shows.Count)"
    if ($shows.Count -gt 0) {
        $shows | Select-Object id, showTime, @{N = 'Movie'; E = { $_.movieResource.title } }, @{N = 'Theater'; E = { $_.theaterResource.name } } | Format-Table
    }
    else {
        Write-Output "No shows found in Madurai."
    }
}
catch {
    Write-Output "Error fetching shows: $($_.Exception.Message)"
}

Write-Output "4. Checking distinct cities..."
$cities = Invoke-RestMethod -Uri "$baseUrl/theater/cities" -Method Get
Write-Output "Cities found: $cities"
