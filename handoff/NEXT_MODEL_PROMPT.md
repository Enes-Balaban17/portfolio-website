# Prompt For The Next Local Coding Model

You are working in a static personal portfolio website repository.

Repository:

```txt
https://github.com/Enes-Balaban17/portfolio-website
```

Current branch:

```txt
add-certificate-logos
```

Project constraints:

- This is a static HTML/CSS/JavaScript website.
- The site is intended for GitHub Pages.
- Do not add React, Vite, Next.js, Astro, Gatsby, Eleventy, or any other framework.
- Do not redesign the whole site unless explicitly asked.
- Use local assets only.
- Do not add remote icon or image URLs.
- Do not run destructive git commands.
- Do not revert user changes you did not make.

Before editing code, read these documents in order:

1. `docs/SITE_PLAN.md`
2. `docs/FILE_STRUCTURE.md`
3. `docs/DESIGN_SYSTEM.md`
4. `docs/SKILLS_PLAN.md`
5. `docs/ICON_SOURCES.md`

Current certificate work:

- The About page has a "Certificates & Completed Educations" section.
- Each certificate card has been updated to use a two-column desktop layout:
  - left: certificate text
  - right: logo in a clean square frame
- CSS classes involved:
  - `.certificate-card`
  - `.certificate-content`
  - `.certificate-logo-frame`
- Mobile CSS stacks certificate cards into one column.

Current certificate logo files in the local repo:

```txt
assets/images/certificates/ege-university-logo.png
assets/images/certificates/data-analysis-ai-logo.png
assets/images/certificates/tusas-lift-up-logo.png
```

Important logo note:

The latest handoff instructions name expected future paths as `.svg` files:

```txt
assets/images/certificates/ege-university-logo.svg
assets/images/certificates/data-analysis-ai-logo.svg
assets/images/certificates/tusas-lift-up-logo.svg
```

However, the current local placeholder assets are PNG files and the current `about.html` paths are not broken. Do not convert, rename, or replace logo files unless the user provides final SVG files or a path is broken.

Your first actions:

1. Run `git status -sb`.
2. Confirm the current branch.
3. Inspect `about.html`, `css/style.css`, and `assets/images/certificates/`.
4. Check that certificate cards remain responsive and preserve the current dark portfolio style.
5. Keep changes scoped.

Preview locally:

```powershell
cd "C:\Users\Enes Balaban\Documents\Personal Website"
python -m http.server 8080 --bind 127.0.0.1
```

Open:

```txt
http://127.0.0.1:8080/about.html
```

Expected certificate layout:

- Desktop: text left, logo frame right.
- Desktop logo frame: about 96px by 96px.
- Logo image: contained, not stretched or cropped.
- Mobile: logo and text stack cleanly.
- No horizontal overflow.

Known local handoff caveats:

- The checkout was initially found on `main`, then `add-certificate-logos` was created locally.
- The worktree had additional dirty changes unrelated to the certificate logo handoff.
- Review all remaining dirty files before staging or committing further work.

Do not continue by adding a framework or replacing the whole design. Keep the site static, clean, and GitHub Pages friendly.
