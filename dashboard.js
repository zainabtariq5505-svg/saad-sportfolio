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
        if (section === 'profile') window.loadProfileEditor?.();
        if (section === 'analytics') window.loadVisitChart?.();

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
            messages: 'Contact inbox', profile: 'Profile editor'
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
            topCountryEl.textContent = 'Location not collected';
        }

    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// ============================================
// DISPLAY RECENT VISITORS
// ============================================

function escapeVisitorText(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function visitorLocation(visitor) {
    const isKnown = value => typeof value === 'string' && value.trim() && !['unknown', 'not collected', 'n/a', 'location unavailable'].includes(value.trim().toLowerCase());
    const location = [visitor.city, visitor.country].filter(isKnown).map(value => value.trim());
    if (location.length) return escapeVisitorText(location.join(', '));
    return visitor.country === 'Not collected' ? 'Anonymous visit · location not collected' : 'Location unavailable';
}

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
                    ${visitorLocation(visitor)}
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
            container.innerHTML = '<div class="loading-state">Location is not collected for anonymous visits.</div>';
            return;
        }

        const top5 = countries.slice(0, 5);

        container.innerHTML = top5.map(item => `
            <div class="country-item">
                <div class="country-info">
                    <div class="country-name">${escapeVisitorText(item.country)}</div>
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

function filteredVisitors() {
    const query = (document.getElementById('visitor-search')?.value || '').trim().toLowerCase();
    const range = document.getElementById('visitor-range')?.value || 'all';
    const cutoff = new Date();
    if (range === 'today') cutoff.setHours(0, 0, 0, 0);
    else if (range !== 'all') cutoff.setTime(Date.now() - Number(range) * 86400000);
    return (analyticsData?.visitors || []).filter(visitor => {
        if (range !== 'all' && new Date(visitor.timestamp) < cutoff) return false;
        return !query || [visitor.city, visitor.country, visitor.ip_address, visitor.user_agent ? getBrowser(visitor.user_agent) : 'Not collected'].join(' ').toLowerCase().includes(query);
    });
}

function loadVisitorsTable() {
    const tbody = document.getElementById('all-visitors-table');
    if (!tbody) return;

    const visitors = filteredVisitors();
    const count = document.getElementById('visitor-result-count');
    if (count) count.textContent = `${visitors.length} of ${analyticsData?.visitors?.length || 0} visits shown`;
    if (!visitors.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading-state">No visits match this filter.</td></tr>';
        return;
    }

    tbody.innerHTML = visitors.map(visitor => `
        <tr>
            <td>${formatDate(visitor.timestamp)}</td>
            <td>${visitorLocation(visitor)}</td>
            <td>${visitor.user_agent ? getBrowser(visitor.user_agent) : 'Not collected'}</td>
            <td>${visitor.ip_address ? escapeVisitorText(visitor.ip_address) : 'Not collected'}</td>
        </tr>
    `).join('');
}

// ============================================
// UPDATE ANALYTICS
// ============================================

async function updateAnalytics() {
    try {
        for (const id of ['unique-visitors', 'returning-visitors']) {
            const element = document.getElementById(id);
            if (element) { element.textContent = 'Not collected'; element.title = 'Anonymous visit counts do not identify individual visitors.'; }
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
    if (!userAgent) return 'Not collected';
    if (['Chrome', 'Edge', 'Firefox', 'Safari', 'Opera', 'Other'].includes(userAgent)) return userAgent;

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

document.getElementById('visitor-search')?.addEventListener('input', loadVisitorsTable);
document.getElementById('visitor-range')?.addEventListener('change', loadVisitorsTable);
document.getElementById('refresh-visitors')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'Refreshing...';
    try { await loadDashboard(); }
    finally { button.disabled = false; button.textContent = 'Refresh data'; }
});
document.getElementById('export-visitors')?.addEventListener('click', () => {
    const cell = value => {
        let text = String(value ?? 'Not collected');
        if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
        return '"' + text.replace(/"/g, '""') + '"';
    };
    const rows = [['Time', 'City', 'Country', 'Browser', 'IP'], ...filteredVisitors().map(v => [v.timestamp, v.city, v.country, v.user_agent ? getBrowser(v.user_agent) : null, v.ip_address])];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n')], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio-visits-' + new Date().toISOString().slice(0,10) + '.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.getElementById('preview-video')?.addEventListener('click', () => {
    const id = extractYouTubeID(document.getElementById('video-url').value.trim());
    const status = document.getElementById('video-preview-status');
    status.replaceChildren();
    if (!id || !/^[\w-]{11}$/.test(id)) { status.textContent = 'Enter a valid YouTube video URL first.'; return; }
    const link = document.createElement('a');
    link.href = 'https://www.youtube.com/watch?v=' + id;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open video preview on YouTube →';
    status.append(link);
});
