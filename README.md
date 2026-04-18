# SmartWash Pro

SmartWash Pro is a portfolio-grade fuzzy logic project that predicts washing-machine cycle time from **Dirt Level** and **Load Size**. The repo now includes both the original MATLAB implementation and a polished interactive website designed to look strong on GitHub and in front of recruiters.

## What is in this repo

- `index.html`, `styles.css`, `script.js`
  Browser-based interactive demo with live fuzzy inference, a response-surface visualization, membership-function charts, and a premium landing page.
- `washing_machine_fis.m`
  Base MATLAB Mamdani FIS implementation.
- `washing_machine_fis_pro.m`
  Professional MATLAB dashboard version.

## Fuzzy System Design

### Inputs

- **Dirt Level**: range `0-10`
  - Low: `[0 0 4]`
  - Medium: `[2 5 8]`
  - High: `[6 10 10]`
- **Load Size**: range `0-10`
  - Small: `[0 0 4]`
  - Medium: `[2 5 8]`
  - Large: `[6 10 10]`

### Output

- **Wash Time**: range `0-60` minutes
  - Short: `[0 0 20]`
  - Medium: `[15 30 45]`
  - Long: `[40 60 60]`

### Rule Base

1. IF Dirt is Low AND Load is Small THEN Time is Short
2. IF Dirt is Low AND Load is Medium THEN Time is Short
3. IF Dirt is Low AND Load is Large THEN Time is Medium
4. IF Dirt is Medium AND Load is Small THEN Time is Medium
5. IF Dirt is Medium AND Load is Medium THEN Time is Medium
6. IF Dirt is Medium AND Load is Large THEN Time is Long
7. IF Dirt is High AND Load is Small THEN Time is Long
8. IF Dirt is High AND Load is Medium THEN Time is Long
9. IF Dirt is High AND Load is Large THEN Time is Long

## Run the Website Locally

Open [index.html](./index.html) in a browser.

If you want a local dev server, you can also run:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository.
2. Open the repository on GitHub.
3. Go to `Settings` -> `Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Select the main branch and the root folder.
6. Save, then wait for GitHub Pages to publish the site.

## MATLAB Versions

Run the base MATLAB implementation with:

```matlab
washing_machine_fis
```

Run the dashboard version with:

```matlab
washing_machine_fis_pro
```

## Example Interpretation

For:

- `Dirt Level = 8`
- `Load Size = 9`

the predicted wash time is approximately in the **55 to 60 minute** range, which reflects a realistic heavy-duty wash recommendation.
