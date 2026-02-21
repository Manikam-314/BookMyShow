$baseUrl = "http://localhost:9099"

echo "1. Fetching All Theaters to check City..."
$theaters = Invoke-RestMethod -Uri "$baseUrl/theater/all" -Method Get
$theaters | Format-Table id, name, city

echo "2. Fetching All Movies..."
$movies = Invoke-RestMethod -Uri "$baseUrl/movie/all" -Method Get
$movies | Format-Table id, title

echo "3. Fetching All Shows (Need a new endpoint or just search for all in Madurai)..."
# Since there is no /show/all endpoint exposed in controller (it was commented out), I'll try searching by city 'Madurai' first.
$shows = Invoke-RestMethod -Uri "$baseUrl/show/search?city=Madurai" -Method Get
echo "Shows in Madurai:"
$shows | Format-Table id, showTime, movieId, theaterId

# Check if maybe the city is distinct case?
echo "4. Checking distinct cities..."
$cities = Invoke-RestMethod -Uri "$baseUrl/theater/cities" -Method Get
echo "Cities found: $cities"
