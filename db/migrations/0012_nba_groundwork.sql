-- 0012: NBA groundwork. Adds a `league` column (NFL | NBA) to teams, stadiums (arenas) and players,
-- makes team abbreviations unique per league (ATL, CHI, DAL, DEN, DET, HOU, IND, LAC, MIA, MIN, PHI, WAS
-- exist in both leagues), extends enums, seeds the 30 NBA teams + home arenas and the per-league season setting.
-- Existing rows default to 'NFL', so every current NFL record is untouched.
-- Idempotent: ADD COLUMN/INDEX IF NOT EXISTS, MODIFY with the full enum, upserts keyed on slug.
-- NOTE for future migrations: look teams up as `WHERE league = 'NFL' AND abbreviation = 'XXX'`.
SET NAMES utf8mb4;

ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS league ENUM('NFL','NBA') NOT NULL DEFAULT 'NFL' AFTER id,
  MODIFY COLUMN conference ENUM('AFC','NFC','East','West') NOT NULL,
  MODIFY COLUMN division ENUM('East','North','South','West','Atlantic','Central','Southeast','Northwest','Pacific','Southwest') NOT NULL;
ALTER TABLE teams DROP INDEX IF EXISTS abbreviation;
ALTER TABLE teams ADD UNIQUE INDEX IF NOT EXISTS uq_teams_league_abbr (league, abbreviation);

ALTER TABLE stadiums
  ADD COLUMN IF NOT EXISTS league ENUM('NFL','NBA') NOT NULL DEFAULT 'NFL' AFTER id,
  MODIFY COLUMN surface_type ENUM('natural','hybrid','artificial','hardwood') NOT NULL;

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS league ENUM('NFL','NBA') NOT NULL DEFAULT 'NFL' AFTER id,
  ADD COLUMN IF NOT EXISTS status_note VARCHAR(160) NULL,
  ADD INDEX IF NOT EXISTS idx_players_league (league);

ALTER TABLE injuries
  MODIFY COLUMN phase ENUM('preseason','regular','playoffs','summer_league') NULL;

-- 30 NBA teams (logos: public/teams/nba/{ABBR}.png, ESPN)
INSERT INTO teams (league, abbreviation, name, slug, conference, division, logo_path) VALUES
('NBA','ATL','Atlanta Hawks','atlanta-hawks','East','Southeast','/teams/nba/ATL.png'),
('NBA','BOS','Boston Celtics','boston-celtics','East','Atlantic','/teams/nba/BOS.png'),
('NBA','BKN','Brooklyn Nets','brooklyn-nets','East','Atlantic','/teams/nba/BKN.png'),
('NBA','CHA','Charlotte Hornets','charlotte-hornets','East','Southeast','/teams/nba/CHA.png'),
('NBA','CHI','Chicago Bulls','chicago-bulls','East','Central','/teams/nba/CHI.png'),
('NBA','CLE','Cleveland Cavaliers','cleveland-cavaliers','East','Central','/teams/nba/CLE.png'),
('NBA','DAL','Dallas Mavericks','dallas-mavericks','West','Southwest','/teams/nba/DAL.png'),
('NBA','DEN','Denver Nuggets','denver-nuggets','West','Northwest','/teams/nba/DEN.png'),
('NBA','DET','Detroit Pistons','detroit-pistons','East','Central','/teams/nba/DET.png'),
('NBA','GSW','Golden State Warriors','golden-state-warriors','West','Pacific','/teams/nba/GSW.png'),
('NBA','HOU','Houston Rockets','houston-rockets','West','Southwest','/teams/nba/HOU.png'),
('NBA','IND','Indiana Pacers','indiana-pacers','East','Central','/teams/nba/IND.png'),
('NBA','LAC','Los Angeles Clippers','los-angeles-clippers','West','Pacific','/teams/nba/LAC.png'),
('NBA','LAL','Los Angeles Lakers','los-angeles-lakers','West','Pacific','/teams/nba/LAL.png'),
('NBA','MEM','Memphis Grizzlies','memphis-grizzlies','West','Southwest','/teams/nba/MEM.png'),
('NBA','MIA','Miami Heat','miami-heat','East','Southeast','/teams/nba/MIA.png'),
('NBA','MIL','Milwaukee Bucks','milwaukee-bucks','East','Central','/teams/nba/MIL.png'),
('NBA','MIN','Minnesota Timberwolves','minnesota-timberwolves','West','Northwest','/teams/nba/MIN.png'),
('NBA','NOP','New Orleans Pelicans','new-orleans-pelicans','West','Southwest','/teams/nba/NOP.png'),
('NBA','NYK','New York Knicks','new-york-knicks','East','Atlantic','/teams/nba/NYK.png'),
('NBA','OKC','Oklahoma City Thunder','oklahoma-city-thunder','West','Northwest','/teams/nba/OKC.png'),
('NBA','ORL','Orlando Magic','orlando-magic','East','Southeast','/teams/nba/ORL.png'),
('NBA','PHI','Philadelphia 76ers','philadelphia-76ers','East','Atlantic','/teams/nba/PHI.png'),
('NBA','PHX','Phoenix Suns','phoenix-suns','West','Pacific','/teams/nba/PHX.png'),
('NBA','POR','Portland Trail Blazers','portland-trail-blazers','West','Northwest','/teams/nba/POR.png'),
('NBA','SAC','Sacramento Kings','sacramento-kings','West','Pacific','/teams/nba/SAC.png'),
('NBA','SAS','San Antonio Spurs','san-antonio-spurs','West','Southwest','/teams/nba/SAS.png'),
('NBA','TOR','Toronto Raptors','toronto-raptors','East','Atlantic','/teams/nba/TOR.png'),
('NBA','UTA','Utah Jazz','utah-jazz','West','Northwest','/teams/nba/UTA.png'),
('NBA','WAS','Washington Wizards','washington-wizards','East','Southeast','/teams/nba/WAS.png')
ON DUPLICATE KEY UPDATE league = VALUES(league), abbreviation = VALUES(abbreviation), name = VALUES(name),
  conference = VALUES(conference), division = VALUES(division), logo_path = COALESCE(logo_path, VALUES(logo_path));

-- 30 NBA home arenas (2026-27 names per NBA.com / Wikipedia list of NBA arenas). Hardwood everywhere.
INSERT INTO stadiums (league, name, slug, city, state, surface_type, surface_brand, notes) VALUES
('NBA','State Farm Arena','state-farm-arena','Atlanta','GA','hardwood',NULL,'Home of the Atlanta Hawks.'),
('NBA','TD Garden','td-garden','Boston','MA','hardwood',NULL,'Home of the Boston Celtics.'),
('NBA','Barclays Center','barclays-center','Brooklyn','NY','hardwood',NULL,'Home of the Brooklyn Nets.'),
('NBA','Spectrum Center','spectrum-center','Charlotte','NC','hardwood',NULL,'Home of the Charlotte Hornets.'),
('NBA','United Center','united-center','Chicago','IL','hardwood',NULL,'Home of the Chicago Bulls.'),
('NBA','Rocket Arena','rocket-arena','Cleveland','OH','hardwood',NULL,'Home of the Cleveland Cavaliers.'),
('NBA','American Airlines Center','american-airlines-center','Dallas','TX','hardwood',NULL,'Home of the Dallas Mavericks.'),
('NBA','Ball Arena','ball-arena','Denver','CO','hardwood',NULL,'Home of the Denver Nuggets.'),
('NBA','Little Caesars Arena','little-caesars-arena','Detroit','MI','hardwood',NULL,'Home of the Detroit Pistons.'),
('NBA','Chase Center','chase-center','San Francisco','CA','hardwood',NULL,'Home of the Golden State Warriors.'),
('NBA','Toyota Center','toyota-center','Houston','TX','hardwood',NULL,'Home of the Houston Rockets.'),
('NBA','Gainbridge Fieldhouse','gainbridge-fieldhouse','Indianapolis','IN','hardwood',NULL,'Home of the Indiana Pacers.'),
('NBA','Intuit Dome','intuit-dome','Inglewood','CA','hardwood',NULL,'Home of the Los Angeles Clippers.'),
('NBA','Crypto.com Arena','cryptocom-arena','Los Angeles','CA','hardwood',NULL,'Home of the Los Angeles Lakers.'),
('NBA','FedExForum','fedexforum','Memphis','TN','hardwood',NULL,'Home of the Memphis Grizzlies.'),
('NBA','Kaseya Center','kaseya-center','Miami','FL','hardwood',NULL,'Home of the Miami Heat.'),
('NBA','Fiserv Forum','fiserv-forum','Milwaukee','WI','hardwood',NULL,'Home of the Milwaukee Bucks.'),
('NBA','Target Center','target-center','Minneapolis','MN','hardwood',NULL,'Home of the Minnesota Timberwolves.'),
('NBA','Smoothie King Center','smoothie-king-center','New Orleans','LA','hardwood',NULL,'Home of the New Orleans Pelicans.'),
('NBA','Madison Square Garden','madison-square-garden','New York','NY','hardwood',NULL,'Home of the New York Knicks.'),
('NBA','Paycom Center','paycom-center','Oklahoma City','OK','hardwood',NULL,'Home of the Oklahoma City Thunder.'),
('NBA','Kia Center','kia-center','Orlando','FL','hardwood',NULL,'Home of the Orlando Magic.'),
('NBA','Xfinity Mobile Arena','xfinity-mobile-arena','Philadelphia','PA','hardwood',NULL,'Home of the Philadelphia 76ers.'),
('NBA','Mortgage Matchup Center','mortgage-matchup-center','Phoenix','AZ','hardwood',NULL,'Home of the Phoenix Suns.'),
('NBA','Moda Center','moda-center','Portland','OR','hardwood',NULL,'Home of the Portland Trail Blazers.'),
('NBA','Golden 1 Center','golden-1-center','Sacramento','CA','hardwood',NULL,'Home of the Sacramento Kings.'),
('NBA','Frost Bank Center','frost-bank-center','San Antonio','TX','hardwood',NULL,'Home of the San Antonio Spurs.'),
('NBA','Scotiabank Arena','scotiabank-arena','Toronto',NULL,'hardwood',NULL,'Home of the Toronto Raptors.'),
('NBA','Delta Center','delta-center','Salt Lake City','UT','hardwood',NULL,'Home of the Utah Jazz.'),
('NBA','Capital One Arena','capital-one-arena','Washington','DC','hardwood',NULL,'Home of the Washington Wizards.')
ON DUPLICATE KEY UPDATE league = VALUES(league), name = VALUES(name), city = VALUES(city), state = VALUES(state), surface_type = VALUES(surface_type);

-- Per-league current season (NBA season 2026 = 2026-27). NFL keeps `current_season`.
INSERT IGNORE INTO settings (k, v) VALUES ('current_season_nba', '2026');
