-- 0013: first NBA tears (6). Facts only from the cited sources; blanks where a source is silent.
--   Season: injuries.season is the league year (2026 = 2026-27), same model as the NFL, and includes the
--   summer league, offseason and preseason. DiVincenzo's April 2026 playoff tear belongs to 2025 (2025-26)
--   and shows as a carryover on the NBA 2026-27 page until he returns.
--   Bios (dob/height/weight) and positions are from the ESPN athlete profile (sports.core.api.espn.com, NBA);
--   ages cross-checked against Hoops Rumors/Yahoo/NBA.com. Position is the ESPN listed position (G or C).
--   Game numbers: DiVincenzo Game 4 (AP/Hoops Rumors; the Wolves' release says Game 3, which conflicts with the
--   series score), Hukporti preseason opener, Watkins Summer League opener. Mechanism only where the source states it.
--   Excluded by rule: Brandon Ingram (partial Achilles) and patellar/MCL/meniscus injuries.
-- Idempotent: every insert is guarded; updates are keyed on slug + league.
SET NAMES utf8mb4;

-- Donte DiVincenzo
INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT 'NBA', 'Donte', 'DiVincenzo', 'donte-divincenzo', 'G', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'MIN')
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = 'donte-divincenzo');
UPDATE players SET dob = COALESCE(dob, '1997-01-31'), height_in = COALESCE(height_in, 76), weight_lb = COALESCE(weight_lb, 203), headshot_path = COALESCE(headshot_path, '/players/donte-divincenzo.png') WHERE slug = 'donte-divincenzo' AND league = 'NBA';
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-04-25', 2025, 4, (SELECT id FROM stadiums WHERE league = 'NBA' AND slug = 'target-center'), 'home', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'DEN'), NULL, 'right', 'playoffs',
       'Went down 1:19 into Game 4 of the Western Conference first-round series against Denver, slipping to the court while chasing a ball in the opening minutes. He put little to no weight on his right foot and left the arena in a wheelchair. An MRI the next day revealed a ruptured right Achilles tendon, ending his season; Minnesota won the game to lead the series 3-1.',
       'https://www.nba.com/news/anthony-edwards-donte-divincenzo-injuries'
FROM players p WHERE p.slug = 'donte-divincenzo' AND p.league = 'NBA'
  AND NOT EXISTS (SELECT 1 FROM injuries x WHERE x.player_id = p.id AND x.injury_type = 'Achilles' AND x.injury_date = '2026-04-25');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-04-26', 'diagnosis', 'Ruptured Achilles confirmed by MRI', 'MRI by Dr. Craig Bennett at Mayo Clinic Sports Medicine revealed a ruptured right Achilles tendon; out indefinitely.', 'https://www.nba.com/timberwolves/news/donte-divincenzo-injury-update-2'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'donte-divincenzo' AND p.league = 'NBA' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-04-25'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-04-26');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-04-26', 'surgery', 'Surgery in New York', 'Team announced surgery that afternoon in New York by Dr. Martin O''Malley of the Hospital for Special Surgery.', 'https://www.hoopsrumors.com/2026/04/donte-divincenzo-undergoing-surgery-for-ruptured-achilles.html'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'donte-divincenzo' AND p.league = 'NBA' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-04-25'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-04-26');

-- Jamir Watkins
INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT 'NBA', 'Jamir', 'Watkins', 'jamir-watkins', 'G', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'WAS')
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = 'jamir-watkins');
UPDATE players SET dob = COALESCE(dob, '2001-07-06'), height_in = COALESCE(height_in, 78), weight_lb = COALESCE(weight_lb, 210), headshot_path = COALESCE(headshot_path, '/players/jamir-watkins.png') WHERE slug = 'jamir-watkins' AND league = 'NBA';
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-07-09', COALESCE((SELECT CAST(v AS UNSIGNED) FROM settings WHERE k = 'current_season_nba'), 2026), 1, NULL, 'neutral', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'UTA'), NULL, 'left', 'summer_league',
       'Hurt in the Wizards'' Summer League opener in Las Vegas against the Jazz, a four-point win in which he had played 20 minutes before the injury. Surgery on July 30 repaired the torn left ACL.',
       'https://www.hoopsrumors.com/2026/07/wizards-jamir-watkins-undergoes-surgery-for-torn-acl.html'
FROM players p WHERE p.slug = 'jamir-watkins' AND p.league = 'NBA'
  AND NOT EXISTS (SELECT 1 FROM injuries x WHERE x.player_id = p.id AND x.injury_type = 'ACL' AND x.injury_date = '2026-07-09');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-07-30', 'surgery', 'Successful surgery on torn left ACL', 'Team announced he underwent successful surgery on Thursday to repair a torn ACL in his left knee.', 'https://www.hoopsrumors.com/2026/07/wizards-jamir-watkins-undergoes-surgery-for-torn-acl.html'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'jamir-watkins' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2026-07-09'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-07-30');

-- Henri Veesaar
INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT 'NBA', 'Henri', 'Veesaar', 'henri-veesaar', 'C', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'ATL')
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = 'henri-veesaar');
UPDATE players SET dob = COALESCE(dob, '2004-03-28'), height_in = COALESCE(height_in, 84), weight_lb = COALESCE(weight_lb, 227), headshot_path = COALESCE(headshot_path, '/players/henri-veesaar.png') WHERE slug = 'henri-veesaar' AND league = 'NBA';
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-09-15', COALESCE((SELECT CAST(v AS UNSIGNED) FROM settings WHERE k = 'current_season_nba'), 2026), NULL, NULL, NULL, NULL, NULL, 'right', NULL,
       'Rookie center (No. 52 pick in the 2026 draft). Tore his right ACL during a workout on September 15. The Hawks announced it on September 21 and expect him to miss the entire 2026-27 season; surgery was scheduled for October.',
       'https://www.hoopsrumors.com/2026/09/hawks-veesaar-expected-to-miss-2026-27-due-to-torn-acl.html'
FROM players p WHERE p.slug = 'henri-veesaar' AND p.league = 'NBA'
  AND NOT EXISTS (SELECT 1 FROM injuries x WHERE x.player_id = p.id AND x.injury_type = 'ACL' AND x.injury_date = '2026-09-15');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-09-21', 'diagnosis', 'Torn ACL announced; out for season', 'Hawks announced the torn right ACL (sustained Sept 15 in a workout); surgery planned for next month; expected to miss all of 2026-27.', 'https://www.hoopsrumors.com/2026/09/hawks-veesaar-expected-to-miss-2026-27-due-to-torn-acl.html'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'henri-veesaar' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-15'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-09-21');

-- Ariel Hukporti
INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT 'NBA', 'Ariel', 'Hukporti', 'ariel-hukporti', 'C', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'PHI')
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = 'ariel-hukporti');
UPDATE players SET dob = COALESCE(dob, '2002-04-12'), height_in = COALESCE(height_in, 84), weight_lb = COALESCE(weight_lb, 258), headshot_path = COALESCE(headshot_path, '/players/ariel-hukporti.png') WHERE slug = 'ariel-hukporti' AND league = 'NBA';
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-10-05', COALESCE((SELECT CAST(v AS UNSIGNED) FROM settings WHERE k = 'current_season_nba'), 2026), 1, (SELECT id FROM stadiums WHERE league = 'NBA' AND slug = 'xfinity-mobile-arena'), 'home', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'NYK'), 'non_contact', 'right', 'preseason',
       'Went down early in the first quarter of his 76ers preseason debut, the opener against his former team the Knicks, and was helped off the court. The injury was non-contact. An MRI confirmed a ruptured right Achilles and he had surgery the next day.',
       'https://www.nba.com/news/ariel-hukporti-suffers-right-achilles-tear-in-76ers-preseason-opener'
FROM players p WHERE p.slug = 'ariel-hukporti' AND p.league = 'NBA'
  AND NOT EXISTS (SELECT 1 FROM injuries x WHERE x.player_id = p.id AND x.injury_type = 'Achilles' AND x.injury_date = '2026-10-05');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-06', 'diagnosis', 'Ruptured Achilles confirmed by MRI', 'MRI on Tuesday confirmed a ruptured right Achilles tendon; ruled out for the 2026-27 season.', 'https://www.nba.com/news/ariel-hukporti-suffers-right-achilles-tear-in-76ers-preseason-opener'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'ariel-hukporti' AND p.league = 'NBA' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-10-05'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-10-06');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-06', 'surgery', 'Successful surgery on torn Achilles', 'Team reported he underwent successful surgery on the torn right Achilles tendon.', 'https://www.nba.com/news/ariel-hukporti-suffers-right-achilles-tear-in-76ers-preseason-opener'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'ariel-hukporti' AND p.league = 'NBA' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-10-05'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-10-06');

-- Otega Oweh
INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT 'NBA', 'Otega', 'Oweh', 'otega-oweh', 'G', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'OKC')
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = 'otega-oweh');
UPDATE players SET dob = COALESCE(dob, '2003-06-21'), height_in = COALESCE(height_in, 76), weight_lb = COALESCE(weight_lb, 217), headshot_path = COALESCE(headshot_path, '/players/otega-oweh.png'), status_note = 'Waived by OKC Oct 24, 2026' WHERE slug = 'otega-oweh' AND league = 'NBA';
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-10-13', COALESCE((SELECT CAST(v AS UNSIGNED) FROM settings WHERE k = 'current_season_nba'), 2026), NULL, NULL, NULL, (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'IND'), NULL, 'right', 'preseason',
       'Rookie guard (No. 41 pick in the 2026 draft, two-way contract). Hurt in the Thunder''s preseason game against the Indiana Pacers; the team put the date at Oct. 13 (Hoops Rumors says Oct. 12). Surgery on Oct. 14 repaired the ruptured right Achilles and ended his season. The Thunder waived him on Oct. 24, so the team shown is his last team.',
       'https://www.nba.com/thunder/news/release-medical-update-261014'
FROM players p WHERE p.slug = 'otega-oweh' AND p.league = 'NBA'
  AND NOT EXISTS (SELECT 1 FROM injuries x WHERE x.player_id = p.id AND x.injury_type = 'Achilles' AND x.injury_date = '2026-10-13');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-14', 'surgery', 'Successful surgery on ruptured Achilles', 'Procedure by Dr. Martin O''Malley at the Hospital for Special Surgery; out for the rest of 2026-27.', 'https://www.nba.com/thunder/news/release-medical-update-261014'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'otega-oweh' AND p.league = 'NBA' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-10-13'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-10-14');

-- Ben Simmons
INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT 'NBA', 'Ben', 'Simmons', 'ben-simmons', 'G', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'SAC')
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = 'ben-simmons');
UPDATE players SET dob = COALESCE(dob, '1996-07-20'), height_in = COALESCE(height_in, 82), weight_lb = COALESCE(weight_lb, 240), headshot_path = COALESCE(headshot_path, '/players/ben-simmons.png') WHERE slug = 'ben-simmons' AND league = 'NBA';
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'Achilles', '2026-10-18', COALESCE((SELECT CAST(v AS UNSIGNED) FROM settings WHERE k = 'current_season_nba'), 2026), NULL, NULL, NULL, NULL, NULL, 'right', NULL,
       'Hurt during a live drill at Kings practice on Sunday, three days before the season opener at the Clippers. The team confirmed on Tuesday, Oct. 20 that he had successful surgery to address a torn right Achilles, ending his comeback attempt with Sacramento (he signed a veteran-minimum deal in September).',
       'https://www.nba.com/news/kings-guard-ben-simmons-suffers-torn-achilles-tendon-during-practice-sunday'
FROM players p WHERE p.slug = 'ben-simmons' AND p.league = 'NBA'
  AND NOT EXISTS (SELECT 1 FROM injuries x WHERE x.player_id = p.id AND x.injury_type = 'Achilles' AND x.injury_date = '2026-10-18');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-20', 'surgery', 'Successful surgery on torn Achilles', 'Kings confirmed Simmons underwent successful surgery to address the torn right Achilles tendon.', 'https://www.nba.com/news/kings-guard-ben-simmons-suffers-torn-achilles-tendon-during-practice-sunday'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'ben-simmons' AND p.league = 'NBA' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-10-18'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-10-20');
