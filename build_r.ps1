# Build script for r/index.html
# Run this to update the page based on current subfolders

$path = Split-Path -Parent $MyInvocation.MyCommand.Path
$rPath = Join-Path $path "r"
$tracksPath = Join-Path $path "tracks"

# Map song codes to track folder names
$songToTrack = @{
    'acn' = 'all-clear-now'
    'bace' = 'born-again-crimson-echo'
    'bacn' = 'born-again-crimson-noise'
    'baswi' = 'born-again-synthwave-instrumental'
    'blcn' = 'bleeding-crimson-noise'
    'blswi' = 'bleeding-synthwave-instrumental'
    'blswv' = 'bleeding-synthwave-vocal'
    'fwaf' = 'fire-without-a-flame'
    'glp' = 'glass-people'
    'lwy' = 'lost-without-you-lucid'
    'plai' = 'please-afterimage'
    'plce' = 'please-crimson-echo'
    'plcn' = 'please-crimson-noise'
    'plee' = 'please-echoexe'
    'plpe' = 'please-pleaexe'
}

# Get subfolders
$subfolders = Get-ChildItem -Path $rPath -Directory | Select-Object -ExpandProperty Name | Where-Object { $_ -ne 'README.md' }

$platforms = @{}
$songs = @{}
$versions = @{}
$slugs = @()

foreach ($folder in $subfolders) {
    if ($folder -match '^([a-z]{2})([a-z]+)(\d)$') {
        $platform = $matches[1]
        $song = $matches[2]
        $version = $matches[3]
        $platforms[$platform] = $true
        $songs[$song] = $true
        $versions[$version] = $true
        $slugs += $folder
    }
}

$platformList = ($platforms.Keys | Sort-Object) -join "', '"
$songList = ($songs.Keys | Sort-Object) -join "', '"
$versionList = ($versions.Keys | Sort-Object) -join "', '"

# Build songNames and songImages
$songNames = @{}
$songImages = @{}
$songOptions = @()

foreach ($song in $songs.Keys | Sort-Object) {
    if ($songToTrack.ContainsKey($song)) {
        $track = $songToTrack[$song]
        $indexPath = Join-Path $tracksPath "$track\index.html"
        if (Test-Path $indexPath) {
            $content = Get-Content $indexPath -Raw
            if ($content -match '<title>([^<]+)</title>') {
                $title = $matches[1]
                # Extract song name
                if ($title -match ' - (.+)$') {
                    $songName = $matches[1]
                } else {
                    $songName = $title
                }
                $songNames[$song] = "'$song': '$songName'"
                $songOptions += "<option value=`"$song`">$songName</option>"
            }
            if ($content -match 'og:image" content="([^"]+)"') {
                $image = $matches[1]
                $songImages[$song] = "'$song': '$image'"
            }
        }
    }
}

$songNamesJs = ($songNames.Values) -join ", "
$songImagesJs = ($songImages.Values) -join ", "

$platformNames = @{
    'fb' = 'Facebook'
    'ig' = 'Instagram'
    'tt' = 'Twitter'
    'yt' = 'YouTube'
}
$platformNamesJs = ($platformNames.GetEnumerator() | ForEach-Object { "'$($_.Key)': '$($_.Value)'" }) -join ", "

$slugsJs = ($slugs | ForEach-Object { "'$_'" }) -join ", "

$songSelectOptions = $songOptions -join "`n        "

# Generate the new script
$jsCode = @"
  <script>
    const platforms = ['$platformList'];
    const platformNames = { $platformNamesJs };
    const songs = ['$songList'];
    const songNames = { $songNamesJs };
    const versions = ['$versionList'];
    const songImages = { $songImagesJs };

    const slugs = [$slugsJs];

    const data = slugs.map(slug => {
      const platform = slug.substring(0, 2);
      const song = slug.substring(2, slug.length - 1);
      const version = slug.substring(slug.length - 1);
      return {
        slug: slug,
        platform: platform,
        song: song,
        version: version,
        title: `${platformNames[platform]} - ${songNames[song]} ${version}`,
        image: songImages[song]
      };
    });

    const grid = document.getElementById('cardsGrid');
    const songFilter = document.getElementById('songFilter');
    const platformFilter = document.getElementById('platformFilter');

    function renderCards(filteredData) {
      grid.innerHTML = '';
      filteredData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${item.image}" alt="${item.title}">
          <div class="card-content">
            <div class="card-title">${item.title}</div>
            <a href="https://skydevaaben.no/r/${item.slug}" class="card-link">Visit</a>
          </div>
        `;
        grid.appendChild(card);
      });
    }

    function filterData() {
      const songValue = songFilter.value;
      const platformValue = platformFilter.value;
      const filtered = data.filter(item => {
        return (songValue === 'all' || item.song === songValue) &&
               (platformValue === 'all' || item.platform === platformValue);
      });
      renderCards(filtered);
    }

    songFilter.addEventListener('change', filterData);
    platformFilter.addEventListener('change', filterData);

    // Initial render
    renderCards(data);
  </script>
"@

# Update the select
$selectCode = @"
      <select id="songFilter">
        <option value="all">All Songs</option>
$songSelectOptions
      </select>
"@

# Read current index.html
$indexPath = Join-Path $rPath "index.html"
$content = Get-Content $indexPath -Raw

# Replace the script
$content = $content -replace '(?s)<script>.*?</script>', $jsCode

# Replace the select
$content = $content -replace '(?s)<select id="songFilter">.*?</select>', $selectCode

# Write back
$content | Set-Content $indexPath -Encoding UTF8

Write-Host "r/index.html updated based on current subfolders."