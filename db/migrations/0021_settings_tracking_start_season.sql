-- 0021: first fully tracked season per league. Seasons before it hold only carryovers (tears added because the
--   player was still recovering going into a tracked season), so their archive pages say so instead of reading as a
--   complete season (lib/seasons.ts isCarryoverOnly). Full tracking started with the 2026 NFL season and the 2026-27
--   NBA season. INSERT IGNORE: never overwrites a value changed later; re-running is a no-op.
INSERT IGNORE INTO settings (k, v) VALUES ('tracking_start_season', '2026');
INSERT IGNORE INTO settings (k, v) VALUES ('tracking_start_season_nba', '2026');
