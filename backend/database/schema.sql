-- ==============================
-- DATABASE
-- ==============================

DROP DATABASE IF EXISTS AnandDB;
CREATE DATABASE AnandDB;
USE AnandDB;

-- ==============================
-- USERS
-- ==============================

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
  phone VARCHAR(20) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employee_id ON users(employee_id);

-- Default Admin
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
  '1111111111',
  'admin',
  '$2a$10$dJ5QvrGBuDABQjMupedXfu1NTVbmZS45VdpOfMI7.mqcSaMjgRc1a',
  'active'
);

-- ==============================
-- CATEGORIES
-- ==============================

CREATE TABLE report_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- TEMPLATES (Report Types)
-- ==============================

CREATE TABLE report_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  doc_no VARCHAR(100),
  customer VARCHAR(100),
  part_no VARCHAR(100),
  part_description VARCHAR(200),
  rev_no VARCHAR(20),
  diagram_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id)
    REFERENCES report_categories(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_category_id ON report_templates(category_id);

-- ==============================
-- TEMPLATE FIELDS
-- ==============================

CREATE TABLE template_fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  label VARCHAR(200) NOT NULL,
  specification VARCHAR(100),
  unit VARCHAR(20) DEFAULT 'mm',
  position INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (template_id)
    REFERENCES report_templates(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_template_id ON template_fields(template_id);

-- ==============================
-- SUBMISSIONS
-- ==============================

CREATE TABLE report_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  employee_id INT NOT NULL,
  inspection_date DATE,
  shift VARCHAR(20),

  inspector_id INT,
  inspector_observation TEXT,
  inspector_remarks TEXT,
  inspector_reviewed_at TIMESTAMP,

  manager_id INT,
  manager_remarks TEXT,
  manager_approved_at TIMESTAMP,

  status ENUM(
    'draft',
    'submitted',
    'inspector_reviewed',
    'manager_approved',
    'rejected'
  ) DEFAULT 'draft',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (template_id)
    REFERENCES report_templates(id)
    ON DELETE CASCADE,

  FOREIGN KEY (employee_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_submission_template ON report_submissions(template_id);
CREATE INDEX idx_submission_employee ON report_submissions(employee_id);

-- ==============================
-- SUBMISSION VALUES
-- ==============================

CREATE TABLE submission_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  field_id INT NOT NULL,
  actual_value VARCHAR(100),

  FOREIGN KEY (submission_id)
    REFERENCES report_submissions(id)
    ON DELETE CASCADE,

  FOREIGN KEY (field_id)
    REFERENCES template_fields(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_submission_id ON submission_values(submission_id);
CREATE INDEX idx_field_id ON submission_values(field_id);
