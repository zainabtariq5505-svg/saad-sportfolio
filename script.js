/* ============================================
   PREMIUM PORTFOLIO - SOPHISTICATED INTERACTIONS
   ============================================ */

// Smooth scroll with offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const navHeight = 80;
            const targetPosition = target.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            document.getElementById('nav-links')?.classList.remove('active');
        }
    });
});

// ============================================
// NAVIGATION
// ============================================

class Navigation {
    constructor() {
        this.nav = document.getElementById('nav');
        this.navToggle = document.getElementById('nav-toggle');
        this.navLinks = document.getElementById('nav-links');
        this.lastScroll = 0;

        this.init();
    }

    init() {
        // Scroll effects
        window.addEventListener('scroll', () => this.handleScroll());

        // Mobile menu toggle
        this.navToggle?.addEventListener('click', () => this.toggleMenu());

        // Active link highlighting
        this.updateActiveLink();
        window.addEventListener('scroll', () => this.updateActiveLink());

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                this.navLinks?.classList.remove('active');
            }
        });
    }

    handleScroll() {
        const currentScroll = window.pageYOffset;

        // Add scrolled class
        if (currentScroll > 50) {
            this.nav?.classList.add('scrolled');
        } else {
            this.nav?.classList.remove('scrolled');
        }

        this.lastScroll = currentScroll;
    }

    toggleMenu() {
        this.navLinks?.classList.toggle('active');
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        // Observe elements
        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });

        // Add data-animate to elements that should animate
        this.addAnimationAttributes();
    }

    addAnimationAttributes() {
        // Animate glass cards
        document.querySelectorAll('.glass-card').forEach(card => {
            card.setAttribute('data-animate', '');
        });

        // Animate project cards
        document.querySelectorAll('.project-card').forEach(card => {
            card.setAttribute('data-animate', '');
        });

        // Animate timeline items
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.setAttribute('data-animate', '');
        });
    }
}

// ============================================
// AUDIO PLAYER WITH VOICE CONTROL
// ============================================

class AudioPlayer {
    constructor() {
        this.audio = document.getElementById('background-music');
        this.toggleBtn = document.getElementById('audio-toggle');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeToggle = document.getElementById('volume-toggle');
        this.voiceControl = document.getElementById('voice-control');

        this.isPlaying = false;
        this.isMuted = false;
        this.previousVolume = 50;

        this.recognition = null;
        this.isListening = false;

        this.init();
    }

    init() {
        if (!this.audio) return;

        // Set initial volume
        this.audio.volume = 0.5;

        // Play/Pause
        this.toggleBtn?.addEventListener('click', () => this.togglePlayPause());

        // Volume slider
        this.volumeSlider?.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });

        // Mute toggle
        this.volumeToggle?.addEventListener('click', () => this.toggleMute());

        // Voice control
        this.voiceControl?.addEventListener('click', () => this.toggleVoiceControl());

        // Initialize speech recognition
        this.initSpeechRecognition();

        console.log('🎵 Audio player initialized');
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.toggleBtn?.classList.add('playing');
                this.showIcon('play', false);
                this.showIcon('pause', true);
                this.showNotification('Playing');
            })
            .catch(err => {
                console.log('Playback error:', err);
            });
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.toggleBtn?.classList.remove('playing');
        this.showIcon('play', true);
        this.showIcon('pause', false);
        this.showNotification('Paused');
    }

    setVolume(value) {
        const volume = value / 100;
        this.audio.volume = volume;
        this.volumeSlider.value = value;

        // Update icon
        if (value == 0) {
            this.isMuted = true;
            this.showVolumeIcon('mute', true);
            this.showVolumeIcon('volume', false);
        } else {
            this.isMuted = false;
            this.showVolumeIcon('mute', false);
            this.showVolumeIcon('volume', true);
        }
    }

    toggleMute() {
        if (this.isMuted) {
            this.setVolume(this.previousVolume);
            this.isMuted = false;
        } else {
            this.previousVolume = this.volumeSlider.value;
            this.setVolume(0);
            this.isMuted = true;
        }
    }

    showIcon(type, show) {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');

        if (type === 'play') {
            playIcon?.classList.toggle('hidden', !show);
        } else {
            pauseIcon?.classList.toggle('hidden', !show);
        }
    }

    showVolumeIcon(type, show) {
        const volumeIcon = document.querySelector('.volume-icon');
        const muteIcon = document.querySelector('.mute-icon');

        if (type === 'volume') {
            volumeIcon?.classList.toggle('hidden', !show);
        } else {
            muteIcon?.classList.toggle('hidden', !show);
        }
    }

    // ============================================
    // VOICE CONTROL
    // ============================================

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.log('Speech recognition not supported');
            if (this.voiceControl) this.voiceControl.style.display = 'none';
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.voiceControl?.classList.add('listening');
            this.showNotification('Listening...');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log('Voice command:', transcript);
            this.processVoiceCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.log('Speech recognition error:', event.error);
            this.stopListening();

            if (event.error !== 'no-speech') {
                this.showNotification('Voice control error', true);
            }
        };

        this.recognition.onend = () => {
            this.stopListening();
        };
    }

    toggleVoiceControl() {
        if (this.isListening) {
            this.recognition?.stop();
        } else {
            if (this.recognition) {
                try {
                    this.recognition.start();
                } catch (err) {
                    console.log('Recognition start error:', err);
                }
            } else {
                this.showNotification('Voice not supported', true);
            }
        }
    }

    stopListening() {
        this.isListening = false;
        this.voiceControl?.classList.remove('listening');
    }

    processVoiceCommand(command) {
        // Play commands
        if (command.includes('play') || command.includes('start')) {
            this.play();
            this.showNotification('Playing');
        }
        // Pause commands
        else if (command.includes('pause') || command.includes('stop')) {
            this.pause();
            this.showNotification('Paused');
        }
        // Volume up
        else if (command.includes('volume up') || command.includes('louder') || command.includes('increase')) {
            const newVolume = Math.min(100, parseInt(this.volumeSlider.value) + 20);
            this.setVolume(newVolume);
            this.showNotification(`Volume ${newVolume}%`);
        }
        // Volume down
        else if (command.includes('volume down') || command.includes('quieter') || command.includes('lower') || command.includes('decrease')) {
            const newVolume = Math.max(0, parseInt(this.volumeSlider.value) - 20);
            this.setVolume(newVolume);
            this.showNotification(`Volume ${newVolume}%`);
        }
        // Mute
        else if (command.includes('mute') || command.includes('silent')) {
            this.setVolume(0);
            this.showNotification('Muted');
        }
        // Max volume
        else if (command.includes('max') || command.includes('maximum') || command.includes('full')) {
            this.setVolume(100);
            this.showNotification('Volume 100%');
        }
        // Set specific volume
        else if (command.match(/volume.*?(\d+)/)) {
            const match = command.match(/(\d+)/);
            if (match) {
                const volume = Math.min(100, Math.max(0, parseInt(match[1])));
                this.setVolume(volume);
                this.showNotification(`Volume ${volume}%`);
            }
        }
        // Unknown command
        else {
            this.showNotification('Command not recognized', true);
        }
    }

    showNotification(message, isError = false) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('audio-notification');

        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'audio-notification';
            notification.style.cssText = `
                position: fixed;
                bottom: 100px;
                right: var(--spacing-lg, 2rem);
                padding: 12px 20px;
                background: rgba(18, 18, 26, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: white;
                font-size: 0.875rem;
                font-weight: 500;
                z-index: 1000;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                pointer-events: none;
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.borderColor = isError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(99, 102, 241, 0.5)';
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(10px)';
        }, 2000);
    }
}

// ============================================
// CONTACT FORM
// ============================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.messageElement = document.getElementById('form-message');

        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Add focus effects
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = {
            name: this.form.name.value,
            email: this.form.email.value,
            message: this.form.message.value
        };

        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        // Simulate submission (integrate with your backend/Supabase)
        this.showMessage('Processing...', 'success');

        // Simulate API call
        await this.submitToBackend(formData);

        // Success
        this.showMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
        this.form.reset();
    }

    async submitToBackend(formData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // TODO: Integrate with Supabase or your backend
        console.log('Form submitted:', formData);

        // You can use Supabase here:
        // const { data, error } = await supabase
        //     .from('contact_messages')
        //     .insert([formData]);
    }

    showMessage(text, type) {
        if (!this.messageElement) return;

        this.messageElement.textContent = text;
        this.messageElement.className = `form-message ${type}`;
        this.messageElement.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                this.messageElement.style.display = 'none';
            }, 5000);
        }
    }
}

// ============================================
// PARALLAX EFFECTS
// ============================================

class ParallaxEffects {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    handleScroll() {
        const scrolled = window.pageYOffset;

        // Parallax for floating code block
        const codeBlock = document.querySelector('.floating-code-block');
        if (codeBlock) {
            const speed = 0.5;
            codeBlock.style.transform = `translateY(calc(-50% + ${scrolled * speed}px))`;
        }
    }

    handleMouseMove(e) {
        // Subtle mouse parallax for cards
        const cards = document.querySelectorAll('.glass-card');

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            } else {
                card.style.transform = '';
            }
        });
    }
}

// ============================================
// TYPING EFFECT
// ============================================

class TypingEffect {
    constructor(element, texts, speed = 100) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;

        this.init();
    }

    init() {
        if (!this.element) return;
        this.type();
    }

    type() {
        const currentText = this.texts[this.textIndex];

        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let typeSpeed = this.speed;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ============================================
// CURSOR TRAIL EFFECT (Subtle & Professional)
// ============================================

class CursorTrail {
    constructor() {
        this.coords = [];
        this.circles = [];
        this.colors = ['rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.3)', 'rgba(217, 70, 239, 0.3)'];

        this.init();
    }

    init() {
        // Create trail circles
        for (let i = 0; i < 20; i++) {
            const circle = document.createElement('div');
            circle.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: ${this.colors[i % this.colors.length]};
                pointer-events: none;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(circle);
            this.circles.push(circle);
        }

        // Track mouse
        window.addEventListener('mousemove', (e) => {
            this.coords.push({ x: e.clientX, y: e.clientY });
            if (this.coords.length > this.circles.length) {
                this.coords.shift();
            }
        });

        // Animate trail
        this.animate();
    }

    animate() {
        this.circles.forEach((circle, index) => {
            const coord = this.coords[index];
            if (coord) {
                circle.style.left = coord.x + 'px';
                circle.style.top = coord.y + 'px';
                circle.style.opacity = (this.coords.length - index) / this.coords.length;
                circle.style.transform = `scale(${(this.coords.length - index) / this.coords.length})`;
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// VISITOR TRACKING (Supabase Integration)
// ============================================

async function trackPortfolioVisit() {
    try {
        if (typeof trackVisitor !== 'undefined' && window.location.protocol !== 'file:') {
            // This function is defined in supabase-config.js
            if (typeof window.trackVisitor === 'function') {
                await window.trackVisitor();
            }
        }
    } catch (error) {
        console.log('Visitor tracking:', error.message);
    }
}

// ============================================
// THEME SWITCHER (Video Background Mode)
// ============================================

class ThemeSwitcher {
    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer;
        this.themeSwitcher = document.getElementById('theme-switcher');
        this.videoControls = document.getElementById('video-controls');
        this.videoToggle = document.getElementById('video-toggle');
        this.videoVolumeSlider = document.getElementById('video-volume-slider');
        this.videoVolumeToggle = document.getElementById('video-volume-toggle');

        this.isVideoMode = false;
        this.videoContainer = null;
        this.videoId = null;
        this.isVideoPlaying = false;
        this.isVideoMuted = true;

        this.ready = this.init();
    }

    async init() {
        if (!this.themeSwitcher) return;

        // Theme switcher click
        this.themeSwitcher.addEventListener('click', async () => await this.toggleTheme());

        // Video controls
        this.videoToggle?.addEventListener('click', () => this.toggleVideoPlayback());
        this.videoVolumeSlider?.addEventListener('input', (e) => this.updateVideoVolume(e.target.value));
        this.videoVolumeToggle?.addEventListener('click', () => this.toggleVideoMute());

        // Bind controls before waiting for the remote settings.
        await this.loadVideoId();

        // Load saved preference
        const saved = localStorage.getItem('videoMode');
        if (saved === 'true' && this.videoId && !document.body.classList.contains('entry-locked')) {
            this.enableVideoMode();
        }

        console.log('🎬 Theme switcher initialized');
    }

    async loadVideoId() {
        try {
            // Check if getBackgroundVideo function exists
            if (typeof getBackgroundVideo !== 'function') {
                console.warn('⚠️ getBackgroundVideo function not available');
                // Show button anyway for testing
                this.themeSwitcher.style.display = 'flex';
                return;
            }

            this.videoId = await getBackgroundVideo();

            console.log('📹 Video ID check:', this.videoId ? this.videoId : 'None configured');

            // Always show the button
            this.themeSwitcher.style.display = 'flex';

        } catch (error) {
            console.log('⚠️ Video ID fetch error:', error);
            // Show button anyway
            this.themeSwitcher.style.display = 'flex';
        }
    }

    async toggleTheme() {
        if (this.isVideoMode) {
            this.disableVideoMode();
        } else {
            this.themeSwitcher.disabled = true;
            try {
                await this.loadVideoId();
                this.enableVideoMode();
            } finally {
                this.themeSwitcher.disabled = false;
            }
        }
    }

    enableVideoMode() {
        console.log('🎬 Attempting to enable video mode...');
        console.log('Video ID:', this.videoId);

        if (!this.videoId) {
            this.showNotification('No background video configured. Please add one in dashboard settings.', true);
            console.warn('No video ID available');
            return;
        }

        console.log('✅ Enabling video mode with ID:', this.videoId);
        this.isVideoMode = true;
        document.body.classList.add('video-mode');
        this.themeSwitcher.classList.add('active');

        // Update label
        const label = this.themeSwitcher.querySelector('.theme-label');
        if (label) label.textContent = 'Default Mode';

        // Show/hide icons
        this.themeSwitcher.querySelector('.video-icon')?.classList.add('hidden');
        this.themeSwitcher.querySelector('.theme-icon')?.classList.remove('hidden');

        // Create video background
        this.createVideoBackground();

        // Show video controls
        if (this.videoControls) {
            this.videoControls.style.display = 'flex';
        }

        // Save preference
        localStorage.setItem('videoMode', 'true');

        this.showNotification('Video background enabled');
        console.log('✅ Video mode enabled successfully');
    }

    disableVideoMode() {
        this.audioPlayer?.pause();
        this.isVideoMode = false;
        document.body.classList.remove('video-mode');
        this.themeSwitcher.classList.remove('active');

        // Update label
        const label = this.themeSwitcher.querySelector('.theme-label');
        if (label) label.textContent = 'Video Mode';

        // Show/hide icons
        this.themeSwitcher.querySelector('.video-icon')?.classList.remove('hidden');
        this.themeSwitcher.querySelector('.theme-icon')?.classList.add('hidden');

        // Remove video background
        if (this.videoContainer) {
            this.videoContainer.remove();
            this.videoContainer = null;
        }

        // Hide video controls
        if (this.videoControls) {
            this.videoControls.style.display = 'none';
        }

        // Save preference
        localStorage.setItem('videoMode', 'false');

        this.showNotification('Default theme enabled');
    }

    createVideoBackground() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Remove existing
        const existing = hero.querySelector('.hero-video-background');
        if (existing) existing.remove();

        // Create container
        this.videoContainer = document.createElement('div');
        this.videoContainer.className = 'hero-video-background';

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'hero-video-iframe';
        iframe.src = `https://www.youtube.com/embed/${this.videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playlist=${this.videoId}&enablejsapi=1`;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; encrypted-media');
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.title = 'Portfolio background video';
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.pointerEvents = 'none';

        this.videoContainer.appendChild(iframe);
        hero.insertBefore(this.videoContainer, hero.firstChild);

        this.isVideoPlaying = true;
        this.updateVideoPlayIcon();

        console.log('✅ Video background created');
    }

    toggleVideoPlayback() {
        // Note: YouTube iframe API would be needed for true control
        // For now, recreate iframe with/without autoplay
        if (this.isVideoPlaying) {
            this.pauseVideo();
        } else {
            this.playVideo();
        }
    }

    playVideo() {
        if (!this.videoContainer) return;

        const iframe = this.videoContainer.querySelector('iframe');
        if (iframe) {
            const currentSrc = iframe.src;
            iframe.src = currentSrc.replace('autoplay=0', 'autoplay=1');
        }

        this.isVideoPlaying = true;
        this.updateVideoPlayIcon();
        this.showNotification('Video playing');
    }

    pauseVideo() {
        if (!this.videoContainer) return;

        const iframe = this.videoContainer.querySelector('iframe');
        if (iframe) {
            const currentSrc = iframe.src;
            iframe.src = currentSrc.replace('autoplay=1', 'autoplay=0');
        }

        this.isVideoPlaying = false;
        this.updateVideoPlayIcon();
        this.showNotification('Video paused');
    }

    updateVideoPlayIcon() {
        const playIcon = document.querySelector('.video-play-icon');
        const pauseIcon = document.querySelector('.video-pause-icon');

        if (this.isVideoPlaying) {
            playIcon?.classList.add('hidden');
            pauseIcon?.classList.remove('hidden');
            this.videoToggle?.classList.add('playing');
        } else {
            playIcon?.classList.remove('hidden');
            pauseIcon?.classList.add('hidden');
            this.videoToggle?.classList.remove('playing');
        }
    }

    updateVideoVolume(value) {
        if (!this.videoContainer) return;

        const iframe = this.videoContainer.querySelector('iframe');
        if (iframe) {
            // Update mute parameter
            const currentSrc = iframe.src;
            if (value == 0) {
                iframe.src = currentSrc.includes('mute=0') ? currentSrc.replace('mute=0', 'mute=1') : currentSrc;
                this.isVideoMuted = true;
            } else {
                iframe.src = currentSrc.includes('mute=1') ? currentSrc.replace('mute=1', 'mute=0') : currentSrc;
                this.isVideoMuted = false;
            }
        }

        this.updateVideoVolumeIcon();
    }

    toggleVideoMute() {
        if (this.isVideoMuted) {
            this.videoVolumeSlider.value = 50;
            this.updateVideoVolume(50);
        } else {
            this.videoVolumeSlider.value = 0;
            this.updateVideoVolume(0);
        }
    }

    updateVideoVolumeIcon() {
        const volumeIcon = document.querySelector('.video-volume-icon');
        const muteIcon = document.querySelector('.video-mute-icon');

        if (this.videoVolumeSlider.value == 0) {
            volumeIcon?.classList.add('hidden');
            muteIcon?.classList.remove('hidden');
        } else {
            volumeIcon?.classList.remove('hidden');
            muteIcon?.classList.add('hidden');
        }
    }

    showNotification(message, isError = false) {
        let notification = document.getElementById('theme-notification');

        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'theme-notification';
            notification.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: var(--spacing-lg, 2rem);
                padding: 12px 20px;
                background: rgba(18, 18, 26, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: white;
                font-size: 0.875rem;
                font-weight: 500;
                z-index: 1000;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                pointer-events: none;
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.borderColor = isError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(99, 102, 241, 0.5)';
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(10px)';
        }, 2000);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const entryScreen = document.getElementById('entry-screen');
    const entryButton = document.getElementById('entry-button');
    const portfolioElements = [...document.body.children].filter(el => el !== entryScreen && el.tagName !== 'SCRIPT');
    portfolioElements.forEach(el => { el.inert = true; });
    entryButton?.focus();
    entryButton?.addEventListener('click', async () => {
        document.body.classList.remove('entry-locked');
        portfolioElements.forEach(el => { el.inert = false; });
        entryScreen.classList.add('entered');
        document.getElementById('theme-switcher')?.focus({ preventScroll: true });
        setTimeout(() => entryScreen.remove(), 550);
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            new TypingEffect(document.getElementById('typing-intro'), ['Software Engineer', 'CS Student', 'Building cool stuff'], 85);
        }
        await themeSwitcher.ready;
        if (themeSwitcher.videoId && !themeSwitcher.isVideoMode) themeSwitcher.enableVideoMode();
    }, { once: true });
    // Initialize all modules
    new Navigation();
    new ScrollAnimations();
    const audioPlayer = new AudioPlayer();
    new ContactForm();
    new ParallaxEffects();
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        glow.setAttribute('aria-hidden', 'true');
        document.body.appendChild(glow);
        window.addEventListener('pointermove', e => {
            glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            glow.classList.add('visible');
        }, { passive: true });
        document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('visible'));
    }
    const themeSwitcher = new ThemeSwitcher(audioPlayer);

    // Track visitor
    trackPortfolioVisit();

    console.log('🚀 Portfolio initialized');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space to play/pause (when not in input)
    if (e.code === 'Space' && document.body.classList.contains('video-mode') && !document.body.classList.contains('entry-locked') && !e.target.matches('input, textarea, button, a')) {
        e.preventDefault();
        const audioPlayer = document.getElementById('audio-toggle');
        audioPlayer?.click();
    }
});

// Prevent context menu on long press (optional, for cleaner mobile experience)
// document.addEventListener('contextmenu', (e) => {
//     if (window.innerWidth <= 768) {
//         e.preventDefault();
//     }
// });
