-- Create prizes table for syncing prize configurations across all clients
CREATE TABLE IF NOT EXISTS prizes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  item_name TEXT DEFAULT '',
  total_count INTEGER NOT NULL DEFAULT 0,
  sponsor TEXT DEFAULT '',
  sponsor_title TEXT DEFAULT '',
  layer TEXT NOT NULL CHECK (layer IN ('A', 'B', 'C')),
  zone TEXT,
  club TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON prizes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON prizes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete" ON prizes FOR DELETE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE prizes;

-- ---

-- Create participants table for syncing participant list across all clients
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  club TEXT NOT NULL,
  zone TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON participants FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete" ON participants FOR DELETE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
