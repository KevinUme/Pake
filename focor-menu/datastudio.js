// ===== Focor Data Studio — custom right-click menu (injected) =====
(function () {
  if (window.__focorCtx) return;
  window.__focorCtx = true;

  const I = {
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    explorer:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="15.5 8.5 13.2 13.2 8.5 15.5 10.8 10.8"/></svg>',
    timeline:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.05 11A9 9 0 1 1 6 18.36"/><path d="M3 4v5h5"/><path d="M12 7.5V12l3 2"/></svg>',
    genesis:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M8.5 6.5 15.5 11M8.5 17.5 15.5 13"/></svg>',
    related:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="18" r="2.4"/><circle cx="19" cy="18" r="2.4"/><path d="M12 7.4v3.2M10.6 12.5 6.4 16M13.4 12.5 17.6 16"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };

  const TRUNC = (s, n) => (s.length > n ? s.slice(0, n) + "…" : s);

  function model(sel) {
    const has = !!sel;
    const eg = (t) => ({ example: t });
    return [
      {
        type: "item",
        id: "copy",
        label: "Copy",
        icon: I.copy,
        hint: "⌘C",
        disabled: !has,
        info: {
          title: "Copy",
          desc: "Copy the selected text to your clipboard.",
          sel: true,
        },
      },
      {
        type: "item",
        id: "search",
        label: has ? `Search Google for “${TRUNC(sel, 26)}”` : "Search Google",
        icon: I.search,
        disabled: !has,
        info: {
          title: "Search with Google",
          desc: "Open a Google search for the selected text in your default browser.",
          sel: true,
        },
      },
      { type: "sep" },
      { type: "label", label: "Data Studio" },
      {
        type: "item",
        id: "explorer",
        label: "Open in Explorer",
        icon: I.explorer,
        badge: "Preview",
        info: {
          title: "Open in Explorer",
          desc: "Pivot this into the knowledge Explorer and inspect it in full graph context — entities, edges, and everything it touches.",
          ...eg("Opens in Explorer"),
        },
      },
      {
        type: "item",
        id: "timeline",
        label: "View on Timeline",
        icon: I.timeline,
        badge: "Preview",
        info: {
          title: "View on Timeline",
          desc: "Jump to this on your Timeline — when it happened and what surrounded it across people, meetings, and decisions.",
          ...eg("Jumps to the Timeline"),
        },
      },
      {
        type: "item",
        id: "genesis",
        label: "Trace Genesis",
        icon: I.genesis,
        badge: "Preview",
        info: {
          title: "Trace Genesis",
          desc: "Trace this back to the exact email, meeting, or message that produced it. Every data point has a source — no black boxes.",
          ...eg("Opens the source moment"),
        },
      },
      {
        type: "item",
        id: "related",
        label: "Find related",
        icon: I.related,
        badge: "Preview",
        info: {
          title: "Find related",
          desc: "Surface the people, companies, decisions, and threads connected to this — across your whole graph.",
          ...eg("Shows connected entities"),
        },
      },
    ];
  }

  let menuEl = null,
    infoEl = null,
    items = [],
    curSel = "";

  function close() {
    if (menuEl) menuEl.remove();
    if (infoEl) infoEl.remove();
    menuEl = infoEl = null;
    items = [];
    document.removeEventListener("mousedown", onDocDown, true);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("blur", close);
    window.removeEventListener("resize", close);
  }

  function onDocDown(e) {
    if (menuEl && !menuEl.contains(e.target)) close();
  }
  function onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  function toast(text) {
    const t = document.createElement("div");
    t.className = "focor-ctx-toast focor-ctx-root";
    t.innerHTML = `<span class="focor-ctx-dot"></span><span>${text}</span>`;
    (document.body || document.documentElement).appendChild(t);
    requestAnimationFrame(() => t.classList.add("is-visible"));
    setTimeout(() => {
      t.classList.remove("is-visible");
      setTimeout(() => t.remove(), 220);
    }, 1500);
  }

  function showInfo(itemEl, data) {
    if (!data.info) {
      if (infoEl) infoEl.classList.remove("is-visible");
      return;
    }
    if (!infoEl) {
      infoEl = document.createElement("div");
      infoEl.className = "focor-ctx-info focor-ctx-root";
      (document.body || document.documentElement).appendChild(infoEl);
    }
    const info = data.info;
    let html = `<div class="focor-ctx-info-ico">${data.icon}</div>`;
    html += `<div class="focor-ctx-info-title">${info.title}</div>`;
    html += `<p class="focor-ctx-info-desc">${info.desc}</p>`;
    if (info.sel && curSel)
      html += `<div class="focor-ctx-info-sel"><b>Selection:</b> ${TRUNC(curSel.replace(/</g, "&lt;"), 120)}</div>`;
    if (info.example)
      html += `<div class="focor-ctx-info-eg"><span style="width:14px;height:14px;display:inline-flex">${I.arrow}</span>${info.example}</div>`;
    infoEl.innerHTML = html;

    const mr = menuEl.getBoundingClientRect();
    const ir = itemEl.getBoundingClientRect();
    const pw = 268,
      vw = window.innerWidth,
      vh = window.innerHeight;
    let left = mr.right + 8;
    if (left + pw > vw - 8) left = mr.left - pw - 8;
    if (left < 8) left = 8;
    infoEl.style.left = left + "px";
    infoEl.style.visibility = "hidden";
    infoEl.classList.add("is-visible");
    const ph = infoEl.offsetHeight;
    let top = ir.top;
    if (top + ph > vh - 8) top = vh - ph - 8;
    if (top < 8) top = 8;
    infoEl.style.top = top + "px";
    infoEl.style.visibility = "visible";
  }

  function act(id) {
    if (id === "copy") {
      if (curSel && navigator.clipboard)
        navigator.clipboard.writeText(curSel).catch(() => {});
    } else if (id === "search") {
      if (curSel)
        window.open(
          "https://www.google.com/search?q=" + encodeURIComponent(curSel),
          "_blank",
        );
    } else {
      const names = {
        explorer: "Open in Explorer",
        timeline: "View on Timeline",
        genesis: "Trace Genesis",
        related: "Find related",
      };
      toast(`${names[id]} — preview (not wired up yet)`);
    }
    close();
  }

  function open(x, y) {
    close();
    curSel = (window.getSelection ? String(window.getSelection()) : "").trim();
    const data = model(curSel);

    menuEl = document.createElement("div");
    menuEl.className = "focor-ctx-menu focor-ctx-root";

    data.forEach((d) => {
      if (d.type === "sep") {
        const s = document.createElement("div");
        s.className = "focor-ctx-sep";
        menuEl.appendChild(s);
        return;
      }
      if (d.type === "label") {
        const l = document.createElement("div");
        l.className = "focor-ctx-label";
        l.innerHTML = `<span class="focor-ctx-dot"></span>${d.label}`;
        menuEl.appendChild(l);
        return;
      }
      const el = document.createElement("div");
      el.className = "focor-ctx-item" + (d.disabled ? " is-disabled" : "");
      const right = d.badge
        ? `<span class="focor-ctx-badge">${d.badge}</span>`
        : d.hint
          ? `<span class="focor-ctx-hint">${d.hint}</span>`
          : "";
      el.innerHTML = `<span class="focor-ctx-ico">${d.icon}</span><span class="focor-ctx-text">${d.label}</span>${right}`;
      el.addEventListener("mouseenter", () => {
        items.forEach((o) => o.el.classList.remove("is-active"));
        if (!d.disabled) el.classList.add("is-active");
        showInfo(el, d);
      });
      el.addEventListener("mouseup", (e) => {
        e.preventDefault();
        if (!d.disabled) act(d.id);
      });
      menuEl.appendChild(el);
      items.push({ el, d });
    });

    menuEl.style.left = "-9999px";
    (document.body || document.documentElement).appendChild(menuEl);
    const mw = menuEl.offsetWidth,
      mh = menuEl.offsetHeight;
    const vw = window.innerWidth,
      vh = window.innerHeight;
    if (x + mw > vw - 6) x = vw - mw - 6;
    if (y + mh > vh - 6) y = vh - mh - 6;
    menuEl.style.left = Math.max(6, x) + "px";
    menuEl.style.top = Math.max(6, y) + "px";

    document.addEventListener("mousedown", onDocDown, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("blur", close);
    window.addEventListener("resize", close);
  }

  window.addEventListener(
    "contextmenu",
    function (e) {
      e.preventDefault();
      e.stopPropagation();
      open(e.clientX, e.clientY);
    },
    true,
  );

  console.log("[Focor Data Studio] custom context menu ready");
})();
