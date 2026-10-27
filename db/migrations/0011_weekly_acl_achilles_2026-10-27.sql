-- 0011: weekly ACL / Achilles update researched 2026-10-27 (window 2026-10-20 .. 2026-10-27).
-- New tears: none confirmed this week.
-- Recovery: Thaddeus Dixon (NYG, Achilles) seen doing rehab work on the field with trainers 2026-10-22,
--   still on IR (Pat Leonard, NY Daily News). Stage unchanged (diagnosis); no surgery/milestone stage reported.
-- Stadium: Tottenham Hotspur Stadium NFL surface verified as artificial (dedicated synthetic NFL field under the
--   retractable grass soccer pitch), per the stadium's official NFL page and Populous (stadium architect).
--   surface_type stays 'artificial'; notes now cite the source.
-- Watching / skipped (not confirmed tears): CHI Cole Kmet right knee (season-ending, IR 2026-10-23; ligament not
--   confirmed by team or reliable outlet), BAL Vega Ioane (MCL sprain), SEA Rashid Shaheed knee (day to day),
--   SF Mike Evans Achilles (not a rupture; out Week 7), WAS Terry McLaurin (torn patellar tendon, not counted).
-- Idempotent: progress update inserted only if absent; stadium notes update is a fixed value.
SET NAMES utf8mb4;

-- thaddeus-dixon: on-field rehab work with trainers (stage unchanged)
INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-10-22', 'diagnosis', 'Rehab work on field with trainers', 'Still on IR; worked with trainers on the grass during Giants practice on Thursday, Oct 22 (Pat Leonard, NY Daily News).', 'https://x.com/PLeonardNYDN/status/2113323133847457841'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'thaddeus-dixon' AND i.injury_type = 'Achilles' AND i.injury_date = '2026-05-13'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.update_date = '2026-10-22' AND u.source = 'https://x.com/PLeonardNYDN/status/2113323133847457841');

-- Tottenham Hotspur Stadium: surface verified (artificial); cite sources in notes
UPDATE stadiums
   SET surface_type = 'artificial',
       notes = 'International venue (UK). NFL games are played on a dedicated artificial-turf field beneath the retractable grass soccer pitch. Sources: https://www.tottenhamhotspurstadium.com/events/nfl-london-games ; https://populous.com/article/populous-designed-tottenham-hotspur-stadium-hosts-first-nfl-games'
 WHERE slug = 'tottenham-hotspur-stadium';
