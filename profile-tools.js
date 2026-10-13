(() => {
    const defaults = {
        bio: "I'm a Computer Science student with a deep passion for software development and problem-solving. My journey in tech is driven by curiosity and the desire to create meaningful digital experiences.",
        semester: '1st Semester',
        skills: 'JavaScript, Python, C++, SQL, HTML5, CSS3, React, Responsive Design, Git, GitHub, VS Code, Database Design',
        github: '', linkedin: '', email: ''
    };
    const fields = Object.keys(defaults);
    const validLink = (value, host) => {
        if (!value) return '';
        const url = new URL(value);
        if (url.protocol !== 'https:' || ![host, 'www.' + host].includes(url.hostname) || url.username || url.password) throw new Error(`Use an https://${host} profile URL.`);
        return url.href;
    };
    async function readProfile() {
        const { data, error } = await supabase.from('settings').select('value').eq('key','portfolio_profile').maybeSingle();
        if (error) throw error;
        return data ? { ...defaults, ...JSON.parse(data.value) } : null;
    }
    window.loadProfileEditor = async () => {
        const status = document.getElementById('profile-status');
        if (document.getElementById('profile-form').dataset.loaded) return;
        status.textContent = 'Loading profile...';
        try {
            if (!await isAdminLoggedIn()) throw new Error('Please sign in as an admin.');
            const profile = await readProfile() || defaults;
            fields.forEach(field => { document.getElementById('profile-' + field).value = profile[field] || ''; });
            document.getElementById('profile-form').dataset.loaded = 'true';
            status.textContent = '';
        } catch { status.textContent = 'Unable to load profile. Please retry by reopening this section.'; }
    };
    let chartRequest = 0;
    window.loadVisitChart = async () => {
        const summary = document.getElementById('chart-summary');
        const chart = document.getElementById('visits-chart');
        if (!chart) return;
        const request = ++chartRequest;
        const days = Number(document.getElementById('chart-range').value);
        summary.textContent = 'Loading visit counts...';
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            const { data, error } = await supabase.rpc('portfolio_daily_visits', { p_days: days, p_timezone: timezone });
            if (request !== chartRequest) return;
            if (error) throw error;
            const counts = data.map(row => Number(row.visits));
            const max = Math.max(4, Math.ceil(Math.max(0, ...counts) / 4) * 4);
            const total = counts.reduce((a,b)=>a+b,0);
            summary.textContent = `${total} visits in the last ${days} days · ${timezone} · daily visit counts, not unique people`;
            chart.replaceChildren();
            const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
            svg.setAttribute('viewBox','0 0 760 240');
            svg.setAttribute('role','img');
            svg.setAttribute('aria-label', `${days}-day visit chart: ${total} visits`);
            const add = (tag, attrs, text) => {
                const node = document.createElementNS(svg.namespaceURI,tag);
                Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,value));
                if (text !== undefined) node.textContent = text;
                svg.append(node); return node;
            };
            for (let i=0;i<=4;i++) {
                const y = 190-i*40;
                add('line',{x1:45,x2:750,y1:y,y2:y,stroke:'#302b42'});
                add('text',{x:35,y:y+4,fill:'#a0a0b8','text-anchor':'end','font-size':11},String(Math.round(max*i/4)));
            }
            data.forEach((row,i)=>{
                const width = 690/days;
                const height = counts[i]/max*160;
                const bar = add('rect',{x:50+i*width,y:190-height,width:Math.max(3,width-5),height:Math.max(1,height),rx:3,fill:'#8b5cf6'});
                const title=document.createElementNS(svg.namespaceURI,'title');title.textContent=`${row.day}: ${counts[i]} visits`;bar.append(title);
                if (i===0 || i===days-1 || i===Math.floor(days/2)) add('text',{x:50+i*width,y:215,fill:'#a0a0b8','font-size':11},row.day.slice(5));
            });
            chart.append(svg);
            const table = document.createElement('table');table.className='visitors-table';
            data.forEach(row=>{const tr=document.createElement('tr');[row.day,row.visits].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});table.append(tr);});
            document.getElementById('chart-table').replaceChildren(table);
        } catch { if(request===chartRequest) { chart.replaceChildren(); summary.textContent='Chart unavailable. Please try again later.'; } }
    };
    document.addEventListener('DOMContentLoaded', async () => {
        const form = document.getElementById('profile-form');
        if (form) {
            document.getElementById('chart-range').addEventListener('change', window.loadVisitChart);
            form.addEventListener('submit', async event => {
                event.preventDefault();
                const status=document.getElementById('profile-status');
                const button=form.querySelector('button[type="submit"]');
                button.disabled=true;
                try {
                    if(!await isAdminLoggedIn()) throw new Error('Please sign in as an admin.');
                    const profile=Object.fromEntries(fields.map(field=>[field,document.getElementById('profile-'+field).value.trim()]));
                    if(!profile.bio || !profile.semester) throw new Error('Enter your bio and semester.');
                    profile.github=validLink(profile.github,'github.com');profile.linkedin=validLink(profile.linkedin,'linkedin.com');
                    if(profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) throw new Error('Enter a valid public email.');
                    const { error }=await supabase.from('settings').upsert({key:'portfolio_profile',value:JSON.stringify(profile),updated_at:new Date().toISOString()},{onConflict:'key'});
                    if(error) throw new Error('Profile could not be saved. Try again.');
                    status.textContent='Saved. Refresh the public portfolio to see your changes.';
                } catch(error) {status.textContent=error.message;}
                finally {button.disabled=false;}
            });
            return;
        }
        try {
            const profile=await readProfile();
            if(!profile) return;
            const bio=document.querySelector('.about-text .text-large');if(bio) bio.textContent=profile.bio;
            const semester=document.querySelector('#experience .timeline-date');if(semester) semester.textContent=profile.semester;
            const stack=document.querySelector('.tech-stack');
            if(stack) {
                stack.querySelectorAll('.stack-category').forEach(el=>el.remove());
                const tags=document.createElement('div');tags.className='tech-tags';
                profile.skills.split(',').map(s=>s.trim()).filter(Boolean).slice(0,40).forEach(skill=>{const span=document.createElement('span');span.className='tech-tag';span.textContent=skill;tags.append(span);});stack.append(tags);
            }
            const methods=document.querySelector('.contact-methods');
            const footer=document.querySelector('.footer-social');
            const links=[['GitHub',validLink(profile.github,'github.com')],['LinkedIn',validLink(profile.linkedin,'linkedin.com')],['Email',profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? 'mailto:'+profile.email : '']];
            const icon = label => {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('width', '24'); svg.setAttribute('height', '24');
                svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
                svg.setAttribute('stroke-width', '1.8'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
                svg.setAttribute('aria-hidden', 'true');
                const paths = {
                    Email: ['M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z', 'm3 7 9 6 9-6'],
                    GitHub: ['M9 19c-5 1.5-5-2.5-7-3', 'M15 22v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.3 6.4-1.5 6.4-7a5.4 5.4 0 0 0-1.5-3.7 5 5 0 0 0-.1-3.7S17.7.7 15 2.5a13 13 0 0 0-7 0C5.3.7 4.1 1.1 4.1 1.1A5 5 0 0 0 4 4.8a5.4 5.4 0 0 0-1.5 3.7c0 5.5 3.3 6.7 6.4 7a3.4 3.4 0 0 0-.9 2.6V22'],
                    LinkedIn: ['M3 9h4v12H3Z', 'M5 3h.01', 'M11 21V9h4v2a4 4 0 0 1 7 3v7h-4v-7a2 2 0 0 0-3 0v7']
                };
                paths[label].forEach(d => { const path=document.createElementNS(svg.namespaceURI,'path'); path.setAttribute('d',d);svg.append(path); });
                return svg;
            };
            if(methods) {
                methods.replaceChildren();
                links.filter(([,url])=>url).forEach(([label,url])=>{
                    const link=document.createElement('a');link.href=url;link.className='contact-method glass-card profile-contact-card';link.rel='noopener noreferrer';
                    const badge=document.createElement('span');badge.className='method-icon';badge.append(icon(label));
                    const copy=document.createElement('span');copy.className='contact-method-copy';
                    const title=document.createElement('h4');title.textContent=label;
                    const detail=document.createElement('p');detail.textContent=label==='Email'?profile.email:new URL(url).pathname.replace(/^\//,'');
                    copy.append(title,detail);link.append(badge,copy);methods.append(link);
                });
            }
            if(footer) {
                footer.replaceChildren();
                links.filter(([,url])=>url).forEach(([label,url])=>{
                    const link=document.createElement('a');link.href=url;link.setAttribute('aria-label',label);link.title=label;link.rel='noopener noreferrer';link.append(icon(label));footer.append(link);
                });
            }
        } catch(error) {console.warn('Public profile unavailable; showing existing profile.');}
    });
})();
