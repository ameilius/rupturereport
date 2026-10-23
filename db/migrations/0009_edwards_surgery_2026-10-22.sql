-- 0009: Mario Edwards Jr. (HOU DT) ACL surgery, per Aaron Wilson (KPRC 2 / SportsTalk 790), reported 2026-09-30.
-- Idempotent: progress update inserted only if absent. Same date as the IR/diagnosis row; the newer id sorts as latest stage.
SET NAMES utf8mb4;

INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, '2026-09-30', 'surgery', 'Undergoing season-ending ACL surgery', 'MRI confirmed a torn ACL; Edwards is undergoing season-ending surgery, per a league source (Aaron Wilson, KPRC 2 / SportsTalk 790).', 'https://sportstalk790.iheart.com/content/2026-09-30-texans-ir-mario-edwards-jr-with-torn-acl-promote-chris-braswell/'
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE p.slug = 'mario-edwards-jr' AND i.injury_type = 'ACL' AND i.injury_date = '2026-09-27'
  AND NOT EXISTS (SELECT 1 FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery' AND u.update_date = '2026-09-30');
