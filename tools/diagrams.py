"""
Architecture diagrams for the portfolio, drawn as SVG.

    python3 tools/diagrams.py

writes data/work/volleyball.diagrams.js, which registers each diagram with the
site. Colors come from CSS classes in assets/app.css (.dg-*), so diagrams
follow the page accent and dark mode.

Keep the drawing tight: a name on each box, a word or two on an arrow. The
purpose of each box goes in its tip, which the site shows on hover or focus.
Coordinates are in a 1200-wide viewBox.
"""
import json, os
from html import escape

W = 1200

def zone(x, y, w, h, label):
    return (f'<g class="dg-zone"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12"/>'
            f'<text class="dg-zl" x="{x+16}" y="{y+26}">{escape(label)}</text></g>')

def node(x, y, w, h, title, tip, kind='n', chips=None):
    """kind: n component, key primary, db data store, ext external service, ai agent"""
    s = (f'<g class="dg-node dg-{kind}" tabindex="0" data-tip="{escape(tip)}" '
         f'aria-label="{escape(title)}: {escape(tip)}">'
         f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/>')
    if chips:
        s += f'<text class="dg-nt" x="{x+w/2}" y="{y+30}">{escape(title)}</text>'
        cw = (w - 24 - 10 * (len(chips) - 1)) / len(chips)
        for i, c in enumerate(chips):
            cx = x + 12 + i * (cw + 10)
            s += (f'<rect class="dg-chip" x="{cx}" y="{y+44}" width="{cw}" height="30" rx="15"/>'
                  f'<text class="dg-ct" x="{cx+cw/2}" y="{y+64}">{escape(c)}</text>')
    else:
        s += f'<text class="dg-nt" x="{x+w/2}" y="{y+h/2+5}">{escape(title)}</text>'
    return s + '</g>'

def arrow(points, label=None, lx=None, ly=None, anchor='middle', both=False, dashed=False):
    d = 'M' + ' L'.join(f'{px},{py}' for px, py in points)
    cls = 'dg-e' + (' dg-e--dash' if dashed else '')
    s = f'<path class="{cls}" d="{d}" marker-end="url(#dg-arrow)"' + (' marker-start="url(#dg-arrow-r)"' if both else '') + '/>'
    if label:
        if lx is None:
            (x1, y1), (x2, y2) = points[0], points[-1]
            lx, ly = (x1 + x2) / 2, min(y1, y2) - 8
        s += f'<text class="dg-el" x="{lx}" y="{ly}" text-anchor="{anchor}">{escape(label)}</text>'
    return s

DEFS = ('<defs>'
        '<marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">'
        '<path d="M0,0 L10,5 L0,10 z" class="dg-head"/></marker>'
        '<marker id="dg-arrow-r" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto">'
        '<path d="M10,0 L0,5 L10,10 z" class="dg-head"/></marker>'
        '</defs>')

def svg(h, body, title):
    return (f'<svg class="dg" viewBox="0 0 {W} {h}" role="img" aria-label="{escape(title)}" '
            f'xmlns="http://www.w3.org/2000/svg">{DEFS}{body}</svg>')


# --------------------------------------------------------------------------
# Stat Tracker
# --------------------------------------------------------------------------
def stat_tracker():
    b = zone(20, 20, 680, 300, 'Volunteer’s phone (PWA)')
    pages = [
        ('Match setup', 'Pick the team, opponent, tournament and format. Remembers the last team used.'),
        ('Tracker', 'Live stat entry: action, player, result. Three taps a play, one-handed, portrait.'),
        ('Rosters', 'Teams and the club-wide player directory. Swing players, home and away numbers.'),
        ('Learn', 'A ten-screen swipe-through guide for new stat keepers, ending in the practice app.'),
    ]
    for i, (t, tip) in enumerate(pages):
        b += node(40 + i * 162, 62, 148, 46, t, tip)
    b += node(200, 152, 300, 48, 'offline-storage.js',
              'The data layer every page shares. Writes to the phone first, queues changes, and syncs with Supabase when a connection is there.', 'key')
    b += node(40, 248, 200, 48, 'localStorage',
              'The primary store during a match. Matches, plays and rosters live here first, so a gym with no signal loses nothing.', 'db')
    b += node(300, 248, 180, 48, 'Service worker',
              'Caches the app so it opens instantly and works offline. App files cache-first; CDN files network-first.')
    b += node(530, 248, 150, 48, 'Cache Storage', 'The cached app shell the service worker serves from.', 'db')
    b += arrow([(274, 108), (274, 152)])
    b += arrow([(240, 200), (240, 222), (140, 222), (140, 248)])
    b += arrow([(480, 272), (530, 272)])

    b += zone(780, 20, 400, 300, 'Supabase')
    b += node(820, 152, 320, 48, 'PostgREST API',
              'Supabase’s HTTPS API over Postgres, called through the supabase-js client.', 'key')
    b += node(820, 248, 320, 48, 'Postgres',
              'Teams, players, rosters, opponents, tournaments, matches, set scores, the play-by-play log and player stats. Stat rows are never rewritten.', 'db')
    b += arrow([(980, 200), (980, 248)], both=True)
    b += arrow([(500, 166), (820, 166)], 'push every 30 s', 660, 156)
    b += arrow([(820, 188), (500, 188)], 'pull rosters', 660, 210)

    b += zone(20, 370, 360, 120, 'GitHub')
    b += node(40, 414, 140, 48, 'Repo', 'Code, docs and SQL migrations for the tracker, analyzer and tournament apps.')
    b += node(220, 414, 140, 48, 'Actions',
              'Runs 600+ Jest unit tests and Playwright phone tests on every pull request and merge.', 'ext')
    b += arrow([(180, 438), (220, 438)])

    b += zone(420, 370, 380, 120, 'Netlify')
    b += node(440, 414, 160, 48, 'Production',
              'The live tracker. Builds from main; a script skips deploys for changes the site does not serve.')
    b += node(620, 414, 160, 48, 'Demo',
              'Same code built with APP_MODE=demo: an invented roster, a banner, and nothing written to Supabase. Volunteers practice here.')
    b += arrow([(380, 438), (420, 438)])
    b += arrow([(520, 414), (520, 320)], 'serves', 528, 352, 'start')

    b += zone(840, 370, 340, 120, 'CDNs')
    b += node(860, 414, 140, 48, 'jsDelivr', 'Delivers the supabase-js client library.', 'ext')
    b += node(1020, 414, 140, 48, 'Google Fonts', 'Oswald and Barlow Condensed, the tracker’s type.', 'ext')
    b += arrow([(930, 414), (930, 345), (660, 345), (660, 320)], 'libraries', 795, 337)
    return svg(510, b, 'Stat Tracker architecture')


# --------------------------------------------------------------------------
# Stat Analyzer
# --------------------------------------------------------------------------
def stat_analyzer():
    b = zone(20, 20, 300, 240, 'Supabase')
    b += node(40, 64, 260, 48, 'PostgREST API', 'Supabase’s HTTPS API, read through supabase-js.', 'key')
    b += node(40, 168, 260, 48, 'Postgres',
              'Completed matches, set scores and player stats, written by the Stat Tracker.', 'db')
    b += arrow([(170, 112), (170, 168)], both=True)

    b += zone(20, 300, 300, 120, 'Stat Tracker')
    b += node(40, 344, 260, 48, 'Volunteers’ phones', 'Each phone records a match and syncs it to Supabase.', 'ext')
    b += arrow([(170, 344), (170, 260)], 'sync', 178, 302, 'start')

    b += zone(370, 20, 460, 470, 'Coach’s browser')
    steps = [
        ('Load', 'One fetch of every completed match, its sets and its player stats.'),
        ('Merge', 'Adds completed matches still on this device that have not synced yet, from localStorage.'),
        ('Filter', 'By team, tournament and opponent. Filters live in the URL, so a view can be shared.', 'key'),
        ('Aggregate', 'Season record by sets, grand totals, kill %, hitting %, serve and error breakdowns, all computed on the page.', 'key'),
        ('Render', 'Team record, match history set by set, attack, serve and error tables. Sortable.'),
    ]
    y = 64
    for i, st in enumerate(steps):
        b += node(400, y, 400, 44, st[0], st[1], st[2] if len(st) > 2 else 'n')
        if i:
            b += arrow([(600, y - 22), (600, y)])
        y += 66
    b += node(400, 414, 190, 48, 'Excel export', 'Builds the .xlsx in the browser with ExcelJS and downloads it.')
    b += node(610, 414, 190, 48, 'Sheets export', 'Signs the coach in with Google and writes a new spreadsheet with the filtered data.')
    b += arrow([(495, 372), (495, 414)])
    b += arrow([(705, 372), (705, 414)])
    b += arrow([(300, 86), (400, 86)], 'select', 350, 78)

    b += zone(880, 20, 300, 110, 'Netlify')
    b += node(900, 62, 260, 48, 'Coach link', 'analyze-stats.html, its own link so coaches go straight to the numbers.')
    b += arrow([(900, 86), (830, 86)], 'page', 865, 78)

    b += zone(880, 150, 300, 110, 'jsDelivr')
    b += node(900, 192, 120, 48, 'supabase-js', 'Client library for the Supabase API.', 'ext')
    b += node(1040, 192, 120, 48, 'ExcelJS', 'Builds Excel files in the browser.', 'ext')
    b += arrow([(900, 216), (830, 216)], 'libraries', 865, 208)

    b += zone(880, 280, 300, 210, 'Google')
    b += node(900, 322, 260, 40, 'Identity Services', 'OAuth sign-in that grants the page access to create a sheet.', 'ext')
    b += node(900, 378, 260, 40, 'Sheets API', 'Creates the spreadsheet and writes the rows.', 'ext')
    b += node(900, 434, 260, 40, 'Coach’s Drive', 'Where the new spreadsheet lands.', 'db')
    b += arrow([(1030, 362), (1030, 378)])
    b += arrow([(1030, 418), (1030, 434)])
    b += arrow([(800, 438), (850, 438), (850, 342), (900, 342)])
    return svg(510, b, 'Stat Analyzer architecture')


# --------------------------------------------------------------------------
# Tournament Platform: the four surfaces and what feeds them
# --------------------------------------------------------------------------
def tournament():
    b = zone(20, 16, 870, 52, 'Netlify')
    for x, t, tip in [(150, '/invite', 'The one link sent to families a week before the event.'),
                      (452, '/score/N', 'Printed on the QR card taped to each score table. The card is the access control.'),
                      (735, '/tv', 'Opened on the laptop that drives the wall TV.')]:
        b += node(x, 24, 110, 36, t, tip, 'ext')

    b += zone(20, 96, 1160, 132, 'Surfaces')
    b += node(36, 132, 300, 84, 'Tournament App',
              'For families and visiting coaches. Before the event, a swipeable preview; on game day, a live hub with courts, standings and brackets. Links to the waiver.',
              'key', chips=['Mobile', 'Desktop'])
    b += node(352, 132, 250, 84, 'Scorekeeper',
              'One volunteer per score table taps +1. Opened from the QR card, so no login. Guards against two phones scoring one match.', 'key')
    b += node(618, 132, 256, 84, 'TV wall',
              'The walk-by display: live standings with the gold-bracket cut line, both courts, what is next, and rotating sponsor panels.', 'key')
    b += node(910, 132, 254, 84, 'Volunteer sheet',
              'Google Sheet where families sign up for volunteer shifts.', 'key')
    for x in (205, 507, 790):
        b += arrow([(x, 60), (x, 132)])

    b += zone(20, 256, 870, 84, 'Supabase')
    b += node(352, 280, 522, 44, 'Postgres: matches and sets',
              'Holds only the points. Standings, seeding and brackets are computed from these rows on every screen.', 'db')
    b += arrow([(477, 216), (477, 280)], 'points', 485, 250, 'start')
    b += arrow([(746, 280), (746, 216)], 'every 15 s', 754, 250, 'start')
    b += arrow([(352, 302), (186, 302), (186, 216)], 'every 15 s', 194, 250, 'start')

    b += zone(910, 256, 270, 204, 'Google')
    b += node(926, 292, 238, 44, 'Waiver form', 'One waiver per athlete, linked from the Tournament App menu.', 'ext')
    b += node(926, 364, 238, 44, 'Responses sheet', 'Every signed waiver, with athlete, team and parent.', 'db')
    b += arrow([(1045, 336), (1045, 364)])

    b += zone(20, 376, 870, 84, 'Claude agents')
    b += node(36, 400, 300, 44, 'Schedule agent',
              'Built the full schedule: court assignments and matchups from the format’s rules and constraints.', 'ai')
    b += node(352, 400, 250, 44, 'Waiver agent',
              'Hourly check of signed waivers against visiting rosters, with fuzzy name matching. Emails a daily status to the athletic director and me.', 'ai')
    b += node(618, 400, 256, 44, 'Daily status email', 'Who is still missing a waiver, by team.', 'ext')
    b += arrow([(186, 400), (186, 358), (420, 358), (420, 324)], 'schedule', 300, 352)
    b += arrow([(602, 422), (618, 422)])
    b += arrow([(926, 386), (540, 386), (540, 400)], 'reads', 740, 380)
    return svg(476, b, 'Tournament Platform architecture')


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, '..', 'data', 'work', 'volleyball.diagrams.js')
    payload = {'stats': stat_tracker(), 'analyzer': stat_analyzer(), 'tournament': tournament()}
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('volleyball', " + json.dumps(payload, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
