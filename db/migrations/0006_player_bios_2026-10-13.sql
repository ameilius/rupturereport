-- 0006: player bios (dob, height_in, weight_lb) from ESPN athlete listings (sports.core.api.espn.com/v2/.../nfl/athletes/{id}), fetched 2026-10-13.
-- Idempotent and non-destructive: each column is only filled where it is still NULL, so admin edits are preserved.
SET NAMES utf8mb4;
UPDATE players SET dob = COALESCE(dob, '2000-09-05'), height_in = COALESCE(height_in, 77), weight_lb = COALESCE(weight_lb, 267) WHERE slug = 'alex-wright'; -- ESPN 4570119
UPDATE players SET dob = COALESCE(dob, '2001-10-11'), height_in = COALESCE(height_in, 72), weight_lb = COALESCE(weight_lb, 179) WHERE slug = 'arian-smith'; -- ESPN 4429105
UPDATE players SET dob = COALESCE(dob, '1998-04-23'), height_in = COALESCE(height_in, 77), weight_lb = COALESCE(weight_lb, 250) WHERE slug = 'brian-burns'; -- ESPN 4035631
UPDATE players SET dob = COALESCE(dob, '2001-10-06'), height_in = COALESCE(height_in, 77), weight_lb = COALESCE(weight_lb, 305) WHERE slug = 'bryan-bresee'; -- ESPN 4428988
UPDATE players SET dob = COALESCE(dob, '1999-03-24'), height_in = COALESCE(height_in, 69), weight_lb = COALESCE(weight_lb, 162) WHERE slug = 'calvin-austin-iii'; -- ESPN 4243389
UPDATE players SET dob = COALESCE(dob, '2001-10-13'), height_in = COALESCE(height_in, 69), weight_lb = COALESCE(weight_lb, 191) WHERE slug = 'devon-achane'; -- ESPN 4429160
UPDATE players SET dob = COALESCE(dob, '1998-03-28'), height_in = COALESCE(height_in, 78), weight_lb = COALESCE(weight_lb, 301) WHERE slug = 'dillon-radunz'; -- ESPN 4040945
UPDATE players SET dob = COALESCE(dob, '1995-08-09'), height_in = COALESCE(height_in, 76), weight_lb = COALESCE(weight_lb, 248) WHERE slug = 'durham-smythe'; -- ESPN 3052897
UPDATE players SET dob = COALESCE(dob, '2000-08-21'), height_in = COALESCE(height_in, 76), weight_lb = COALESCE(weight_lb, 275) WHERE slug = 'dylan-horton'; -- ESPN 4374066
UPDATE players SET dob = COALESCE(dob, '2001-11-17'), height_in = COALESCE(height_in, 74), weight_lb = COALESCE(weight_lb, 229) WHERE slug = 'edgerrin-cooper'; -- ESPN 4430438
UPDATE players SET dob = COALESCE(dob, '2002-10-13'), height_in = COALESCE(height_in, 76), weight_lb = COALESCE(weight_lb, 263) WHERE slug = 'ethan-downs'; -- ESPN 4431534
UPDATE players SET dob = COALESCE(dob, '2000-12-06'), height_in = COALESCE(height_in, 74), weight_lb = COALESCE(weight_lb, 216) WHERE slug = 'graham-mertz'; -- ESPN 4426335
UPDATE players SET dob = COALESCE(dob, '1996-11-26'), height_in = COALESCE(height_in, 72), weight_lb = COALESCE(weight_lb, 190) WHERE slug = 'gunner-olszewski'; -- ESPN 4424106
UPDATE players SET dob = COALESCE(dob, '2004-02-24'), height_in = COALESCE(height_in, 74), weight_lb = COALESCE(weight_lb, 245) WHERE slug = 'jalon-walker'; -- ESPN 4685597
UPDATE players SET dob = COALESCE(dob, '1993-02-07'), height_in = COALESCE(height_in, 74), weight_lb = COALESCE(weight_lb, 307) WHERE slug = 'javon-hargrave'; -- ESPN 2983055
UPDATE players SET dob = COALESCE(dob, '2002-12-15'), height_in = COALESCE(height_in, 76), weight_lb = COALESCE(weight_lb, 215) WHERE slug = 'jayden-higgins'; -- ESPN 4877706
UPDATE players SET dob = COALESCE(dob, '2002-05-01'), height_in = COALESCE(height_in, 76), weight_lb = COALESCE(weight_lb, 247) WHERE slug = 'jaylen-harrell'; -- ESPN 4429058
UPDATE players SET dob = COALESCE(dob, '2004-06-13'), height_in = COALESCE(height_in, 71), weight_lb = COALESCE(weight_lb, 203) WHERE slug = 'kendrick-law'; -- ESPN 4685441
UPDATE players SET dob = COALESCE(dob, '1994-01-25'), height_in = COALESCE(height_in, 75), weight_lb = COALESCE(weight_lb, 280) WHERE slug = 'mario-edwards-jr'; -- ESPN 2969921
UPDATE players SET dob = COALESCE(dob, '1999-07-09'), height_in = COALESCE(height_in, 75), weight_lb = COALESCE(weight_lb, 291) WHERE slug = 'matt-henningsen'; -- ESPN 4242358
UPDATE players SET dob = COALESCE(dob, '2004-08-25'), height_in = COALESCE(height_in, 74), weight_lb = COALESCE(weight_lb, 257) WHERE slug = 'nic-scourton'; -- ESPN 4833355
UPDATE players SET dob = COALESCE(dob, '1999-03-11'), height_in = COALESCE(height_in, 74), weight_lb = COALESCE(weight_lb, 245) WHERE slug = 'princeton-fant'; -- ESPN 4242442
UPDATE players SET dob = COALESCE(dob, '1993-07-23'), height_in = COALESCE(height_in, 79), weight_lb = COALESCE(weight_lb, 300) WHERE slug = 'roy-robertson-harris'; -- ESPN 2574891
UPDATE players SET dob = COALESCE(dob, '2002-02-20'), height_in = COALESCE(height_in, 73), weight_lb = COALESCE(weight_lb, 195) WHERE slug = 'thaddeus-dixon'; -- ESPN 5151880
UPDATE players SET dob = COALESCE(dob, '1999-05-02'), height_in = COALESCE(height_in, 78), weight_lb = COALESCE(weight_lb, 271) WHERE slug = 'tyler-batty'; -- ESPN 4608794
UPDATE players SET dob = COALESCE(dob, '1997-11-20'), height_in = COALESCE(height_in, 76), weight_lb = COALESCE(weight_lb, 318) WHERE slug = 'tyler-biadasz'; -- ESPN 4035788
