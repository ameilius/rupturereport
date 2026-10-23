-- 0010: New tear: Anton Harrison (JAX OT) torn ACL, found during knee surgery 2026-10-22 (Ian Rapoport).
-- Original injury: right knee, Week 5 vs PHI (19-17 win), Sun 2026-10-11, Tottenham Hotspur Stadium, London
-- (Jaguars designated home game). Hurt blocking on a run play; contact/non-contact not reported -> NULL.
-- Surface: in-game tear, from stadium record (Tottenham NFL pitch = artificial turf; brand left NULL).
-- Season from settings.current_season; never hard-coded. Idempotent throughout.
SET NAMES utf8mb4;

INSERT INTO stadiums (name, slug, city, state, surface_type, surface_brand, notes)
VALUES ('Tottenham Hotspur Stadium', 'tottenham-hotspur-stadium', 'London', NULL, 'artificial', NULL, 'International venue (UK). NFL games use the retractable artificial-turf pitch beneath the grass soccer field.')
ON DUPLICATE KEY UPDATE notes = COALESCE(notes, VALUES(notes));

INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Anton', 'Harrison', 'anton-harrison', 'OT', (SELECT id FROM teams WHERE abbreviation = 'JAX'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);

INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-10-11',
       COALESCE((SELECT CAST(s.v AS UNSIGNED) FROM settings s WHERE s.k = 'current_season'), (SELECT MAX(i2.season) FROM injuries i2)),
       5, (SELECT id FROM stadiums WHERE slug = 'tottenham-hotspur-stadium'), 'home', (SELECT id FROM teams WHERE abbreviation = 'PHI'), NULL, 'right', 'regular',
       'Injured his right knee blocking on a running play in the 19-17 Week 5 win over the Eagles in London and was carted off. Placed on IR Oct 13 pending an arthroscopic procedure; surgeons found a torn ACL during surgery Oct 22, ending his season.',
       'https://x.com/rapsheet/status/2113591539846754515'
FROM players p WHERE p.slug = 'anton-harrison'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-10-11');

INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-13', 'diagnosis', 'Knee injury; placed on IR', 'Jaguars placed Harrison on IR ahead of planned arthroscopic knee surgery; severity unknown at the time.', 'https://jaguarswire.usatoday.com/story/sports/nfl/jaguars/2026/10/13/jaguars-roster-moves-anton-harrison-injured-reserve-2-signings-made/92238213007/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'anton-harrison' AND i.injury_type = 'ACL' AND i.injury_date = '2026-10-11'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-10-13');

INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-22', 'surgery', 'Torn ACL found during surgery; out for season', 'Expected arthroscopic procedure revealed a torn ACL; already on IR, now out for the season (Ian Rapoport).', 'https://x.com/rapsheet/status/2113591539846754515'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'anton-harrison' AND i.injury_type = 'ACL' AND i.injury_date = '2026-10-11'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-10-22');

UPDATE players SET headshot_path = '/players/anton-harrison.png' WHERE slug = 'anton-harrison' AND headshot_path IS NULL;
UPDATE players SET dob = COALESCE(dob, '2002-02-02'), height_in = COALESCE(height_in, 76), weight_lb = COALESCE(weight_lb, 315) WHERE slug = 'anton-harrison'; -- ESPN 4692525
