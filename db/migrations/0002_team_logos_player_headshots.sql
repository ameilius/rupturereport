-- 0002: image paths. Official team logos (public/teams/{team-slug}.png) and player headshots
-- (public/players/{player-slug}.png), stored locally (sourced from ESPN CDN, 2026-10-12; images © their owners).
-- Idempotent: columns added only if missing; paths only set where currently NULL.
-- Display is gated by NEXT_PUBLIC_USE_OFFICIAL_IMAGES ("false" = fall back to original badges/initials).
SET NAMES utf8mb4;

ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_path VARCHAR(255) NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS headshot_path VARCHAR(255) NULL;

UPDATE teams SET logo_path = CONCAT('/teams/', slug, '.png') WHERE logo_path IS NULL;

UPDATE players SET headshot_path = '/players/alex-wright.png' WHERE slug = 'alex-wright' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/arian-smith.png' WHERE slug = 'arian-smith' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/brian-burns.png' WHERE slug = 'brian-burns' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/bryan-bresee.png' WHERE slug = 'bryan-bresee' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/calvin-austin-iii.png' WHERE slug = 'calvin-austin-iii' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/devon-achane.png' WHERE slug = 'devon-achane' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/dillon-radunz.png' WHERE slug = 'dillon-radunz' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/durham-smythe.png' WHERE slug = 'durham-smythe' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/dylan-horton.png' WHERE slug = 'dylan-horton' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/edgerrin-cooper.png' WHERE slug = 'edgerrin-cooper' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/ethan-downs.png' WHERE slug = 'ethan-downs' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/graham-mertz.png' WHERE slug = 'graham-mertz' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/gunner-olszewski.png' WHERE slug = 'gunner-olszewski' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/jalon-walker.png' WHERE slug = 'jalon-walker' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/javon-hargrave.png' WHERE slug = 'javon-hargrave' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/jayden-higgins.png' WHERE slug = 'jayden-higgins' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/jaylen-harrell.png' WHERE slug = 'jaylen-harrell' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/kendrick-law.png' WHERE slug = 'kendrick-law' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/matt-henningsen.png' WHERE slug = 'matt-henningsen' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/nic-scourton.png' WHERE slug = 'nic-scourton' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/princeton-fant.png' WHERE slug = 'princeton-fant' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/roy-robertson-harris.png' WHERE slug = 'roy-robertson-harris' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/thaddeus-dixon.png' WHERE slug = 'thaddeus-dixon' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/tyler-batty.png' WHERE slug = 'tyler-batty' AND headshot_path IS NULL;
UPDATE players SET headshot_path = '/players/tyler-biadasz.png' WHERE slug = 'tyler-biadasz' AND headshot_path IS NULL;
