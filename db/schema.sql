-- Mentra Catalog Database Schema
-- Run this on the mentra_catalog database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_evergreen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    course_files JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creators table
CREATE TABLE creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    script_status TEXT DEFAULT 'Not Started',
    video_status TEXT DEFAULT 'Not Started',
    script_content TEXT,
    video_url TEXT,
    quiz_content JSONB DEFAULT '[]',
    lesson_files JSONB DEFAULT '[]',
    review_data JSONB DEFAULT '[]',
    assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_by UUID REFERENCES creators(id) ON DELETE SET NULL,
    date_assigned DATE,
    due_date DATE,
    date_completed DATE,
    has_question BOOLEAN DEFAULT FALSE,
    question_note TEXT,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_departments_company ON departments(company_id);
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_assigned ON lessons(assigned_to);
CREATE INDEX idx_lessons_created_by ON lessons(created_by);
CREATE INDEX idx_notifications_member ON notifications(team_member_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
