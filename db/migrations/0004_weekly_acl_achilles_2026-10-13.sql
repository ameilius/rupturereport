-- 0004: weekly ACL / Achilles update researched 2026-10-13 (window 2026-10-06 .. 2026-10-12, plus earlier-2026 backfill).
-- Window: no new confirmed tears beyond those already in 0001 (Hargrave 10-11). Feared/unconfirmed cases skipped
-- (e.g. PHI Jalyx Hunt knee/ankle 10-11, BUF C.J. Gardner-Johnson knee 10-12).
-- Backfill: Mario Edwards Jr. (HOU) torn ACL in Week 3, missing from 0001.
-- Idempotent: players upsert on unique slug; injuries and progress updates are inserted only if absent.
SET NAMES utf8mb4;

-- Mario Edwards Jr. (HOU DT) ACL 2026-09-27
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Mario', 'Edwards Jr.', 'mario-edwards-jr', 'DT', (SELECT id FROM teams WHERE abbreviation = 'HOU'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-09-27', 2026, 3, (SELECT id FROM stadiums WHERE slug = 'lucas-oil-stadium'), 'away', (SELECT id FROM teams WHERE abbreviation = 'IND'), NULL, 'unknown', 'regular', 'Tore ACL in 19-17 Week 3 loss at Colts. Placed on IR Sept 30; HC DeMeco Ryans confirmed he will miss the rest of the 2026 season.', 'https://www.profootballrumors.com/2026/09/texans-dt-mario-edwards-jr-placed-on-ir-with-torn-acl'
FROM players p WHERE p.slug = 'mario-edwards-jr'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-27');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-09-30', 'diagnosis', 'Torn ACL; placed on IR', 'Texans announced IR move; torn ACL per Aaron Wilson (KPRC 2) and PFT.', 'https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/texans-put-dl-mario-edwards-on-injured-reserve'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'mario-edwards-jr' AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-27'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-09-30');
UPDATE players SET headshot_path = '/players/mario-edwards-jr.png' WHERE slug = 'mario-edwards-jr' AND headshot_path IS NULL;
