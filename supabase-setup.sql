-- Supabase Setup für PushUp Panic Highscores
-- Dieses SQL manuell in Supabase SQL Editor ausführen

-- 1. Highscores Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.highscores (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Index für Performance (sortiert nach Score)
CREATE INDEX IF NOT EXISTS idx_highscores_score ON public.highscores(score DESC);

-- 3. Index für Datum (neueste zuerst)
CREATE INDEX IF NOT EXISTS idx_highscores_created ON public.highscores(created_at DESC);

-- 4. Row Level Security (RLS) aktivieren
ALTER TABLE public.highscores ENABLE ROW LEVEL SECURITY;

-- 5. Policy für public read access (jeder kann Highscores lesen)
CREATE POLICY IF NOT EXISTS "Allow public read access" 
ON public.highscores FOR SELECT 
USING (true);

-- 6. Policy für public insert access (jeder kann Scores eintragen)
CREATE POLICY IF NOT EXISTS "Allow public insert access" 
ON public.highscores FOR INSERT 
WITH CHECK (true);

-- 7. Teste die Tabelle mit einem Dummy-Eintrag
INSERT INTO public.highscores (player_name, score, level) 
VALUES ('TestPlayer', 1000, 5);

-- 8. Teste das Auslesen
SELECT * FROM public.highscores ORDER BY score DESC LIMIT 5;

-- 9. Lösche den Test-Eintrag
DELETE FROM public.highscores WHERE player_name = 'TestPlayer';

-- Setup komplett! Die Tabelle ist jetzt bereit für das Game.