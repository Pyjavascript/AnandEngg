
-- CREATE DATABASE anandengg;
-- USE anandengg;

-- -- CREATE TABLE users (
-- --   id INT AUTO_INCREMENT PRIMARY KEY,
-- --   name VARCHAR(100),
-- --   employee_id VARCHAR(50) UNIQUE NOT NULL,
-- --   role ENUM('machine_operator','quality_inspector','quality_manager'),
-- --   password VARCHAR(255) NOT NULL,
-- --   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- -- );

-- -- SELECT * FROM users;

CREATE DATABASE IF NOT EXISTS AnandDB;
USE AnandDB;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  role ENUM(
    'machine_operator',
    'quality_inspector',
    'quality_manager',
    'admin'
  ) NOT NULL,
  password VARCHAR(255) NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE
);

CREATE INDEX idx_employee_id ON users(employee_id);

CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  part_no VARCHAR(100),
  report_type VARCHAR(100),
  report_data JSON,
  status ENUM('pending', 'inspector_approved', 'approved', 'rejected')
    DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id ON reports(user_id);
CREATE INDEX idx_created_at ON reports(created_at);

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  description TEXT,
  protected BOOLEAN DEFAULT false
);
INSERT INTO roles (name, display_name, protected) VALUES
('admin', 'Admin', true),
('machine_operator', 'Machine Operator', true),
('quality_inspector', 'Quality Inspector', true),
('quality_manager', 'Quality Manager', true);


CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(50) UNIQUE,
  description TEXT
);

CREATE TABLE role_permissions (
  role_id INT,
  permission_id INT,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

INSERT INTO users (
  name,
  employee_id,
  email,
  phone,
  role,
  password,
  status
) VALUES (
  'System Admin',
  'ADMIN001',
  'admin@anandengg.com',
  '111111111',
  'admin',
  '$2a$10$dJ5QvrGBuDABQjMupedXfu1NTVbmZS45VdpOfMI7.mqcSaMjgRc1a',
  'active'
);

CREATE TABLE report_templates (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  version INT NOT NULL DEFAULT 1,
  template_schema JSON NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_submissions (
  id CHAR(36) PRIMARY KEY,
  template_id CHAR(36) NOT NULL,
  template_version INT NOT NULL,
  submitted_by INT NOT NULL,
  data JSON NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (template_id) REFERENCES report_templates(id)
);

CREATE TABLE report_parts (
  id CHAR(36) PRIMARY KEY,
  template_id CHAR(36) NOT NULL,
  part_no VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  doc_no VARCHAR(100),
  rev_no VARCHAR(50),
  diagram_url TEXT,
  dimension_schema JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (template_id) REFERENCES report_templates(id)
);



-- testing

SHOW DATABASES;

USE AnandDB;
SET SQL_SAFE_UPDATES = 0;
SELECT * FROM users;

SELECT id, name, display_name FROM roles;

SELECT COUNT(*) FROM reports;

SELECT * FROM reports;
DELETE FROM reports WHERE id=1;

SELECT * FROM report_templates;
DELETE FROM report_templates;
SELECT * FROM report_submissions;


SELECT id FROM report_templates WHERE code = 'CUT_INS_001';

DESCRIBE report_templates;
DESCRIBE report_submissions;
DESCRIBE report_parts;

SELECT * FROM report_parts;
SELECT * FROM report_templates;
 SELECT id, name, code, template_schema
      FROM report_templates
      WHERE status = 'active';

-- Ensure diagram_url exists on report_templates (safe for incremental migrations)
ALTER TABLE report_templates
ADD COLUMN IF NOT EXISTS diagram_url TEXT;
