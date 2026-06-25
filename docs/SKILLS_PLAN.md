# Skills Section Plan

This document defines the visual and content plan for the homepage Skills section.

## Purpose

The Skills section will present the technologies, languages, and tools used in the portfolio as a compact visual grid on the homepage. The goal is to create a clean, scannable skill index rather than a long resume-style list.

## Main Layout

```txt
Skills

[Icon Card] C
[Icon Card] C++
[Icon Card] C#

[Icon Card] Java
[Icon Card] Kotlin
[Icon Card] Assembly

[Icon Card] React
[Icon Card] HTML
[Icon Card] CSS

[Icon Card] JavaScript
[Icon Card] TypeScript
[Icon Card] Terminal

[Icon Card] Blender
[Icon Card] SQL
[Icon Card] Oracle DB
```

## Grid Rules

- Use a single aesthetic grid.
- Show the grid on the homepage after the hero section.
- Use 3 cards per row on desktop.
- After 3 cards, the next skill moves to the next row.
- Use 2 cards per row on medium screens if needed.
- Use 1 card per row on mobile screens.
- Keep all cards compact and consistent.
- Do not add long descriptions inside the cards.
- Do not add a separate `skills.html` page for the current version.
- Do not add a "View all skills" link in the current version.

## Final Skill Order

- C
- C++
- C#
- Java
- Kotlin
- Assembly
- React
- HTML
- CSS
- JavaScript
- TypeScript
- Terminal
- Blender
- SQL
- Oracle DB

## Card Structure

Each skill should be shown as a small rectangular card.

```txt
[SVG/Icon] Skill Name
```

Card behavior:

- Icon on the left
- Skill name on the right
- Thin border
- Small border radius
- Subtle hover background
- Theme-aware colors

## Icon Source Plan

Use local icons from:

```txt
assets/icons/
```

Current icon files:

- `c.svg`
- `cpp.svg`
- `csharp.svg`
- `java.svg`
- `kotlin.svg`
- `assembly.svg`
- `react.svg`
- `html.svg`
- `css.svg`
- `javascript.svg`
- `typescript.svg`
- `terminal.svg`
- `blender.svg`
- `sql.svg`
- `oracle-db.svg`

During implementation, any icon can be replaced with a cleaner local SVG while keeping the same file name.

## Future Category Option

The first version will not use visible grouped categories. All skills will be shown in one visual grid.

If the page grows later, skills can be grouped internally like this:

```txt
Programming Languages
C, C++, C#, Java, Kotlin, Assembly, JavaScript, TypeScript

Frontend
React, HTML, CSS

Database
SQL, Oracle DB

Tools
Terminal, Blender
```

## First Version Decision

For the first version, use one homepage visual grid with local icons and no detailed descriptions.
