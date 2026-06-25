# Design System Plan

This document defines the final visual rules for the first implementation phase.

## Overall Direction

The site will use a minimal developer-portfolio layout with a fixed left sidebar on desktop and a compact top navigation on smaller screens.

The design should be text-first, warm in light mode, dark gray in dark mode, and easy to read.

## Layout Values

Use these values during implementation:

```txt
navbar height: 60px
footer height: 60px
content width: 760px
sidebar width: 260px
optional right/post sidebar width: 260px
main layout width: content width + optional right/post sidebar width
mobile/base padding: 1.5rem vertical and horizontal
tablet/desktop padding: 2rem vertical and horizontal
border radius: 6px
```

## Breakpoints

```txt
600px and above:
- increase layout padding to 2rem
- increase heading sizes

800px and above:
- larger hero/page heading around 3rem

1020px and above:
- show left sidebar
- hide compact top navigation
- use two-column layout: 260px sidebar + main content
- main content left padding: 200px
- main content right padding: 2rem
- main content max width preserves the readable text column by adding the desktop offset and right padding to the content width

1360px and above:
- allow wider layout with optional right-side content area
```

## Sidebar

Sidebar behavior:

```txt
width: 260px
position: sticky on desktop
height: 100vh
scrollable if content overflows
border-right: 1px solid border color
hidden below 1020px
```

Sidebar identity row:

```txt
[Small Game Boy Advance icon] Enes Balaban [Light/Dark Theme Toggle]
```

Sidebar identity styling:

```txt
horizontal flex row
items centered vertically
0.35rem gap between identity items
Game Boy Advance icon width: 35px
site name font size: 18px
site name weight: 500
theme toggle margin-left: 0.50rem
theme toggle size: 32px by 32px
theme toggle icon size: 20px by 20px
```

Sidebar section styling:

```txt
margin: 1.25rem
padding-bottom: 1.5rem
border-bottom: 1px solid border color
```

Sidebar navigation styling:

```txt
links are vertical
2px gap between nav links
font size: 16px
font weight: 500
padding: 4px 0.5rem
small negative horizontal margin for alignment
border radius: 6px
active link uses highlighted background and accent text
```

Primary sidebar navigation link structure:

```txt
[28px icon box] [text label]
```

Primary sidebar navigation icon rules:

```txt
display each primary nav link as a grid
grid-template-columns: 28px 1fr
column gap: 2.5px
icon box: 28px by 28px
visible icon image/SVG: 24px by 24px
center icon inside the icon box
text label line-height: 1.2
do not set different icon sizes per sidebar link
do not use per-icon margin-left or manual offsets
use transform scaling inside the fixed icon box when an icon has internal whitespace
```

Primary sidebar navigation icons:

```txt
About Me: assets/icons/filesection_icon.png
Notes: assets/icons/aboutme_icon.png
Projects: assets/icons/github-dark-theme.svg and assets/icons/github-light-theme.svg
```

Projects icon switches between dark-theme and light-theme GitHub assets based on the active theme.

About Me and Notes icons may use shared modifier classes for visual tuning inside the fixed icon box:

```txt
About Me icon scale: 1.60
Notes icon visual transform: translateX(7.5px) scale(2)
```

## Color Palette

Core dark gray palette:

```txt
gray-0  #fbfbfb
gray-1  #eeeeee
gray-2  #e4e4e7
gray-3  #d4d4d8
gray-4  #c8c8cf
gray-5  #a1a1a8
gray-6  #4e4e55
gray-7  #323239
gray-8  #25252b
gray-9  #1c1c20
gray-10 #1d1d22
gray-11 #16161a
gray-12 #0d0d11
```

Core warm light palette:

```txt
beige-0  #fdf9ee
beige-1  #f6f0df
beige-2  #eee8d5
beige-25 #e5dcbd
beige-3  #ded4b2
beige-4  #c6ba93
```

Accent palette:

```txt
yellow light/dark:   #ac7c14 / #fcdc97
green light/dark:    #2d922d / #92d192
pink light/dark:     #d33682 / #ff8ac0
lavender light/dark: #a455be / #d48ceb
blue light/dark:     #2f71b4 / #6ab0f3
```

First version accent:

```txt
pink
```

Mascot circle colors:

```txt
light theme mascot circle: #d33682
dark theme mascot circle: #ff8ac0
```

Mascot frame rules:

```txt
hero mascot image: assets/images/enescot.png
desktop mascot frame max width: 400px
base mascot frame max width: 380px
mascot image uses object-fit: contain
circle is created with CSS only using .hero-mascot-frame::before
circle width: clamp(190px, 52%, 255px)
circle position: left 48%, top 55%
mascot image stays above the circle
```

Homepage desktop hero layout:

```txt
display as grid
grid-template-columns: minmax(350px, 1fr) minmax(250px, 400px)
align-items: start
gap: clamp(1.5rem, 4vw, 3rem)
hero visual aligns right
hero visual padding-top: 2.1rem
```

Main color mapping:

```txt
light background: beige-0
dark background: gray-9
light sidebar: beige-0
dark sidebar: gray-9
light card: beige-1
dark card: gray-8
light text: gray-8
dark text: gray-3
light emphasized text: gray-10
dark emphasized text: gray-0
light muted text: gray-6
dark muted text: gray-5
light border: beige-25
dark border: gray-7
light card border: beige-3
dark card border: gray-7
```

## Typography

Body font:

```txt
-apple-system, BlinkMacSystemFont, Avenir, Helvetica, Arial, sans-serif
```

Heading font:

```txt
Outfit, -apple-system, BlinkMacSystemFont, DM Sans, Avenir, Helvetica, Arial, sans-serif
```

Monospace font:

```txt
Menlo, Google Sans Code, monospace
```

Base heading sizes:

```txt
h1: 2.2rem
h2: 1.8rem
h3: 1.6rem
h4: 1.2rem
```

Larger screens:

```txt
h1: 2.8rem
h2: 2.3rem
h3: 1.9rem
h4: 1.5rem
hero/page h1: about 3rem
```

## Cards

Card rules:

```txt
border radius: 6px
thin border
compact padding
subtle hover background or border change
no heavy shadow in the first version
```

Skill cards:

```txt
[Icon] Skill Name
```

Skills grid:

```txt
3 cards per row on desktop
2 cards per row on tablet if needed
1 card per row on mobile
```

## Buttons and Links

Button rules:

```txt
inline-flex
center aligned
2px border
10px 14px padding
6px radius
font size 1rem
font weight 600
small button: 14px font, 0.5rem 0.75rem padding
extra small button: 11px font, 0.25rem 0.5rem padding
```

Link rules:

```txt
accent color for normal text links
active sidebar link is visually clear
hover state changes color or background subtly
```

Hero action button icons:

```txt
About Me button: assets/icons/filesection_icon.png
Email Newsletter button: assets/icons/mailnewsletter-icon.svg
button min-height: 44px
button padding: 0.55rem 0.9rem
button border: 2px solid accent color
button border radius: 6px
icon box: 24px by 24px
icon image/SVG: 24px by 24px
About Me icon image scale: 1.35 inside fixed icon box
icons appear before button text
icon and text gap: 0.55rem
```

Theme toggle rules:

```txt
icon-only button
default background transparent
default border transparent
hover/focus shows subtle background and border
use assets/icons/theme-sun.svg and assets/icons/theme-moon.svg
only one theme icon is visible at a time
```

## Archive Lists

Notes and Projects should use clean archive lists.

Rules:

```txt
group by year
use simple text links
keep generous spacing
avoid large image cards
support optional search input later
```

## Mobile Behavior

```txt
left sidebar hidden
compact top navigation shown
navigation remains readable and easy to tap
skills grid becomes one column
main content uses comfortable side padding
```

## Implementation Priority

1. CSS variables
2. Base typography
3. Sidebar layout
4. Main content layout
5. Cards and skill grid
6. Archive list styling
7. Theme toggle styling
8. Responsive styling
