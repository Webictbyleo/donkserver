/**
 * Shared navigation for Donk feature pages.
 * Include via <script src="../assets/feature-nav.js"></script> at end of <body>.
 *
 * Detects whether it's on the features index or a sub-page
 * and renders the full nav with mobile toggle, matching the main site.
 */
(function () {
    const isIndex = location.pathname.endsWith('/features/') ||
                    location.pathname.endsWith('/features/index.html');

    const nav = document.getElementById('nav');
    if (!nav) return;

    nav.innerHTML = `
    <div class="nav-inner">
        <a href="../" class="nav-brand"><img src="../assets/donk_64.png" alt="Donk">Donk</a>
        <div class="nav-links" id="navLinks">
            <a href="./">All Features</a>
            <a href="framework-templates.html">Frameworks</a>
            <a href="api-mocking.html">API Mocking</a>
            <a href="http-gateway.html">Gateway</a>
            <a href="donk-doctor.html">Doctor</a>
            <a href="../#pricing">Pricing</a>
        </div>
        <div class="nav-cta">
            <a href="../#download" class="btn btn-primary btn-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
            </a>
        </div>
        <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
    </div>`;

    document.getElementById('mobileToggle')
        .addEventListener('click', function () {
            document.getElementById('navLinks').classList.toggle('show');
        });
})();
