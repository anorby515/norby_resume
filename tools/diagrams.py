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


_clip = [0]
def shot(x, y, w, h, src, caption, tip, phone=False, href=None):
    """A screenshot inside the diagram, with its caption underneath."""
    _clip[0] += 1
    cid = f'dgc{_clip[0]}'
    r = 14 if phone else 6
    img_src = 'assets/work/volleyball/' + src
    s = (f'<g class="dg-node dg-shot" tabindex="0" data-tip="{escape(tip)}"' + (f' data-href="{href}" role="link"' if href else '') + f' aria-label="{escape(caption)}: {escape(tip)}">'
         f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"/></clipPath>'
         f'<image href="{img_src}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMin slice" clip-path="url(#{cid})"/>'
         f'<rect class="dg-frame{" dg-frame--phone" if phone else ""}" x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"/>'
         f'<text class="dg-nt" x="{x + w/2}" y="{y + h + 22}">{escape(caption)}</text></g>')
    return s

def label(x, y, lines, anchor='middle'):
    return ''.join(f'<text class="dg-el" x="{x}" y="{y + i*15}" text-anchor="{anchor}">{escape(t)}</text>' for i, t in enumerate(lines))

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
# Eclipse Volleyball: the product suite, shown on the overview page
# --------------------------------------------------------------------------
def suite():
    b = zone(20, 20, 350, 600, 'Stats App')
    b += shot(142, 64, 106, 230, 'st-tracker.webp', 'Stats Tracker',
              'Any parent takes stats on their phone: three taps a play, works with no signal, syncs when it can.', phone=True, href='#/portfolio/volleyball/products/2')
    b += shot(45, 390, 300, 168, 'an-attack.webp', 'Stats Analyzer',
              'Coaches check stats on game day and analyze players and opponent matchups all season. Exports to Excel.', href='#/portfolio/volleyball/products/2')
    b += arrow([(195, 322), (195, 390)])
    b += label(205, 362, ['every play'], 'start')

    b += zone(420, 20, 360, 600, '')
    b += node(500, 44, 200, 44, 'Club calendar',
              'The athletic director books every event here, in her own shorthand.', 'ext')
    b += ('<g class="dg-node dg-ai dg-os" tabindex="0" data-href="#/portfolio/volleyball/products/1" role="link" data-tip="Claude agents on a schedule, following the club’s rules in a versioned skill. They plan events, keep TeamSnap current, assign volunteers, chase waivers and send the weekly email." '
          'aria-label="Eclipse Agentic OS">'
          '<rect x="440" y="196" width="320" height="214" rx="12"/>'
          '<text class="dg-nt dg-os-t" x="600" y="236">Eclipse Agentic OS</text>'
          '<text class="dg-os-s" x="600" y="258">Claude agents</text>')
    for i, t in enumerate(['Schedules and court assignments', 'TeamSnap imports', 'Volunteer assignments', 'Waivers and reminders', 'Sunday email']):
        b += f'<text class="dg-os-l" x="600" y="{290 + i*24}">{escape(t)}</text>'
    b += '</g>'
    b += node(500, 520, 200, 48, 'TeamSnap',
              'Where every parent and coach reads the schedule. Updated from the agent’s imports, so it stays current.', 'ext')
    b += arrow([(600, 88), (600, 196)])
    b += label(610, 146, ['events'], 'start')
    b += arrow([(600, 410), (600, 520)])
    b += label(610, 458, ['imports and', 'volunteer assignments'], 'start')

    b += arrow([(440, 250), (408, 250), (408, 180), (252, 180)])
    b += label(330, 172, ['rosters'])

    b += zone(830, 20, 350, 600, 'Tournament Suite')
    b += shot(855, 64, 300, 169, 'tp-tv.webp', 'Command Center',
              'On the gym TVs: live scores, live standings with the gold-bracket cut line, and sponsor ads.', href='#/portfolio/volleyball/products/3')
    b += shot(852, 330, 97, 210, 'tp-hub.webp', 'Tournament App',
              'Families follow live scores, standings, schedule updates and which courts are running behind.', phone=True, href='#/portfolio/volleyball/products/3')
    b += shot(976, 400, 190, 82, 'tp-score-land.webp', 'Scorekeeper',
              'On every court, turned sideways: one volunteer taps +1 and the score reaches every phone and TV.', href='#/portfolio/volleyball/products/3')
    b += arrow([(1120, 400), (1120, 258)])
    b += label(1128, 330, ['live', 'scores'], 'start')
    b += arrow([(976, 441), (949, 441)])

    b += arrow([(760, 300), (852, 300)])
    b += label(806, 268, ['schedule,', 'courts, waivers'], 'middle')
    return svg(640, b, 'Eclipse Volleyball product architecture')


# --------------------------------------------------------------------------
# Eclipse Agentic OS: Claude running the club schedule
# --------------------------------------------------------------------------
def agentic_os():
    b = zone(20, 20, 250, 340, 'Sources')
    b += node(36, 64, 218, 44, 'Tournament links',
              'Host sites and shared workbooks for each tournament: draws, pools, courts and times.', 'ext')
    b += node(36, 128, 218, 44, 'TeamSnap export',
              'What TeamSnap actually holds, exported by hand (TeamSnap has no API). Used to verify deletes and spot drift.', 'ext')
    b += node(36, 192, 218, 44, 'TeamSnap feed',
              'TeamSnap’s own calendar feed, mirrored into Google Calendar. Lags 8 to 24 hours, so it only confirms that an import landed.', 'ext')
    b += node(36, 256, 218, 64, 'Club calendar',
              'The athletic director’s Google Calendar: the source of truth for every event, written in her own shorthand.', 'key')

    b += zone(320, 20, 540, 340, 'Claude')
    jobs = [
        ('Calendar watch', 'Twice a day, unattended. Diffs the calendar against the last snapshot and notifies only when something changed, plus a weekly heartbeat so silence never hides a failure.'),
        ('Change analysis', 'On demand, after a TeamSnap export: the rows to delete, the rows to import, a plain-language summary, and a drift report.'),
        ('Event planning', 'Builds tournament and game-night schedules, court assignments and matchups from the rules and constraints.'),
        ('Live tournament watch', 'During a tournament, picks up new games as they are added and updates volunteer assignments and TeamSnap imports.'),
        ('Sunday email', 'Every Sunday: this week, next week and the two after, with gaps, TBDs and missing start times called out.'),
    ]
    for i, (t, tip) in enumerate(jobs):
        b += node(336, 56 + i * 44, 250, 36, t, tip, 'ai')
    b += node(620, 60, 224, 52, 'Eclipse skill',
              'The playbook every run follows: two modes, team-name mapping, venues, override events, and the delete-first-then-import rule. Versioned, so unattended runs behave the same.', 'key')
    b += node(620, 136, 224, 44, 'sync_check.py',
              'Diffs by Google event ID, parses the athletic director’s shorthand into team rows, and verifies the delete list against the TeamSnap export.')
    b += node(620, 204, 224, 44, 'Snapshot',
              'eclipse-calendar-snapshot.json in Google Drive: the calendar state TeamSnap is aligned to. Only analysis advances it.', 'db')
    b += arrow([(586, 74), (620, 74)])
    b += arrow([(732, 112), (732, 136)])
    b += arrow([(732, 180), (732, 204)])
    conns = [('Calendar', 'Google Calendar connector: reads the club calendar and the TeamSnap feed.'),
             ('Drive', 'Google Drive connector: the snapshot, the export mirror and the outputs.'),
             ('Gmail', 'Gmail connector: weekly and change emails.'),
             ('Todoist', 'Todoist connector: one task per change, due today.'),
             ('My Mac', 'Reads the TeamSnap export from my laptop when it is online.')]
    for i, (t, tip) in enumerate(conns):
        b += node(336 + i * 102, 314, 94, 32, t, tip, 'ext')
    b += ('<text class="dg-zl" x="336" y="304">Connectors</text>')
    b += arrow([(270, 180), (336, 180)], 'reads', 303, 172)

    b += zone(910, 20, 270, 340, 'Outputs')
    outs = [
        ('TeamSnap imports', 'CSV rows ready for TeamSnap’s importer: games and other events, one row per team.'),
        ('Delete worklist', 'The exact rows to remove in TeamSnap first. TeamSnap’s importer appends and never merges.'),
        ('Volunteer assignments', 'Volunteer events for every team, updated as tournament games are added.'),
        ('Schedules', 'Printable game-night and tournament schedules: PDF, image and spreadsheet.'),
        ('Notifications', 'A Todoist task, a phone push and an email, leading with what I need to do next.'),
    ]
    for i, (t, tip) in enumerate(outs):
        b += node(926, 60 + i * 58, 238, 44, t, tip, 'db' if i < 3 else 'n')
    b += arrow([(844, 230), (926, 230)], 'writes', 885, 222)

    b += zone(20, 400, 1160, 92, 'People')
    b += node(36, 440, 218, 40, 'Athletic director', 'Books events in her calendar and gets the Sunday email. Nothing new to learn.')
    b += node(336, 440, 250, 40, 'Parents and coaches', 'Read the schedule in TeamSnap, where it now lands the same week it is booked.')
    b += node(620, 440, 224, 40, 'TeamSnap', 'Where every family and coach reads the schedule.', 'ext')
    b += node(926, 440, 238, 40, 'Me', 'Reviews the change summary, deletes first, then imports. The one human step, by design.', 'key')
    b += arrow([(145, 440), (145, 320)], 'books', 153, 392, 'start')
    b += arrow([(1045, 350), (1045, 440)], 'review', 1053, 392, 'start')
    b += arrow([(926, 460), (844, 460)], 'import', 885, 452)
    b += arrow([(620, 460), (586, 460)])
    return svg(504, b, 'Eclipse Agentic OS architecture')


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
    return svg(482, b, 'Tournament Suite architecture')


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, '..', 'data', 'work', 'volleyball.diagrams.js')
    payload = {'suite': suite(), 'os': agentic_os(), 'stats': stats_app(), 'tournament': tournament()}
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('volleyball', " + json.dumps(payload, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
