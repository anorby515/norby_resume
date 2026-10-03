/*
  Portfolio app. No build step, no dependencies. Designed for desktop.

  Routes (hash):
    #/                                   home: name and attributes
    #/<section-id>                       a screen from the top menu (career, beyond, portfolio)
    #/portfolio/<project>                suite overview, or straight into the deck for a single product
    #/portfolio/<project>/<product>/<why|how>/<slide>

  Content: data/layer-*.js (listed in data/layers.js) and data/work/<project>.js.
  Schema: docs/LAYER-SPEC.md.
*/
(function () {
  'use strict';

  var store = { profile: {}, attributes: [], sections: [], tools: {}, projects: [], collections: {}, layers: [] };
  var works = {};
  var review = /[?&]review\b/.test(location.search);
  var KIND = { app: 'App', agent: 'Agent', product: 'Product' };
  var deck = null; // active slide deck state

  /* ---------------- helpers ---------------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function arr(x) { return x == null ? [] : (Array.isArray(x) ? x : [x]); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function mergeById(target, incoming, layer) {
    arr(incoming).forEach(function (item) {
      item = Object.assign({ layer: layer }, item);
      var existing = byId(target, item.id);
      if (existing) { Object.assign(existing, item); return; }
      var at = item.after ? target.findIndex(function (t) { return t.id === item.after; }) : -1;
      if (at > -1) { target.splice(at + 1, 0, item); return; }
      var bt = item.before ? target.findIndex(function (t) { return t.id === item.before; }) : -1;
      if (bt > -1) { target.splice(bt, 0, item); return; }
      target.push(item);
    });
  }
  function confirmNotes(n) {
    if (!review || !arr(n).length) return '';
    return '<ul class="confirm">' + arr(n).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  }
  function draftMark(d) { return review && d ? ' data-draft' : ''; }
  function kinds(k) { return arr(k).map(function (x) { return '<span class="kind kind--' + esc(x) + '">' + esc(KIND[x] || x) + '</span>'; }).join(''); }
  function toolName(id, w) {
    return (w && w.tools && w.tools[id] && w.tools[id].name) || (store.tools[id] && store.tools[id].name) || id;
  }
  function chips(ids, w) {
    if (!arr(ids).length) return '';
    return '<ul class="chips">' + arr(ids).map(function (t) { return '<li>' + esc(toolName(t, w)) + '</li>'; }).join('') + '</ul>';
  }
  function list(items, cls) {
    return '<ul class="' + (cls || 'bullets') + '">' + arr(items).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  }
  function img(src, alt, cls) {
    return '<button type="button" class="zoom ' + (cls || '') + '" data-zoom="' + esc(src) + '" data-cap="' + esc(alt) + '">' +
      '<img src="' + esc(src) + '" alt="' + esc(alt) + '"></button>';
  }
  function link(path) { return '#/' + path; }

  /* ---------------- screens from sections ---------------- */

  // A section with a nav label (or the hero) starts a screen; sections without one
  // join the screen before them.
  function screens() {
    var out = [], cur = null;
    store.sections.forEach(function (s) {
      if (s.type === 'hero' || s.nav || !cur) {
        cur = { id: s.type === 'hero' ? '' : s.id, nav: s.nav, sections: [] };
        out.push(cur);
      }
      cur.sections.push(s);
    });
    return out;
  }

  var render = {};

  render.hero = function () {
    var p = store.profile;
    return '<div class="home">' +
      '<h1 class="home__name">' + esc(p.name).replace(' ', '<br>') + '</h1>' +
      '<ul class="home__traits" aria-label="Leadership attributes">' + store.attributes.map(function (a) {
        return '<li><span class="home__trait">' + esc(a.name) + '</span>' +
          '<span class="home__line"' + draftMark(a.draft) + '>' + esc(a.line) + '</span></li>';
      }).join('') + '</ul>' +
      confirmNotes(p.confirm) +
    '</div>';
  };

  function sectionHead(s) {
    return '<div class="page__head"><h1 class="page__title">' + esc(s.title) + '</h1>' +
      (s.lede ? '<p class="page__lede prose">' + esc(s.lede) + '</p>' : '') + '</div>';
  }
  function subHead(s) {
    return '<div class="page__sub"><h2>' + esc(s.title) + '</h2>' + (s.lede ? '<p class="prose page__lede">' + esc(s.lede) + '</p>' : '') + '</div>';
  }

  render.prose = function (s, first) {
    if (!arr(s.body).length && !review) return '';
    return (first ? sectionHead(s) : subHead(s)) +
      '<div class="prose prose--wide"' + draftMark(s.draft) + '>' + arr(s.body).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      confirmNotes(s.confirm);
  };

  render.cards = function (s, first) {
    var items = arr(store.collections[s.items]);
    return (first ? sectionHead(s) : subHead(s)) +
      '<div class="cards">' + items.map(function (c) {
        return '<article class="card"><h3>' + esc(c.title) + '</h3>' +
          (c.meta ? '<p class="card__meta">' + esc(c.meta) + '</p>' : '') +
          '<p class="prose">' + esc(c.text) + '</p>' + (arr(c.points).length ? list(c.points, 'bullets prose') : '') +
          confirmNotes(c.confirm) + '</article>';
      }).join('') + '</div>';
  };

  render.timeline = function (s, first) {
    var items = arr(store.collections[s.items]);
    return (first ? sectionHead(s) : subHead(s)) +
      '<ol class="timeline">' + items.map(function (t) {
        return '<li><span class="timeline__when">' + esc(t.period) + '</span><div><h3>' + esc(t.title) + '</h3>' +
          '<p class="prose">' + esc(t.text) + '</p>' + (arr(t.points).length ? list(t.points, 'bullets prose') : '') +
          confirmNotes(t.confirm) + '</div></li>';
      }).join('') + '</ol>';
  };

  render.qa = function (s, first) {
    var items = arr(store.collections[s.items]);
    return (first ? sectionHead(s) : subHead(s)) +
      '<div class="qa">' + items.map(function (q) {
        return '<details class="qa__item"><summary>' + esc(q.question) + '</summary><div class="qa__body">' +
          arr(q.answer).map(function (p) { return '<p class="prose">' + esc(p) + '</p>'; }).join('') +
          (arr(q.points).length ? list(q.points, 'bullets prose') : '') +
          (arr(q.evidence).length ? '<p class="qa__evidence">See: ' + arr(q.evidence).map(function (id) {
            var p = byId(store.projects, id);
            return p ? '<a href="' + link('portfolio/' + id) + '">' + esc(p.title) + '</a>' : '';
          }).join(', ') + '</p>' : '') +
          confirmNotes(q.confirm) + '</div></details>';
      }).join('') + '</div>';
  };

  function cover(c, title, cls) {
    if (c && c.src) {
      return '<span class="frame' + (c.tall ? ' frame--tall' : '') + (cls ? ' ' + cls : '') + '"><img src="' + esc(c.src) + '" alt="" loading="lazy"></span>';
    }
    return '<span class="frame frame--empty' + (cls ? ' ' + cls : '') + '"><span>' + esc(title) + '</span></span>';
  }

  render.portfolio = function (s) {
    var projects = store.projects.filter(function (p) { return !p.hidden; });
    return sectionHead(s) +
      '<div class="rail" data-rail>' +
        '<ul class="rail__track">' + projects.map(function (p) {
          return '<li class="rail__item"><a class="pcard" href="' + link('portfolio/' + p.id) + '">' +
            cover(p.cover, p.title) +
            '<span class="pcard__kinds">' + kinds(p.kind) + (p.context === 'work' ? '<span class="ctx">At work</span>' : '') + '</span>' +
            '<span class="pcard__title">' + esc(p.title) + '</span>' +
            '<span class="pcard__summary">' + esc(p.summary) + '</span></a>' +
            (p.cover ? '' : confirmNotes('Add a marquee screenshot (cover).')) + '</li>';
        }).join('') + '</ul>' +
        '<div class="rail__controls">' + arrowBtn('prev', 'Scroll left', 'data-rail-prev') + arrowBtn('next', 'Scroll right', 'data-rail-next') + '</div>' +
      '</div>';
  };

  function arrowBtn(dir, label, attr) {
    var path = dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7';
    return '<button type="button" class="arrow" ' + attr + ' aria-label="' + label + '">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="' + path + '" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
  }

  function screenView(sc) {
    var html = '';
    sc.sections.forEach(function (s, i) {
      var fn = render[s.type];
      if (fn) html += '<section class="block block--' + esc(s.type) + '" id="s-' + esc(s.id) + '">' + fn(s, i === 0) + '</section>';
    });
    return '<div class="page page--' + esc(sc.sections[0].type) + '">' + html + '</div>';
  }

  /* ---------------- portfolio: suite overview ---------------- */

  function crumbs(items) {
    return '<nav class="crumbs" aria-label="Breadcrumb">' + items.map(function (c, i) {
      return i < items.length - 1 ? '<a href="' + c.href + '">' + esc(c.label) + '</a><span aria-hidden="true">/</span>' : '<span aria-current="page">' + esc(c.label) + '</span>';
    }).join('') + '</nav>';
  }

  function suiteView(p, w) {
    var base = 'portfolio/' + p.id;
    return '<div class="page suite">' +
      crumbs([{ label: 'AI Portfolio', href: link('portfolio') }, { label: w.title }]) +
      '<div class="suite__head"><h1 class="page__title">' + esc(w.title) + '</h1>' +
        '<p class="suite__kicker">' + esc(w.kicker) + '</p>' +
        '<p class="prose suite__summary">' + esc(w.summary) + '</p></div>' +
      '<ol class="suite__products">' + w.products.map(function (pr) {
        return '<li><a class="pcard pcard--suite" href="' + link(base + '/' + pr.id + '/why') + '">' +
          cover(pr.hero ? { src: 'assets/work/' + w.id + '/' + pr.hero.src, tall: pr.hero.tall } : null, pr.name) +
          '<span class="pcard__kinds">' + kinds(pr.kind) + '</span>' +
          '<span class="pcard__title">' + esc(pr.name) + '</span>' +
          '<span class="pcard__summary">' + esc(pr.line) + '</span>' +
          (arr(pr.points).length ? '<span class="pcard__points">' + pr.points.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</span>' : '') +
          '</a></li>';
      }).join('') + '</ol>' +
      (w.how ? '<p class="suite__deep"><a href="' + link(base + '/suite/how') + '">How the suite fits together</a>' +
        '<span>The build loop, shared architecture and numbers across all three.</span></p>' : '') +
    '</div>';
  }

  /* ---------------- slides ---------------- */

  function slide(kind, title, body) {
    return { kind: kind, title: title, html: (title ? '<h2 class="slide__title">' + esc(title) + '</h2>' : '') + body };
  }

  function diagram(stages) {
    return '<ol class="arch" aria-label="Architecture, left to right">' + arr(stages).map(function (s) {
      return '<li class="arch__stage"><span class="arch__label">' + esc(s.stage) + '</span>' +
        '<ul>' + arr(s.nodes).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul></li>';
    }).join('') + '</ol>';
  }

  function decisions(items) {
    return '<ul class="decisions">' + arr(items).map(function (d) {
      return '<li><span class="decision__t">' + esc(d.title) + '</span><p class="prose">' + esc(d.text) + '</p></li>';
    }).join('') + '</ul>';
  }

  function productWhy(w, p) {
    var why = p.why || {}, out = [];
    var hero = p.hero ? img('assets/work/' + w.id + '/' + p.hero.src, p.hero.alt, 'slide__hero' + (p.hero.tall ? ' is-tall' : '')) : '';
    out.push(slide('intro', 'Why I built this',
      '<div class="intro"><div class="intro__text"><p class="intro__problem">' + esc(why.problem) + '</p>' +
        (why.insight ? '<blockquote class="insight"><span>The insight</span><p>' + esc(why.insight) + '</p></blockquote>' : '') +
        confirmNotes(p.confirm) + '</div>' + hero + '</div>'));
    if (arr(p.who).length) out.push(slide('who', 'Who I built this for',
      '<ul class="personas">' + p.who.map(function (x) {
        return '<li class="persona"><div class="persona__who"><span class="persona__name">' + esc(x.name) + '</span><span class="persona__role">' + esc(x.who) + '</span></div>' +
          '<div><span class="persona__k">Needs</span><p class="prose">' + esc(x.need) + '</p></div>' +
          '<div><span class="persona__k">Gets</span><p class="prose">' + esc(x.gets) + '</p></div></li>';
      }).join('') + '</ul>'));
    if (arr(p.features).length) out.push(slide('what', 'What it does',
      '<ul class="features' + (p.features.length > 6 ? ' features--8' : '') + '">' + p.features.map(function (f) {
        return '<li><span class="feature__name">' + esc(f.name) + '</span><p class="prose">' + esc(f.text) + '</p>' + confirmNotes(f.confirm) + '</li>';
      }).join('') + '</ul>'));
    if (p.value) out.push(slide('case', 'The case for it',
      '<p class="case__model">' + esc(p.value.model) + '</p>' + list(p.value.points, 'case__points') + confirmNotes(p.value.confirm) +
      (p.link && p.link.href ? '<p class="case__link"><a href="' + esc(p.link.href) + '">' + esc(p.link.label) + '</a></p>' : '')));
    return out;
  }

  function productHow(w, p) {
    var e = ((w.how || {}).products || {})[p.id] || {}, out = [];
    if (arr(e.diagram).length) out.push(slide('arch', 'Architecture', diagram(e.diagram)));
    if (arr(e.decisions).length) out.push(slide('decisions', 'Decisions that shaped it', decisions(e.decisions)));
    arr(e.shots).forEach(function (s) {
      var src = 'assets/work/' + w.id + '/' + s.src;
      out.push(slide('shot' + (s.tall ? ' slide--tall' : '') + (s.wide ? ' slide--wide' : ''), '',
        '<div class="shot">' + img(src, s.title + '. ' + s.caption, 'shot__img') +
        '<div class="shot__text"><h2 class="slide__title">' + esc(s.title) + '</h2><p class="shot__caption">' + esc(s.caption) + '</p>' +
        chips(s.tools, w) + '</div></div>'));
    });
    if (e.artifact) out.push(slide('artifact', e.artifact.title,
      '<div class="artifact"><table><thead><tr>' + e.artifact.head.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') +
      '</tr></thead><tbody>' + e.artifact.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table><p class="prose artifact__cap">' + esc(e.artifact.caption) + '</p></div>'));
    if (e.split || arr(e.tools).length) out.push(slide('split', 'Vibe-coded and agentic',
      (e.split ? '<div class="split"><div class="split__side split__side--vibe"><span class="split__k">Vibe-coded</span><p>' + esc(e.split.vibe) + '</p></div>' +
        '<div class="split__side split__side--agent"><span class="split__k">Agentic</span><p>' + esc(e.split.agentic) + '</p></div></div>' : '') +
      (arr(e.tools).length ? '<h3 class="slide__sub">Built with</h3>' + chips(e.tools, w) : '') + confirmNotes(e.confirm)));
    return out;
  }

  function suiteWhy(w) {
    var y = w.why || {};
    return [slide('lead', 'Why I built this', '<p class="lead">' + esc(y.lead) + '</p><div class="lead__body">' +
      arr(y.body).map(function (p) { return '<p class="prose">' + esc(p) + '</p>'; }).join('') + '</div>')];
  }

  function suiteHow(w) {
    var h = w.how || {}, out = [];
    out.push(slide('lead', 'How I built this', '<p class="lead">' + esc(h.lead) + '</p><div class="lead__body">' +
      arr(h.body).map(function (p) { return '<p class="prose">' + esc(p) + '</p>'; }).join('') + '</div>' +
      (arr(w.numbers).length ? '<dl class="numbers">' + w.numbers.map(function (n) { return '<div><dt>' + esc(n.label) + '</dt><dd>' + esc(n.n) + '</dd></div>'; }).join('') + '</dl>' : '')));
    if (arr(h.workflow).length) out.push(slide('arch', 'The build loop',
      diagram(h.workflow.map(function (s) { return { stage: s.label, nodes: [s.detail] }; }))));
    if (arr(h.shared).length) out.push(slide('decisions', 'Across the suite', decisions(h.shared) +
      (arr(h.tools).length ? '<h3 class="slide__sub">Shared stack</h3>' + chips(h.tools, w) : '')));
    return out;
  }

  // Projects without a work file get a short deck from the main data.
  function simpleWhy(p) {
    var y = p.why || {}, out = [];
    out.push(slide('intro', 'Why I built this',
      '<div class="intro"><div class="intro__text"><p class="intro__problem">' + esc(y.problem) + '</p>' +
      (arr(y.decisions).length ? '<h3 class="slide__sub">Decisions I made</h3>' + list(y.decisions, 'bullets prose') : '') +
      (y.outcome ? '<h3 class="slide__sub">What it changed</h3><p class="prose">' + esc(y.outcome) + '</p>' : '') +
      confirmNotes(p.confirm) + '</div>' + (p.cover ? img(p.cover.src, p.title, 'slide__hero' + (p.cover.tall ? ' is-tall' : '')) : '') + '</div>'));
    if (arr(p.components).length) out.push(slide('what', 'What is in it',
      '<ul class="features">' + p.components.map(function (c) {
        return '<li><span class="feature__name">' + esc(c.title) + ' ' + kinds(c.kind) + '</span><p class="prose">' + esc(c.text) + '</p>' + confirmNotes(c.confirm) + '</li>';
      }).join('') + '</ul>'));
    return out;
  }
  function simpleHow(p) {
    var h = p.how || {}, out = [];
    if (arr(h.flow).length) out.push(slide('arch', 'How it fits together', diagram(h.flow.map(function (s) { return { stage: s.label, nodes: [s.detail] }; }))));
    if (arr(h.practices).length || arr(h.stack).length) out.push(slide('decisions', 'Engineering notes',
      list(h.practices, 'bullets prose notes') + (arr(h.stack).length ? '<h3 class="slide__sub">Built with</h3>' + chips(h.stack) : '')));
    return out;
  }

  /* ---------------- deck ---------------- */

  function deckView(opts) {
    var slides = opts.slides;
    var base = opts.base;
    var pill = opts.views.length > 1 ? '<div class="pill" role="group" aria-label="View">' + opts.views.map(function (v) {
      var label = v === 'why' ? 'Why I built this' : 'How I built this';
      return '<a href="' + link(base + '/' + v) + '"' + (v === opts.view ? ' aria-current="page"' : '') + '>' + label + '</a>';
    }).join('') + '</div>' : '';
    return '<div class="deck" data-deck>' +
      '<div class="deck__top">' + crumbs(opts.crumbs) + pill +
        '<div class="deck__name"><span class="deck__product">' + esc(opts.name) + '</span>' + kinds(opts.kind) + '</div></div>' +
      '<div class="deck__viewport" data-viewport><div class="deck__track" data-track>' +
        slides.map(function (s, i) { return '<section class="slide slide--' + s.kind + '" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + slides.length + '">' + s.html + '</section>'; }).join('') +
      '</div></div>' +
      (slides.length > 1 ? '<div class="deck__nav">' + arrowBtn('prev', 'Previous slide', 'data-prev') +
        '<ol class="dots">' + slides.map(function (s, i) {
          return '<li><button type="button" data-goto="' + i + '" aria-label="' + esc((i + 1) + ': ' + (s.title || 'Screenshot')) + '"></button></li>';
        }).join('') + '</ol>' + arrowBtn('next', 'Next slide', 'data-next') +
        '<span class="deck__count" data-count></span></div>' : '') +
    '</div>';
  }

  function startDeck(opts, index) {
    deck = { n: opts.slides.length, i: 0, path: opts.base + '/' + opts.view, titles: opts.slides.map(function (s) { return s.title; }) };
    go(index || 0, true);
  }

  function go(i, initial) {
    if (!deck) return;
    deck.i = Math.max(0, Math.min(deck.n - 1, i));
    var track = document.querySelector('[data-track]');
    if (!track) return;
    track.style.transform = 'translateX(' + (-100 * deck.i) + '%)';
    document.querySelectorAll('.slide').forEach(function (el, k) {
      el.setAttribute('aria-hidden', String(k !== deck.i));
      el.inert = k !== deck.i;
    });
    document.querySelectorAll('[data-goto]').forEach(function (b, k) { b.setAttribute('aria-current', String(k === deck.i)); });
    var prev = document.querySelector('[data-prev]'), next = document.querySelector('[data-next]');
    if (prev) prev.disabled = deck.i === 0;
    if (next) next.disabled = deck.i === deck.n - 1;
    var c = document.querySelector('[data-count]');
    if (c) c.textContent = (deck.i + 1) + ' / ' + deck.n;
    if (!initial && history.replaceState) history.replaceState(null, '', location.pathname + location.search + '#/' + deck.path + '/' + (deck.i + 1));
  }

  /* ---------------- router ---------------- */

  function loadWork(id, cb) {
    if (works[id]) return cb(works[id]);
    var s = document.createElement('script');
    s.src = 'data/work/' + id + '.js';
    s.onload = function () { cb(works[id] || null); };
    s.onerror = function () { cb(null); };
    document.body.appendChild(s);
  }

  function show(html, opts) {
    opts = opts || {};
    document.body.classList.toggle('is-deck', !!opts.deck);
    document.body.classList.toggle('is-home', !!opts.home);
    document.documentElement.setAttribute('data-lens', opts.view === 'how' ? 'how' : 'why');
    document.getElementById('main').innerHTML = html;
    document.querySelectorAll('#nav a').forEach(function (a) {
      a.toggleAttribute('aria-current', a.getAttribute('data-screen') === opts.screen);
    });
    document.title = (opts.title ? opts.title + ' | ' : '') + (store.profile.name || '');
    if (!opts.keepScroll) window.scrollTo(0, 0);
  }

  function notFound() { show('<div class="page"><h1 class="page__title">Not found</h1><p class="prose">That page does not exist. <a href="#/">Go home</a>.</p></div>'); }

  function route() {
    deck = null;
    var parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    var all = screens();

    if (!parts.length) { var home = all[0]; return show(screenView(home), { home: true, screen: '' }); }

    if (parts[0] !== 'portfolio' || parts.length === 1) {
      var sc = all.filter(function (x) { return x.id === parts[0]; })[0];
      if (!sc) return notFound();
      return show(screenView(sc), { screen: sc.id, title: sc.nav });
    }

    var p = byId(store.projects, parts[1]);
    if (!p) return notFound();
    var product = parts[2], view = parts[3] === 'how' ? 'how' : 'why', idx = Math.max(0, (parseInt(parts[4], 10) || 1) - 1);
    var base = 'portfolio/' + p.id;
    var crumbBase = [{ label: 'AI Portfolio', href: link('portfolio') }];

    function simple() {
      if (!product) { location.replace('#/' + base + '/main/why'); return; }
      var opts = { slides: view === 'how' ? simpleHow(p) : simpleWhy(p), views: ['why', 'how'], view: view,
        base: base + '/main', name: p.title, kind: p.kind, crumbs: crumbBase.concat([{ label: p.title }]) };
      if (!opts.slides.length) opts.slides = [slide('lead', '', '<p class="lead">More detail coming.</p>')];
      show(deckView(opts), { deck: true, view: view, screen: 'portfolio', title: p.title });
      startDeck(opts, idx);
    }

    if (!p.page) return simple();
    loadWork(p.page, function (w) {
      if (!w) return simple();
      var single = w.products.length === 1;
      if (!product) {
        if (single) { location.replace('#/' + base + '/' + w.products[0].id + '/why'); return; }
        return show(suiteView(p, w), { screen: 'portfolio', title: w.title });
      }
      var crumbs2 = crumbBase.concat(single ? [] : [{ label: w.title, href: link(base) }]);
      var opts;
      if (product === 'suite') {
        opts = { slides: view === 'how' ? suiteHow(w) : suiteWhy(w), views: ['why', 'how'], view: view, base: base + '/suite',
          name: w.title, kind: [], crumbs: crumbs2.concat([{ label: 'The suite' }]) };
      } else {
        var pr = byId(w.products, product);
        if (!pr) return notFound();
        opts = { slides: view === 'how' ? productHow(w, pr) : productWhy(w, pr), views: ['why', 'how'], view: view,
          base: base + '/' + pr.id, name: pr.name, kind: pr.kind, crumbs: crumbs2.concat([{ label: pr.name }]) };
      }
      show(deckView(opts), { deck: true, view: view, screen: 'portfolio', title: opts.name });
      startDeck(opts, idx);
    });
  }

  /* ---------------- interaction ---------------- */

  function bind() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-prev],[data-next],[data-goto],[data-zoom],[data-close-lightbox],[data-rail-prev],[data-rail-next]');
      var lb = document.getElementById('lightbox');
      if (!t) { if (e.target === lb) lb.close(); return; }
      if (t.hasAttribute('data-prev')) go(deck.i - 1);
      else if (t.hasAttribute('data-next')) go(deck.i + 1);
      else if (t.hasAttribute('data-goto')) go(parseInt(t.getAttribute('data-goto'), 10));
      else if (t.hasAttribute('data-zoom')) {
        if (swiped) return;
        lb.querySelector('img').src = t.getAttribute('data-zoom');
        lb.querySelector('p').textContent = t.getAttribute('data-cap');
        lb.showModal();
      } else if (t.hasAttribute('data-close-lightbox')) lb.close();
      else {
        var track = document.querySelector('.rail__track');
        if (track) track.scrollBy({ left: (t.hasAttribute('data-rail-prev') ? -1 : 1) * track.clientWidth * 0.8, behavior: 'smooth' });
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!deck || document.getElementById('lightbox').open || e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { go(deck.i + 1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(deck.i - 1); e.preventDefault(); }
      else if (e.key === 'Home') { go(0); e.preventDefault(); }
      else if (e.key === 'End') { go(deck.n - 1); e.preventDefault(); }
    });

    // Swipe and trackpad drag on the slide area
    var sx = null, sy = 0, swiped = false;
    document.addEventListener('pointerdown', function (e) {
      if (!deck || !e.target.closest('[data-viewport]')) return;
      sx = e.clientX; sy = e.clientY; swiped = false;
    });
    document.addEventListener('pointerup', function (e) {
      if (sx == null || !deck) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      sx = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; go(deck.i + (dx < 0 ? 1 : -1)); setTimeout(function () { swiped = false; }, 50); }
    });
    var wheelLock = 0;
    document.addEventListener('wheel', function (e) {
      if (!deck || !e.target.closest('[data-viewport]')) return;
      if (Math.abs(e.deltaX) > 40 && Math.abs(e.deltaX) > Math.abs(e.deltaY) && Date.now() > wheelLock) {
        wheelLock = Date.now() + 600; go(deck.i + (e.deltaX > 0 ? 1 : -1));
      }
    }, { passive: true });

    window.addEventListener('hashchange', route);
  }

  /* ---------------- boot ---------------- */

  function drawChrome() {
    var nav = document.getElementById('nav');
    nav.innerHTML = screens().filter(function (s) { return s.nav; }).map(function (s) {
      return '<a href="' + link(s.id) + '" data-screen="' + esc(s.id) + '">' + esc(s.nav) + '</a>';
    }).join('');
    document.getElementById('bar-name').textContent = store.profile.name || '';
    if (review) {
      var b = document.getElementById('review-banner');
      b.hidden = false;
      b.textContent = 'Review mode. Layers: ' + store.layers.join(' + ') + '. Yellow notes are to confirm; underlined text is a draft. Remove ?review from the URL to see the public site.';
    }
  }

  function loadLayers(names, done) {
    var i = 0;
    (function next() {
      if (i >= names.length) return done();
      var s = document.createElement('script');
      s.src = 'data/layer-' + names[i++] + '.js';
      s.onload = next;
      s.onerror = function () { console.warn('Layer not found: ' + s.src); next(); };
      document.body.appendChild(s);
    })();
  }

  window.PORTFOLIO = {
    register: function (data) {
      var layer = data.layer || 'unknown';
      store.layers.push(layer);
      Object.keys(data).forEach(function (k) {
        var v = data[k];
        if (k === 'layer') return;
        if (k === 'profile') Object.assign(store.profile, v);
        else if (k === 'tools') Object.assign(store.tools, v);
        else if (k === 'attributes' || k === 'sections' || k === 'projects') mergeById(store[k], v, layer);
        else if (Array.isArray(v)) mergeById(store.collections[k] = store.collections[k] || [], v, layer);
      });
    },
    boot: function () {
      bind();
      loadLayers(arr(window.PORTFOLIO_LAYERS).length ? window.PORTFOLIO_LAYERS : ['public'], function () { drawChrome(); route(); });
    },
    _store: store
  };
  window.PORTFOLIO_WORK = { register: function (d) { works[d.id] = d; } };
})();
