class SupabaseManager {
    constructor() {
        this.supabaseUrl = 'https://umvrurelsxpxmyzcvrcd.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdnJ1cmVsc3hweG15emN2cmNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4NTg4MCwiZXhwIjoyMDY2MjYxODgwfQ.3c4WM9kbSgEia6m9jgOlRtlPCQk1NdKWhucNov0rQSo';
        
        this.isConnected = false;
        this.client = null;
        
        console.log('🗄️ SupabaseManager initialized');
    }

    async initialize() {
        try {
            // Create Supabase client
            this.client = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            
            // Test connection
            const { data, error } = await this.client
                .from('highscores')
                .select('count')
                .limit(1);
                
            if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
                throw error;
            }
            
            this.isConnected = true;
            console.log('✅ Supabase connected successfully');
            
            // Create table if it doesn't exist
            await this.createHighscoreTable();
            
            return true;
        } catch (error) {
            console.error('❌ Supabase connection failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    async createHighscoreTable() {
        try {
            // Check if table exists first
            const { data, error } = await this.client
                .from('highscores')
                .select('id')
                .limit(1);
                
            if (!error) {
                console.log('📊 Highscores table already exists');
                return;
            }
            
            // Table doesn't exist, we need to create it via SQL
            const { error: createError } = await this.client.rpc('create_highscores_table');
            
            if (createError) {
                console.warn('⚠️ Could not create table via RPC, table might need to be created manually');
                console.log('📝 Please create the highscores table manually with this SQL:');
                console.log(`
CREATE TABLE IF NOT EXISTS highscores (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_highscores_score ON highscores(score DESC);
                `);
            } else {
                console.log('✅ Highscores table created successfully');
            }
        } catch (error) {
            console.error('❌ Error creating highscores table:', error);
        }
    }

    async submitHighscore(playerName, score, level) {
        if (!this.isConnected) {
            console.warn('⚠️ Supabase not connected, cannot submit highscore');
            return false;
        }

        try {
            const { data, error } = await this.client
                .from('highscores')
                .insert([
                    {
                        player_name: playerName || 'Anonymous',
                        score: score,
                        level: level,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) {
                throw error;
            }

            console.log('🏆 Highscore submitted successfully:', data);
            return true;
        } catch (error) {
            console.error('❌ Failed to submit highscore:', error);
            return false;
        }
    }

    async getHighscores(limit = 10) {
        if (!this.isConnected) {
            console.warn('⚠️ Supabase not connected, returning empty highscores');
            return [];
        }

        try {
            const { data, error } = await this.client
                .from('highscores')
                .select('*')
                .order('score', { ascending: false })
                .limit(limit);

            if (error) {
                throw error;
            }

            console.log('📊 Retrieved highscores:', data.length);
            return data || [];
        } catch (error) {
            console.error('❌ Failed to get highscores:', error);
            return [];
        }
    }

    async getPlayerRank(score) {
        if (!this.isConnected) {
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('highscores')
                .select('score')
                .gt('score', score);

            if (error) {
                throw error;
            }

            return (data?.length || 0) + 1;
        } catch (error) {
            console.error('❌ Failed to get player rank:', error);
            return null;
        }
    }

    isReady() {
        return this.isConnected;
    }
}