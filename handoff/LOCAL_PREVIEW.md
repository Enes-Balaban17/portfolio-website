# Local Preview

This site is static HTML, CSS, and JavaScript. No build step is required.

## Start The Server

From PowerShell:

```powershell
cd "C:\Users\Enes Balaban\Documents\Personal Website"
python -m http.server 8080 --bind 127.0.0.1
```

Open:

```txt
http://127.0.0.1:8080/
```

Certificate page:

```txt
http://127.0.0.1:8080/about.html
```

## Stop Or Restart The Server

If port `8080` is already in use, stop the listener and restart:

```powershell
$connections = Get-NetTCPConnection -LocalPort 8080 -State Listen
foreach ($connection in $connections) {
  $proc = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
  if ($proc) { Stop-Process -Id $proc.Id -Force }
}

python -m http.server 8080 --bind 127.0.0.1
```

## What To Check

Open `about.html` and inspect "Certificates & Completed Educations".

Desktop expectations:

- certificate text is on the left
- logo frame is on the right
- frame is square and aligned inside the card
- logo image is contained and not stretched
- dark portfolio style is preserved

Mobile expectations:

- certificate cards stack into one column
- logo frame remains readable
- no horizontal scrollbar appears

## Cache Notes

If an old stylesheet or icon appears, hard refresh the browser:

```txt
Ctrl + F5
```

The pages currently include a cache-busting stylesheet query string, so normal refresh should usually pick up CSS changes.

## Manual Pull Request URL

If automated PR creation is not available, push the branch and open:

```txt
https://github.com/Enes-Balaban17/portfolio-website/compare/main...add-certificate-logos?expand=1
```
