-- 0001: 2026 NFL ACL / Achilles tears (offseason through 2026-10-11), researched 2026-10-12.
-- Idempotent: players upsert on unique slug; injuries and progress updates are inserted only if absent.
-- team/stadium/opponent ids resolve via subqueries; an unknown abbreviation/slug yields NULL instead of an error.
-- Week is NULL for offseason/preseason events (practices are phase 'preseason' with NULL stadium).
SET NAMES utf8mb4;

-- Thaddeus Dixon (NYG CB) Achilles 2026-05-13
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Thaddeus', 'Dixon', 'thaddeus-dixon', 'CB', (SELECT id FROM teams WHERE abbreviation = 'NYG'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-05-13', 2026, NULL, NULL, NULL, NULL, NULL, 'unknown', 'preseason', 'Undrafted rookie; tore Achilles during rookie minicamp workout. Placed on IR May 14; out for 2026 season.', 'https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-thursday-may-14'
FROM players p WHERE p.slug = 'thaddeus-dixon'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'Achilles' AND i.injury_date = '2026-05-13');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-05-14', 'diagnosis', 'Torn Achilles confirmed; placed on IR', NULL, 'https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/giants-rookie-cb-thaddeus-dixon-tore-his-achilles'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'thaddeus-dixon' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-05-13'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-05-14');

-- Roy Robertson-Harris (NYG DT) Achilles 2026-05-21
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Roy', 'Robertson-Harris', 'roy-robertson-harris', 'DT', (SELECT id FROM teams WHERE abbreviation = 'NYG'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-05-21', 2026, NULL, NULL, NULL, NULL, NULL, 'right', 'preseason', 'Tore right Achilles in OTA practice. Placed on PUP July 23, moved to IR Aug 5; out for 2026 season.', 'https://www.espn.com/nfl/story/_/id/48843258/source-giants-dl-roy-robertson-harris-tears-achilles'
FROM players p WHERE p.slug = 'roy-robertson-harris'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'Achilles' AND i.injury_date = '2026-05-21');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-05-22', 'diagnosis', 'Torn Achilles reported (sources)', NULL, 'https://www.nytimes.com/athletic/7300357/2026/05/22/roy-robertson-harris-achilles-injury-giants-nfl/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'roy-robertson-harris' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-05-21'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-05-22');

-- Gunner Olszewski (NYG WR) Achilles 2026-05-29
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Gunner', 'Olszewski', 'gunner-olszewski', 'WR', (SELECT id FROM teams WHERE abbreviation = 'NYG'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-05-29', 2026, NULL, NULL, NULL, NULL, NULL, 'right', 'preseason', 'Tore right Achilles during OTAs; underwent surgery. Placed on IR June 1; out for 2026 season.', 'https://www.espn.com/nfl/story/_/id/48913425/giants-fear-wr-gunner-olszewski-torn-achilles-sources-say'
FROM players p WHERE p.slug = 'gunner-olszewski'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'Achilles' AND i.injury_date = '2026-05-29');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-06-01', 'diagnosis', 'Torn Achilles; placed on IR', NULL, 'https://www.cbssports.com/fantasy/football/news/giants-gunner-olszewski-moves-to-ir/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'gunner-olszewski' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-05-29'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-06-01');

-- Kendrick Law (DET WR) ACL 2026-06-02
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Kendrick', 'Law', 'kendrick-law', 'WR', (SELECT id FROM teams WHERE abbreviation = 'DET'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-06-02', 2026, NULL, NULL, NULL, NULL, 'non_contact', 'unknown', 'preseason', 'Rookie (5th round); tore ACL in a non-contact drill at OTAs. Placed on IR June 17; out for 2026 season.', 'https://www.espn.com/nfl/story/_/id/48966401/lions-2026-fifth-round-pick-kendrick-law-tears-acl-practice'
FROM players p WHERE p.slug = 'kendrick-law'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-06-02');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-06-04', 'diagnosis', 'Torn ACL; out for season', NULL, 'https://www.usatoday.com/story/sports/nfl/lions/2026/06/04/nfl-otas-lions-kendrick-law-injury/90400722007/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'kendrick-law' AND i.injury_type = 'ACL' AND i.injury_date = '2026-06-02'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-06-04');

-- Nic Scourton (CAR LB) ACL 2026-07-23
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Nic', 'Scourton', 'nic-scourton', 'LB', (SELECT id FROM teams WHERE abbreviation = 'CAR'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-07-23', 2026, NULL, NULL, NULL, NULL, NULL, 'right', 'preseason', 'Tore right ACL in first training camp practice. Placed on IR July 24; out for 2026 season.', 'https://www.nytimes.com/athletic/7466249/2026/07/23/carolina-panthers-nic-scourton-knee-injury-camp/'
FROM players p WHERE p.slug = 'nic-scourton'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-07-23');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-07-23', 'diagnosis', 'Torn ACL confirmed (sources)', NULL, 'https://x.com/RapSheet/status/2080380576205320466'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'nic-scourton' AND i.injury_type = 'ACL' AND i.injury_date = '2026-07-23'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-07-23');

-- Ethan Downs (KC DE) ACL 2026-07-28
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Ethan', 'Downs', 'ethan-downs', 'DE', (SELECT id FROM teams WHERE abbreviation = 'KC'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-07-28', 2026, NULL, NULL, NULL, NULL, NULL, 'left', 'preseason', 'Tore left ACL in training camp practice. Placed on IR July 28; out for 2026 season.', 'https://www.cbssports.com/fantasy/football/news/chiefs-ethan-downs-tears-acl-in-training-camp/'
FROM players p WHERE p.slug = 'ethan-downs'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-07-28');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-07-28', 'diagnosis', 'Torn ACL; placed on IR', NULL, 'https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/report-chiefs-de-ethan-downs-tore-his-acl'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'ethan-downs' AND i.injury_type = 'ACL' AND i.injury_date = '2026-07-28'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-07-28');

-- Bryan Bresee (NO DT) ACL 2026-07-29
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Bryan', 'Bresee', 'bryan-bresee', 'DT', (SELECT id FROM teams WHERE abbreviation = 'NO'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-07-29', 2026, NULL, NULL, NULL, NULL, 'non_contact', 'right', 'preseason', 'Non-contact knee injury in first training camp practice (11-on-11). Season-ending ACL surgery; placed on IR Aug 7.', 'https://www.espn.com/nfl/story/_/id/49513248/saints-starting-dt-bryan-bresee-season-ending-acl-surgery'
FROM players p WHERE p.slug = 'bryan-bresee'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-07-29');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-02', 'diagnosis', 'Torn ACL confirmed by HC Kellen Moore; surgery planned', NULL, 'https://x.com/AdamSchefter/status/2083954418924261854'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'bryan-bresee' AND i.injury_type = 'ACL' AND i.injury_date = '2026-07-29'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-02');

-- Jalon Walker (ATL LB) ACL 2026-08-04
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Jalon', 'Walker', 'jalon-walker', 'LB', (SELECT id FROM teams WHERE abbreviation = 'ATL'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-08-04', 2026, NULL, NULL, NULL, NULL, NULL, 'left', 'preseason', 'Tore left ACL in non-padded training camp practice; carted off. Placed on IR Aug 6; out for 2026 season.', 'https://www.nfl.com/news/falcons-lb-jalon-walker-feared-to-have-torn-acl-in-training-camp-practice'
FROM players p WHERE p.slug = 'jalon-walker'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-04');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-05', 'diagnosis', 'Torn ACL confirmed by team after imaging', NULL, 'https://www.atlantafalcons.com/news/jalon-walker-to-miss-2026-season'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'jalon-walker' AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-04'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-05');

-- Princeton Fant (DAL TE) ACL 2026-08-04
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Princeton', 'Fant', 'princeton-fant', 'TE', (SELECT id FROM teams WHERE abbreviation = 'DAL'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-08-04', 2026, NULL, NULL, NULL, NULL, NULL, 'left', 'preseason', 'Torn ACL plus partial MCL tear in first full-pads practice. Placed on IR; out for 2026 season.', 'https://www.dallascowboys.com/news/princeton-fant-suffers-acl-partial-mcl-injury-in-practice'
FROM players p WHERE p.slug = 'princeton-fant'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-04');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-06', 'diagnosis', 'Torn ACL + partial MCL; placed on IR', NULL, 'https://www.cbssports.com/fantasy/football/news/cowboys-princeton-fant-moved-to-ir/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'princeton-fant' AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-04'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-06');

-- Matt Henningsen (DEN DE) Achilles 2026-08-07
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Matt', 'Henningsen', 'matt-henningsen', 'DE', (SELECT id FROM teams WHERE abbreviation = 'DEN'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-08-07', 2026, NULL, NULL, NULL, NULL, NULL, 'unknown', 'preseason', 'Tore Achilles in practice, one year after tearing the other Achilles. Placed on IR Aug 8; out for 2026 season.', 'https://www.profootballrumors.com/2026/08/broncos-matt-henningsen-suffers-torn-achilles'
FROM players p WHERE p.slug = 'matt-henningsen'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'Achilles' AND i.injury_date = '2026-08-07');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-08', 'diagnosis', 'Torn Achilles; placed on IR', NULL, 'https://www.denvergazette.com/2026/08/08/broncos-put-matt-henningsen-on-season-ending-ir-replace-sam-webb-with-ricardo-hallman/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'matt-henningsen' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-08-07'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-08');

-- Dillon Radunz (NO G) ACL 2026-08-08
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Dillon', 'Radunz', 'dillon-radunz', 'G', (SELECT id FROM teams WHERE abbreviation = 'NO'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-08-08', 2026, NULL, NULL, NULL, NULL, NULL, 'right', 'preseason', 'Tore right ACL in Saturday practice. Placed on IR Aug 12; out for 2026 season.', 'https://global.espn.com/nfl/story/_/id/49568453/saints-dillon-radunz-season-torn-acl'
FROM players p WHERE p.slug = 'dillon-radunz'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-08');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-09', 'diagnosis', 'Torn ACL confirmed by HC Kellen Moore', NULL, 'https://x.com/AdamSchefter/status/2086489706775089395'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'dillon-radunz' AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-08'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-09');

-- Graham Mertz (HOU QB) ACL 2026-08-13
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Graham', 'Mertz', 'graham-mertz', 'QB', (SELECT id FROM teams WHERE abbreviation = 'HOU'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-08-13', 2026, NULL, (SELECT id FROM stadiums WHERE slug = 'nrg-stadium'), 'home', (SELECT id FROM teams WHERE abbreviation = 'LAC'), 'non_contact', 'right', 'preseason', 'Tore right ACL scrambling late in first half of preseason opener vs Chargers. Placed on IR; out for 2026 season.', 'https://www.nbcsports.com/fantasy/football/player-news/2026-08-15/texans-confirm-torn-acl-for-graham-mertz'
FROM players p WHERE p.slug = 'graham-mertz'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-13');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-15', 'diagnosis', 'Torn ACL confirmed by team after MRI', NULL, 'https://www.nbcsports.com/fantasy/football/player-news/2026-08-15/texans-confirm-torn-acl-for-graham-mertz'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'graham-mertz' AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-13'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-15');

-- Jaylen Harrell (TEN DE) ACL 2026-08-13
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Jaylen', 'Harrell', 'jaylen-harrell', 'DE', (SELECT id FROM teams WHERE abbreviation = 'TEN'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-08-13', 2026, NULL, (SELECT id FROM stadiums WHERE slug = 'levis-stadium'), 'away', (SELECT id FROM teams WHERE abbreviation = 'SF'), NULL, 'unknown', 'preseason', 'Tore ACL in preseason opener at 49ers. Placed on IR Aug 16; out for 2026 season.', 'https://www.cbssports.com/fantasy/football/news/titans-jaylen-harrell-done-for-season-due-to-torn-acl/'
FROM players p WHERE p.slug = 'jaylen-harrell'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-13');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-15', 'diagnosis', 'Torn ACL; done for season', NULL, 'https://www.tennessean.com/story/sports/nfl/titans/2026/08/15/jaren-kanak-injury-update-tennessee-titans-jaylen-harrell/91235847007/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'jaylen-harrell' AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-13'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-15');

-- Tyler Biadasz (LAC C) ACL 2026-08-18
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Tyler', 'Biadasz', 'tyler-biadasz', 'C', (SELECT id FROM teams WHERE abbreviation = 'LAC'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-08-18', 2026, NULL, NULL, NULL, NULL, 'contact', 'left', 'preseason', 'ACL damage plus additional left knee injuries when a defender fell into his leg in joint practice with 49ers. Placed on season-ending IR Aug 23.', 'https://www.espn.com/nfl/story/_/id/49661157/sources-chargers-tyler-biadasz-indefinitely-acl-injury'
FROM players p WHERE p.slug = 'tyler-biadasz'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-18');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-18', 'diagnosis', 'ACL injury reported (sources); out indefinitely', NULL, 'https://www.espn.com/nfl/story/_/id/49661157/sources-chargers-tyler-biadasz-indefinitely-acl-injury'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'tyler-biadasz' AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-18'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-18');

-- Jayden Higgins (HOU WR) ACL 2026-08-18
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Jayden', 'Higgins', 'jayden-higgins', 'WR', (SELECT id FROM teams WHERE abbreviation = 'HOU'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-08-18', 2026, NULL, NULL, NULL, NULL, NULL, 'unknown', 'preseason', 'Tore ACL in joint practice vs Raiders. Placed on IR Aug 21; out for 2026 season.', 'https://www.espn.com/nfl/story/_/id/49660770/sources-texans-jayden-higgins-torn-acl-season'
FROM players p WHERE p.slug = 'jayden-higgins'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-18');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-19', 'diagnosis', 'Torn ACL reported (sources)', NULL, 'https://x.com/RapSheet/status/2090111236247584871'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'jayden-higgins' AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-18'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-19');

-- Alex Wright (CLE DE) Achilles 2026-08-20
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Alex', 'Wright', 'alex-wright', 'DE', (SELECT id FROM teams WHERE abbreviation = 'CLE'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-08-20', 2026, NULL, NULL, NULL, NULL, NULL, 'right', 'preseason', 'Ruptured right Achilles in one-on-one pass-rush drill during joint practice with Bills. Placed on IR; out for 2026 season.', 'https://www.espn.com/nfl/story/_/id/49702666/sources-browns-lose-de-wright-achilles-season-add-barnett'
FROM players p WHERE p.slug = 'alex-wright'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'Achilles' AND i.injury_date = '2026-08-20');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-23', 'diagnosis', 'Ruptured Achilles; placed on IR', NULL, 'https://www.news5cleveland.com/sports/browns/browns-de-alex-wright-diagnosed-with-ruptured-achilles-will-miss-2026-season'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'alex-wright' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-08-20'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-23');

-- Dylan Horton (HOU DE) Achilles 2026-08-24
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Dylan', 'Horton', 'dylan-horton', 'DE', (SELECT id FROM teams WHERE abbreviation = 'HOU'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-08-24', 2026, NULL, NULL, NULL, NULL, NULL, 'unknown', 'preseason', 'Tore Achilles in practice. Placed on IR Aug 25; out for 2026 season.', 'https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/texans-de-dylan-horton-tore-his-achilles-at-mondays-practice'
FROM players p WHERE p.slug = 'dylan-horton'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'Achilles' AND i.injury_date = '2026-08-24');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-24', 'diagnosis', 'Torn Achilles reported (sources)', NULL, 'https://sportstalk790.iheart.com/content/2026-08-24-sources-texans-defensive-end-dylan-horton-tore-achilles/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'dylan-horton' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-08-24'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-24');

-- Calvin Austin III (NYG WR) ACL 2026-08-25
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Calvin', 'Austin III', 'calvin-austin-iii', 'WR', (SELECT id FROM teams WHERE abbreviation = 'NYG'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-08-25', 2026, NULL, NULL, NULL, NULL, 'non_contact', 'right', 'preseason', 'Tore right ACL in non-contact one-on-one practice drill; carted off. Placed on IR; out for 2026 season.', 'https://www.giants.com/news/calvin-austin-iii-injury-status-roster-new-york-giants'
FROM players p WHERE p.slug = 'calvin-austin-iii'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-25');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-26', 'diagnosis', 'Torn ACL confirmed', NULL, 'https://x.com/AdamSchefter/status/2092590430537785629'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'calvin-austin-iii' AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-25'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-26');

-- Tyler Batty (MIN LB) ACL 2026-08-28
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Tyler', 'Batty', 'tyler-batty', 'LB', (SELECT id FROM teams WHERE abbreviation = 'MIN'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-08-28', 2026, NULL, (SELECT id FROM stadiums WHERE slug = 'empower-field-at-mile-high'), 'away', (SELECT id FROM teams WHERE abbreviation = 'DEN'), NULL, 'unknown', 'preseason', 'Tore ACL in preseason finale at Broncos. Placed on IR; out for 2026 season.', 'https://vikingswire.usatoday.com/story/sports/nfl/vikings/2026/08/31/vikings-tyler-batty-placed-on-injured-reserve-with-acl-injury/91542434007/'
FROM players p WHERE p.slug = 'tyler-batty'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-28');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-08-30', 'diagnosis', 'Torn ACL reported (sources)', NULL, 'https://x.com/TomPelissero/status/2094172999708475840'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'tyler-batty' AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-28'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-08-30');

-- Arian Smith (NYJ WR) ACL 2026-09-20
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Arian', 'Smith', 'arian-smith', 'WR', (SELECT id FROM teams WHERE abbreviation = 'NYJ'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-09-20', 2026, 2, (SELECT id FROM stadiums WHERE slug = 'metlife-stadium'), 'home', (SELECT id FROM teams WHERE abbreviation = 'GB'), NULL, 'unknown', 'regular', 'Tore ACL in Week 2 loss to Packers; underwent ACL surgery. Placed on IR Sept 22; out for 2026 season.', 'https://www.newyorkjets.com/news/jets-injury-news-arian-smith-to-miss-season-after-acl-surgery-david-onyemata-sidelined-09-23-2026'
FROM players p WHERE p.slug = 'arian-smith'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-20');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-09-22', 'diagnosis', 'Torn ACL; placed on IR', NULL, 'https://www.newyorkjets.com/news/jets-injury-news-arian-smith-to-miss-season-after-acl-surgery-david-onyemata-sidelined-09-23-2026'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'arian-smith' AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-20'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-09-22');

-- De'Von Achane (MIA RB) ACL 2026-09-27
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('De''Von', 'Achane', 'devon-achane', 'RB', (SELECT id FROM teams WHERE abbreviation = 'MIA'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-09-27', 2026, 3, (SELECT id FROM stadiums WHERE slug = 'hard-rock-stadium'), 'home', (SELECT id FROM teams WHERE abbreviation = 'KC'), 'contact', 'left', 'regular', 'Tore ACL on 11-yard run on opening drive vs Chiefs. Placed on IR Sept 28; out for 2026 season.', 'https://www.nfl.com/news/dolphins-rb-devon-achane-miss-2026-season-acl-tear'
FROM players p WHERE p.slug = 'devon-achane'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-27');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-09-28', 'diagnosis', 'Torn ACL confirmed; placed on IR', NULL, 'https://x.com/AdamSchefter/status/2104579485366710726'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'devon-achane' AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-27'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-09-28');

-- Brian Burns (NYG LB) ACL 2026-09-27
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Brian', 'Burns', 'brian-burns', 'LB', (SELECT id FROM teams WHERE abbreviation = 'NYG'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-09-27', 2026, 3, (SELECT id FROM stadiums WHERE slug = 'metlife-stadium'), 'home', (SELECT id FROM teams WHERE abbreviation = 'TEN'), NULL, 'right', 'regular', 'Tore right ACL early in 4th quarter vs Titans while playing through an ankle injury. Placed on IR Sept 29; season-ending surgery.', 'https://www.giants.com/news/coach-john-harbaugh-confirms-torn-acl-for-olb-brian-burns-injury-update-week-3'
FROM players p WHERE p.slug = 'brian-burns'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-27');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-09-28', 'diagnosis', 'Torn ACL confirmed by HC John Harbaugh', NULL, 'https://www.giants.com/news/coach-john-harbaugh-confirms-torn-acl-for-olb-brian-burns-injury-update-week-3'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'brian-burns' AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-27'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-09-28');

-- Edgerrin Cooper (GB LB) Achilles 2026-10-04
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Edgerrin', 'Cooper', 'edgerrin-cooper', 'LB', (SELECT id FROM teams WHERE abbreviation = 'GB'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-10-04', 2026, 4, (SELECT id FROM stadiums WHERE slug = 'raymond-james-stadium'), 'away', (SELECT id FROM teams WHERE abbreviation = 'TB'), 'non_contact', 'left', 'regular', 'Non-contact left Achilles tear in 3rd quarter at Buccaneers; carted off. Placed on IR Oct 6; out for 2026 season.', 'https://www.espn.com/nfl/story/_/id/50110763/sources-packers-lb-edgerrin-cooper-torn-achilles'
FROM players p WHERE p.slug = 'edgerrin-cooper'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'Achilles' AND i.injury_date = '2026-10-04');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-05', 'diagnosis', 'Torn Achilles confirmed by MRI', NULL, 'https://x.com/AdamSchefter/status/2107157862590079337'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'edgerrin-cooper' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-10-04'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-10-05');

-- Durham Smythe (BAL TE) Achilles 2026-10-04
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Durham', 'Smythe', 'durham-smythe', 'TE', (SELECT id FROM teams WHERE abbreviation = 'BAL'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-10-04', 2026, 4, (SELECT id FROM stadiums WHERE slug = 'mt-bank-stadium'), 'home', (SELECT id FROM teams WHERE abbreviation = 'TEN'), NULL, 'right', 'regular', 'Tore right Achilles vs Titans. Placed on IR; out for 2026 season.', 'https://www.baltimoreravens.com/news/durham-smythe-torn-achilles-ravens-tight-end-out-for-season'
FROM players p WHERE p.slug = 'durham-smythe'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'Achilles' AND i.injury_date = '2026-10-04');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-06', 'diagnosis', 'Torn Achilles confirmed by MRI', NULL, 'https://x.com/RapSheet/status/2107525796776575252'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'durham-smythe' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-10-04'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-10-06');

-- Javon Hargrave (GB DT) Achilles 2026-10-11
INSERT INTO players (first_name, last_name, slug, position, team_id) VALUES ('Javon', 'Hargrave', 'javon-hargrave', 'DT', (SELECT id FROM teams WHERE abbreviation = 'GB'))
  ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), position = VALUES(position), team_id = COALESCE(VALUES(team_id), team_id);
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-10-11', 2026, 5, (SELECT id FROM stadiums WHERE slug = 'lambeau-field'), 'home', (SELECT id FROM teams WHERE abbreviation = 'CHI'), NULL, 'unknown', 'regular', 'Carted off late in 4th quarter vs Bears; tests confirmed torn Achilles. Out for 2026 season.', 'https://www.espn.com/nfl/story/_/id/50167021/source-packers-lose-hargrave-season-ending-torn-achilles'
FROM players p WHERE p.slug = 'javon-hargrave'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'Achilles' AND i.injury_date = '2026-10-11');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-12', 'diagnosis', 'Torn Achilles confirmed by tests', NULL, 'https://x.com/AdamSchefter/status/2109678016473280736'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'javon-hargrave' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-10-11'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-10-12');
