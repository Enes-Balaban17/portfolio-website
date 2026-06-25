# Icon Sources Report

This document records the current status of the local icons used in the portfolio website.

## Icon Folder

Current icon folder:

```txt
assets/icons/
```

## Skill Icons Added to This Repository

Current local icon files:

- `assembly.svg`
- `c.svg`
- `cpp.svg`
- `csharp.svg`
- `java.svg`
- `kotlin.svg`
- `react.svg`
- `html.svg`
- `css.svg`
- `javascript.svg`
- `typescript.svg`
- `terminal.svg`
- `blender.svg`
- `sql.svg`
- `oracle-db.svg`

## Interface and Content Icons Added to This Repository

Current local interface/content icon files:

- `aboutme-icon.svg`
- `aboutme_icon.png`
- `email-newsletter.svg`
- `filesection_icon.png`
- `folder-open.svg`
- `github-dark-theme.svg`
- `github-light-theme.svg`
- `mailnewsletter-icon.svg`
- `notebook.svg`
- `projects.svg`
- `theme-moon.svg`
- `theme-sun.svg`

Current local image files used by the layout:

- `assets/images/gba-icon.png`
- `assets/images/enescot.png`

## Current Decision

The first version will use local files from `assets/icons/`.

Some icons are custom minimal SVGs. Some icons are SVG wrappers containing embedded image data. Some finalized sidebar icons are PNG files. This keeps the site independent from external image URLs during normal use.

During the implementation phase, icons can be replaced or improved while keeping the same file names.

## Current Icon Usage

- Sidebar About Me link uses `assets/icons/filesection_icon.png`.
- Sidebar Notes link uses `assets/icons/aboutme_icon.png`.
- Sidebar Projects link uses `assets/icons/github-dark-theme.svg` in dark theme and `assets/icons/github-light-theme.svg` in light theme.
- Homepage About Me action button uses `assets/icons/filesection_icon.png`.
- Homepage Email Newsletter action button uses `assets/icons/mailnewsletter-icon.svg`.
- Notes preview heading uses `assets/icons/notebook.svg`.
- Projects preview heading uses `assets/icons/projects.svg`.
- Theme toggle uses `assets/icons/theme-sun.svg` and `assets/icons/theme-moon.svg`.
- Site identity uses `assets/images/gba-icon.png`.
- Homepage hero mascot uses `assets/images/enescot.png`.

## Possible Future Icon Sources

- Simple Icons
- Devicon
- Local custom SVG files
- Manually designed minimal SVG icons

## Implementation Notes

- Prefer local files over remote image links.
- Keep icon sizes visually consistent.
- Sidebar navigation icons must share the same 28px icon box and 24px rendered icon size.
- If a sidebar icon has internal whitespace, scale it visually with `transform` inside the fixed icon box instead of moving it with margins.
- Use the same card dimensions for all skill cards.
- Icons should adapt well to both dark and light themes.
- If an icon has poor contrast in one theme, replace it with a cleaner SVG.
