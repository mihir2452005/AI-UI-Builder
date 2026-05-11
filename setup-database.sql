-- Create database for AI UI Builder
CREATE DATABASE ai_ui_builder;

-- Create a dedicated user (optional but recommended)
CREATE USER aibuilder WITH PASSWORD 'aibuilder_secure_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ai_ui_builder TO aibuilder;

-- Connect to the new database
\c ai_ui_builder

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO aibuilder;
