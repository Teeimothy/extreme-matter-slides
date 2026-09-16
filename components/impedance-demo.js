(function () {
  function initImpedanceDemo() {
    var root = document.getElementById('impedance-demo');
    if (!root || root.dataset.ready) return;
    root.dataset.ready = '1';

    root.innerHTML = `
      <div class="demo-stage">
        <div class="demo-head">
          <div>
            <div class="demo-tag">INTERACTION 01 / COUPLING</div>
            <div class="demo-title">波遇到材料界面时，会发生什么？</div>
          </div>
          <div class="demo-tag">LINEAR ACOUSTIC ANALOGY</div>
        </div>

        <svg id="wm-svg" class="demo-svg" viewBox="0 0 820 330" role="img" aria-label="Wave reflection and transmission at a material interface">
          <rect x="24" y="54" width="380" height="210" rx="10" fill="#0C1622"/>
          <rect x="416" y="54" width="380" height="210" rx="10" fill="#111E2B"/>
          <line x1="410" y1="42" x2="410" y2="276" stroke="#C8D1DC" stroke-opacity=".62" stroke-width="2"/>
          <text x="42" y="78" fill="#C8D1DC" font-size="14">Material A</text>
          <text x="42" y="97" fill="#8794A5" font-size="11" font-family="IBM Plex Mono, monospace">Z₁</text>
          <text x="436" y="78" fill="#C8D1DC" font-size="14">Material B</text>
          <text x="436" y="97" fill="#8794A5" font-size="11" font-family="IBM Plex Mono, monospace">Z₂</text>
          <g id="wm-particles"></g>
          <path id="wm-inc" fill="none" stroke="#45B5F5" stroke-width="4" stroke-linecap="round"/>
          <path id="wm-ref" fill="none" stroke="#37C6C0" stroke-width="4" stroke-linecap="round"/>
          <path id="wm-trans" fill="none" stroke="#F5DB4D" stroke-width="4" stroke-linecap="round"/>
          <line x1="170" y1="118" x2="292" y2="118" stroke="#45B5F5" stroke-width="2"/>
          <polygon points="292,118 280,112 280,124" fill="#45B5F5"/>
          <text x="170" y="106" fill="#45B5F5" font-size="11" font-family="IBM Plex Mono, monospace">INCIDENT</text>
          <line x1="300" y1="224" x2="205" y2="224" stroke="#37C6C0" stroke-width="2"/>
          <polygon points="205,224 217,218 217,230" fill="#37C6C0"/>
          <text x="226" y="212" fill="#37C6C0" font-size="11" font-family="IBM Plex Mono, monospace">REFLECTED</text>
          <line x1="510" y1="118" x2="630" y2="118" stroke="#F5DB4D" stroke-width="2"/>
          <polygon points="630,118 618,112 618,124" fill="#F5DB4D"/>
          <text x="510" y="106" fill="#F5DB4D" font-size="11" font-family="IBM Plex Mono, monospace">TRANSMITTED</text>
        </svg>

        <div class="demo-divider"></div>
        <div class="demo-control-grid">
          <div>
            <div class="demo-range-row">
              <label for="wm-ratio" class="demo-label">阻抗比 <span class="mono" style="color:var(--text-muted)">Z₂ / Z₁</span></label>
              <span id="wm-ratio-out" class="demo-value">1.00</span>
            </div>
            <input id="wm-ratio" class="demo-input" type="range" min="0.2" max="5" step="0.05" value="1"/>
            <div class="demo-small-row"><span>0.2</span><span>matched</span><span>5.0</span></div>
          </div>
          <div id="wm-note" class="demo-note">阻抗匹配：反射最小，能量主要向材料 B 传播。</div>
        </div>

        <div class="demo-stats" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
          <div class="demo-stat"><div class="demo-stat-label">PRESSURE REFLECTION</div><div id="wm-rp" class="demo-stat-value" style="color:var(--cyan)">0.00</div></div>
          <div class="demo-stat"><div class="demo-stat-label">REFLECTED ENERGY</div><div id="wm-ri" class="demo-stat-value">0%</div></div>
          <div class="demo-stat"><div class="demo-stat-label">TRANSMITTED ENERGY</div><div id="wm-ti" class="demo-stat-value" style="color:var(--yellow)">100%</div></div>
        </div>

        <div class="demo-foot">
          <div>Rₚ = (Z₂−Z₁)/(Z₂+Z₁) · schematic normal-incidence model</div>
          <button id="wm-toggle" type="button" class="demo-button">PAUSE</button>
        </div>
      </div>`;

    var slider = root.querySelector('#wm-ratio');
    var out = root.querySelector('#wm-ratio-out');
    var rp = root.querySelector('#wm-rp');
    var ri = root.querySelector('#wm-ri');
    var ti = root.querySelector('#wm-ti');
    var note = root.querySelector('#wm-note');
    var inc = root.querySelector('#wm-inc');
    var ref = root.querySelector('#wm-ref');
    var trans = root.querySelector('#wm-trans');
    var pg = root.querySelector('#wm-particles');
    var toggle = root.querySelector('#wm-toggle');

    var phase = 0;
    var running = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function coeff() {
      var r = Math.max(0.2, Math.min(5, Number(slider.value) || 1));
      var R = (r - 1) / (r + 1);
      var RE = R * R;
      return { r: r, R: R, RE: RE, TE: 1 - RE };
    }

    function wavePath(x0, x1, y, a, p, d) {
      var s = '';
      for (var x = x0; x <= x1; x += 4) {
        var yy = y + a * Math.sin(0.055 * x + d * p);
        s += (x === x0 ? 'M' : 'L') + x + ',' + yy.toFixed(1) + ' ';
      }
      return s;
    }

    function drawParticles(c) {
      if (!pg.dataset.built) {
        var h = '';
        for (var x = 54; x < 780; x += 34) {
          for (var y = 150; y <= 198; y += 24) {
            h += '<circle cx="' + x + '" cy="' + y + '" r="3" fill="#C8D1DC" opacity=".42"/>';
          }
        }
        pg.innerHTML = h;
        pg.dataset.built = '1';
      }
      Array.prototype.forEach.call(pg.children, function (el) {
        var x = Number(el.getAttribute('cx'));
        var a = x < 410 ? 2.7 : 2.7 * Math.sqrt(c.TE);
        var dx = a * Math.sin(0.052 * x - phase);
        el.setAttribute('transform', 'translate(' + dx.toFixed(2) + ' 0)');
      });
    }

    function render() {
      var c = coeff();
      out.textContent = c.r.toFixed(2);
      rp.textContent = (c.R >= 0 ? '+' : '') + c.R.toFixed(2);
      ri.textContent = Math.round(c.RE * 100) + '%';
      ti.textContent = Math.round(c.TE * 100) + '%';
      inc.setAttribute('d', wavePath(38, 402, 132, 19, phase, -1));
      ref.setAttribute('d', wavePath(38, 402, 220, 19 * Math.abs(c.R), phase, 1));
      trans.setAttribute('d', wavePath(418, 788, 132, 19 * Math.sqrt(c.TE), phase, -1));
      ref.style.strokeDasharray = c.R < 0 ? '7 5' : 'none';
      if (Math.abs(c.r - 1) < 0.06) note.textContent = '阻抗匹配：反射最小，能量主要向材料 B 传播。';
      else if (c.r > 1) note.textContent = 'Z₂ > Z₁：产生同相压力反射；阻抗差越大，反射越明显。';
      else note.textContent = 'Z₂ < Z₁：反射压力发生相位反转；阻抗差越大，反射越明显。';
      drawParticles(c);
    }

    slider.addEventListener('input', render);
    toggle.addEventListener('click', function () {
      running = !running;
      toggle.textContent = running ? 'PAUSE' : 'PLAY';
      render();
    });

    function tick() {
      if (running) {
        phase += 0.08;
        render();
      }
      window.requestAnimationFrame(tick);
    }
    render();
    toggle.textContent = running ? 'PAUSE' : 'PLAY';
    window.requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initImpedanceDemo);
  else initImpedanceDemo();
  document.addEventListener('slidechanged', initImpedanceDemo);
})();
