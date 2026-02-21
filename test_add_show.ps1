$baseUrl = "http://localhost:9099"

# 1. Get a Movie
echo "Fetching Movies..."
$movies = Invoke-RestMethod -Uri "$baseUrl/movie/all" -Method Get
if ($movies.Count -eq 0) {
    echo "No movies found."
    exit
}
$movieId = $movies[0].id
echo "Using Movie ID: $movieId"

# 2. Get a Theater
echo "Fetching Theaters..."
$theaters = Invoke-RestMethod -Uri "$baseUrl/theater/all" -Method Get
if ($theaters.Count -eq 0) {
    echo "No theaters found."
    exit
}
$theatreId = $theaters[0].id
echo "Using Theater ID: $theatreId"

# 3. Add Show
echo "Adding Show..."
$body = @{
    movieId = $movieId
    theaterId = $theatreId
    showTime = "2026-05-20T10:00:00"
    minPrice = 100
    maxPrice = 200
} | ConvertTo-Json

echo "Payload: $body"

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/show/add" -Method Post -Body $body -ContentType "application/json"
    echo "Show Added Successfully!"
    $response
} catch {
    echo "Failed to add show."
    echo $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        echo "Response Body: $responseBody"
    }
}
