-- 0003: recovery progress updates researched 2026-10-12 (facts only; unconfirmed/planned surgeries skipped).
-- Idempotent: each row inserted only if no update exists for the same injury + stage + date.
SET NAMES utf8mb4;

-- gunner-olszewski: Surgery on ruptured Achilles
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-06-01', 'surgery', 'Surgery on ruptured Achilles', 'Surgery on Monday Jun 1 per Olszewski to Art Stapleton (The Record); placed on IR same day.', 'https://www.fantasypros.com/nfl/news/589074/gunner-olszewski-achilles-to-undergo-surgery-monday-.php'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'gunner-olszewski' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-05-29'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-06-01');

-- ethan-downs: Surgery to repair torn left ACL
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-07-29', 'surgery', 'Surgery to repair torn left ACL', 'Andy Reid said Downs had surgery (reported Jul 29; date approximate).', 'https://x.com/ByNateTaylor/status/2082491100678222278'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'ethan-downs' AND i.injury_type = 'ACL' AND i.injury_date = '2026-07-28'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-07-29');

-- arian-smith: Season-ending ACL surgery
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-09-23', 'surgery', 'Season-ending ACL surgery', 'HC Aaron Glenn announced Smith underwent ACL surgery (reported Sep 23; date approximate).', 'https://www.profootballrumors.com/2026/09/jets-wr-arian-smith-undergoes-season-ending-knee-surgery'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'arian-smith' AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-20'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-09-23');

-- brian-burns: Surgery: ACL + lateral meniscus
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-01', 'surgery', 'Surgery: ACL + lateral meniscus', 'Surgery on Oct 1 repairing torn right ACL and lateral meniscus, per Dan Duggan (The Athletic).', 'https://www.profootballrumors.com/2026/10/giants-olb-brian-burns-tore-meniscus-in-addition-to-acl'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'brian-burns' AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-27'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-10-01');
