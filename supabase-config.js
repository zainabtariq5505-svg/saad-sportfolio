// ============================================
// SUPABASE CONFIGURATION
// ============================================

// IMPORTANT: Replace these with your actual Supabase credentials
// Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

var SUPABASE_URL = 'https://kozfasbfbpnxedvymabm.supabase.co'; // Your Supabase URL
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvemZhc2JmYnBueGVkdnltYWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MDg1MjMsImV4cCI6MjEwNzI4NDUyM30.cCMm838JEMk9IcOfzQLLv59bOgD8hOC13LJb7FnN_10'; // Your anon/public key

// Initialize Supabase client (only once)
var supabase;
if (typeof window.supabaseClient === 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabase;
    console.log('✅ Supabase client initialized');
} else {
    supabase = window.supabaseClient;
    console.log('✅ Supabase client reused');
}

// ============================================
// ADMIN CREDENTIALS (Hardcoded)
// ============================================
// Admin credentials are managed by Supabase Auth, never shipped in source.

// ============================================
// VISITOR TRACKING
// ============================================

async function trackVisitor() {
    // Public visitor collection is disabled for this deployment.
}

// ============================================
// GET ANALYTICS DATA
// ============================================

async function getAnalytics() {
    try {
        const { data: visitors, error: visitorsError } = await supabase
            .from('visitors')
            .select('*')
            .order('timestamp', { ascending: false });

        if (visitorsError) {
            console.warn('Visitors table error (run SQL setup first):', visitorsError.message);
            return { visitors: [], totalVisitors: 0, backgroundVideo: null };
        }

        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('*')
            .eq('key', 'background_video')
            .maybeSingle();

        return {
            visitors: visitors || [],
            totalVisitors: visitors?.length || 0,
            backgroundVideo: settings?.value || null
        };
    } catch (error) {
        console.warn('Analytics error:', error.message);
        return { visitors: [], totalVisitors: 0, backgroundVideo: null };
    }
}

// ============================================
// UPDATE BACKGROUND VIDEO
// ============================================

async function updateBackgroundVideo(youtubeUrl) {
    try {
        if (!await isAdminLoggedIn()) throw new Error('Please sign in with an authorized admin account.');
        console.log('🎬 Updating video with URL:', youtubeUrl);

        // Extract YouTube video ID from URL
        const videoId = extractYouTubeID(youtubeUrl);

        console.log('📹 Extracted video ID:', videoId);

        if (!videoId && youtubeUrl.trim() !== '') {
            throw new Error('Invalid YouTube URL. Please use a valid YouTube link.');
        }

        // Use upsert to insert or update
        if (videoId) {
            const { data, error } = await supabase
                .from('settings')
                .upsert({
                    key: 'background_video',
                    value: videoId,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'key'
                });

            if (error) {
                console.error('❌ Upsert error:', error);
                throw error;
            }

            console.log('✅ Video saved successfully:', videoId);
        } else {
            // Delete if empty URL
            const { error } = await supabase
                .from('settings')
                .delete()
                .eq('key', 'background_video');
            if (error) throw error;

            console.log('✅ Video removed successfully');
        }

        return { success: true, videoId };
    } catch (error) {
        console.error('❌ Error updating background video:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// GET BACKGROUND VIDEO
// ============================================

async function getBackgroundVideo() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'background_video')
            .maybeSingle();

        if (error) {
            console.warn('getBackgroundVideo error:', error.message);
            return null;
        }

        return data?.value || null;
    } catch (error) {
        console.warn('getBackgroundVideo failed:', error.message);
        return null;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function extractYouTubeID(url) {
    if (!url) return null;

    // Handle various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// ADMIN AUTHENTICATION
// ============================================

async function authenticateAdmin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Unable to sign in. Check your email and password.');
    if (data.user?.app_metadata?.portfolio_admin !== true) {
        await supabase.auth.signOut();
        throw new Error('This account does not have portfolio admin access.');
    }
    return true;
}

async function isAdminLoggedIn() {
    try {
        const { data, error } = await supabase.auth.getUser();
        return !error && data.user?.app_metadata?.portfolio_admin === true;
    } catch {
        return false;
    }
}

async function logoutAdmin() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin.html';
}

// ============================================
// REAL-TIME VISITOR COUNT
// ============================================

async function getRealTimeVisitorCount() {
    try {
        // Get visitors from last 5 minutes (considered "active")
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('visitors')
            .select('id')
            .gte('timestamp', fiveMinutesAgo);

        if (error) throw error;

        return data?.length || 0;
    } catch (error) {
        console.error('Error fetching real-time visitors:', error);
        return 0;
    }
}

// ============================================
// GET VISITORS BY COUNTRY
// ============================================

async function getVisitorsByCountry() {
    try {
        const { data, error } = await supabase
            .from('visitors')
            .select('country');

        if (error) {
            console.warn('getVisitorsByCountry error:', error.message);
            return [];
        }

        const countryCount = {};
        data.forEach(visitor => {
            const country = visitor.country || 'Unknown';
            countryCount[country] = (countryCount[country] || 0) + 1;
        });

        return Object.entries(countryCount)
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count);
    } catch (error) {
        console.warn('getVisitorsByCountry failed:', error.message);
        return [];
    }
}

// ============================================
// GET VISITORS TODAY
// ============================================

async function getVisitorsToday() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('visitors')
            .select('id')
            .gte('timestamp', today.toISOString());

        if (error) {
            console.warn('getVisitorsToday error:', error.message);
            return 0;
        }

        return data?.length || 0;
    } catch (error) {
        console.warn('getVisitorsToday failed:', error.message);
        return 0;
    }
}

console.log('Supabase config loaded');
