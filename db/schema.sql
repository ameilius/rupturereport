SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS teams (
  id            SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  league        ENUM('NFL','NBA') NOT NULL DEFAULT 'NFL',
  abbreviation  CHAR(3) NOT NULL,
  name          VARCHAR(64) NOT NULL,
  slug          VARCHAR(80) NOT NULL UNIQUE,
  conference    ENUM('AFC','NFC','East','West') NOT NULL,
  division      ENUM('East','North','South','West','Atlantic','Central','Southeast','Northwest','Pacific','Southwest') NOT NULL,
  logo_path     VARCHAR(255) NULL,
  UNIQUE KEY uq_teams_league_abbr (league, abbreviation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stadiums (
  id             SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  league         ENUM('NFL','NBA') NOT NULL DEFAULT 'NFL',
  name           VARCHAR(128) NOT NULL,
  slug           VARCHAR(150) NOT NULL UNIQUE,
  city           VARCHAR(64) NOT NULL,
  state          CHAR(2) NULL,
  surface_type   ENUM('natural','hybrid','artificial','hardwood') NOT NULL,
  surface_brand  VARCHAR(64) NULL,
  notes          TEXT NULL,
  UNIQUE KEY uq_stadium_name_city (name, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS players (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  league      ENUM('NFL','NBA') NOT NULL DEFAULT 'NFL',
  first_name  VARCHAR(64) NOT NULL,
  last_name   VARCHAR(64) NOT NULL,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  position    VARCHAR(4) NOT NULL,
  team_id     SMALLINT UNSIGNED NULL,
  dob         DATE NULL,
  height_in   SMALLINT UNSIGNED NULL,
  weight_lb   SMALLINT UNSIGNED NULL,
  headshot_path VARCHAR(255) NULL,
  status_note VARCHAR(160) NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  INDEX idx_players_name (last_name, first_name),
  INDEX idx_players_team (team_id),
  INDEX idx_players_league (league)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS injuries (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  player_id       INT UNSIGNED NOT NULL,
  injury_type     ENUM('ACL','Achilles','MCL','other') NOT NULL,
  injury_date     DATE NOT NULL,
  season          SMALLINT UNSIGNED NOT NULL,
  week            TINYINT UNSIGNED NULL,
  stadium_id      SMALLINT UNSIGNED NULL,
  home_away       ENUM('home','away','neutral') NULL,
  opponent_id     SMALLINT UNSIGNED NULL,
  mechanism       ENUM('non_contact','contact','other') NULL,
  body_side       ENUM('left','right','bilateral','unknown') NULL,
  phase           ENUM('preseason','regular','playoffs','summer_league') NULL,
  severity_notes  TEXT NULL,
  source          VARCHAR(500) NULL,
  practice_venue  VARCHAR(160) NULL,
  practice_surface ENUM('natural','hybrid','artificial') NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (stadium_id) REFERENCES stadiums(id),
  FOREIGN KEY (opponent_id) REFERENCES teams(id),
  INDEX idx_injuries_player (player_id),
  INDEX idx_injuries_type_season (injury_type, season),
  INDEX idx_injuries_date (injury_date),
  INDEX idx_injuries_stadium (stadium_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS progress_updates (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  injury_id     BIGINT UNSIGNED NOT NULL,
  update_date   DATE NOT NULL,
  stage         ENUM(
                  'diagnosis','surgery','immobilization','non_weight_bearing',
                  'weight_bearing','jogging','cutting','practice_limited',
                  'practice_full','game_ready','returned','reinjured'
                ) NOT NULL,
  status_label  VARCHAR(64) NULL,
  notes         TEXT NULL,
  source        VARCHAR(500) NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (injury_id) REFERENCES injuries(id) ON DELETE CASCADE,
  INDEX idx_progress_injury_date (injury_id, update_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS injury_weather (
  injury_id   BIGINT UNSIGNED PRIMARY KEY,
  temp_f      SMALLINT NULL,
  precip_in   DECIMAL(4,2) NULL,
  conditions  VARCHAR(64) NULL,
  FOREIGN KEY (injury_id) REFERENCES injuries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Site settings (key/value). Seeded by migration 0005 (current_season).
CREATE TABLE IF NOT EXISTS settings (
  k           VARCHAR(64) NOT NULL PRIMARY KEY,
  v           VARCHAR(255) NULL,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
