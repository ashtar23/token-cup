-- Grant full access to anon and authenticated roles
-- Required for the publishable key to read/write all tables
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON matches TO anon, authenticated;
GRANT ALL ON user_match_stakes TO anon, authenticated;
GRANT ALL ON predictions TO anon, authenticated;
