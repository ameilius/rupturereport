-- 0008: weekly ACL / Achilles update researched 2026-10-20 (window 2026-10-11 .. 2026-10-20).
-- New tear: Blake Grupe (LAR K) torn ACL, Week 6 vs ARI at SoFi Stadium (2026-10-18).
-- Season comes from settings.current_season (fallback: latest season with data); never hard-coded.
-- Surface: game tear, so surface comes from the stadium record (SoFi Stadium = artificial).
-- Recovery: Javon Hargrave placed on injured reserve 2026-10-17 (stage unchanged: diagnosis).
-- Watching / skipped (not confirmed tears): WAS Terry McLaurin left knee (MRI 2026-10-20),
-- SF Mike Evans Achilles soreness (no rupture per HC Kyle Shanahan), DAL Dee Winters Achilles sprain,
-- PHI Jalyx Hunt knee/ankle (no tear reported).
-- Idempotent: players upsert on unique slug; injuries and progress updates are inserted only if absent;
-- bio and headshot columns are only filled where still NULL (admin edits are preserved).
SET NAMES utf8mb4;

-- Blake Grupe (LAR K) ACL 2026-10-18
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Blake', 'Grupe', 'blake-grupe', 'K', (SELECT id FROM teams WHERE abbreviation = 'LAR'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-10-18',
       COALESCE((SELECT CAST(s.v AS UNSIGNED) FROM settings s WHERE s.k = 'current_season'), (SELECT MAX(i2.season) FROM injuries i2)),
       6, (SELECT id FROM stadiums WHERE slug = 'sofi-stadium'), 'home', (SELECT id FROM teams WHERE abbreviation = 'ARI'), 'contact', 'unknown', 'regular',
       'Tore ACL making a tackle on a kickoff return about five minutes into his Rams debut, an 18-16 Week 6 home loss to the Cardinals (he had made a 44-yard field goal earlier). Placed on IR Oct 19; HC Sean McVay said he will miss the rest of the season.',
       'https://www.therams.com/news/rams-injury-updates-cardinals-week-6-2026-blake-grupe-torn-acl-out-for-season-poona-ford-davante-adams-kobie-turner-trent-mcduffie-raiders'
FROM players p WHERE p.slug = 'blake-grupe'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-10-18');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-19', 'diagnosis', 'Torn ACL; placed on IR', 'HC Sean McVay announced the torn ACL Monday; Rams placed him on IR the same day (Adam Schefter, ESPN; therams.com).', 'https://x.com/AdamSchefter/status/2112286736176783368'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'blake-grupe' AND i.injury_type = 'ACL' AND i.injury_date = '2026-10-18'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-10-19');
UPDATE players SET headshot_path = '/players/blake-grupe.png' WHERE slug = 'blake-grupe' AND headshot_path IS NULL;
UPDATE players SET dob = COALESCE(dob, '1998-11-05'), height_in = COALESCE(height_in, 67), weight_lb = COALESCE(weight_lb, 156) WHERE slug = 'blake-grupe'; -- ESPN 4259619

-- javon-hargrave: placed on injured reserve (stage unchanged)
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-17', 'diagnosis', 'Placed on injured reserve', 'Packers moved Hargrave (Achilles) to IR on Saturday, Oct 17, per Rob Demovsky (ESPN) and the NFL transaction wire.', 'https://x.com/RobDemovsky/status/2111549053108617309'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'javon-hargrave' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-10-11'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-10-17');
