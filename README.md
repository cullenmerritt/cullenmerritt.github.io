# cullenmerritt.github.io

Personal portfolio. Plain HTML and CSS plus one script (`main.js`) for the animations. No build step. GitHub Pages serves it as is.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home. Animated overview with highlights |
| `experience.html` | Timeline of every role, newest first, one photo each |
| `life.html` | Outside engineering. Races, family and travel photos |
| `projects/tactus.html`, `projects/robotic-hand.html` | Project write-ups |

## Adding photos

**Experience timeline.** Put one photo per role in `assets/experience/` with these exact names. Each appears automatically, and a missing file just doesn't show.

`nasa.jpg`, `collins.jpg`, `ta.jpg`, `bae.jpg`, `robotic-hand.jpg`, `city.jpg`

**Outside engineering.** Put the image in `assets/life/`, then add one line to `photos.js`:

```js
{ src: "assets/life/grandmas-2025.jpg", caption: "Grandma’s Marathon, 2025", section: "races" },
```

`section` is `races`, `family` or `travel`. A section stays hidden until it has at least one photo.

**Projects.** `assets/tactus/cover.jpg`, `board.jpg`, `enclosure.jpg` and `assets/robotic-hand/cover.jpg`, `demo.mp4`.

Keep photos under about 500 KB (export around 2000 px wide, JPEG quality 80) so pages load fast.

## Updating the resume

Replace `Cullen_Merritt_Resume.pdf` with a new export and keep the same filename. The public version has no phone number.
