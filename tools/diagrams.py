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
# Stats App: the tracker on volunteers' phones and the coaches' analytics
# --------------------------------------------------------------------------
def stats_app():
    b = zone(20, 20, 540, 290, 'Volunteer’s phone')
    pages = [
        ('Match setup', 'Pick the team, opponent, tournament and format. Remembers the last team used.'),
        ('Tracker', 'Live stat entry: action, player, result. Three taps a play, one-handed, portrait.'),
        ('Rosters', 'Teams and the club-wide player directory. Swing players, home and away numbers.'),
        ('Learn', 'A ten-screen swipe-through guide for new stat keepers, ending in the practice app.'),
    ]
    for i, (t, tip) in enumerate(pages):
        b += node(36 + i * 128, 62, 118, 44, t, tip)
    b += node(140, 150, 280, 44, 'offline-storage.js',
              'The data layer every page shares. Writes to the phone first, queues changes, and syncs with Supabase when a connection is there.', 'key')
    b += node(36, 240, 220, 44, 'localStorage',
              'The primary store during a match. Matches, plays and rosters live here first, so a gym with no signal loses nothing.', 'db')
    b += node(300, 240, 244, 44, 'Service worker',
              'Caches the app so it opens instantly and works offline. App files cache-first; CDN files network-first.')
    b += arrow([(225, 106), (225, 150)])
    b += arrow([(200, 194), (200, 216), (146, 216), (146, 240)])

    b += zone(620, 20, 260, 290, 'Supabase')
    b += node(636, 150, 228, 44, 'PostgREST API', 'Supabase’s HTTPS API over Postgres, called through the supabase-js client.', 'key')
    b += node(636, 240, 228, 44, 'Postgres',
              'Teams, players, rosters, opponents, tournaments, matches, set scores, the play-by-play log and player stats. Stat rows are never rewritten.', 'db')
    b += arrow([(750, 194), (750, 240)], both=True)
    b += arrow([(420, 162), (636, 162)], 'push every 30 s', 528, 152)
    b += arrow([(636, 182), (420, 182)], 'pull rosters', 528, 204)

    b += zone(940, 20, 240, 290, 'Coach’s browser')
    b += node(956, 150, 208, 44, 'Analytics',
              'Loads completed matches once, then filters by team, tournament and opponent and computes record, totals, attack, serve, block and error stats on the page.', 'key')
    b += node(956, 240, 98, 44, 'Excel', 'Exports every filtered table to an .xlsx file, built in the browser, for coaches’ own analysis.')
    b += node(1066, 240, 98, 44, 'Sheets', 'Signs the coach in with Google and writes the data to a new spreadsheet in their Drive.')
    b += arrow([(864, 172), (956, 172)], 'select', 910, 164)
    b += arrow([(1005, 194), (1005, 240)])
    b += arrow([(1115, 194), (1115, 240)])

    b += zone(20, 350, 270, 110, 'GitHub')
    b += node(36, 392, 110, 44, 'Repo', 'Code, docs and SQL migrations for every Eclipse app.')
    b += node(162, 392, 112, 44, 'Actions', 'Runs 600+ Jest unit tests and Playwright phone tests on every pull request and merge.', 'ext')
    b += arrow([(146, 414), (162, 414)])

    b += zone(320, 350, 300, 110, 'Netlify')
    b += node(336, 392, 130, 44, 'Production', 'The live app for the club. Builds from main; a script skips deploys for changes the site does not serve.')
    b += node(476, 392, 128, 44, 'Demo', 'Same code in demo mode: an invented roster, a banner, and nothing written. Volunteers practice here.')
    b += arrow([(290, 414), (320, 414)])
    b += arrow([(401, 392), (401, 310)], 'serves', 409, 340, 'start')

    b += zone(650, 350, 230, 110, 'CDNs')
    b += node(666, 392, 98, 44, 'jsDelivr', 'Delivers supabase-js and ExcelJS.', 'ext')
    b += node(774, 392, 90, 44, 'Fonts', 'Google Fonts: Oswald and Barlow Condensed.', 'ext')

    b += zone(910, 350, 270, 110, 'Google')
    b += node(926, 392, 238, 44, 'Sign-in and Sheets API', 'OAuth sign-in, then the Sheets API creates the coach’s spreadsheet.', 'ext')
    b += arrow([(1115, 284), (1115, 392)], 'export', 1123, 340, 'start')
    return svg(476, b, 'Stats App architecture')


# --------------------------------------------------------------------------
# Tournament Platform: the four surfaces and what feeds them
# --------------------------------------------------------------------------
def tournament():
    b = zone(20, 16, 870, 52, 'Netlify')
    for x, t, tip in [(150, '/invite', 'The one link sent to families a week before the event.'),
                      (452, '/score/N', 'Printed on the QR card taped to each score table. The card is the access control.'),
                      (735, '/tv', 'Opened on the laptop that drives the gym TVs.')]:
        b += node(x, 24, 110, 36, t, tip, 'ext')

    b += zone(20, 96, 1160, 132, 'Surfaces')
    b += node(36, 132, 300, 84, 'Tournament App',
              'For families: live scores, live standings, schedule updates and which courts are running behind. A swipeable preview before the event. Links to the waiver.',
              'key', chips=['Mobile', 'Desktop'])
    b += node(352, 132, 250, 84, 'Scorekeeper',
              'On every court: one volunteer taps +1, and the score reaches parents’ phones and the TVs. Opened from the QR card, so no login.', 'key')
    b += node(618, 132, 256, 84, 'Command Center',
              'The Tournament Command Center on the gym TVs: live scores, live standings with the gold-bracket cut line, and sponsor ads.', 'key')
    b += node(910, 132, 254, 84, 'Volunteer sheet',
              'Volunteer assignments for the day, created by the tournament agent.', 'key')
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

    b += zone(20, 376, 870, 84, 'Claude')
    b += node(36, 400, 566, 44, 'Tournament agent',
              'Built the schedule (courts and matchups from the rules and constraints), monitored waivers against visiting rosters, sent reminders and a daily status, and created the volunteer assignments.', 'ai')
    b += node(618, 400, 256, 44, 'Reminders and status', 'Waiver reminders, and a daily status email to the athletic director and me.', 'ext')
    b += arrow([(186, 400), (186, 358), (420, 358), (420, 324)], 'schedule', 300, 352)
    b += arrow([(602, 422), (618, 422)])
    b += arrow([(926, 386), (540, 386), (540, 400)], 'reads waivers', 740, 380)
    b += arrow([(560, 444), (560, 470), (898, 470), (898, 240), (1037, 240), (1037, 216)], 'volunteer assignments', 730, 462)
    return svg(482, b, 'Tournament Platform architecture')


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, '..', 'data', 'work', 'volleyball.diagrams.js')
    payload = {'stats': stats_app(), 'tournament': tournament()}
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('volleyball', " + json.dumps(payload, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
