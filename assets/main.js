// ===== HERO — 3D PARTICLE NETWORK WITH FLOATING GEOMETRY =====
(function() {
    const canvas = document.getElementById('hero-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // === Particle cloud ===
    const COUNT = 350;
    const positions = new Float32Array(COUNT * 3);
    const velocities = [];
    const SPREAD = 80;

    for (let i = 0; i < COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * SPREAD;
        positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
        positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 0.5;
        velocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.01
        });
    }

    const geoParts = new THREE.BufferGeometry();
    geoParts.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const matParts = new THREE.PointsMaterial({
        color: 0x6c5ce7, size: 0.35, transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(geoParts, matParts));

    // === Connection lines ===
    const linePos = new Float32Array(COUNT * COUNT * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x6c5ce7, transparent: true, opacity: 0.06,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // === Wireframe shapes ===
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x6c5ce7, wireframe: true, transparent: true, opacity: 0.1 });
    const wireMat2 = new THREE.MeshBasicMaterial({ color: 0xa29bfe, wireframe: true, transparent: true, opacity: 0.07 });

    const shapes = [];
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(3.5, 1), wireMat);
    ico.position.set(-28, 14, -12); scene.add(ico); shapes.push(ico);

    const oct = new THREE.Mesh(new THREE.OctahedronGeometry(2.8), wireMat);
    oct.position.set(30, -10, -18); scene.add(oct); shapes.push(oct);

    const torus = new THREE.Mesh(new THREE.TorusGeometry(5, 1, 8, 24), wireMat2);
    torus.position.set(22, 18, -22); scene.add(torus); shapes.push(torus);

    const dodec = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2), wireMat);
    dodec.position.set(-22, -16, -10); scene.add(dodec); shapes.push(dodec);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(3, 0.3, 8, 32), wireMat2);
    ring.position.set(0, -20, -5); scene.add(ring); shapes.push(ring);

    // === Mouse tracking ===
    let mx = 0, my = 0;
    document.addEventListener('mousemove', e => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
        requestAnimationFrame(animate);
        const arr = geoParts.attributes.position.array;

        for (let i = 0; i < COUNT; i++) {
            arr[i*3]   += velocities[i].x;
            arr[i*3+1] += velocities[i].y;
            arr[i*3+2] += velocities[i].z;
            if (Math.abs(arr[i*3])   > SPREAD/2) velocities[i].x *= -1;
            if (Math.abs(arr[i*3+1]) > SPREAD/2) velocities[i].y *= -1;
            if (Math.abs(arr[i*3+2]) > SPREAD/4) velocities[i].z *= -1;
        }
        geoParts.attributes.position.needsUpdate = true;

        // Lines
        let li = 0;
        const la = lineGeo.attributes.position.array;
        const MAX_D = 12;
        for (let i = 0; i < COUNT; i++) {
            for (let j = i + 1; j < COUNT; j++) {
                const dx = arr[i*3]-arr[j*3], dy = arr[i*3+1]-arr[j*3+1], dz = arr[i*3+2]-arr[j*3+2];
                if (dx*dx+dy*dy+dz*dz < MAX_D*MAX_D && li < la.length-6) {
                    la[li++]=arr[i*3]; la[li++]=arr[i*3+1]; la[li++]=arr[i*3+2];
                    la[li++]=arr[j*3]; la[li++]=arr[j*3+1]; la[li++]=arr[j*3+2];
                }
            }
        }
        for (let i = li; i < li+60 && i < la.length; i++) la[i]=0;
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.setDrawRange(0, li/3);

        const t = Date.now() * 0.001;
        shapes.forEach((s, i) => { s.rotation.x = t*(0.12+i*0.04); s.rotation.y = t*(0.08+i*0.06); });

        camera.position.x += (mx*6 - camera.position.x) * 0.015;
        camera.position.y += (-my*4 - camera.position.y) * 0.015;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();

// ===== RUNTIMES SECTION — FLOATING SPHERES + TORUS KNOT =====
(function() {
    const canvas = document.getElementById('runtimes-canvas');
    const wrap = canvas.parentElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
    camera.position.z = 40;

    function resize() {
        const w = wrap.clientWidth, h = wrap.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    const palette = [0x6c5ce7, 0xa29bfe, 0x74b9ff, 0x00b894, 0xfdcb6e];
    const spheres = [];
    for (let i = 0; i < 30; i++) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.25 + Math.random() * 0.7, 16, 16),
            new THREE.MeshBasicMaterial({
                color: palette[i % 5], transparent: true,
                opacity: 0.12 + Math.random() * 0.15, blending: THREE.AdditiveBlending
            })
        );
        mesh.position.set((Math.random()-0.5)*60, (Math.random()-0.5)*24, (Math.random()-0.5)*20);
        mesh.userData = { spd: 0.2+Math.random()*0.3, off: Math.random()*Math.PI*2, amp: 2+Math.random()*4 };
        scene.add(mesh); spheres.push(mesh);
    }

    const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(6, 1.5, 100, 16),
        new THREE.MeshBasicMaterial({ color: 0x6c5ce7, wireframe: true, transparent: true, opacity: 0.035 })
    );
    scene.add(knot);

    resize();

    function animate() {
        requestAnimationFrame(animate);
        const t = Date.now() * 0.001;
        spheres.forEach(s => {
            s.position.y += Math.sin(t*s.userData.spd+s.userData.off)*0.008*s.userData.amp;
            s.position.x += Math.cos(t*s.userData.spd*0.5+s.userData.off)*0.004;
        });
        knot.rotation.x = t*0.04;  knot.rotation.y = t*0.07;
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', resize);
})();

// ===== INTERACTIVE HERO GUI =====
(function() {
    const runningServers = new Set(['flask']);
    const serverMeta = {
        flask:   { name: 'dbg-flask',   fw: 'Flask',        port: 8001, startupMs: 1400 },
        node:    { name: 'dbg-node',    fw: 'Node.js',      port: 8004, startupMs: 2000 },
        php:     { name: 'dbg-php',     fw: 'PHP Built-in', port: 8003, startupMs: 900  },
        donk:    { name: 'donk',        fw: 'Static Files', port: 80,   startupMs: 600  },
        go:      { name: 'testgo',      fw: 'Go',           port: 8005, startupMs: 1100 },
        laravel: { name: 'testlaravel', fw: 'Laravel',      port: 8008, startupMs: 2200 }
    };
    const statIntervals = {};

    function getTime() {
        const d = new Date();
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
    }

    function addLog(cls, text) {
        const out = document.getElementById('consoleOutput');
        if (!out) return;
        const line = document.createElement('div');
        line.className = `clog ${cls}`;
        line.style.opacity = '0';
        line.style.transition = 'opacity 0.3s';
        line.textContent = text;
        out.appendChild(line);
        setTimeout(() => line.style.opacity = '1', 30);
        out.scrollTop = out.scrollHeight;
        if (out.children.length > 20) out.removeChild(out.children[0]);
    }

    function updateStatusBar() {
        const el = document.getElementById('guiStatusText');
        if (el) el.textContent = `${Object.keys(serverMeta).length} servers configured \u2022 ${runningServers.size} running`;
    }

    function startStatUpdater(key) {
        if (statIntervals[key]) return;
        let cpu = 8, mem = 100 + Math.random() * 60;
        statIntervals[key] = setInterval(() => {
            if (!runningServers.has(key)) {
                clearInterval(statIntervals[key]); delete statIntervals[key]; return;
            }
            cpu = Math.max(1, Math.min(90, cpu + (Math.random() - 0.48) * 10));
            mem = Math.max(60, Math.min(320, mem + (Math.random() - 0.5) * 12));
            const row = document.querySelector(`[data-server="${key}"]`);
            if (!row) return;
            const cpuEl = row.querySelector('[data-stat="cpu"]');
            const memEl = row.querySelector('[data-stat="mem"]');
            const cpuVal = Math.round(cpu);
            if (cpuEl) {
                cpuEl.textContent = cpuVal + '%';
                cpuEl.className = `srv-stat ${cpuVal > 70 ? 'high' : 'active'}`;
            }
            if (memEl) { memEl.textContent = Math.round(mem) + ' MB'; memEl.className = 'srv-stat active'; }
        }, 1600);
    }

    window.donkStart = function(key) {
        if (runningServers.has(key)) return;
        const meta = serverMeta[key];
        const row = document.querySelector(`[data-server="${key}"]`);
        if (!row) return;

        const actionsDiv = row.querySelector('.srv-actions');
        actionsDiv.innerHTML = `<button class="srv-btn start srv-btn-pending" disabled>
            <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="5,3 19,12 5,21"/></svg>Starting\u2026
        </button><button class="srv-btn edit">\u270e Edit</button>`;

        const statusCell = row.querySelector('.srv-status');
        statusCell.className = 'srv-status stopped';
        statusCell.innerHTML = '<span class="s-dot s-dot-starting"></span>Starting\u2026';

        setTimeout(() => {
            runningServers.add(key);
            statusCell.className = 'srv-status running';
            statusCell.innerHTML = `<span class="s-dot"></span>Running<div class="srv-bars"><span></span><span></span><span></span></div>`;

            actionsDiv.innerHTML = `<button class="srv-btn stop" onclick="donkStop('${key}')">
                <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>Stop
            </button><button class="srv-btn edit">\u270e Edit</button>`;

            // Add cpu/mem cells if needed
            const cpuEl = row.querySelector('[data-stat="cpu"]');
            const memEl = row.querySelector('[data-stat="mem"]');
            if (cpuEl) cpuEl.textContent = '0%';
            if (memEl) memEl.textContent = '—';

            addLog('ok', `${getTime()} ${meta.name} started on http://127.0.0.1:${meta.port}`);
            setTimeout(() => addLog('out', `${getTime()} INFO: ${meta.fw} ready in ${(meta.startupMs/1000).toFixed(1)}s`), 400);
            setTimeout(() => addLog('out', `${getTime()} INFO: \u2713 Environment loaded`), 900);

            updateStatusBar();
            startStatUpdater(key);

            // Update console server select
            const sel = document.getElementById('consoleServerSelect');
            if (sel && ![...sel.options].some(o => o.value === key)) {
                const opt = document.createElement('option');
                opt.value = key; opt.text = meta.name; sel.add(opt);
            }
        }, meta.startupMs);
    };

    window.donkStop = function(key) {
        if (!runningServers.has(key)) return;
        const meta = serverMeta[key];
        const row = document.querySelector(`[data-server="${key}"]`);
        if (!row) return;

        const actionsDiv = row.querySelector('.srv-actions');
        actionsDiv.innerHTML = `<button class="srv-btn stop srv-btn-pending" disabled>
            <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>Stopping\u2026
        </button><button class="srv-btn edit">\u270e Edit</button>`;

        setTimeout(() => {
            runningServers.delete(key);
            if (statIntervals[key]) { clearInterval(statIntervals[key]); delete statIntervals[key]; }

            const statusCell = row.querySelector('.srv-status');
            statusCell.className = 'srv-status stopped';
            statusCell.innerHTML = '<span class="s-dot"></span>Stopped';

            actionsDiv.innerHTML = `<button class="srv-btn start" onclick="donkStart('${key}')">
                <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="5,3 19,12 5,21"/></svg>Start
            </button><button class="srv-btn edit">\u270e Edit</button>`;

            const cpuEl = row.querySelector('[data-stat="cpu"]');
            const memEl = row.querySelector('[data-stat="mem"]');
            if (cpuEl) { cpuEl.textContent = '0%'; cpuEl.className = 'srv-stat'; }
            if (memEl) { memEl.textContent = '\u2014'; memEl.className = 'srv-stat'; }

            addLog('warn', `${getTime()} ${meta.name} stopped`);
            updateStatusBar();
        }, 1000);
    };

    window.switchConsoleTab = function(el, tab) {
        document.querySelectorAll('.gui-ctab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
    };

    // 3D tilt on mouse move
    const gui = document.getElementById('heroGUI');
    if (gui) {
        const wrap = gui.closest('.hero-gui-wrap');
        wrap.addEventListener('mousemove', (e) => {
            const rect = wrap.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            gui.style.transform = `rotateX(${-y * 5}deg) rotateY(${x * 6}deg)`;
        });
        wrap.addEventListener('mouseleave', () => {
            gui.style.transform = 'rotateX(3deg) rotateY(0deg)';
        });
    }

    // Live stats for the initially running Flask server
    startStatUpdater('flask');
})();

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== NAV SCROLL STATE =====
window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const t = document.querySelector(this.getAttribute('href'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
});

// ===== COUNTER ANIMATE =====
const cObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.stat-num').forEach(el => {
            const target = parseInt(el.textContent);
            let cur = 0; const step = Math.ceil(target / 40);
            const timer = setInterval(() => {
                cur += step;
                if (cur >= target) { cur = target; clearInterval(timer); }
                el.textContent = cur;
            }, 30);
        });
        cObs.unobserve(entry.target);
    });
}, { threshold: 0.5 });
document.querySelectorAll('.stats-row').forEach(el => cObs.observe(el));

// ===== HERO — ROTATING HEADLINE =====
(function() {
    const lines = document.querySelectorAll('.hero-rotate-line');
    if (!lines.length) return;
    let current = 0;

    setInterval(() => {
        const prev = current;
        current = (current + 1) % lines.length;

        // exit current line upward
        lines[prev].classList.remove('active');
        lines[prev].classList.add('exit-up');

        // enter next line from below
        lines[current].classList.remove('exit-up');
        lines[current].classList.add('active');

        // clean exit class after transition
        setTimeout(() => lines[prev].classList.remove('exit-up'), 500);
    }, 2800);
})();

// ===== HERO — TERMINAL TYPING DEMO =====
(function() {
    const cmdEl = document.getElementById('heroTermCmd');
    const outputEl = document.getElementById('heroTermOutput');
    const cursorEl = document.getElementById('heroTermCursor');
    if (!cmdEl || !outputEl) return;

    const sequences = [
        {
            cmd: 'donk start my-app --backend flask',
            output: [
                { text: '✓ Python 3.12 ready', cls: 't-success' },
                { text: '✓ Secrets injected (3 vars)', cls: 't-success' },
                { text: '✓ SSL certificate generated', cls: 't-success' },
                { text: '● Server running at ', cls: 't-info', suffix: '<span class="t-url">https://my-app.test</span>' },
                { text: '  Tunnel: ', cls: 't-muted', suffix: '<span class="t-url">https://abc123.trycloudflare.com</span>' },
            ]
        },
        {
            cmd: 'donk db provision --engine postgres',
            output: [
                { text: '✓ PostgreSQL 16 started on port 5432', cls: 't-success' },
                { text: '✓ Database "my_app_dev" created', cls: 't-success' },
                { text: '✓ Connection string injected → DATABASE_URL', cls: 't-success' },
                { text: '● Visual browser at ', cls: 't-info', suffix: '<span class="t-url">http://localhost:9080/db</span>' },
            ]
        },
        {
            cmd: 'donk doctor scan',
            output: [
                { text: '✓ Dependencies: 0 CVEs found', cls: 't-success' },
                { text: '✓ Secrets: no hardcoded keys', cls: 't-success' },
                { text: '✓ SAST: 0 issues (20 patterns checked)', cls: 't-success' },
                { text: '✓ Endpoints: all write routes require auth', cls: 't-success' },
                { text: '● Verdict: ', cls: 't-info', suffix: '<span class="t-success">Safe to ship ✓</span>' },
            ]
        }
    ];

    let seqIndex = 0;
    let isTyping = false;

    function typeCmd(text, cb) {
        let i = 0;
        cmdEl.textContent = '';
        isTyping = true;
        const iv = setInterval(() => {
            cmdEl.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(iv);
                isTyping = false;
                cb();
            }
        }, 45);
    }

    function showOutput(lines, cb) {
        let i = 0;
        const iv = setInterval(() => {
            const line = lines[i];
            const div = document.createElement('div');
            div.innerHTML = `<span class="${line.cls}">${line.text}</span>${line.suffix || ''}`;
            outputEl.appendChild(div);
            i++;
            if (i >= lines.length) {
                clearInterval(iv);
                cb();
            }
        }, 350);
    }

    function runSequence() {
        const seq = sequences[seqIndex];
        seqIndex = (seqIndex + 1) % sequences.length;
        outputEl.innerHTML = '';
        typeCmd(seq.cmd, () => {
            setTimeout(() => {
                showOutput(seq.output, () => {
                    setTimeout(runSequence, 3000);
                });
            }, 400);
        });
    }

    // start after a brief delay so the page settles
    setTimeout(runSequence, 1500);
})();

/* ===== WAITLIST HANDLER ===== */
function handleWaitlist(e, form) {
    e.preventDefault();
    const email = form.email.value.trim();
    const msgEl = form.querySelector('.waitlist-msg');
    const btn = form.querySelector('.btn-waitlist');
    if (!email) return false;

    btn.disabled = true;
    btn.textContent = 'Joining…';
    msgEl.textContent = '';
    msgEl.className = 'waitlist-msg';

    const formData = new FormData();
    formData.append('emailAddress', email);

    fetch('https://docs.google.com/forms/d/e/1FAIpQLSfShO7jPN9VPOwE-L3y8jox9Ft1es42yPcL6LgOlqH0CgvYnw/formResponse', {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
    })
    .then(function() {
        msgEl.textContent = "You're on the list! We'll be in touch.";
        msgEl.className = 'waitlist-msg success';
        form.email.value = '';
    })
    .catch(function() {
        msgEl.textContent = 'Network error. Please try again.';
        msgEl.className = 'waitlist-msg error';
    })
    .finally(function() {
        btn.disabled = false;
        btn.textContent = 'Join the Waitlist';
    });

    return false;
}