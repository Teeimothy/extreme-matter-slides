(function () {
  function initPulseDemo() {
    var root = document.getElementById('pulse-demo');
    if (!root || root.dataset.ready) return;
    root.dataset.ready = '1';

    root.innerHTML = `
      <div class="demo-stage">
        <div class="demo-head">
          <div>
            <div class="demo-tag">INTERACTION 02 / HISTORY</div>
            <div class="demo-title">相同冲量，意味着相同响应吗？</div>
          </div>
          <div class="demo-tag">NORMALIZED LOADING</div>
        </div>

        <div class="demo-chip-row">
          <span class="demo-chip"><span class="demo-dot" style="background:#45B5F5"></span>Pulse A · reference</span>
          <span class="demo-chip"><span class="demo-dot" style="background:#F5DB4D"></span>Pulse B · adjustable</span>
        </div>

        <svg id="pm-svg" class="demo-svg" viewBox="0 0 820 365" role="img" aria-label="Two pressure-time loading pulses with equal impulse but different peak and duration">
          <line x1="74" y1="92" x2="782" y2="92" stroke="#465568" stroke-opacity=".15" stroke-width="1"/>
          <line x1="74" y1="154" x2="782" y2="154" stroke="#465568" stroke-opacity=".15" stroke-width="1"/>
          <line x1="74" y1="216" x2="782" y2="216" stroke="#465568" stroke-opacity=".15" stroke-width="1"/>
          <line x1="250" y1="50" x2="250" y2="278" stroke="#465568" stroke-opacity=".15" stroke-width="1"/>
          <line x1="426" y1="50" x2="426" y2="278" stroke="#465568" stroke-opacity=".15" stroke-width="1"/>
          <line x1="602" y1="50" x2="602" y2="278" stroke="#465568" stroke-opacity=".15" stroke-width="1"/>
          <line x1="74" y1="278" x2="782" y2="278" stroke="#8794A5" stroke-opacity=".6" stroke-width="1.2"/>
          <line x1="74" y1="278" x2="74" y2="44" stroke="#8794A5" stroke-opacity=".6" stroke-width="1.2"/>
          <text x="24" y="57" fill="#8794A5" font-size="12" font-family="IBM Plex Mono, monospace">P(t)</text>
          <text x="744" y="305" fill="#8794A5" font-size="12" font-family="IBM Plex Mono, monospace">time</text>
          <line id="pm-peak-a" x1="74" x2="782" y1="178" y2="178" stroke="#8794A5" stroke-opacity=".32" stroke-dasharray="5 6"/>
          <line id="pm-peak-b" x1="74" x2="782" y1="178" y2="178" stroke="#8794A5" stroke-opacity=".32" stroke-dasharray="5 6"/>
          <path id="pm-a" fill="rgba(69,181,245,.08)" stroke="#45B5F5" stroke-width="4" stroke-linejoin="round" d=""/>
          <path id="pm-b" fill="rgba(245,219,77,.08)" stroke="#F5DB4D" stroke-width="4" stroke-linejoin="round" d=""/>
          <text id="pm-label-a" x="190" y="165" fill="#45B5F5" font-size="12" font-family="IBM Plex Mono, monospace">A</text>
          <text id="pm-label-b" x="500" y="165" fill="#F5DB4D" font-size="12" font-family="IBM Plex Mono, monospace">B</text>
          <g transform="translate(74 330)">
            <text x="0" y="0" fill="#C8D1DC" font-size="12">Both pulses have the same normalized impulse</text>
            <text x="365" y="0" fill="#F5DB4D" font-size="13" font-family="IBM Plex Mono, monospace">I = ∫ P(t) dt = const.</text>
          </g>
        </svg>

        <div class="demo-divider"></div>
        <div class="demo-control-grid">
          <div>
            <div class="demo-range-row">
              <label for="pm-conc" class="demo-label">Pulse B 集中程度</label>
              <span id="pm-conc-out" class="demo-value">1.60×</span>
            </div>
            <input id="pm-conc" class="demo-input" type="range" min="0.60" max="3.20" step="0.05" value="1.60"/>
            <div class="demo-small-row"><span>broader</span><span>same shape</span><span>shorter / higher</span></div>
          </div>
          <div id="pm-note" class="demo-note">Pulse B 更短、更高，但两者曲线下面积相同。</div>
        </div>

        <div class="demo-stats">
          <div class="demo-stat"><div class="demo-stat-label">IMPULSE A</div><div class="demo-stat-value" style="color:var(--blue-light)">1.00</div></div>
          <div class="demo-stat"><div class="demo-stat-label">IMPULSE B</div><div class="demo-stat-value" style="color:var(--yellow)">1.00</div></div>
          <div class="demo-stat"><div class="demo-stat-label">PEAK B / A</div><div id="pm-peak" class="demo-stat-value">1.60×</div></div>
          <div class="demo-stat"><div class="demo-stat-label">DURATION B / A</div><div id="pm-dur" class="demo-stat-value">0.63×</div></div>
        </div>

        <div class="demo-foot">
          <div>Conceptual triangular pulses · normalized units · equal area by construction</div>
          <button id="pm-reset" type="button" class="demo-button">RESET</button>
        </div>
        <div class="demo-note" style="margin-top:.65rem;"><span style="color:var(--yellow);font-weight:700">Same impulse ≠ same loading history.</span> 实际材料响应还取决于峰值、持续时间、应变率、状态路径、塑性功和相变/损伤动力学。</div>
      </div>`;

    var slider = root.querySelector('#pm-conc');
    var out = root.querySelector('#pm-conc-out');
    var peak = root.querySelector('#pm-peak');
    var dur = root.querySelector('#pm-dur');
    var note = root.querySelector('#pm-note');
    var pathA = root.querySelector('#pm-a');
    var pathB = root.querySelector('#pm-b');
    var labelA = root.querySelector('#pm-label-a');
    var labelB = root.querySelector('#pm-label-b');
    var lineA = root.querySelector('#pm-peak-a');
    var lineB = root.querySelector('#pm-peak-b');
    var reset = root.querySelector('#pm-reset');

    var baseY = 278, centerA = 270, centerB = 560, widthA = 220, heightA = 100;

    function triPath(cx, w, h) {
      var x0 = cx - w / 2, x1 = cx, x2 = cx + w / 2, y = baseY - h;
      return 'M ' + x0.toFixed(1) + ' ' + baseY + ' L ' + x1.toFixed(1) + ' ' + y.toFixed(1) + ' L ' + x2.toFixed(1) + ' ' + baseY + ' Z';
    }

    function render() {
      var c = Number(slider.value) || 1;
      c = Math.max(0.6, Math.min(3.2, c));
      var widthB = widthA / c, heightB = heightA * c;
      out.textContent = c.toFixed(2) + '×';
      peak.textContent = c.toFixed(2) + '×';
      dur.textContent = (1 / c).toFixed(2) + '×';
      pathA.setAttribute('d', triPath(centerA, widthA, heightA));
      pathB.setAttribute('d', triPath(centerB, widthB, heightB));
      lineA.setAttribute('y1', baseY - heightA); lineA.setAttribute('y2', baseY - heightA);
      lineB.setAttribute('y1', baseY - heightB); lineB.setAttribute('y2', baseY - heightB);
      labelA.setAttribute('x', centerA - 5); labelA.setAttribute('y', baseY - heightA - 12);
      labelB.setAttribute('x', centerB - 5); labelB.setAttribute('y', Math.max(38, baseY - heightB - 12));
      if (Math.abs(c - 1) < 0.06) note.textContent = 'Pulse A 与 B 的峰值和持续时间几乎相同。';
      else if (c > 1) note.textContent = 'Pulse B 更短、更高，但两者曲线下面积相同。';
      else note.textContent = 'Pulse B 更宽、更低，但两者曲线下面积仍然相同。';
    }

    slider.addEventListener('input', render);
    reset.addEventListener('click', function () { slider.value = '1.60'; render(); });
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPulseDemo);
  else initPulseDemo();
  document.addEventListener('slidechanged', initPulseDemo);
})();
