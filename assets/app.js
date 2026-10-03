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
  var diagrams = {};
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

  /* ---------------- AI Portfolio: home screen of apps ---------------- */

  // 24px line glyphs for app icons.
  var GLYPH = {
    flask: 'M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 14h9',
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    spark: 'M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z',
    gauge: 'M4 18a8 8 0 1 1 16 0M12 18l4-6M8 18h8',
    cycle: 'M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3M18 3v4h-4M6 21v-4h4',
    coin: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15 9h-4a1.8 1.8 0 0 0 0 3.6h2a1.8 1.8 0 0 1 0 3.6H9M12 7v2M12 16v2',
    toggle: 'M7 7h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 7zM16 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
    orbit: 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 12c0-2.5 4-4.5 9-4.5s9 2 9 4.5-4 4.5-9 4.5-9-2-9-4.5z',
    trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9.5 17h5',
    tv: 'M3 6h18v11H3zM8 21h8M12 17v4M9 3l3 3 3-3',
    plusone: 'M3 12h7M6.5 8.5v7M15 8l3-2v12',
    bars: 'M5 20V11M10 20V5M15 20v-7M20 20V8M3 20h18',
    analyze: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5L21 21M7.5 13V11M10.5 13V8.5M13.5 13v-3',
    people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14a6.5 6.5 0 0 1 3.5 6',
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    home: 'M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5',
    bag: 'M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2',
    car: 'M5 16H3v-4l2-5h14l2 5v4h-2M5 12h14M7.5 16a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM16.5 16a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM9 17.5h6',
    flame: 'M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-1.5-2-1.5-3C7 10 6 12.5 6 15a6 6 0 0 0 6 6z',
    notebook: 'M6 3h12v18H6zM9 3v18M12 8h4M12 12h4M4 7h2M4 11h2M4 15h2',
    folder: 'M3 6h6l2 2h10v11H3zM8 14l2.5 2.5L16 11',
    music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
    pie: 'M12 3v9h9a9 9 0 1 1-9-9zM15 3.5A9 9 0 0 1 20.5 9H15z',
    palm: 'M12 21c0-5 .5-9 2-12M14 9c-1-3-4-4-7-3M14 9c2-2 5-2 7 0M14 9c0-3 2-5 5-5M14 9c-3-1-6 1-7 4M4 21h16',
    mountain: 'M2 20l7-12 4 6 3-4 6 10zM7.5 10.5L9 12l1.5-1.5',
    disc: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 6.5a5.5 5.5 0 0 0-5.5 5.5'
  };
  var WORK_GLYPHS = ['flask', 'grid', 'spark', 'gauge', 'cycle', 'coin', 'toggle'];

  function appIcon(a, k) {
    if (a.img) return '<span class="app__icon app__icon--img" aria-hidden="true"><img src="' + esc(a.img) + '" alt="" loading="lazy"></span>';
    var g = GLYPH[a.icon] || (a.placeholder ? GLYPH[WORK_GLYPHS[k % WORK_GLYPHS.length]] : GLYPH.grid);
    return '<span class="app__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="' + g + '"/></svg></span>';
  }

  render.apps = function (s, first) {
    var rows = arr(store.collections[s.items]).filter(function (r) { return !r.hidden && arr(r.apps).length; });
    return (first ? sectionHead(s) : subHead(s)) +
      '<div class="homescreen">' + rows.map(function (r) {
        return '<section class="approw approw--' + esc(r.tone || r.id) + '" aria-label="' + esc(r.title) + '">' +
          '<h2 class="approw__title">' + esc(r.title) + '</h2>' +
          '<ul class="approw__apps">' + r.apps.map(function (a, k) {
            var inner = appIcon(a, k) + '<span class="app__name">' + esc(a.name) + '</span>' +
              (a.note ? '<span class="app__note">' + esc(a.note) + '</span>' : '');
            var cls = 'app' + (a.placeholder ? ' app--placeholder' : '');
            if (a.href && !a.placeholder) {
              var ext = /^https?:/.test(a.href);
              return '<li><a class="' + cls + '" href="' + esc(a.href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + inner + '</a></li>';
            }
            return '<li><span class="' + cls + ' app--static">' + inner + '</span></li>';
          }).join('') + '</ul>' +
          confirmNotes(r.confirm) +
        '</section>';
      }).join('') + '</div>' +
      (s.footnote ? '<p class="footnote">' + esc(s.footnote) + '</p>' : '');
  };

  render.placeholder = function (s, first) {
    return (first ? sectionHead(s) : subHead(s)) +
      '<ol class="pq">' + arr(s.items).map(function (q, i) {
        return '<li><span class="pq__n">' + (i + 1) + '</span><span class="pq__q">' + esc(q) + '</span>' +
          (s.note ? '<span class="pq__note">' + esc(s.note) + '</span>' : '') + '</li>';
      }).join('') + '</ol>' + confirmNotes(s.confirm);
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
      ((diagrams[w.id] || {}).suite ? '<div class="suite__arch">' + diagrams[w.id].suite + '<p class="dg-hint">Hover over any piece to see what it does. Click a product to explore it.</p></div>' : '') +
      '<p class="suite__launch"><a href="' + link(base + '/products/1') + '">Explore the products</a>' +
        '<span>' + w.products.map(function (pr) { return esc(pr.name); }).join(', ') + '</span></p>' +
    '</div>';
  }

  /* ---------------- slides ---------------- */

  function productTour(w, base) {
    return w.products.map(function (pr) {
      var hero = pr.hero ? img('assets/work/' + w.id + '/' + pr.hero.src, pr.hero.alt || pr.name, 'pslide__img' + (pr.hero.tall ? ' is-tall' : '')) : '';
      return slide('product', '',
        '<div class="pslide"><div class="pslide__text"><p class="pslide__kinds">' + kinds(pr.kind) + '</p>' +
        '<h2 class="pslide__name">' + esc(pr.name) + '</h2>' +
        '<p class="pslide__line">' + esc(pr.line) + '</p>' +
        (arr(pr.points).length ? list(pr.points, 'pslide__points') : '') +
        '<p class="pslide__go"><a class="go--why" href="' + link(base + '/' + pr.id + '/why') + '">Why I built this</a>' +
        '<a class="go--how" href="' + link(base + '/' + pr.id + '/how') + '">How I built this</a></p></div>' + hero + '</div>');
    });
  }

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
    return '<ul class="decisions' + (arr(items).length > 4 ? ' decisions--3' : '') + '">' + arr(items).map(function (d) {
      return '<li><span class="decision__t">' + esc(d.title) + '</span><p class="prose">' + esc(d.text) + '</p></li>';
    }).join('') + '</ul>';
  }

  function linkButtons(p) {
    var l = arr(p.links).concat(p.link && p.link.href ? [p.link] : []).filter(function (x) { return x.href; });
    if (!l.length) return '';
    return '<p class="try">' + l.map(function (x) { return '<a href="' + esc(x.href) + '" target="_blank" rel="noopener">' + esc(x.label) + '</a>'; }).join('') + '</p>';
  }

  function productWhy(w, p) {
    var why = p.why || {}, out = [];
    var hero = p.hero ? img('assets/work/' + w.id + '/' + p.hero.src, p.hero.alt, 'slide__hero' + (p.hero.tall ? ' is-tall' : '')) : '';
    out.push(slide('intro', 'Why I built this',
      '<div class="intro"><div class="intro__text"><p class="intro__problem">' + esc(why.problem) + '</p>' +
        (why.insight ? '<blockquote class="insight"><span>The insight</span><p>' + esc(why.insight) + '</p></blockquote>' : '') +
        linkButtons(p) + confirmNotes(p.confirm) + '</div>' + hero + '</div>'));
    if (arr(p.who).length) out.push(slide('who', 'Who I built this for',
      '<ul class="personas">' + p.who.map(function (x) {
        return '<li class="persona"><div class="persona__who"><span class="persona__name">' + esc(x.name) + '</span><span class="persona__role">' + esc(x.who) + '</span></div>' +
          '<div><span class="persona__k">Needs</span><p class="prose">' + esc(x.need) + '</p></div>' +
          '<div><span class="persona__k">Gets</span><p class="prose">' + esc(x.gets) + '</p></div></li>';
      }).join('') + '</ul>'));
    arr(p.featureGroups).forEach(function (g) {
      var shot = g.shot ? img('assets/work/' + w.id + '/' + g.shot.src, g.shot.alt || g.title, 'whatsplit__img' + (g.shot.tall ? ' is-tall' : '')) : '';
      out.push(slide('whatsplit', 'What it does',
        '<div class="whatsplit"><div><h3 class="whatsplit__group">' + esc(g.title) + '</h3><ul class="flist">' + arr(g.items).map(function (f) {
          return '<li><span class="feature__name">' + esc(f.name) + '</span><p class="prose">' + esc(f.text) + '</p>' + confirmNotes(f.confirm) + '</li>';
        }).join('') + '</ul></div>' + shot + '</div>'));
    });
    if (arr(p.features).length) out.push(slide('what', 'What it does',
      '<ul class="features' + (p.features.length > 6 ? ' features--8' : '') + '">' + p.features.map(function (f) {
        return '<li><span class="feature__name">' + esc(f.name) + '</span><p class="prose">' + esc(f.text) + '</p>' + confirmNotes(f.confirm) + '</li>';
      }).join('') + '</ul>'));
    if (p.value) out.push(slide('case', 'The case for it',
      '<p class="case__model">' + esc(p.value.model) + '</p>' + list(p.value.points, 'case__points') + confirmNotes(p.value.confirm) +
      linkButtons(p)));
    return out;
  }

  function productHow(w, p) {
    var e = ((w.how || {}).products || {})[p.id] || {}, out = [];
    var svg = (diagrams[w.id] || {})[p.id];
    var builtWith = arr(e.tools).length ? '<div class="builtwith"><span class="builtwith__k">Built with</span>' + chips(e.tools, w) + '</div>' : '';
    if (svg) out.push(slide('arch slide--svg' + (builtWith ? ' slide--tools' : ''), 'Architecture', '<div class="dgwrap">' + svg + '</div><p class="dg-hint">Hover over any box to see what it does.</p>' + builtWith));
    else if (arr(e.diagram).length) out.push(slide('arch', 'Architecture', diagram(e.diagram)));
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
    if (!svg && arr(e.tools).length) out.push(slide('split', 'Built with', chips(e.tools, w) + confirmNotes(e.confirm)));
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
    var svg = h.svg && (diagrams[p.id] || {})[h.svg];
    if (svg) out.push(slide('arch slide--svg', 'Engineering architecture', '<div class="dgwrap">' + svg + '</div><p class="dg-hint">Hover over any box to see what it does.</p>'));
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
    }).join('') + '</div>' : '<div></div>';
    return '<div class="deck" data-deck>' +
      '<div class="deck__top">' + crumbs(opts.crumbs) + pill +
        '<div class="deck__name"><span class="deck__product">' + esc(opts.name) + '</span>' + kinds(opts.kind) + '</div></div>' +
      '<div class="deck__viewport" data-viewport><div class="deck__track" data-track>' +
        slides.map(function (s, i) { return '<section class="slide slide--' + s.kind + '" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + slides.length + '">' + s.html + '</section>'; }).join('') +
      '</div></div>' +
      (slides.length > 1 ? deckNav(slides.map(function (s) { return s.title || 'Screenshot'; }), 'slide') : '') +
    '</div>';
  }

  function deckNav(titles, noun) {
    return '<div class="deck__nav">' + arrowBtn('prev', 'Previous ' + noun, 'data-prev') +
      '<ol class="dots">' + titles.map(function (t, i) {
        return '<li><button type="button" data-goto="' + i + '" aria-label="' + esc((i + 1) + ': ' + t) + '" title="' + esc(t) + '"></button></li>';
      }).join('') + '</ol>' + arrowBtn('next', 'Next ' + noun, 'data-next') +
      '<span class="deck__count" data-count></span></div>';
  }

  // The opening flow: every top-level screen is one scene in a horizontal deck.
  function scenesView(all, k) {
    var html = '<div class="deck deck--scenes" data-deck>' +
      '<div class="deck__viewport" data-viewport><div class="deck__track" data-track>' +
        all.map(function (sc) {
          return '<section class="slide slide--scene" aria-roledescription="scene" aria-label="' + esc(sc.nav || store.profile.name) + '">' + screenView(sc) + '</section>';
        }).join('') +
      '</div></div>' + deckNav(all.map(function (sc) { return sc.nav || store.profile.name; }), 'section') + '</div>';
    show(html, { deck: true, scenes: true, screen: all[k].id, title: all[k].id ? all[k].nav : '' });
    deck = { n: all.length, i: 0, scenes: all.map(function (sc) { return sc.id; }), titles: all.map(function (sc) { return sc.nav; }) };
    go(k, true);
  }

  function startDeck(opts, index) {
    deck = { n: opts.slides.length, i: 0, path: opts.view ? opts.base + '/' + opts.view : opts.base, titles: opts.slides.map(function (s) { return s.title; }) };
    go(index || 0, true);
  }

  function go(i, initial) {
    var t = document.querySelector('.dg-tip'); if (t) t.hidden = true;
    if (!deck) return;
    deck.i = Math.max(0, Math.min(deck.n - 1, i));
    var track = document.querySelector('[data-track]');
    if (!track) return;
    track.style.transform = 'translateX(' + (-100 * deck.i) + '%)';
    document.querySelectorAll('.slide').forEach(function (el, k) {
      el.setAttribute('aria-hidden', String(k !== deck.i));
      el.inert = k !== deck.i;
      if (k === deck.i && deck.scenes) el.scrollTop = 0;
    });
    document.querySelectorAll('[data-goto]').forEach(function (b, k) { b.setAttribute('aria-current', String(k === deck.i)); });
    var prev = document.querySelector('[data-prev]'), next = document.querySelector('[data-next]');
    if (prev) prev.disabled = deck.i === 0;
    if (next) next.disabled = deck.i === deck.n - 1;
    var c = document.querySelector('[data-count]');
    if (c) c.textContent = (deck.i + 1) + ' / ' + deck.n;
    if (deck.scenes) {
      var id = deck.scenes[deck.i];
      document.querySelectorAll('#nav a').forEach(function (a) { a.toggleAttribute('aria-current', a.getAttribute('data-screen') === id); });
      document.title = (id ? deck.titles[deck.i] + ' | ' : '') + (store.profile.name || '');
      if (c) c.textContent = deck.titles[deck.i] || '';
      if (!initial && history.replaceState) history.replaceState(null, '', location.pathname + location.search + '#/' + id);
      return;
    }
    if (!initial && history.replaceState) history.replaceState(null, '', location.pathname + location.search + '#/' + deck.path + '/' + (deck.i + 1));
  }

  /* ---------------- router ---------------- */

  function loadWork(id, cb) {
    if (works[id]) return cb(works[id]);
    var s = document.createElement('script');
    s.src = 'data/work/' + id + '.js';
    s.onload = function () {
      var w = works[id];
      if (!w || !w.diagrams) return cb(w || null);
      var d = document.createElement('script');
      d.src = 'data/work/' + id + '.diagrams.js';
      d.onload = d.onerror = function () { cb(w); };
      document.body.appendChild(d);
    };
    s.onerror = function () { cb(null); };
    document.body.appendChild(s);
  }

  function show(html, opts) {
    opts = opts || {};
    document.body.classList.toggle('is-deck', !!opts.deck);
    document.body.classList.toggle('is-home', !!opts.home);
    document.body.classList.toggle('is-scenes', !!opts.scenes);
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
    var parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    var all = screens();

    if (!parts.length || parts[0] !== 'portfolio' || parts.length === 1) {
      var id = parts[0] || '', k = -1;
      all.forEach(function (x, j) { if (x.id === id) k = j; });
      if (k < 0) { deck = null; return notFound(); }
      if (deck && deck.scenes && document.querySelector('.deck--scenes')) return go(k);
      deck = null;
      return scenesView(all, k);
    }
    deck = null;

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

    if (!p.page) {
      if (!(p.how || {}).svg || diagrams[p.id]) return simple();
      var ds = document.createElement('script');
      ds.src = 'data/work/' + p.id + '.diagrams.js';
      ds.onload = ds.onerror = simple;
      return document.body.appendChild(ds);
    }
    loadWork(p.page, function (w) {
      if (!w) return simple();
      var single = w.products.length === 1;
      if (!product) {
        if (single) { location.replace('#/' + base + '/' + w.products[0].id + '/why'); return; }
        return show(suiteView(p, w), { screen: 'portfolio', title: w.title });
      }
      var crumbs2 = crumbBase.concat(single ? [] : [{ label: w.title, href: link(base) }]);
      var opts;
      if (product === 'products') {
        opts = { slides: productTour(w, base), views: [], view: '', base: base + '/products',
          name: w.title, kind: [], crumbs: crumbs2.concat([{ label: 'Products' }]) };
        show(deckView(opts), { deck: true, view: 'why', screen: 'portfolio', title: w.title });
        return startDeck(opts, Math.max(0, (parseInt(parts[3], 10) || 1) - 1));
      }
      {
        var pr = byId(w.products, product);
        if (!pr) return notFound();
        opts = { slides: view === 'how' ? productHow(w, pr) : productWhy(w, pr), views: ['why', 'how'], view: view,
          base: base + '/' + pr.id, name: pr.name, kind: pr.kind,
          crumbs: crumbs2.concat([{ label: pr.name, href: link(base + '/products/' + (w.products.indexOf(pr) + 1)) }, { label: view === 'how' ? 'How I built this' : 'Why I built this' }]) };
      }
      show(deckView(opts), { deck: true, view: view, screen: 'portfolio', title: opts.name });
      startDeck(opts, idx);
    });
  }

  /* ---------------- interaction ---------------- */

  function bind() {
    document.addEventListener('click', function (e) {
      if (swiped && e.target.closest('[data-viewport] a')) { e.preventDefault(); return; }
      var dl = e.target.closest && e.target.closest('.dg [data-href]');
      if (dl) { location.hash = dl.getAttribute('data-href'); return; }
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

    // Diagram tooltips: hover or keyboard focus on a box shows its purpose.
    var tip = document.createElement('div');
    tip.className = 'dg-tip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
    document.body.appendChild(tip);
    function showTip(el, x, y) {
      tip.innerHTML = '<strong>' + esc(el.querySelector('.dg-nt').textContent) + '</strong>' + esc(el.getAttribute('data-tip'));
      tip.hidden = false;
      var r = tip.getBoundingClientRect();
      var left = Math.min(window.innerWidth - r.width - 12, Math.max(12, x - r.width / 2));
      var top = y - r.height - 14;
      if (top < 8) top = y + 22;
      tip.style.left = left + 'px'; tip.style.top = top + 'px';
    }
    document.addEventListener('mousemove', function (e) {
      var n = e.target.closest && e.target.closest('.dg [data-tip]');
      if (n) showTip(n, e.clientX, e.clientY); else tip.hidden = true;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var dl = e.target.closest && e.target.closest('.dg [data-href]');
      if (dl) location.hash = dl.getAttribute('data-href');
    });
    document.addEventListener('focusin', function (e) {
      var n = e.target.closest && e.target.closest('.dg [data-tip]');
      if (!n) { tip.hidden = true; return; }
      var r = n.getBoundingClientRect();
      showTip(n, r.left + r.width / 2, r.top);
    });
    window.addEventListener('hashchange', route);
  }

  /* ---------------- boot ---------------- */

  function drawChrome() {
    var nav = document.getElementById('nav');
    nav.innerHTML = screens().filter(function (s) { return s.nav && s.id; }).map(function (s) {
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
  window.PORTFOLIO_WORK = { register: function (d) { works[d.id] = d; }, diagrams: function (id, map) { diagrams[id] = map; } };
})();
