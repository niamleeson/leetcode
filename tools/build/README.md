GitHub Pages serves the committed `docs` directory. An open tab can request a lazy
module long after the HTML loaded, so deleting the previous build's hashed files
can break that tab when the lesson reaches its code runner.

`retainDeployedAssets` snapshots `docs/assets` before Vite empties the output and
restores the complete assets for the current build plus five previous distinct
builds. `docs/asset-generations.json` records their contents deterministically;
identical rebuilds do not use another retention slot. Keeping whole generations
preserves transitive JavaScript, CSS, font, and image dependencies. Other public
files and `index.html` are rebuilt normally. Retained assets are only downloaded
by tabs that reference them, so they do not increase a fresh page's loading size.

The six-generation limit bounds hosting size. Tabs older than that window use the
app's load-error recovery. Different content under an existing asset filename,
missing retained files, or unsafe paths fail the build instead of silently
publishing a broken dependency graph.

For the initial migration, restore an older deployment before building:

```sh
node tools/build/seed-asset-history.mjs a9476fb
npm run build
```

After that, normal `vite build` / `npm run build` handles retention automatically.
Commit the manifest together with `docs/assets`. Validate the retention behavior
with `node --test tools/build/retained-assets.test.mjs`.
