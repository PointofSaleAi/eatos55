# Shared source conventions (`src/lib`, `src/styles.css`)

- `cn()` in `src/lib/utils.ts` runs `twMerge`, which does not know the project's fluid `text-fs-*` scale, so it silently drops a `text-fs-*` class whenever a text colour class is merged into the same string. When a line must carry both a colour and one of these sizes, put the size in a `@utility` in `src/styles.css` (e.g. `mod-line`) so it survives the merge; keep `@utility` bodies free of colour values so light and dark themes still come from the tokens.
