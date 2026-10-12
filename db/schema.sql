SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS teams (
  id            SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  abbreviation  CHAR(3) NOT NULL UNIQUE,
  name          VARCHAR(64) NOT NULL,
  slug          VARCHAR(80) NOT NULL UNIQUE,
  conference    ENUM('AFC','NFC') NOT NULL,
  division      ENUM('East','North','South','West') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stadiums (
  id             SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(128) NOT NULL,
  slug           VARCHAR(150) NOT NULL UNIQUE,
  city           VARCHAR(64) NOT NULL,
  state          CHAR(2) NULL,
  surface_type   ENUM('natural','hybrid','artificial') NOT NULL,
  surface_brand  VARCHAR(64) NULL,
  notes          TEXT NULL,
  UNIQUE KEY uq_stadium_name_city (name, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS players (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(64) NOT NULL,
  last_name   VARCHAR(64) NOT NULL,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  position    VARCHAR(4) NOT NULL,
  team_id     SMALLINT UNSIGNED NULL,
  dob         DATE NULL,
  height_in   SMALLINT UNSIGNED NULL,
  weight_lb   SMALLINT UNSIGNED NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  INDEX idx_players_name (last_name, first_name),
  INDEX idx_players_team (team_id)
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
  phase           ENUM('preseason','regular','playoffs') NULL,
  severity_notes  TEXT NULL,
  source          VARCHAR(500) NULL,
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