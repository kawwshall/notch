/*
 * Renders the Notch tally device from data attributes, mirroring the geometry
 * in src/components/tally.tsx exactly so these previews can't drift from the
 * shipped component.
 *
 *   <span data-tally data-total="10" data-remaining="3" data-health="low"></span>
 */
(function () {
  const STEP = 6;
  const GROUP_GAP = 11;
  const OVERHANG = 3;
  const HEIGHT = 24;
  const STROKE = 2;
  const GROUP_SPAN = STEP * 3 + OVERHANG * 2;
  const GROUP_PITCH = GROUP_SPAN + GROUP_GAP;

  const HEALTH = { ok: "var(--ok)", low: "var(--low)", out: "var(--out)" };

  const groupWidth = (n) => (n === 0 ? 0 : Math.ceil(n / 5) * GROUP_PITCH - GROUP_GAP);

  function run(count, color, offset) {
    let out = "";
    for (let i = 0; i < count; i++) {
      const groupX = offset + Math.floor(i / 5) * GROUP_PITCH;
      const pos = i % 5;
      if (pos === 4) {
        // The fifth mark is the diagonal struck across the other four.
        out += `<line x1="${groupX}" y1="${HEIGHT - 2}" x2="${groupX + STEP * 3 + OVERHANG * 2}" y2="2" stroke="${color}" stroke-width="${STROKE}" stroke-linecap="round"/>`;
      } else {
        const x = groupX + OVERHANG + pos * STEP;
        out += `<line x1="${x}" y1="1" x2="${x}" y2="${HEIGHT - 1}" stroke="${color}" stroke-width="${STROKE}" stroke-linecap="round"/>`;
      }
    }
    return out;
  }

  document.querySelectorAll("[data-tally]").forEach((el) => {
    const total = Number(el.dataset.total);
    const remaining = Math.min(total, Math.max(0, Number(el.dataset.remaining)));
    const health = el.dataset.health || "ok";
    const scale = Number(el.dataset.scale || 1);

    const used = total - remaining;
    const usedW = groupWidth(used);
    const divide = used > 0 && remaining > 0 ? GROUP_GAP + 5 : 0;
    const width = Math.max(usedW + divide + groupWidth(remaining), 1);

    el.innerHTML =
      `<svg width="${width * scale}" height="${HEIGHT * scale}" viewBox="0 0 ${width} ${HEIGHT}" fill="none" role="img" aria-label="${remaining} of ${total} sessions remaining">` +
      run(used, "var(--rule)", 0) +
      run(remaining, HEALTH[health], usedW + divide) +
      `</svg>`;
  });
})();
