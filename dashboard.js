/* ============================================
   PREMIUM DASHBOARD - REAL-TIME SUPABASE DATA
   ============================================ */

let analyticsData = null;
let autoRefreshInterval = null;

// ============================================
// NAVIGATION
// ============================================

const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.dashboard-section');
const sectionTitle = document.getElementById('section-title');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();

        const section = item.dataset.section;
        if (section === 'messages') loadContactInbox();

        // Update active nav
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Show section
        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');

        // Update title
        const titles = {
            overview: 'Overview',
            visitors: 'All Visitors',
            analytics: 'Analytics',
            settings: 'Settings',
            messages: 'Contact inbox'
        };
        sectionTitle.textContent = titles[section] || 'Dashboard';
    });
});

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const sidebar = document.getElementById('sidebar');

mobileMenuToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// ============================================
// LOAD DASHBOARD DATA
// ============================================

async function loadDashboard() {
    try {
        console.log('Loading dashboard data...');

        // Get analytics from Supabase
        analyticsData = await getAnalytics();
        console.log('Analytics data:', analyticsData);

        // Update overview stats
        updateOverviewStats();

        // Display recent visitors
        displayRecentVisitors();

        // Display top countries
        displayTopCountries();

        // Load full visitors table
        loadVisitorsTable();

        // Update analytics section
        updateAnalytics();

        console.log('✅ Dashboard loaded successfully');

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data. Check console for details.');
    }
}

// ============================================
// UPDATE OVERVIEW STATS
// ============================================

async function updateOverviewStats() {
    try {
        // Total visitors
        const totalEl = document.getElementById('total-visitors');
        if (totalEl) {
            totalEl.textContent = analyticsData?.totalVisitors || 0;
        }

        // Today's visitors
        const todayCount = await getVisitorsToday();
        const todayEl = document.getElementById('today-visitors');
        if (todayEl) {
            todayEl.textContent = todayCount || 0;
        }

        // Active visitors (last 5 minutes)
        const activeCount = await getRealTimeVisitorCount();
        const activeEl = document.getElementById('active-visitors');
        if (activeEl) {
            activeEl.textContent = activeCount || 0;
        }

        // Top country
        const countries = await getVisitorsByCountry();
        const topCountryEl = document.getElementById('top-country');
        if (topCountryEl && countries && countries.length > 0) {
            topCountryEl.textContent = countries[0].country;
        } else if (topCountryEl) {
            topCountryEl.textContent = 'N/A';
        }

    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// ============================================
// DISPLAY RECENT VISITORS
// ============================================

function displayRecentVisitors() {
    const container = document.getElementById('recent-visitors');
    if (!container) return;

    if (!analyticsData?.visitors || analyticsData.visitors.length === 0) {
        container.innerHTML = '<div class="loading-state">No visitors yet</div>';
        return;
    }

    const recent = analyticsData.visitors.slice(0, 10);

    container.innerHTML = recent.map(visitor => `
        <div class="visitor-item">
            <div class="visitor-info">
                <div class="visitor-location">
                    ${visitor.city || 'Unknown'}, ${visitor.country || 'Unknown'}
                </div>
                <div class="visitor-time">
                    ${formatDate(visitor.timestamp)}
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// DISPLAY TOP COUNTRIES
// ============================================

async function displayTopCountries() {
    const container = document.getElementById('top-countries');
    if (!container) return;

    try {
        const countries = await getVisitorsByCountry();

        if (!countries || countries.length === 0) {
            container.innerHTML = '<div class="loading-state">No data yet</div>';
            return;
        }

        const top5 = countries.slice(0, 5);

        container.innerHTML = top5.map(item => `
            <div class="country-item">
                <div class="country-info">
                    <div class="country-name">${item.country}</div>
                    <div class="country-count">${item.count} visitors</div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error displaying countries:', error);
        container.innerHTML = '<div class="loading-state">Error loading countries</div>';
    }
}

// ============================================
// LOAD VISITORS TABLE
// ============================================

function loadVisitorsTable() {
    const tbody = document.getElementById('all-visitors-table');
    if (!tbody) return;

    if (!analyticsData?.visitors || analyticsData.visitors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading-state">No visitors yet</td></tr>';
        return;
    }

    tbody.innerHTML = analyticsData.visitors.map(visitor => `
        <tr>
            <td>${formatDate(visitor.timestamp)}</td>
            <td>${visitor.city || 'Unknown'}, ${visitor.country || 'Unknown'}</td>
            <td>${getBrowser(visitor.user_agent)}</td>
            <td>${visitor.ip_address || 'N/A'}</td>
        </tr>
    `).join('');
}

// ============================================
// UPDATE ANALYTICS
// ============================================

async function updateAnalytics() {
    try {
        const uniqueEl = document.getElementById('unique-visitors');
        if (uniqueEl && analyticsData?.visitors) {
            // Count unique IPs
            const uniqueIPs = new Set(analyticsData.visitors.map(v => v.ip_address));
            uniqueEl.textContent = uniqueIPs.size;
        }

        const returningEl = document.getElementById('returning-visitors');
        if (returningEl && analyticsData?.visitors) {
            // Count IPs that appear more than once
            const ipCounts = {};
            analyticsData.visitors.forEach(v => {
                ipCounts[v.ip_address] = (ipCounts[v.ip_address] || 0) + 1;
            });
            const returning = Object.values(ipCounts).filter(count => count > 1).length;
            returningEl.textContent = returning;
        }

    } catch (error) {
        console.error('Error updating analytics:', error);
    }
}

// ============================================
// VIDEO SETTINGS
// ============================================

const videoForm = document.getElementById('video-form');
const videoUrlInput = document.getElementById('video-url');
const videoMessage = document.getElementById('video-message');

// Load current video
async function loadCurrentVideo() {
    try {
        const videoId = await getBackgroundVideo();
        if (videoId && videoUrlInput) {
            videoUrlInput.value = `https://www.youtube.com/watch?v=${videoId}`;
        }
    } catch (error) {
        console.error('Error loading video:', error);
    }
}

// Handle video form submission
videoForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = videoUrlInput.value.trim();

    console.log('📤 Submitting video URL:', url);

    try {
        videoMessage.textContent = 'Saving...';
        videoMessage.className = 'form-message';
        videoMessage.style.display = 'block';

        const result = await updateBackgroundVideo(url);

        console.log('📥 Update result:', result);

        if (result.success) {
            videoMessage.textContent = 'Background video updated successfully! Refresh the main page to see changes.';
            videoMessage.className = 'form-message success';

            // Update the input to show the formatted URL
            if (result.videoId) {
                videoUrlInput.value = `https://www.youtube.com/watch?v=${result.videoId}`;
            }
        } else {
            videoMessage.textContent = `Error: ${result.error}`;
            videoMessage.className = 'form-message error';
        }

    } catch (error) {
        console.error('❌ Error updating video:', error);
        videoMessage.textContent = `Error: ${error.message}`;
        videoMessage.className = 'form-message error';
    }

    setTimeout(() => {
        videoMessage.style.display = 'none';
    }, 10000);
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) {
        return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
        const mins = Math.floor(diff / 60000);
        return `${mins} min${mins > 1 ? 's' : ''} ago`;
    }

    // Less than 1 day
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // Format as date
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getBrowser(userAgent) {
    if (!userAgent) return 'Unknown';

    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Opera')) return 'Opera';

    return 'Unknown';
}

function showError(message) {
    console.error(message);
    // You can add a toast notification here
}

// ============================================
// AUTO-REFRESH
// ============================================

function startAutoRefresh() {
    autoRefreshInterval = setInterval(async () => {
        console.log('Auto-refreshing dashboard...');
        await loadDashboard();
    }, 30000); // Refresh every 30 seconds
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// ============================================
// LOGOUT
// ============================================

const logoutBtn = document.getElementById('logout-btn');

logoutBtn?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to logout?')) {
        try { await logoutAdmin(); }
        catch { alert('Unable to sign out. Please try again.'); }
    }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Dashboard initializing...');

    // Check authentication
    if (!await isAdminLoggedIn()) {
        console.log('Not authenticated, redirecting...');
        window.location.href = 'admin.html';
        return;
    }

    // Load dashboard data
    await loadDashboard();

    // Load current video
    await loadCurrentVideo();

    // Start auto-refresh
    startAutoRefresh();

    console.log('✅ Dashboard ready');
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

// Handle window resize for mobile
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar?.classList.remove('active');
    }
});

async function loadContactInbox() {
    const inbox = document.getElementById('contact-inbox');
    if (!inbox) return;
    inbox.textContent = 'Loading messages...';
    const { data, error } = await supabase.from('contact_messages').select('name,email,message,created_at').order('created_at', { ascending: false }).limit(100);
    if (error) { inbox.textContent = 'Inbox unavailable. Database setup may still be required.'; return; }
    inbox.replaceChildren();
    if (!data.length) { inbox.textContent = 'No messages yet.'; return; }
    for (const message of data) {
        const card = document.createElement('article');
        card.className = 'glass-card';
        const title = document.createElement('h4');
        title.textContent = message.name;
        const sender = document.createElement('p');
        sender.textContent = message.email + ' · ' + new Date(message.created_at).toLocaleString();
        const body = document.createElement('p');
        body.style.whiteSpace = 'pre-wrap';
        body.style.overflowWrap = 'anywhere';
        body.textContent = message.message;
        card.append(title, sender, body);
        inbox.append(card);
    }
}
