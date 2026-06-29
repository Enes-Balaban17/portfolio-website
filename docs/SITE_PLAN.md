# Site Plan

This document defines the final site plan for the first implementation phase.

## Implementation Source of Truth

Before coding, read the planning files in this order:

1. `docs/SITE_PLAN.md`
   - Main source for page content, page purpose, section order, and navigation structure.

2. `docs/FILE_STRUCTURE.md`
   - Source for the exact file/folder structure.
   - Source for the framework decision.
   - First version must use static HTML, CSS, and JavaScript with GitHub Pages.
   - Do not add Gatsby, React, Vite, Astro, Next.js, Eleventy, or another framework in the first version.

3. `docs/DESIGN_SYSTEM.md`
   - Source for layout dimensions, colors, typography, sidebar behavior, cards, buttons, links, breakpoints, and responsive rules.
   - Use the values in this file when implementing `css/style.css`.

4. `docs/SKILLS_PLAN.md`
   - Source for the homepage Skills section content.
   - Use this file for the exact skill order, grid rules, and skill card behavior.
   - The Skills section in this file is only a summary. The detailed implementation rules are in `docs/SKILLS_PLAN.md`.

5. `docs/ICON_SOURCES.md`
   - Source for available icon files.
   - Use local icons from `assets/icons/`.
   - Do not use remote image URLs for skill icons unless explicitly changed later.

Implementation rule:

```txt
SITE_PLAN.md tells what pages and sections exist.
FILE_STRUCTURE.md tells where files must be created.
DESIGN_SYSTEM.md tells how the site must look.
SKILLS_PLAN.md tells how the homepage Skills grid must be built.
ICON_SOURCES.md tells which icon files to use.
```

If there is a conflict between files:

```txt
Page content and section order: SITE_PLAN.md
File/folder structure: FILE_STRUCTURE.md
Visual design and dimensions: DESIGN_SYSTEM.md
Skills grid and ordering: SKILLS_PLAN.md
Icon usage: ICON_SOURCES.md
```

## Main Sections

1. Sidebar / Navigation
2. Home / Hero
3. About Me Page
4. Notes Page
5. Projects Page
6. Resume Page
7. Minigames Page
8. Illustrations Page

## Sidebar Layout

Desktop sidebar structure:

```txt
[Small Game Boy Advance icon] Enes Balaban [Theme Toggle]

[Folder icon] About Me
[Notepad icon] Notes
[Theme-aware GitHub icon] Projects

Contact
Email signup
LinkedIn
```

Sidebar rules:

- Use a left sidebar on desktop.
- Place the Game Boy Advance icon immediately to the left of the name.
- Place the theme toggle immediately to the right of the name.
- Keep navigation links vertical.
- Primary sidebar navigation has only About Me, Notes, and Projects.
- Do not include a separate Skills navigation link.
- Primary sidebar links use a shared icon column and a shared text column so icon left edges and label start positions align.
- Keep contact links vertical.
- Sidebar Email signup links open `mailto:balabanenes111@icloud.com`.
- Keep the sidebar sticky on desktop.
- On mobile, move the navigation above the content or use a compact top navigation.
- Include a short About Me block after the identity row and before primary navigation.

Sidebar About Me block:

```txt
About Me

I'm Enes, a software developer and Computer Programming graduate. This is my digital base. 🚀
```

## Home / Hero

Home page content:

```txt
Hey, I'm Enes!

I'm a Software Developer and graduate from Ege University Computer Programming.

I'm interested in unmanned aerial systems, artificial intelligence, and embedded systems, and I create content around these fields.

[About Me icon] About Me
[Email newsletter icon] Email Newsletter

------------------------------------------------------------

Skills

[Skill grid]

------------------------------------------------------------

[Notebook icon] Notes

[Recent notes preview]

------------------------------------------------------------

[Projects icon] Projects

[Selected projects preview]
```

Hero rules:

- Use a two-column hero layout on desktop.
- Keep hero copy on the left and the mascot visual on the right.
- Use `assets/images/enescot.png` for the hero mascot.
- Place a themed accent circle behind the mascot with CSS only, not baked into the PNG.
- Use `#d33682` for the mascot circle in light theme.
- Use `#ff8ac0` for the mascot circle in dark theme.
- Action buttons are side by side on desktop and can stack on mobile.
- About Me action button links to `about.html`.
- Email Newsletter action button opens the contact/message modal.
- Use clear spacing between text blocks.
- Do not include the old Contact block inside the homepage hero. Contact remains in the sidebar and About page.
- Only the homepage Email Newsletter action button opens the contact/message modal.

## About Me Page

Main heading:

```txt
About Me
```

Introduction text:

```txt
I'm Enes!

I'm a Computer Programming graduate from Ege University and a software developer based in Türkiye.

I use this website as my personal space for sharing my projects, notes, portfolio progress, and the things I learn while improving myself as a developer.

I'm open to project, internship, and collaboration opportunities where I can improve my skills and contribute to real-world software projects.

I'm interested in software development, data analysis, artificial intelligence, database systems, and web technologies.

Outside of software, I enjoy Muay Thai, exploring hardware and electronic devices, playing tabletop RPGs, reading comics and fantasy books, researching history, watching documentaries, and nerding out about strategy games.
```

Subsections:

- Contact
- Certificates & Completed Educations
- What I'm Doing Right Now
- Tools
- Hardware
- Miscellaneous

## Contact

```txt
If you want to say hello, send me an email or connect via the socials.

- Email: balabanenes111@icloud.com
- Email Newsletter
- GitHub
- LinkedIn
```

## Certificates & Completed Educations

```txt
- Ege University - Computer Programming
  Associate Degree / 2024 - 2026

- Data Analysis School - Artificial Intelligence Module
  Free online training program carried out under the auspices of the Council of Higher Education, coordinated by Marmara University Population and Social Research Institute, with contributions from METU, ITU, and Bogazici University. The program focuses on combining theoretical knowledge and practical skills in data analysis, statistics, and artificial intelligence.
  2025 - 2026

- TUSAS LIFT UP - Industry-Oriented Undergraduate Graduation Projects Conference
  Certificate of Participation / 2024 - 2025
```

Certificate action rules:

- Certificates are loaded from `content/certificates/certificates.json`.
- `certificate_action_type: link` uses `certificate_url` for an external verification page.
- `certificate_action_type: pdf` uses `certificate_pdf` for an uploaded or local PDF.
- `certificate_action_type: none` renders no action.
- `View Certificate` opens valid links and PDFs in a new tab.
- Invalid, empty, and unsafe targets do not render a link.

## What I'm Doing Right Now

```txt
- Building my personal portfolio website
- Improving my GitHub profile
- Open to internship, project, and collaboration opportunities
- Improving myself in software development, data analysis, and artificial intelligence
```

## Tools

```txt
This website is hosted with GitHub Pages and uses a static HTML, CSS, and JavaScript structure for the first version.

- Coding: Visual Studio Code, Visual Studio, IntelliJ IDEA, PyCharm, Arduino IDE
- Terminal: Linux Terminal, PowerShell ISE
- Notes & Planning: GitHub, GitHub Issues, Markdown
- Databases: SQL Server Management Studio, Oracle Database tools
```

## Hardware

```txt
- Coding PC: Asus TUF Gaming F15
  - CPU:
  - Motherboard:
  - Memory:
  - Storage:
  - GPU:
- Side Monitor: TUF Gaming VG27AQ
- Keyboard: TUF F3
- Headphones: SteelSeries Arctis Nova 3
```

Hardware rules:

- Only include devices used for software development.
- Do not include drone hardware, embedded systems, or project hardware.

## Miscellaneous

```txt
- Resume
- Minigames
- Illustrations
```

Each item links to its own page.

## Notes Page

Purpose:

- Year in Review notes
- Events attended
- Completed projects
- Completed courses or trainings
- Short development notes
- Learning logs
- Project planning notes
- Technical reminders
- GitHub portfolio progress notes

Notes rules:

- Group notes by year.
- Each note has a date, title, and optional tag.
- Notes are shorter and more personal than full blog posts.
- Show a complete readable date including the year.
- Note titles link to `note.html?slug=NOTE_SLUG`.
- The note detail page loads the same JSON source and renders the title, full date, tags, summary, and body as escaped text.

## Projects Page

Project item structure:

- Year
- Project name
- Short description
- Technologies used
- Demo link when available
- Source link
- Optional details link when needed

Link display rules:

- If a project has a live demo, show: Demo / Source
- Only Source uses the theme-aware GitHub icon. Demo remains a plain text link.
- If a project does not have a live demo, show only: Source
- If a project needs more explanation but no demo exists, show: Details / Source
- If a project is not public yet, show: In Progress or Private

## Skills Section

The Skills section appears on the homepage and must be implemented according to:

```txt
docs/SKILLS_PLAN.md
```

Summary of the final skill order:

```txt
C / C++ / C#
Java / Kotlin / Assembly
React / HTML / CSS
JavaScript / TypeScript / Terminal
Blender / SQL / Oracle DB
```

Summary of grid rules:

- 3 cards per row on desktop.
- 2 cards per row on tablet if needed.
- 1 card per row on mobile.
- Use local icons from `assets/icons/`.
- Use icon file details from `docs/ICON_SOURCES.md`.
- Use card dimensions, colors, spacing, hover rules, and responsive rules from `docs/DESIGN_SYSTEM.md`.
- Do not create or link to a separate `skills.html` page in the current version.

## Visual Direction

Use the final first-version visual rules in:

```txt
docs/DESIGN_SYSTEM.md
```

Do not guess colors, spacing, sidebar width, content width, card style, typography, or breakpoints from this file alone. Use `docs/DESIGN_SYSTEM.md` for those details.

## Framework and File Structure Decision

Use the final first-version file and framework decision in:

```txt
docs/FILE_STRUCTURE.md
```

Do not create files outside the planned structure unless necessary. Do not introduce a framework in the first version.

## Icon Source Decision

Use the final icon list and icon usage notes in:

```txt
docs/ICON_SOURCES.md
```

Use local icons from:

```txt
assets/icons/
```

## Acknowledgement

Special thanks to Tania Rascia for the inspiration behind the clean personal website direction.
