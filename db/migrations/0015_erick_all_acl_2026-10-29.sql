-- 0015: New tear: Erick All Jr. (CIN TE) torn right ACL, Week 7 at BAL (35-13 win), Sun 2026-10-25, M&T Bank Stadium.
-- Hurt on a nine-yard catch over the middle in the third quarter (Bengals.com); contact/non-contact not reported -> NULL.
-- Surface: in-game tear, from the stadium record (M&T Bank Stadium = natural grass). Third tear of the same right ACL.
-- Placed on IR Oct 27 (ESPN); Zac Taylor confirmed the torn ACL and season-ending surgery Oct 28 (Bengals.com, CBS/RotoWire).
-- Bio from ESPN athlete 4427834. Season from settings.current_season. League-qualified lookups; idempotent throughout.
SET NAMES utf8mb4;

INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT 'NFL', 'Erick', 'All Jr.', 'erick-all-jr', 'TE', (SELECT id FROM teams WHERE league = 'NFL' AND abbreviation = 'CIN')
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = 'erick-all-jr');
UPDATE players SET dob = COALESCE(dob, '2000-09-13'), height_in = COALESCE(height_in, 77), weight_lb = COALESCE(weight_lb, 255), headshot_path = COALESCE(headshot_path, '/players/erick-all-jr.png') WHERE slug = 'erick-all-jr' AND league = 'NFL';

INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, 'ACL', '2026-10-25',
       COALESCE((SELECT CAST(s.v AS UNSIGNED) FROM settings s WHERE s.k = 'current_season'), 2026),
       7, (SELECT id FROM stadiums WHERE league = 'NFL' AND slug = 'mt-bank-stadium'), 'away', (SELECT id FROM teams WHERE league = 'NFL' AND abbreviation = 'BAL'), NULL, 'right', 'regular',
       'Injured his right knee on a nine-yard catch over the middle in the third quarter of the 35-13 Week 7 win at Baltimore, during his best game of the season (three catches, 26 yards). Placed on IR Oct 27; Zac Taylor confirmed a torn ACL requiring season-ending surgery on Oct 28. It is the third tear of his right ACL (Iowa 2023, rookie season 2024).',
       'https://www.bengals.com/news/quick-hits-erick-all-jr-zac-taylor-bengals-tight-end-room-gets-facelift-ryan-rehkow-s-gutty-sunday'
FROM players p WHERE p.slug = 'erick-all-jr' AND p.league = 'NFL'
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = 'ACL' AND i.injury_date = '2026-10-25');

INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-27', 'diagnosis', 'Placed on IR; torn ACL suspected', 'Bengals placed All on injured reserve; a source told Ian Rapoport the injury is believed to be a torn ACL.', 'https://www.espn.com/nfl/story/_/id/50299803/bengals-te-all-put-ir-likely-due-torn-acl-per-source'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'erick-all-jr' AND p.league = 'NFL' AND i.injury_type = 'ACL' AND i.injury_date = '2026-10-25'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-10-27');

INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-28', 'diagnosis', 'Torn right ACL confirmed; out for season', 'Zac Taylor confirmed a torn right ACL that will require season-ending surgery.', 'https://www.cbssports.com/fantasy/football/news/bengals-erick-all-out-for-season-with-acl-tear/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'erick-all-jr' AND p.league = 'NFL' AND i.injury_type = 'ACL' AND i.injury_date = '2026-10-25'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'diagnosis' AND u.update_date = '2026-10-28');
