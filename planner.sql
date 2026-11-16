
CREATE DATABASE IF NOT EXISTS study_planner
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE study_planner;

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    student_id  VARCHAR(50)         UNIQUE,
    email       VARCHAR(150)        UNIQUE,
    password    VARCHAR(255)        NOT NULL,
    role        ENUM('admin','student') DEFAULT 'student',
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- ── Departments ───────────────────────────────────────────────
CREATE TABLE departments (
    dept_id     INT AUTO_INCREMENT PRIMARY KEY,
    dept_name   VARCHAR(100)        UNIQUE NOT NULL
);

-- ── Faculty ───────────────────────────────────────────────────
CREATE TABLE faculty (
    faculty_id  INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    dept_id     INT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE SET NULL
);

-- ── Trimesters ────────────────────────────────────────────────
CREATE TABLE trimesters (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    start_date  DATE,
    end_date    DATE,
    is_active   BOOLEAN             DEFAULT TRUE
);

-- ── Subjects ──────────────────────────────────────────────────
CREATE TABLE subjects (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT                 NOT NULL,
    faculty_id  INT,
    name        VARCHAR(100)        NOT NULL,
    credit_hours INT                DEFAULT 3,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (faculty_id)  REFERENCES faculty(faculty_id) ON DELETE SET NULL
);

-- ── Events (CT, MID, FINAL, ASSIGNMENT, HOLIDAY) ──────────────
CREATE TABLE events (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(255)       NOT NULL,
    type         ENUM('CT','MID','FINAL','ASSIGNMENT','HOLIDAY') NOT NULL,
    event_date   DATE               NOT NULL,
    subject_id   INT,
    trimester_id INT,
    created_by   INT,
    FOREIGN KEY (subject_id)   REFERENCES subjects(id)   ON DELETE SET NULL,
    FOREIGN KEY (trimester_id) REFERENCES trimesters(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by)   REFERENCES users(id)      ON DELETE CASCADE
);

-- ── Results ───────────────────────────────────────────────────
CREATE TABLE results (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    subject_id  INT                NOT NULL,
    event_id    INT                NOT NULL,
    marks       FLOAT              NOT NULL,
    max_marks   FLOAT              DEFAULT 100,
    created_at  TIMESTAMP          DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id)   REFERENCES events(id)   ON DELETE CASCADE
);

-- ── Study Sessions ────────────────────────────────────────────
CREATE TABLE study_sessions (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT            NOT NULL,
    subject_id       INT            NOT NULL,
    start_time       DATETIME       NOT NULL,
    end_time         DATETIME,
    duration_minutes INT,
    created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- ── Priorities (auto-computed) ────────────────────────────────
CREATE TABLE priorities (
    subject_id      INT PRIMARY KEY,
    priority_score  INT,
    level           ENUM('HIGH','MEDIUM','LOW'),
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- ── Schedules ─────────────────────────────────────────────────
CREATE TABLE schedules (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT           NOT NULL,
    subject_id        INT           NOT NULL,
    study_date        DATE          NOT NULL,
    planned_minutes   INT           NOT NULL,
    completed_minutes INT           DEFAULT 0,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- ── Tasks ─────────────────────────────────────────────────────
CREATE TABLE tasks (
    task_id        INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT           NOT NULL,
    subject_id     INT,
    title          VARCHAR(255)  NOT NULL,
    description    TEXT,
    due_date       DATE,
    priority_level ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
    status         ENUM('PENDING','IN_PROGRESS','COMPLETED') DEFAULT 'PENDING',
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- ── Reminders ─────────────────────────────────────────────────
CREATE TABLE reminders (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT           NOT NULL,
    event_id      INT           NOT NULL,
    reminder_date DATETIME      NOT NULL,
    type          ENUM('ONE_WEEK_BEFORE','TWO_DAYS_BEFORE'),
    is_sent       BOOLEAN       DEFAULT FALSE,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ── Resources ─────────────────────────────────────────────────
CREATE TABLE resources (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    subject_id  INT           NOT NULL,
    title       VARCHAR(255)  NOT NULL,
    link        TEXT,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- ── Notes ─────────────────────────────────────────────────────
CREATE TABLE notes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    subject_id  INT           NOT NULL,
    user_id     INT           NOT NULL,
    content     TEXT,
    is_pinned   BOOLEAN       DEFAULT FALSE,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

-- ── User Settings ─────────────────────────────────────────────
CREATE TABLE user_settings (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT           UNIQUE NOT NULL,
    off_day          VARCHAR(20)   DEFAULT 'Friday',
    daily_study_goal INT           DEFAULT 120,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Study Goals ───────────────────────────────────────────────
CREATE TABLE study_goals (
    goal_id        INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT           NOT NULL,
    subject_id     INT,
    target_minutes INT           NOT NULL,
    start_date     DATE          NOT NULL,
    end_date       DATE          NOT NULL,
    status         ENUM('ACTIVE','COMPLETED','FAILED') DEFAULT 'ACTIVE',
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- ── Daily Streaks ─────────────────────────────────────────────
CREATE TABLE daily_streaks (
    user_id         INT PRIMARY KEY,
    current_streak  INT  DEFAULT 0,
    longest_streak  INT  DEFAULT 0,
    last_study_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Weekly Summary ────────────────────────────────────────────
CREATE TABLE weekly_summary (
    summary_id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id              INT  NOT NULL,
    week_start_date      DATE NOT NULL,
    total_study_minutes  INT  DEFAULT 0,
    total_tasks_completed INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Monthly Reviews ───────────────────────────────────────────
CREATE TABLE monthly_reviews (
    review_id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT   NOT NULL,
    month               INT   NOT NULL,
    year                INT   NOT NULL,
    total_study_minutes INT   DEFAULT 0,
    average_marks       FLOAT DEFAULT 0,
    remarks             TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── User Points (Gamification) ────────────────────────────────
CREATE TABLE user_points (
    user_id      INT PRIMARY KEY,
    total_points INT       DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Study Groups ──────────────────────────────────────────────
CREATE TABLE study_groups (
    group_id   INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    created_by INT,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Group Members ─────────────────────────────────────────────
CREATE TABLE group_members (
    group_id  INT,
    user_id   INT,
    role      ENUM('ADMIN','MEMBER') DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES study_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES users(id)              ON DELETE CASCADE
);

CREATE VIEW leaderboard AS
SELECT
    u.id,
    u.name,
    COALESCE(SUM(ss.duration_minutes), 0) AS total_study_minutes,
    ROUND(COALESCE(SUM(ss.duration_minutes), 0) / 60, 1) AS total_study_hours
FROM users u
LEFT JOIN study_sessions ss ON u.id = ss.user_id
GROUP BY u.id, u.name
ORDER BY total_study_minutes DESC;

CREATE VIEW subject_performance AS
SELECT
    s.id   AS subject_id,
    s.name AS subject_name,
    u.id   AS user_id,
    u.name AS student_name,
    COUNT(r.id)      AS total_results,
    AVG(r.marks)     AS avg_marks,
    MAX(r.marks)     AS highest_marks,
    MIN(r.marks)     AS lowest_marks
FROM subjects s
JOIN users u              ON s.user_id = u.id
LEFT JOIN results r       ON s.id = r.subject_id
GROUP BY s.id, s.name, u.id, u.name;

-- ============================================================
-- TRIGGER: Auto-calculate session duration
-- ============================================================
DELIMITER $$

CREATE TRIGGER calculate_duration
BEFORE INSERT ON study_sessions
FOR EACH ROW
BEGIN
    IF NEW.end_time IS NOT NULL THEN
        SET NEW.duration_minutes = TIMESTAMPDIFF(MINUTE, NEW.start_time, NEW.end_time);
    END IF;
END $$

DELIMITER ;

-- ============================================================
-- STORED PROCEDURE: Update priority scores
-- ============================================================
DELIMITER $$

CREATE PROCEDURE update_priorities()
BEGIN
    INSERT INTO priorities (subject_id, priority_score, level)
    SELECT
        s.id,
        CASE
            WHEN AVG(r.marks) < 50  THEN 3
            WHEN AVG(r.marks) <= 70 THEN 2
            ELSE 1
        END AS priority_score,
        CASE
            WHEN AVG(r.marks) < 50  THEN 'HIGH'
            WHEN AVG(r.marks) <= 70 THEN 'MEDIUM'
            ELSE 'LOW'
        END AS level
    FROM subjects s
    LEFT JOIN results r ON s.id = r.subject_id
    GROUP BY s.id
    ON DUPLICATE KEY UPDATE
        priority_score = VALUES(priority_score),
        level          = VALUES(level);
END $$

DELIMITER ;

-- ============================================================
-- STORED PROCEDURE: Generate daily schedule for a user
-- ============================================================
DELIMITER $$

CREATE PROCEDURE generate_schedule(IN uid INT, IN target_date DATE)
BEGIN
    -- Remove any existing schedule for this user today
    DELETE FROM schedules
    WHERE user_id = uid AND study_date = target_date;

    -- Insert new schedule based on priorities
    INSERT INTO schedules (user_id, subject_id, study_date, planned_minutes)
    SELECT
        uid,
        p.subject_id,
        target_date,
        CASE
            WHEN p.level = 'HIGH'   THEN 120
            WHEN p.level = 'MEDIUM' THEN 90
            ELSE 60
        END AS planned_minutes
    FROM priorities p
    JOIN subjects s ON p.subject_id = s.id
    WHERE s.user_id = uid;
END $$

DELIMITER ;

-- ============================================================
-- SEED DATA (sample)
-- ============================================================

INSERT INTO departments (dept_name) VALUES
  ('Computer Science & Engineering'),
  ('Business Administration'),
  ('Electrical Engineering');

INSERT INTO users (name, student_id, email, password, role) VALUES
  ('Admin User',  'ADMIN001', 'admin@study.app',  '$2b$10$hashed_password_here', 'admin'),
  ('Rahul Ahmed', 'CSE22001', 'rahul@study.app',  '$2b$10$hashed_password_here', 'student'),
  ('Sakib Khan',  'CSE22002', 'sakib@study.app',  '$2b$10$hashed_password_here', 'student'),
  ('Nadia Islam', 'CSE22003', 'nadia@study.app',  '$2b$10$hashed_password_here', 'student');

INSERT INTO trimesters (name, start_date, end_date, is_active) VALUES
  ('Trimester 1 2026', '2026-01-01', '2026-04-30', FALSE),
  ('Trimester 2 2026', '2026-05-01', '2026-08-31', TRUE);

INSERT INTO user_points (user_id, total_points) VALUES (2,1240),(3,1420),(4,1580);
INSERT INTO daily_streaks (user_id, current_streak, longest_streak, last_study_date) VALUES
  (2, 12, 21, CURDATE()),
  (3,  8, 15, CURDATE()),
  (4, 20, 20, CURDATE());