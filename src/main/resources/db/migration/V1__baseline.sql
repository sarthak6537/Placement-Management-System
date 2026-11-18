-- Initial schema for PlacementManagement
-- This migration creates the core tables. Adjust or split into separate migrations as needed.
SET search_path TO public;

-- 1) app_user (users). SINGLE_TABLE for User + Admin
CREATE TABLE IF NOT EXISTS app_user (
  id bigserial PRIMARY KEY,
  user_type varchar(31) NOT NULL,
  username varchar(255) NOT NULL UNIQUE,
  password varchar(255) NOT NULL,
  email varchar(255),
  full_name varchar(255)
);

-- 2) college
CREATE TABLE IF NOT EXISTS college (
  id bigserial PRIMARY KEY,
  name varchar(255),
  address varchar(255)
);

-- 3) placement
CREATE TABLE IF NOT EXISTS placement (
  id bigserial PRIMARY KEY,
  company_name varchar(255),
  date date
);

-- 4) student (references college)
CREATE TABLE IF NOT EXISTS student (
  id bigserial PRIMARY KEY,
  first_name varchar(255),
  last_name varchar(255),
  email varchar(255),
  college_id bigint,
  CONSTRAINT fk_student_college FOREIGN KEY (college_id)
	REFERENCES college(id)
	ON DELETE SET NULL
);

-- 5) certificate (references student)
CREATE TABLE IF NOT EXISTS certificate (
  id bigserial PRIMARY KEY,
  name varchar(255),
  issued_date date,
  student_id bigint,
  CONSTRAINT fk_certificate_student FOREIGN KEY (student_id)
	REFERENCES student(id)
	ON DELETE CASCADE
);

-- 6) join table for Student <-> Placement many-to-many
CREATE TABLE IF NOT EXISTS student_placement (
  student_id bigint NOT NULL,
  placement_id bigint NOT NULL,
  PRIMARY KEY (student_id, placement_id),
  CONSTRAINT fk_sp_student FOREIGN KEY (student_id)
	REFERENCES student(id)
	ON DELETE CASCADE,
  CONSTRAINT fk_sp_placement FOREIGN KEY (placement_id)
	REFERENCES placement(id)
	ON DELETE CASCADE
);

-- Insert default admin (password is plaintext; replace with secure hash in production)
INSERT INTO app_user (user_type, username, password, email, full_name)
VALUES ('ADMIN', 'admin', 'Akasha@123', 'admin@example.com', 'Administrator')
ON CONFLICT (username) DO NOTHING;

-- Notes: user creation / grants are environment-specific and typically done by DB admins;
-- therefore creation of DB users and GRANT statements are omitted from this migration.

