# rupturereport
NFL ACL &amp; Achilles injury progress tracker — rupturereport.com

## Seasons

- A **season** is the league year stored on `injuries.season` (it includes that year's offseason and preseason). We say "season", never "year", in copy.
- The current season comes from `settings.current_season` (Admin → Settings, migration 0005), falling back to the latest season with data, then the calendar year.
- `/` always shows the **current** season. `/{season}` is an archive page for past seasons with data; `/{current season}` **308-redirects to `/`** so each season has exactly one URL (canonical `/` for the current season, `/{season}` for archives). Anything else at one path segment returns the themed 404 (handled in `proxy.ts` so the status is a real 404).
- Season totals count only tears with that season. Earlier-season tears whose latest stage isn't `returned` are listed under "Still recovering from previous seasons" and are never added to the totals. Progress updates always belong to the original injury, whatever their date.

## Terminology

- **Tear** is the counted event ("17 ACL tears", "torn ACL"). "Injury" is used only for generic data records (admin forms, schema/MedicalCondition) and never in counts.
- **Achilles** (not "Achilles tendon") in copy; "Achilles tendon" appears only in medical schema names.
- Brand and site title are season-neutral ("NFL ACL & Achilles Tear Tracker"); a season appears only on season-scoped pages, stats and FAQ ("in the 2026 NFL season").
