-- 0007: practice-site context for non-game tears (researched 2026-10-15).
-- Adds injuries.practice_venue / practice_surface. Game-surface stats still come only from stadiums
-- (games); practice_surface is display context and is set ONLY where a credible report states it.
-- All game tears already had stadiums; 2026 stadium surfaces re-verified (MetLife and NRG reverted to
-- turf after the World Cup), no changes needed.
-- Idempotent: columns added IF NOT EXISTS; updates only touch NULL fields.
SET NAMES utf8mb4;

ALTER TABLE injuries ADD COLUMN IF NOT EXISTS practice_venue VARCHAR(160) NULL AFTER source;
ALTER TABLE injuries ADD COLUMN IF NOT EXISTS practice_surface ENUM('natural','hybrid','artificial') NULL AFTER practice_venue;

-- Surface stated: Texans.com "Harris Hits" (2026-08-18): "the day spent on the grass at the Houston Methodist Training Center".
UPDATE injuries i JOIN players p ON p.id = i.player_id
   SET i.practice_venue = COALESCE(i.practice_venue, 'Houston Methodist Training Center, Houston, TX (joint practice vs Raiders)'),
       i.practice_surface = COALESCE(i.practice_surface, 'natural')
 WHERE p.slug = 'jayden-higgins' AND i.injury_type = 'ACL' AND i.injury_date = '2026-08-18' AND i.stadium_id IS NULL;

-- Venue only (surface not stated by any source found):
UPDATE injuries i JOIN players p ON p.id = i.player_id SET i.practice_venue = 'The Bolt (Chargers facility), El Segundo, CA (joint practice vs 49ers)'
 WHERE p.slug = 'tyler-biadasz' AND i.injury_date = '2026-08-18' AND i.stadium_id IS NULL AND i.practice_venue IS NULL;
UPDATE injuries i JOIN players p ON p.id = i.player_id SET i.practice_venue = 'Browns training facility, Berea, OH (joint practice vs Bills)'
 WHERE p.slug = 'alex-wright' AND i.injury_date = '2026-08-20' AND i.stadium_id IS NULL AND i.practice_venue IS NULL;
UPDATE injuries i JOIN players p ON p.id = i.player_id SET i.practice_venue = 'River Ridge Playing Fields, Oxnard, CA (training camp)'
 WHERE p.slug = 'princeton-fant' AND i.injury_date = '2026-08-04' AND i.stadium_id IS NULL AND i.practice_venue IS NULL;
UPDATE injuries i JOIN players p ON p.id = i.player_id SET i.practice_venue = 'Missouri Western State University, St. Joseph, MO (training camp)'
 WHERE p.slug = 'ethan-downs' AND i.injury_date = '2026-07-28' AND i.stadium_id IS NULL AND i.practice_venue IS NULL;
UPDATE injuries i JOIN players p ON p.id = i.player_id SET i.practice_venue = 'Quest Diagnostics Training Center, East Rutherford, NJ (outdoor practice)'
 WHERE p.slug = 'calvin-austin-iii' AND i.injury_date = '2026-08-25' AND i.stadium_id IS NULL AND i.practice_venue IS NULL;
UPDATE injuries i JOIN players p ON p.id = i.player_id SET i.practice_venue = 'Panthers practice fields, Charlotte, NC (training camp)'
 WHERE p.slug = 'nic-scourton' AND i.injury_date = '2026-07-23' AND i.stadium_id IS NULL AND i.practice_venue IS NULL;
