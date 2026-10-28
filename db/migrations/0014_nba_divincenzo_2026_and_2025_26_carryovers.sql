-- 0014: DiVincenzo moves into the 2026-27 league season (owner decision), plus four 2025-26 NBA tears still in rehab.
--   Season convention (unchanged): injuries.season is the league year the tear happened in, offseason included
--   (2025 = 2025-26). Butler (Jan 19, 2026), Furphy (Feb 8, 2026), Williams Jr. (Feb 23, 2026) and Sorber
--   (Sept 4, 2025, an offseason workout) are 2025 and show as carryovers on /nba until they return.
--   DiVincenzo's Apr 25, 2026 playoff tear is an explicit exception: it is counted in 2026-27 at the owner's request.
--   Bios (dob/height/weight) and positions are the ESPN athlete profile values. Facts only; blanks where unconfirmed
--   (no game numbers; no mechanism for Sorber's workout tear; Williams Jr.'s surgery date is not confirmed by a source).
--   Williams Jr.: Shams/Hoops Rumors/NBC say left knee; one narrative says right. Left is used.
-- Idempotent: inserts are guarded; updates are keyed on slug + league.
SET NAMES utf8mb4;

UPDATE injuries i JOIN players p ON p.id = i.player_id
SET i.season = 2026
WHERE p.slug = 'donte-divincenzo' AND p.league = 'NBA' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-04-25' AND i.season <> 2026;

-- Jimmy Butler
INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT 'NBA', 'Jimmy', 'Butler', 'jimmy-butler', 'F', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'GSW')
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = 'jimmy-butler');
UPDATE players SET dob = COALESCE(dob, '1989-09-14'), height_in = COALESCE(height_in, 78), weight_lb = COALESCE(weight_lb, 230), headshot_path = COALESCE(headshot_path, '/players/jimmy-butler.png') WHERE slug = 'jimmy-butler' AND league = 'NBA';
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-01-19', 2025, NULL, (SELECT id FROM stadiums WHERE league = 'NBA' AND slug = 'chase-center'), 'home', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'MIA'), 'contact', 'right', 'regular',
       'Hurt in the third quarter of a Warriors win over the Heat, his former team, moments after catching a pass in the paint. He landed awkwardly after a collision with Miami''s Davion Mitchell (a foul was called), and his right knee buckled; he needed help to the locker room. The Warriors announced the torn right ACL the next day and that he would miss the rest of 2025-26.',
       'https://www.nba.com/news/warriors-star-jimmy-butler-exits-early-with-right-knee-injury-vs-heat'
FROM players p WHERE p.slug = 'jimmy-butler' AND p.league = 'NBA'
  AND NOT EXISTS (SELECT 1 FROM injuries x WHERE x.player_id = p.id AND x.injury_type = 'ACL' AND x.injury_date = '2026-01-19');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-01-20', 'diagnosis', 'Torn right ACL; out for season', 'Warriors announced a torn right ACL and that he would miss the remainder of the 2025-26 season; surgery date to be determined.', 'https://www.nba.com/news/warriors-star-jimmy-butler-exits-early-with-right-knee-injury-vs-heat'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'jimmy-butler' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2026-01-19'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-01-20');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-02-09', 'surgery', 'ACL reconstruction', 'Dr. Bert Mandelbaum performed the reconstruction in Los Angeles; the team said it was successful and rehab began immediately.', 'https://www.nba.com/news/warriors-star-jimmy-butler-undergoes-right-knee-surgery-to-repair-acl'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'jimmy-butler' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2026-01-19'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-02-09');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-16', 'weight_bearing', 'Light on-court work; return date not set', 'Cleared for light on-court activities (reported Sept. 28). ESPN''s Anthony Slater reported on Oct. 16 that a January-to-February return is considered an optimistic target; the team has not announced a return date.', 'https://www.nba.com/warriors/player/202710/jimmy-butler-iii'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'jimmy-butler' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2026-01-19'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'weight_bearing' AND u.update_date = '2026-10-16');

-- Johnny Furphy
INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT 'NBA', 'Johnny', 'Furphy', 'johnny-furphy', 'G', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'IND')
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = 'johnny-furphy');
UPDATE players SET dob = COALESCE(dob, '2004-12-07'), height_in = COALESCE(height_in, 80), weight_lb = COALESCE(weight_lb, 200), headshot_path = COALESCE(headshot_path, '/players/johnny-furphy.png') WHERE slug = 'johnny-furphy' AND league = 'NBA';
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-02-08', 2025, NULL, (SELECT id FROM stadiums WHERE league = 'NBA' AND slug = 'scotiabank-arena'), 'away', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'TOR'), 'non_contact', 'right', 'regular',
       'Hurt late in the third quarter of a 122-104 Pacers loss in Toronto. He finished a one-handed dunk, landed and immediately clutched his right knee, and left the floor in a wheelchair. An MRI at the Hospital for Special Surgery in New York confirmed the torn right ACL the next day, and the Pacers announced he would miss the rest of 2025-26.',
       'https://apnews.com/article/pacers-injury-furphy-bcee4c3730fa839bc97cea3bc96e29b2'
FROM players p WHERE p.slug = 'johnny-furphy' AND p.league = 'NBA'
  AND NOT EXISTS (SELECT 1 FROM injuries x WHERE x.player_id = p.id AND x.injury_type = 'ACL' AND x.injury_date = '2026-02-08');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-02-09', 'diagnosis', 'Torn right ACL; out for season', 'Pacers announced the torn ACL in his right knee and that he would miss the rest of the 2025-26 season.', 'https://apnews.com/article/pacers-injury-furphy-bcee4c3730fa839bc97cea3bc96e29b2'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'johnny-furphy' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2026-02-08'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-02-09');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-02-24', 'surgery', 'Successful surgery on torn right ACL', 'Team announced the repair surgery, performed by Dr. Brian Cole at Rush in Chicago; coach Rick Carlisle called it "very successful".', 'https://www.fieldhousefiles.com/p/johnny-furphy-undergoes-surgery-right-acl'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'johnny-furphy' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2026-02-08'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-02-24');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-09-24', 'weight_bearing', 'Rehab on track; midseason return expected', 'Pacers executives said he has hit all rehab benchmarks and the original timeline of a return around the middle of the season still stands; no date given. He was back on the court by August but had not reached five-on-five work as of late August.', 'https://roundtable.io/sports/nba/pacers/news/pacers-give-johnny-furphy-acl-rehab-update-before-camp'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'johnny-furphy' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2026-02-08'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'weight_bearing' AND u.update_date = '2026-09-24');

-- Thomas Sorber
INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT 'NBA', 'Thomas', 'Sorber', 'thomas-sorber', 'C', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'OKC')
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = 'thomas-sorber');
UPDATE players SET dob = COALESCE(dob, '2005-12-25'), height_in = COALESCE(height_in, 81), weight_lb = COALESCE(weight_lb, 250), headshot_path = COALESCE(headshot_path, '/players/thomas-sorber.png') WHERE slug = 'thomas-sorber' AND league = 'NBA';
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2025-09-04', 2025, NULL, NULL, NULL, NULL, NULL, 'right', NULL,
       'Rookie forward/center (No. 15 pick in the 2025 draft). Tore his right ACL in an offseason workout in Oklahoma City on Sept. 4, 2025; the Thunder announced it the next day and ruled him out for 2025-26, so he never played in his rookie season. On July 1, 2026 he had a minor arthroscopic procedure on the same knee, with a return to full basketball activities expected in four weeks. He had not made his NBA debut as of Oct. 26, 2026.',
       'https://www.reuters.com/sports/thunder-rookie-thomas-sorber-tears-acl-out-season--flm-2025-09-06/'
FROM players p WHERE p.slug = 'thomas-sorber' AND p.league = 'NBA'
  AND NOT EXISTS (SELECT 1 FROM injuries x WHERE x.player_id = p.id AND x.injury_type = 'ACL' AND x.injury_date = '2025-09-04');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2025-09-05', 'diagnosis', 'Torn right ACL; out for season', 'Thunder announced the torn ACL in his right knee, sustained in a workout the day before; out for 2025-26.', 'https://www.reuters.com/sports/thunder-rookie-thomas-sorber-tears-acl-out-season--flm-2025-09-06/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'thomas-sorber' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2025-09-04'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2025-09-05');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2025-09-16', 'surgery', 'Successful surgery on torn right ACL', 'Dr. Neal ElAttrache performed the procedure at Cedars-Sinai Medical Center in Los Angeles; expected to be back for 2026-27.', 'https://okcthunderwire.usatoday.com/story/sports/nba/thunder/2025/09/16/thomas-sorber-has-surgery-for-torn-acl-to-return-by-2026-27-season/86190448007/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'thomas-sorber' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2025-09-04'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2025-09-16');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-07-01', 'surgery', 'Minor arthroscopic procedure, same knee', 'Dr. Neal ElAttrache performed a minor arthroscopic procedure on the right knee; return to full basketball activities expected in four weeks.', 'https://okcthunderwire.usatoday.com/story/sports/nba/thunder/2026/07/01/thomas-sorber-undergoes-knee-surgery-out-for-1-month/90775921007/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'thomas-sorber' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2025-09-04'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-07-01');

-- Vince Williams Jr.
INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT 'NBA', 'Vince', 'Williams Jr.', 'vince-williams-jr', 'G', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'UTA')
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = 'vince-williams-jr');
UPDATE players SET dob = COALESCE(dob, '2000-08-30'), height_in = COALESCE(height_in, 76), weight_lb = COALESCE(weight_lb, 205), headshot_path = COALESCE(headshot_path, '/players/vince-williams-jr.png'), status_note = 'Waived by UTA Mar 9, 2026' WHERE slug = 'vince-williams-jr' AND league = 'NBA';
INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-02-23', 2025, NULL, (SELECT id FROM stadiums WHERE league = 'NBA' AND slug = 'toyota-center'), 'away', (SELECT id FROM teams WHERE league = 'NBA' AND abbreviation = 'HOU'), 'contact', 'left', 'regular',
       'Hurt in the first half of a 125-105 Jazz loss at Houston, in just his sixth game with Utah after a Feb. 3 trade from Memphis. He was knocked off balance in a collision with the Rockets'' Tari Eason and his knee bent awkwardly. An MRI the next day confirmed a torn left ACL (reported by Shams Charania), ending his 2025-26 season. The Jazz waived him on March 9, so the team shown is his last team.',
       'https://sports.yahoo.com/nba/breaking-news/article/report-jazzs-vince-williams-jr-suffers-season-ending-torn-left-acl-in-collision-with-rockets-tari-eason-182535632.html'
FROM players p WHERE p.slug = 'vince-williams-jr' AND p.league = 'NBA'
  AND NOT EXISTS (SELECT 1 FROM injuries x WHERE x.player_id = p.id AND x.injury_type = 'ACL' AND x.injury_date = '2026-02-23');
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-02-24', 'diagnosis', 'Torn left ACL; out for season', 'MRI confirmed a torn left ACL, ending his 2025-26 season (ESPN''s Shams Charania). Hoops Rumors noted the injury is likely to keep him out for a significant part of 2026-27.', 'https://www.hoopsrumors.com/2026/03/jazz-to-waive-vince-williams-jr.html'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'vince-williams-jr' AND p.league = 'NBA' AND i.injury_type = 'ACL' AND i.injury_date = '2026-02-23'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-02-24');
