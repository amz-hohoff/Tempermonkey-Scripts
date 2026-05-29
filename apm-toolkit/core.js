// core.js – APM Toolkit Kernlogik
// Wird vom loader.user.js geladen. CONFIG wird automatisch übergeben.
'use strict';

const PREFIX_OPTIONS    = CONFIG.prefixOptions    || [];
const COMMENT_TEMPLATES = CONFIG.commentTemplates || [];

const PREFIX_BTN_ID   = 'apm-prefix-btn';
const PREFIX_DROP_ID  = 'apm-prefix-dropdown';
const COMMENT_BTN_ID  = 'apm-comment-btn';
const COMMENT_DROP_ID = 'apm-comment-dropdown';

// ── Gemeinsame Hilfsfunktionen ────────────────────────────────────────────────

function setExtValue(el, value) {
    const cmpId = el.getAttribute('data-componentid');
    if (cmpId && window.Ext) {
        try {
            const cmp = Ext.getCmp(cmpId);
            if (cmp && typeof cmp.setValue === 'function') { cmp.setValue(value); el.focus(); return; }
        } catch (_) { }
    }
    const proto  = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.focus();
}

function createToolbarButton(label, tooltip) {
    const COLOR = '#4a7fc1', HOVER = '#3568a8';
    const btn   = document.createElement('button');
    btn.type = 'button'; btn.textContent = label; btn.title = tooltip;
    Object.assign(btn.style, {
        display: 'inline-block', marginLeft: '5px', padding: '0 9px', height: '22px',
        fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif', cursor: 'pointer',
        backgroundColor: COLOR, color: '#ffffff', border: '1px solid #2d60a8',
        borderRadius: '3px', verticalAlign: 'middle', whiteSpace: 'nowrap',
        lineHeight: '20px', boxSizing: 'border-box', flexShrink: '0', outline: 'none', transition: 'background 0.1s',
    });
    btn.addEventListener('mouseenter', () => btn.style.backgroundColor = HOVER);
    btn.addEventListener('mouseleave', () => btn.style.backgroundColor = COLOR);
    return btn;
}

function attachButtonToField(el, btn) {
    const triggerWrap = el.closest('.x-form-trigger-wrap');
    if (triggerWrap) {
        const bodyEl = triggerWrap.parentElement;
        if (bodyEl) { bodyEl.style.display = 'flex'; bodyEl.style.alignItems = 'center'; bodyEl.style.flexWrap = 'nowrap'; }
        triggerWrap.insertAdjacentElement('afterend', btn);
    } else {
        el.insertAdjacentElement('afterend', btn);
    }
}

/** Hängt den Comment-Button in die Label-Spalte links der Textarea.
 *  Nicht-invasiv: kein Flex auf dem Label-Element → Textarea-Layout bleibt original.
 *  Responsive: bei wenig Platz wird der Text ausgeblendet → nur "▾" sichtbar. */
function attachButtonToTextarea(el, btn) {
    const formItem = el.closest('.x-form-item');
    const labelEl  = formItem ? formItem.querySelector('.x-form-item-label') : null;

    if (labelEl) {
        // Wrapper-Div: kein Eingriff in das Label-Layout, nur Block-Container
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, {
            textAlign:    'right',
            paddingRight: '8px',   // passend zum Label-padding-right
            marginTop:    '5px',
        });

        // Button: width auto, kein calc() – nur so breit wie der Text
        btn.style.position   = 'static';
        btn.style.marginLeft = '0';
        btn.style.width      = 'auto';
        btn.style.maxWidth   = '100%';

        wrapper.appendChild(btn);
        labelEl.appendChild(wrapper);

        // Responsive: Text ausblenden wenn Label-Zelle zu schmal
        const FULL = '▾ Comment';
        const MINI = '▾';
        const THRESHOLD = 88; // px

        const updateText = () => {
            const w = labelEl.getBoundingClientRect().width;
            btn.textContent = (w > 0 && w < THRESHOLD) ? MINI : FULL;
        };

        const ro = new ResizeObserver(updateText);
        ro.observe(labelEl);
        updateText();

    } else {
        // Fallback: absolut oben-rechts in der Textarea-Box
        const triggerWrap = el.closest('.x-form-trigger-wrap');
        if (!triggerWrap) { el.insertAdjacentElement('afterend', btn); return; }
        triggerWrap.style.position = 'relative';
        btn.style.position   = 'absolute';
        btn.style.top        = '4px';
        btn.style.right      = '4px';
        btn.style.marginLeft = '0';
        btn.style.zIndex     = '100';
        triggerWrap.appendChild(btn);
    }
}


function positionDropdown(drop, btn, minWidth) {
    const rect = btn.getBoundingClientRect();
    let left = rect.left;
    if (left + minWidth > window.innerWidth - 8) left = window.innerWidth - minWidth - 8;
    drop.style.top = (rect.bottom + 3) + 'px';
    drop.style.left = left + 'px';
}

function createDropdownContainer(minWidth) {
    const drop = document.createElement('div');
    Object.assign(drop.style, {
        display: 'none', position: 'fixed', zIndex: '2147483647', backgroundColor: '#ffffff',
        border: '1px solid #c0c0c0', borderRadius: '4px', boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
        minWidth: minWidth + 'px', padding: '0', fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '13px', lineHeight: '1.4', userSelect: 'none', overflow: 'hidden',
    });
    document.body.appendChild(drop);
    return drop;
}

const openDropdowns = new Set();
function closeAllDropdowns() { openDropdowns.forEach(fn => fn()); }
document.addEventListener('click',   closeAllDropdowns, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllDropdowns(); });

// ════════════════════════════════════════════════════════════════════════════════
// MODUL 1 – Titel-Präfix
// ════════════════════════════════════════════════════════════════════════════════

function findTitleInput() {
    return document.querySelector('input[name="description"].x-form-text[aria-readonly="false"]:not([aria-disabled="true"])');
}

function applyPrefix(input, label) {
    let current = input.value;
    for (const opt of PREFIX_OPTIONS) {
        if (current.startsWith(opt.label + ' ')) { current = current.slice(opt.label.length + 1); break; }
        if (current === opt.label)               { current = ''; break; }
    }
    setExtValue(input, label + ' ' + current);
}

function buildPrefixDropdown(input) {
    let drop = document.getElementById(PREFIX_DROP_ID);
    if (drop) { drop._input = input; return drop; }
    drop = createDropdownContainer(380);
    drop.id = PREFIX_DROP_ID; drop._input = input;

    const thead = document.createElement('div');
    Object.assign(thead.style, { display: 'flex', padding: '5px 12px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', gap: '12px' });
    const mkTh = (text, minW) => {
        const th = document.createElement('span');
        th.textContent = text;
        Object.assign(th.style, { minWidth: minW, fontWeight: 'bold', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em' });
        return th;
    };
    thead.appendChild(mkTh('Präfix', '110px')); thead.appendChild(mkTh('Beschreibung', 'auto'));
    drop.appendChild(thead);

    PREFIX_OPTIONS.forEach((opt, i) => {
        const row = document.createElement('div');
        Object.assign(row.style, { display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '12px', cursor: 'pointer', transition: 'background 0.08s', borderBottom: i < PREFIX_OPTIONS.length - 1 ? '1px solid #f0f0f0' : 'none' });
        const lbl = document.createElement('span');
        lbl.textContent = opt.label;
        Object.assign(lbl.style, { minWidth: '110px', fontFamily: '"Courier New", monospace', fontWeight: 'bold', fontSize: '13px', color: '#1557b0', whiteSpace: 'nowrap' });
        const dsc = document.createElement('span');
        dsc.textContent = opt.desc;
        Object.assign(dsc.style, { fontSize: '12px', color: '#555' });
        row.addEventListener('mouseenter', () => { row.style.backgroundColor = '#e8f0fe'; lbl.style.color = '#0d47a1'; });
        row.addEventListener('mouseleave', () => { row.style.backgroundColor = '';        lbl.style.color = '#1557b0'; });
        row.addEventListener('mousedown', e => { e.preventDefault(); applyPrefix(drop._input, opt.label); closePrefixDropdown(); });
        row.appendChild(lbl); row.appendChild(dsc); drop.appendChild(row);
    });
    return drop;
}

function closePrefixDropdown() {
    const d = document.getElementById(PREFIX_DROP_ID);
    if (d) d.style.display = 'none';
    openDropdowns.delete(closePrefixDropdown);
}

function injectPrefixButton(input) {
    if (document.getElementById(PREFIX_BTN_ID)) return;
    const btn = createToolbarButton('▾ Präfix', 'Präfix vor den Titel schreiben');
    btn.id = PREFIX_BTN_ID;
    const drop = buildPrefixDropdown(input);
    btn.addEventListener('click', e => {
        e.stopPropagation(); drop._input = findTitleInput() || input;
        if (drop.style.display !== 'none') { closePrefixDropdown(); }
        else { closeAllDropdowns(); positionDropdown(drop, btn, 380); drop.style.display = 'block'; openDropdowns.add(closePrefixDropdown); }
    });
    attachButtonToField(input, btn);
}

// ════════════════════════════════════════════════════════════════════════════════
// MODUL 2 – Comment-Templates
// ════════════════════════════════════════════════════════════════════════════════

function findCommentTextarea() {
    return document.querySelector('textarea[name="udfnote01"].x-form-text[aria-readonly="false"]:not([aria-disabled="true"])');
}


/**
 * Fügt ein Comment-Template in die Textarea ein.
 *
 * Optionale Template-Felder (config.json):
 *   guardLine     – Wenn die erste Zeile des Felds exakt diesem String entspricht,
 *                   wird das Template NICHT eingefügt (Schutz vor Doppelung).
 *   appendWithDate – true → Inhalt wird IMMER angehängt (nie ersetzt),
 *                   mit "___UPDATE-DD/MM/YY___" als Trenner.
 */
function applyCommentTemplate(textarea, tpl) {
    const current = textarea.value;

    // ── Guard: Doppelung verhindern ──────────────────────────────────────────
    if (tpl.guardLine) {
        // Schützt auch bearbeiteten Text – solange der Schlüsselbegriff irgendwo vorkommt
        if (current.includes(tpl.guardLine.trim())) {
            // Visuelles Feedback: Button kurz orange färben
            const btn = document.getElementById(COMMENT_BTN_ID);
            if (btn) {
                const prev = btn.style.backgroundColor;
                btn.textContent       = '⚠ Bereits vorhanden';
                btn.style.backgroundColor = '#e67e22';
                setTimeout(() => {
                    btn.textContent        = '▾ Comment';
                    btn.style.backgroundColor = prev;
                }, 2000);
            }
            return;
        }
    }

    // ── Anhängen mit Datums-Trenner ──────────────────────────────────────────
    if (tpl.appendWithDate) {
        const now = new Date();
        const dd  = String(now.getDate()).padStart(2, '0');
        const mm  = String(now.getMonth() + 1).padStart(2, '0');
        const yy  = String(now.getFullYear()).slice(-2);
        const sep = `___UPDATE-${dd}/${mm}/${yy}___`;
        const newValue = current
            ? current.trimEnd() + '\n\n' + sep + '\n' + tpl.text
            : tpl.text;
        setExtValue(textarea, newValue);
        return;
    }

    // ── Standard: ersetzen ───────────────────────────────────────────────────
    setExtValue(textarea, tpl.text);
}

function buildCommentDropdown(textarea) {
    let drop = document.getElementById(COMMENT_DROP_ID);
    if (drop) { drop._textarea = textarea; return drop; }
    drop = createDropdownContainer(220);
    drop.id = COMMENT_DROP_ID; drop._textarea = textarea;

    const thead = document.createElement('div');
    Object.assign(thead.style, { padding: '5px 12px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', fontSize: '11px', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em' });
    thead.textContent = 'Template wählen';
    drop.appendChild(thead);

    COMMENT_TEMPLATES.forEach((tpl, i) => {
        const row = document.createElement('div');
        row.textContent = tpl.title;
        row.title       = tpl.text;
        Object.assign(row.style, { padding: '9px 16px', cursor: 'pointer', color: '#1a1a1a', fontSize: '13px', transition: 'background 0.08s', whiteSpace: 'nowrap', borderBottom: i < COMMENT_TEMPLATES.length - 1 ? '1px solid #f0f0f0' : 'none' });
        row.addEventListener('mouseenter', () => { row.style.backgroundColor = '#e8f0fe'; row.style.color = '#0d47a1'; });
        row.addEventListener('mouseleave', () => { row.style.backgroundColor = '';        row.style.color = '#1a1a1a'; });
        row.addEventListener('mousedown', e => { e.preventDefault(); applyCommentTemplate(drop._textarea, tpl); closeCommentDropdown(); });
        drop.appendChild(row);
    });
    return drop;
}

function closeCommentDropdown() {
    const d = document.getElementById(COMMENT_DROP_ID);
    if (d) d.style.display = 'none';
    openDropdowns.delete(closeCommentDropdown);
}

function injectCommentButton(textarea) {
    if (document.getElementById(COMMENT_BTN_ID)) return;
    const btn = createToolbarButton('▾ Comment', 'Comment-Template einfügen');
    btn.id = COMMENT_BTN_ID;
    const drop = buildCommentDropdown(textarea);
    btn.addEventListener('click', e => {
        e.stopPropagation(); drop._textarea = findCommentTextarea() || textarea;
        if (drop.style.display !== 'none') { closeCommentDropdown(); }
        else { closeAllDropdowns(); positionDropdown(drop, btn, 220); drop.style.display = 'block'; openDropdowns.add(closeCommentDropdown); }
    });
    attachButtonToTextarea(textarea, btn);
}

// ════════════════════════════════════════════════════════════════════════════════
// Initialisierung & MutationObserver
// ════════════════════════════════════════════════════════════════════════════════

function init() {
    const titleInput  = findTitleInput();
    const commentArea = findCommentTextarea();
    if (titleInput)  injectPrefixButton(titleInput);
    if (commentArea) injectCommentButton(commentArea);
}

/** Prüft ob ein Input/Textarea gerade editierbar ist */
function isEditable(el) {
    if (!el) return false;
    return el.getAttribute('aria-readonly') !== 'true'
        && el.getAttribute('aria-disabled') !== 'true';
}

const observer = new MutationObserver(() => {
    // ── Präfix-Button: nur anzeigen wenn Titelfeld editierbar ──────────────
    const prefixBtn  = document.getElementById(PREFIX_BTN_ID);
    const titleInput = document.querySelector('input[name="description"].x-form-text');

    if (titleInput) {
        if (isEditable(titleInput)) {
            // Feld editierbar → Button injizieren (falls fehlend) oder einblenden
            if (!prefixBtn) {
                injectPrefixButton(titleInput);
            } else {
                prefixBtn.style.display = 'inline-block';
            }
        } else {
            // Feld readonly/disabled → Button ausblenden + Dropdown schließen
            if (prefixBtn) {
                prefixBtn.style.display = 'none';
                closePrefixDropdown();
            }
        }
    } else if (prefixBtn) {
        prefixBtn.style.display = 'none';
    }

    // ── Comment-Button: nur anzeigen wenn Kommentarfeld editierbar ──────────
    const commentBtn  = document.getElementById(COMMENT_BTN_ID);
    const commentArea = document.querySelector('textarea[name="udfnote01"].x-form-text');

    if (commentArea) {
        if (isEditable(commentArea)) {
            if (!commentBtn) {
                injectCommentButton(commentArea);
            } else {
                commentBtn.style.display = 'inline-block';
            }
        } else {
            if (commentBtn) {
                commentBtn.style.display = 'none';
                closeCommentDropdown();
            }
        }
    } else if (commentBtn) {
        commentBtn.style.display = 'none';
    }
});
observer.observe(document.body, { childList: true, subtree: true });
setTimeout(init, 800);
