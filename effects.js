/* Small, local effects. No network requests or command execution. */
document.addEventListener('DOMContentLoaded', () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.runCinematicIntro = () => new Promise(resolve => {
        if (reduced) { resolve(); return; }
        const entry = document.getElementById('entry-button');
        const boot = document.getElementById('cinematic-boot');
        const skip = document.getElementById('skip-intro');
        const status = document.getElementById('boot-status');
        entry.hidden = true;
        boot.hidden = false;
        skip.focus();
        const timers = [];
        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            timers.forEach(clearTimeout);
            skip.removeEventListener('click', finish);
            resolve();
        };
        skip.addEventListener('click', finish);
        timers.push(setTimeout(() => { status.textContent = 'Connecting ideas with code'; }, 550));
        timers.push(setTimeout(() => { status.textContent = 'Your invitation is ready'; }, 1150));
        timers.push(setTimeout(finish, 1750));
    });

    const dialog = document.getElementById('portfolio-terminal');
    const input = document.getElementById('terminal-command');
    const output = document.getElementById('terminal-output');
    const launcher = document.getElementById('terminal-launcher');
    const close = () => { dialog.close(); launcher.focus(); };
    launcher.addEventListener('click', () => { dialog.showModal(); input.focus(); });
    document.getElementById('terminal-close').addEventListener('click', close);
    dialog.addEventListener('click', event => { if (event.target === dialog) {
        const box = dialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
    }});
    const history = [];
    let historyIndex = 0;
    const print = text => {
        const row = document.createElement('p');
        row.textContent = text;
        output.append(row);
        while (output.children.length > 40) output.firstChild.remove();
        output.scrollTop = output.scrollHeight;
    };
    const run = value => {
        const command = value.trim().toLowerCase();
        if (!command) return;
        history.push(value.trim());
        if (history.length > 30) history.shift();
        historyIndex = history.length;
        print(`guest@saad:~$ ${value.trim()}`);
        input.value = '';
        if (['about', 'projects', 'contact', 'home', 'experience'].includes(command)) {
            close();
            document.getElementById(command).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        } else if (command === 'help') {
            print('Explore: home · about · experience · projects · contact\nExtras: whoami · skills · video · clear · exit\nPsst… the SMS logo has a secret.');
        } else if (command === 'whoami') {
            print('Syed Muhammad Saad — CS student, software developer, and curious builder.');
        } else if (command === 'skills') {
            print('JavaScript · Python · C++ · SQL\nHTML · CSS · React · Git');
        } else if (command === 'video') {
            close();
            document.getElementById('theme-switcher').click();
        } else if (command === 'clear') {
            output.replaceChildren();
        } else if (command === 'exit') {
            close();
        } else {
            print(`Unknown command: ${command}. Try help.`);
        }
    };
    document.getElementById('terminal-form').addEventListener('submit', event => { event.preventDefault(); run(input.value); });
    document.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => run(button.dataset.command)));
    input.addEventListener('keydown', event => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
            input.value = history[historyIndex] || '';
        }
    });
    let taps = 0;
    let lastTap = 0;
    let toastTimer;
    document.querySelector('.secret-logo').addEventListener('click', () => {
        const now = Date.now();
        taps = now - lastTap > 1800 ? 1 : taps + 1;
        lastTap = now;
        if (taps < 5) return;
        taps = 0;
        const active = document.body.classList.toggle('secret-mode');
        const toast = document.getElementById('secret-toast');
        toast.textContent = active ? 'SECRET UNLOCKED / Welcome to the other side. Five taps to return.' : 'Back to reality.';
        toast.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
    });
});
