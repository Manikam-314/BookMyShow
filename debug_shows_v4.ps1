$baseUrl = "http://localhost:9099"

Write-Output "=== 1. CHECKING THEATER 'Ritzy' ==="
try {
    $theaters = Invoke-RestMethod -Uri "$baseUrl/theater/all" -Method Get
    $ritzy = $theaters | Where-Object { $_.name -like "*Ritzy*" }
    if ($ritzy) {
        Write-Output "FOUND: ID: $($ritzy.id) | Name: $($ritzy.name) | City: $($ritzy.city)"
    }
    else {
        Write-Output "NOT FOUND: Theater 'Ritzy' does not exist."
    }
}
catch { Write-Output "Error: $($_.Exception.Message)" }

Write-Output "`n=== 2. CHECKING MOVIE 'Sirai' ==="
try {
    $movies = Invoke-RestMethod -Uri "$baseUrl/movie/all" -Method Get
    $sirai = $movies | Where-Object { $_.title -like "*Sirai*" }
    if ($sirai) {
        Write-Output "FOUND: ID: $($sirai.id) | Title: $($sirai.title)"
    }
    else {
        Write-Output "NOT FOUND: Movie 'Sirai' does not exist."
    }
}
catch { Write-Output "Error: $($_.Exception.Message)" }

Write-Output "`n=== 3. SEARCHING SHOWS (City: Madurai, Movie: Sirai) ==="
try {
    # Try searching specifically
    $uri = "$baseUrl/show/search?city=Madurai&movieName=Sirai"
    Write-Output "Requesting: $uri"
    $shows = Invoke-RestMethod -Uri $uri -Method Get
    Write-Output "Count: $($shows.Count)"
    foreach ($s in $shows) {
        Write-Output "Show: $($s.showTime) @ $($s.theaterResource.name)"
    }
}
catch {
    Write-Output "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Output "Body: $($reader.ReadToEnd())"
    }
}
