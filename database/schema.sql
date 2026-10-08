-- ============================================
-- Research Opportunity Portal — Database Schema
-- Run this in MySQL / phpMyAdmin to set up the database
-- ============================================

CREATE DATABASE IF NOT EXISTS research_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE research_portal;

CREATE TABLE IF NOT EXISTS opportunities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  area VARCHAR(100) NOT NULL,
  skills VARCHAR(255),
  positions INT DEFAULT 1,
  deadline DATE,
  status ENUM('Open','Closed') DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
