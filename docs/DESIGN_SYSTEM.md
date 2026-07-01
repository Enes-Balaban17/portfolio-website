# Design System Plan

This document defines the final visual rules for the first implementation phase.

## Overall Direction

The site will use a minimal developer-portfolio layout with a fixed left sidebar on desktop and a compact top navigation on smaller screens.

The design should be text-first, warm in light mode, dark gray in dark mode, and comfortable to read.

## Reference Match Requirements

The implementation must closely follow the reference layout proportions:

- Sidebar must feel aligned to the far-left edge with the same compact inner spacing.
- Sidebar content should not float too far from the left edge.
- Main content should start after the 260px sidebar with comfortable but not excessive left spacing.
- The home hero must support a mascot image positioned to the right of the main hero text on desktop.
- The mascot should visually occupy the same general area as the reference hero illustration: right side of the hero block, aligned around the top/middle of the hero heading and intro text.
- The hero text and mascot must become a single-column layout on smaller screens.

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
- use larger hero/page headings around 3rem

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

Sidebar short About Me block:

```txt
heading: About Me
text: I'm Enes, a software developer and Computer Programming graduate. This is my personal website.
font size: 14px - 15px
line height: 1.6
muted/emphasized mixed text styling is allowed
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

## Home Hero Mascot

Use this asset for the home page hero mascot:

```txt
assets/images/enescot.png
```

Mascot placement rules:

```txt
desktop: right side of hero intro
max width: 360px - 420px
image should not push text too far down
align around heading/top intro area
use object-fit: contain
keep transparent background
hide or stack below text on small screens if needed
```

Recommended structure:

```txt
hero section
- hero text column
- mascot image column
```

## Hero Mascot Circle

The mascot circle must be a compact decorative circle behind only the front/center part of the mascot. It must not become a large background disk behind the whole image.

Correct visual direction:

```txt
The mascot extends outside the circle.
The circle sits behind the front/center body and circuit board area.
The circle should not cover the full tail, full spikes, or full body width.
The circle should feel like a small accent shape, not a giant backdrop.
```

Theme colors:

```txt
dark theme circle: #ff8ac0
light theme circle: #d33682
```

Circle sizing and positioning:

```txt
circle diameter: 58% - 64% of mascot frame width
circle max size: 260px - 300px
circle min size: 210px
position: absolute
left: 43% - 46% of mascot frame
top: 50% - 53% of mascot frame
transform: translate(-50%, -50%)
z-index: 0
mascot image z-index: 1
```

Implementation notes:

```txt
Use a CSS pseudo-element on the mascot frame.
Do not edit the mascot PNG.
Do not bake the circle into the image.
Use overflow: visible so the mascot can extend beyond the circle.
The tail and outer spikes should visibly extend beyond the circle.
```

Recommended CSS variable:

```txt
--color-mascot-circle
```

Recommended structure:

```txt
hero-visual
- hero-mascot-frame
  - img mascot
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

Import these fonts in CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&family=Outfit:wght@100..900&display=swap');
```

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

Typography rules:

```txt
body line-height: 1.6
body font weight: 400
main h1 font weight: 700
main h2/h3 font weight: 600
sidebar site name weight: 500
button/link emphasis weight: 500 - 600
use font smoothing for cleaner rendering
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

## Theme Toggle Button

Use these local icon assets:

```txt
assets/icons/theme-sun.svg
assets/icons/theme-moon.svg
```

Theme toggle visual rules:

```txt
icon-only button
24px icon size
button visual area: 34px - 36px square
transparent background by default
no visible square border by default
no visible frame by default
border radius: 6px
color follows current theme text color
subtle square background/border appears only on hover and keyboard focus
hover background: navbar/input hover background color
focus outline must remain accessible
transition: 0.12s ease
```

Behavior rules:

```txt
when current theme is dark: show moon icon or use moon as active state indicator
when current theme is light: show sun icon or use sun as active state indicator
save selected theme to localStorage
update aria-label between light/dark theme states
```

Do not use a permanently boxed button. The icon should look clean and modern on the sidebar identity row; the square frame appears only when the mouse hovers over it or when the button receives keyboard focus.

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
hero mascot stacks below hero text or is hidden if it hurts readability
```

## Implementation Priority

1. CSS variables
2. Base typography
3. Sidebar layout
4. Sidebar short About Me block
5. Main content layout
6. Home hero mascot placement
7. Hero mascot circle placement
8. Cards and skill grid
9. Archive list styling
10. Theme toggle styling
11. Responsive styling

Implementation notes should stay practical and easy to follow during coding.
