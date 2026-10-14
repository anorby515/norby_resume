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

def zone(x, y, w, h, label, center=False):
    """center=True puts the label mid-zone, clear of arrows entering on the left."""
    lx, anchor = (x + w / 2, ' text-anchor="middle"') if center else (x + 16, '')
    return (f'<g class="dg-zone"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12"/>'
            f'<text class="dg-zl" x="{lx}" y="{y+26}"{anchor}>{escape(label)}</text></g>')

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
    caps = caption if isinstance(caption, list) else [caption]
    caption = ' '.join(caps)
    s = (f'<g class="dg-node dg-shot" tabindex="0" data-tip="{escape(tip)}"' + (f' data-href="{href}" role="link"' if href else '') + f' aria-label="{escape(caption)}: {escape(tip)}">'
         f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"/></clipPath>'
         f'<image href="{img_src}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMin slice" clip-path="url(#{cid})"/>'
         f'<rect class="dg-frame{" dg-frame--phone" if phone else ""}" x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"/>'
         + ''.join(f'<text class="dg-nt" x="{x + w/2}" y="{y + h + 22 + i*19}">{escape(c)}</text>' for i, c in enumerate(caps))
         + '</g>')
    return s

def teamsnap_node(x, y, w, h):
    """TeamSnap, shown as its official logo (assets/icons/TeamSnapOne.jpg)."""
    tip = 'Where every parent and coach reads the schedule. Kept current by the agents’ CSV imports.'
    return (f'<g class="dg-node dg-shot" tabindex="0" data-tip="{escape(tip)}" aria-label="TeamSnap: {escape(tip)}">'
            f'<clipPath id="dgc-ts"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/></clipPath>'
            f'<image href="assets/icons/TeamSnapOne.jpg" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#dgc-ts)"/>'
            f'<rect class="dg-frame" x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/></g>')

def node2(x, y, w, h, title, sub, tip, kind='n'):
    """A box with a name and a short role line underneath."""
    return (f'<g class="dg-node dg-{kind}" tabindex="0" data-tip="{escape(tip)}" '
            f'aria-label="{escape(title)}, {escape(sub)}: {escape(tip)}">'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/>'
            f'<text class="dg-nt" x="{x+w/2}" y="{y+h/2-2}">{escape(title)}</text>'
            f'<text class="dg-sub" x="{x+w/2}" y="{y+h/2+15}">{escape(sub)}</text></g>')

def group(x, y, w, h, title):
    """A dashed outline that gathers related boxes under a small heading."""
    return (f'<rect class="dg-group" x="{x}" y="{y}" width="{w}" height="{h}" rx="10"/>'
            f'<text class="dg-gl" x="{x+14}" y="{y+18}">{escape(title)}</text>')

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
    b += shot(45, 390, 300, 168, 'an-attack.webp', 'Stats Analyzer for Coaches',
              'Coaches check stats on game day and analyze players and opponent matchups all season. Exports to Excel.', href='#/portfolio/volleyball/products/2')
    b += arrow([(195, 322), (195, 390)])
    b += label(205, 362, ['every play'], 'start')

    b += zone(420, 20, 360, 600, '')
    b += teamsnap_node(492, 30, 216, 66)
    b += ('<g class="dg-node dg-ai dg-os" tabindex="0" data-href="#/portfolio/volleyball/products/1" role="link" data-tip="Claude agents on a schedule, following the club’s rules in a versioned skill. They plan events, keep TeamSnap current, assign volunteers, chase waivers and send the weekly email." '
          'aria-label="Eclipse Agentic OS">'
          '<rect x="440" y="196" width="320" height="214" rx="12"/>'
          '<text class="dg-nt dg-os-t" x="600" y="236">Eclipse Agentic OS</text>'
          '<text class="dg-os-s" x="600" y="258">Claude agents</text>')
    for i, t in enumerate(['Schedules and court assignments', 'TeamSnap imports', 'Volunteer assignments', 'Waivers and reminders', 'Sunday email']):
        b += f'<text class="dg-os-l" x="600" y="{290 + i*24}">{escape(t)}</text>'
    b += '</g>'
    b += arrow([(600, 196), (600, 96)])
    b += label(610, 136, ['events, games, practice', 'CSV imports'], 'start')

    b += node(440, 520, 150, 48, 'Club calendar',
              'The athletic director books every event here, in her own shorthand.', 'ext')
    b += node(610, 520, 150, 48, 'Google Sheets',
              'Volunteer assignments for every team, written by the agents and shared with parents.', 'ext')
    b += arrow([(515, 520), (515, 410)])
    b += label(523, 470, ['events'], 'start')
    b += arrow([(685, 410), (685, 520)])
    b += label(677, 458, ['volunteer', 'assignments'], 'end')

    b += arrow([(440, 250), (408, 250), (408, 180), (252, 180)])
    b += label(330, 142, ['rosters, opponents,', 'tournaments,', 'match formats'])

    b += zone(830, 20, 350, 600, 'Tournament Suite')
    b += shot(855, 64, 300, 169, 'tp-tv.webp', 'Command Center',
              'On the gym TVs: live scores, live standings with the gold-bracket cut line, and sponsor ads.', href='#/portfolio/volleyball/products/3')
    b += shot(852, 330, 97, 210, 'tp-hub.webp', 'Tournament App',
              'Families follow live scores, standings, schedule updates and which courts are running behind.', phone=True, href='#/portfolio/volleyball/products/3')
    b += shot(976, 400, 190, 82, 'tp-score-land.webp', ['Scorekeeper App', '@ every court'],
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
    # ---- the actors, left to right in the order a schedule change travels ----
    b = zone(20, 10, 1160, 150, 'Actors')
    b += node2(36, 62, 160, 70, 'Other clubs’ ADs', 'Visiting teams',
               'Athletic directors at other clubs. They trade dates, opponents and changes with ours by email and text.')
    b += node2(278, 62, 160, 70, 'Athletic director', 'Books every event',
               'Books courts, opponents and tournaments in her Google Calendar, and sends me the details of upcoming events and tournaments by email and text.')
    b += node2(520, 62, 160, 70, 'Digital director', 'Me',
               'I give the agent context and goals, review what it produces, and import the CSVs into TeamSnap. The one human step, by design.', 'key')
    b += node2(762, 62, 160, 70, 'Eclipse Agent', 'Claude',
               'Claude agents on a schedule, following the club’s rules in a versioned skill. They watch the calendar and the tournament schedules, write the TeamSnap CSVs and keep the volunteer spreadsheets current.', 'ai')
    b += node2(1004, 62, 160, 70, 'TeamSnap', 'Families and coaches',
               'Where every family and coach reads the schedule. Its importer appends and never merges, so a changed event is deleted by hand before it is re-imported.', 'ext')

    b += arrow([(200, 97), (274, 97)], both=True)
    b += label(237, 89, ['email, text'])
    b += arrow([(438, 97), (520, 97)])
    b += label(479, 72, ['event', 'details'])
    b += arrow([(680, 82), (762, 82)])
    b += label(721, 58, ['context,', 'goals'])
    b += arrow([(762, 114), (680, 114)])
    b += label(721, 130, ['CSVs'])
    b += arrow([(600, 62), (600, 42), (1084, 42), (1084, 62)])
    b += label(842, 34, ['imports CSVs'])

    # ---- what each one produces (dropped 40 below the actors to leave a lane for the email wire) ----
    b += node2(278, 246, 160, 60, 'Google Calendar', 'Working draft',
               'The working draft of the club calendar: a mix of events that are set and events still being worked out.', 'ext')
    b += arrow([(358, 132), (358, 246)])
    b += label(366, 214, ['books'], 'start')

    b += zone(500, 220, 440, 216, 'Eclipse Agent: scheduled tasks')
    b += node(516, 256, 250, 44, 'Weekly email',
              'Every week, to the athletic director and me: what is coming up, what needs attention this week, and anywhere the Google Calendar and the TeamSnap schedule disagree.', 'ai')
    b += node(516, 314, 250, 44, 'Calendar watch',
              'Watches the athletic director’s Google Calendar. When she changes something, it emails me and adds a to-do to my Todoist list.', 'ai')
    b += node(516, 372, 250, 44, 'Schedule watch',
              'Watches tournament and event schedules for changes. It emails and notifies me, creates the CSV updates and updates the volunteer spreadsheet automatically.', 'ai')
    b += node2(784, 256, 140, 60, 'Eclipse skill', 'Club rules',
               'Team names, venues and edge cases in a versioned skill and script, so every unattended run behaves the same.', 'key')
    b += node2(784, 356, 140, 60, 'Connectors', 'Google, Todoist',
               'Calendar, Drive and Gmail for the club’s data and email; Todoist for my to-dos.', 'ext')
    b += arrow([(842, 132), (842, 220)])
    b += label(850, 208, ['runs'], 'start')
    b += arrow([(438, 276), (500, 276)])
    b += label(469, 268, ['reads'])

    b += zone(980, 220, 200, 216, 'Outputs')
    b += node(996, 256, 168, 44, 'Emails and alerts',
              'The weekly email to the athletic director and me, plus change alerts and notifications to me.')
    b += node(996, 314, 168, 44, 'Volunteer sheets',
              'Volunteer spreadsheets in Google Drive, one per event and shared with parents. Each includes a link to the TeamSnap CSV.', 'ext')
    b += node(996, 372, 168, 44, 'Todoist to-dos',
              'A to-do on my list whenever the calendar changes, so nothing waits on memory.')
    b += arrow([(940, 328), (980, 328)])
    b += label(960, 320, ['writes'])

    # Emails go back up to the two people who act on them.
    b += arrow([(1080, 256), (1080, 182), (400, 182), (400, 132)])
    b += arrow([(640, 182), (640, 132)])
    b += '<circle class="dg-dot" cx="640" cy="182" r="3.5"/>'
    b += label(966, 176, ['weekly email, alerts'])
    return svg(450, b, 'Eclipse Agentic OS architecture')


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

    b += zone(910, 256, 270, 250, 'Google')
    b += node(926, 292, 238, 44, 'Waiver form', 'One waiver per athlete, linked from the Tournament App menu.', 'ext')
    b += node(926, 364, 238, 44, 'Responses sheet', 'Every signed waiver, with athlete, team and parent.', 'db')
    b += arrow([(1045, 336), (1045, 364)])

    # The Claude lane is taller than the others so its three arrows each get their own track.
    b += zone(20, 376, 870, 130, 'Claude')
    b += node(120, 420, 400, 44, 'Tournament agent',
              'Built the schedule (courts and matchups from the rules and constraints), monitored waivers against visiting rosters, sent reminders and a daily status, and created the volunteer assignments.', 'ai')
    b += node(618, 420, 256, 44, 'Reminders and status', 'Waiver reminders, and a daily status email to the athletic director and me.', 'ext')
    b += arrow([(186, 420), (186, 358), (420, 358), (420, 324)], 'schedule', 300, 352)
    b += arrow([(520, 442), (618, 442)])
    b += arrow([(926, 386), (470, 386), (470, 420)], 'reads waivers', 700, 404)
    b += arrow([(400, 464), (400, 488), (898, 488), (898, 240), (1037, 240), (1037, 216)], 'volunteer assignments', 650, 482)
    return svg(520, b, 'Tournament Suite architecture')


# --------------------------------------------------------------------------
# Vibes.live: engineering architecture, from plan to App Store to data
# --------------------------------------------------------------------------
def vibes():
    # ---- left: plan, build, test and deploy ----
    b = zone(20, 20, 370, 620, 'Plan, build, test and deploy')
    b += node2(36, 52, 150, 56, 'Claude Cowork', 'Business model, spec',
               'Business model, pricing and the product spec, worked out with Claude and kept as Markdown.', 'ai')
    b += node2(224, 52, 150, 56, 'Digital marketing', 'Future',
               'Next output from Claude Cowork: launch and marketing content.', 'ext')
    b += arrow([(186, 80), (224, 80)], dashed=True)
    b += node2(36, 138, 150, 48, 'Obsidian', 'Spec files',
               'Where I read and manage the spec Markdown files: the product spec, the roadmap and the Claude Code contract. Linked to the Todoist backlog.')
    b += arrow([(111, 108), (111, 138)])
    b += node2(224, 138, 150, 48, 'Claude Design', 'UX',
               'Screens and flows designed before they are built. A major UX revamp is designed and coming in the next App Store version.', 'ai')
    b += node2(36, 224, 338, 48, 'Claude Code', 'Coding',
               'Writes the app, the Supabase functions and the tests, under a contract file with test-first, reproduce-before-fix and peer-review rules.', 'ai')
    b += arrow([(111, 186), (111, 224)])
    b += label(119, 210, ['specs'], 'start')
    b += arrow([(299, 186), (299, 224)])
    b += label(307, 210, ['UX'], 'start')
    b += node2(36, 310, 150, 48, 'Todoist', 'Backlog',
               'The Vibes.live Backlog project: every feature, bug and idea, prioritized. Claude Code reads it with a script.')
    b += arrow([(111, 310), (111, 272)])
    b += label(119, 296, ['backlog'], 'start')
    b += arrow([(36, 162), (27, 162), (27, 334), (36, 334)], both=True)
    b += node2(224, 310, 150, 48, 'Testing', 'Unit + UX tests',
               'About 1,040 unit tests across Vitest, Jest and Deno, plus Maestro end-to-end flows for sign-up and sign-in.')
    b += arrow([(299, 272), (299, 310)])
    b += node2(224, 392, 150, 48, 'GitHub', 'Repo + Actions',
               'Source and version history. GitHub Actions also runs the daily data pipeline.', 'ext')
    b += arrow([(299, 358), (299, 392)])
    b += node2(224, 474, 150, 48, 'Xcode', 'Build + profile',
               'iOS Simulator for daily development and Instruments for memory-leak checks. EAS builds the release.')
    b += arrow([(299, 440), (299, 474)])
    b += node2(224, 556, 150, 48, 'App Store', 'TestFlight, then release',
               'Every build goes to TestFlight testers first, then through App Store review.', 'key')
    b += arrow([(299, 522), (299, 556)])

    # ---- middle: the runtime stack, top to bottom ----
    b += zone(410, 20, 580, 620, 'How it runs')
    # links out of the app
    b += node2(426, 52, 264, 48, 'Buy tickets', 'Ticketmaster, StubHub, AXS, more',
               'Tap Get Tickets to buy on Ticketmaster, SeatGeek, StubHub, AXS or Vivid Seats. Resale links are affiliate links, and every tap is logged.')
    b += node2(710, 52, 264, 48, 'Artist socials', 'YouTube, Instagram, more',
               'Artist cards link out to the artist’s YouTube, Instagram and other social channels.')
    # the app
    tip = 'React Native and Expo. Follow artists and venues, see shows on a map, mark shows you are going to, and see where friends are going.'
    b += (f'<g class="dg-node dg-key" tabindex="0" data-tip="{escape(tip)}" aria-label="Vibes.live for iPhone: {escape(tip)}">'
          '<rect x="426" y="146" width="548" height="100" rx="8"/>'
          '<text class="dg-nt" x="700" y="176">Vibes.live for iPhone</text>'
          '<text class="dg-sub" x="700" y="194">React Native + Expo</text>')
    for i, c in enumerate(['OpenStreetMap maps', 'Push alerts']):
        cx = 552 + i * 158
        b += (f'<rect class="dg-chip" x="{cx}" y="206" width="148" height="30" rx="15"/>'
              f'<text class="dg-ct" x="{cx + 74}" y="226">{escape(c)}</text>')
    b += '</g>'
    b += arrow([(558, 146), (558, 100)])
    b += arrow([(842, 146), (842, 100)])
    b += label(700, 128, ['links out'])
    # App Store installs the app
    b += arrow([(374, 580), (400, 580), (400, 196), (426, 196)])
    b += label(396, 296, ['installs'], 'end')
    # music accounts: started in the app, land in Supabase
    b += node(740, 290, 110, 44, 'Spotify',
              'Connect Spotify in the app; a Supabase function syncs the artists you listen to into your list.', 'ext')
    b += node(864, 290, 110, 44, 'Apple Music', 'Library sync, coming next. Same pattern as Spotify.', 'ext')
    b += arrow([(795, 246), (795, 290)])
    b += arrow([(919, 246), (919, 290)])
    b += arrow([(795, 334), (795, 370)])
    b += arrow([(919, 334), (919, 370)])
    b += label(732, 272, ['connect'], 'end')
    b += label(732, 356, ['artists'], 'end')
    # app <-> database
    b += arrow([(560, 246), (560, 370)], both=True)
    b += label(570, 302, ['shows, friends,', 'feedback'], 'start')
    # Supabase
    b += node(426, 370, 548, 86, 'Supabase',
              'Postgres with row-level security on every table, email one-time-code sign-in, photo storage, and Deno functions on a schedule.',
              'db', chips=['Postgres', 'Auth', 'Functions'])
    # data layer
    b += node2(426, 490, 264, 48, 'Data pipeline', 'Daily · GitHub Actions + pg_cron',
               'Every day: Ticketmaster first, SeatGeek two hours later. One query per artist for all users, not per user, so API limits hold.')
    b += node2(710, 490, 264, 48, 'On-demand lookups', 'Supabase functions',
               'Called when someone needs it, such as opening a show they attended to see its setlist.')
    b += arrow([(558, 490), (558, 456)])
    b += arrow([(842, 490), (842, 456)])
    # platforms and APIs
    b += node(426, 574, 170, 48, 'Ticketmaster', 'Main source of shows, venues, festivals and on-sale dates (Discovery API).', 'ext')
    b += node(610, 574, 170, 48, 'SeatGeek', 'Adds shows Ticketmaster misses, and ticket links for shows on both.', 'ext')
    b += node(804, 574, 170, 48, 'setlist.fm', 'Setlists for shows you attended, looked up when you open one.', 'ext')
    b += arrow([(511, 574), (511, 538)])
    b += arrow([(660, 574), (660, 538)])
    b += label(586, 562, ['APIs'])
    b += arrow([(889, 574), (889, 538)])

    # ---- right: support and operations ----
    b += zone(1010, 20, 170, 620, 'Support and ops')
    b += group(1018, 58, 154, 112, 'Support')
    b += node(1024, 82, 142, 38, 'GitHub Pages',
              'Hosts live-vibes.net from the repo: the support, privacy and terms pages the App Store requires.', 'ext')
    b += node(1024, 126, 142, 38, 'Cloudflare', 'Routes the support email address to my inbox.', 'ext')
    b += group(1018, 182, 154, 334, 'Operations')
    b += node(1024, 204, 142, 40, 'Sentry', 'Crash reports from the app.', 'ext')
    b += node(1024, 254, 142, 40, 'PostHog', 'Product analytics: how people use the app.', 'ext')
    b += arrow([(974, 210), (999, 210), (999, 224), (1024, 224)])
    b += arrow([(974, 236), (990, 236), (990, 274), (1024, 274)])
    b += node2(1024, 392, 142, 44, 'Resend', 'Email delivery',
               'Sends the daily analytics and health emails, and every piece of in-app feedback.', 'ext')
    b += arrow([(974, 414), (1024, 414)])
    b += label(999, 406, ['emails'])
    b += node2(1024, 456, 142, 48, 'Daily emails', 'Analytics + health',
               'Every morning: pipeline health and platform stats, plus an alert if anything failed. No email means something is broken.')
    b += arrow([(1095, 436), (1095, 456)])

    # ---- feedback loop back to the backlog ----
    b += node2(560, 650, 180, 40, 'Make', 'Email to Todoist task',
               'A Make automation turns each feedback email into a task in the Todoist backlog.', 'ext')
    b += arrow([(1166, 414), (1174, 414), (1174, 670), (740, 670)])
    b += label(950, 664, ['user feedback'])
    b += arrow([(560, 670), (111, 670), (111, 358)])
    b += label(320, 664, ['new tasks'])
    return svg(700, b, 'Vibes.live engineering architecture')


# --------------------------------------------------------------------------
# Tournament Suite: the three apps, shown on the product's Why page
# --------------------------------------------------------------------------
def tournament_hero():
    b = shot(60, 10, 520, 293, 'tp-tv.webp', 'Command Center',
             'On the gym TVs: live scores, live standings with the gold-bracket cut line, and sponsor ads.')
    b += shot(20, 380, 150, 325, 'tp-hub.webp', 'Tournament App',
              'Families follow live scores, standings, schedule updates and which courts are running behind.', phone=True)
    b += shot(290, 480, 330, 142, 'tp-score-land.webp', ['Scorekeeper App', '@ every court'],
              'On every court, turned sideways: one volunteer taps +1 and the score reaches every phone and TV.')
    b += arrow([(540, 480), (540, 345)])
    b += label(550, 405, ['live', 'scores'], 'start')
    b += arrow([(290, 551), (178, 551)])
    return (f'<svg class="dg dg--hero" viewBox="0 0 640 735" role="img" aria-label="Tournament Suite: Command Center, Tournament App and Scorekeeper App" '
            f'xmlns="http://www.w3.org/2000/svg">{DEFS}{b}</svg>')

# --------------------------------------------------------------------------
# Norby Family CoS: the weekly and daily planning emails
# --------------------------------------------------------------------------
def clock_node(x, y, w, h, title, sub, tip, hour, minute):
    """A schedule trigger: a small clock face set to the run time, then the time and cadence."""
    import math
    cx, cy, r = x + 30, y + h / 2, 14
    ha = math.radians((hour % 12 + minute / 60) * 30 - 90)
    ma = math.radians(minute * 6 - 90)
    return (f'<g class="dg-node dg-key" tabindex="0" data-tip="{escape(tip)}" '
            f'aria-label="{escape(title)}, {escape(sub)}: {escape(tip)}">'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/>'
            f'<circle class="dg-clock" cx="{cx}" cy="{cy}" r="{r}"/>'
            f'<path class="dg-hand" d="M{cx},{cy} L{cx + 7*math.cos(ha):.1f},{cy + 7*math.sin(ha):.1f} M{cx},{cy} L{cx + 10.5*math.cos(ma):.1f},{cy + 10.5*math.sin(ma):.1f}"/>'
            f'<text class="dg-nt" x="{x+56}" y="{y+h/2-2}" text-anchor="start" style="text-anchor:start">{escape(title)}</text>'
            f'<text class="dg-sub" x="{x+56}" y="{y+h/2+15}" style="text-anchor:start">{escape(sub)}</text></g>')

def family_cos():
    # ---- inputs ----
    b = zone(20, 20, 280, 400, 'Inputs')
    b += node2(40, 112, 220, 64, 'Google Calendar', 'Family events, Andy’s travel',
               'The family calendar, including my work travel. The agent reads this week and the two weeks after it.', 'ext')
    b += node2(40, 262, 220, 64, 'Todoist', 'To-do list',
               'Our to-do list. Tasks due this week go in the Sunday email; today’s go in the daily one.', 'ext')

    # ---- the agent and its schedule ----
    b += zone(360, 20, 440, 400, 'Claude scheduled tasks')
    b += clock_node(374, 66, 204, 64, 'Sunday 9:00 AM', 'Weekly run',
                    'A scheduled task wakes the agent every Sunday at 9 AM to write the weekly email.', 9, 0)
    b += clock_node(588, 66, 196, 64, 'Daily 6:30 AM', 'Daily run',
                    'A second scheduled task wakes the agent every morning at 6:30 AM for the daily email.', 6, 30)
    b += arrow([(476, 130), (476, 222)], dashed=True)
    b += arrow([(686, 130), (686, 222)], dashed=True)
    b += label(484, 182, ['triggers'], 'start')
    b += label(694, 182, ['triggers'], 'start')
    b += node2(410, 222, 340, 110, 'Norby CoS Agent', 'Claude',
               'Claude, running unattended on a schedule. Reads the calendar and the to-do list, decides what matters this week, then writes and sends the email.', 'ai')

    b += arrow([(260, 144), (330, 144), (330, 254), (410, 254)])
    b += label(295, 136, ['events'])
    b += arrow([(260, 294), (330, 294), (330, 300), (410, 300)])
    b += label(295, 286, ['to-dos'])

    # ---- outputs ----
    b += zone(860, 20, 320, 400, 'Outputs')
    b += node2(880, 112, 240, 64, 'Weekly email', 'Sundays, 9 AM',
               'The week ahead day by day, my travel and the to-do list, plus any travel or major events in the two weeks after.')
    b += node2(880, 262, 240, 64, 'Daily email', 'Every day, 6:30 AM',
               'Today’s events and to-dos, before anyone leaves the house.')
    b += arrow([(750, 254), (815, 254), (815, 144), (880, 144)])
    b += arrow([(750, 300), (815, 300), (815, 294), (880, 294)])
    b += '<circle class="dg-dot" cx="815" cy="254" r="3.5"/>'
    b += label(782, 246, ['sends'])

    b += node2(920, 356, 200, 50, 'Andy and Shauna', 'Same plan, same inbox',
               'We both get every email, so we work from one plan and travel never comes as a surprise.')
    b += arrow([(1120, 144), (1160, 144), (1160, 381), (1120, 381)])
    b += arrow([(1000, 326), (1000, 356)])
    return svg(440, b, 'Norby Family CoS architecture')

# --------------------------------------------------------------------------
# Vehicles: the family app, its API, and the receipt-filing pipeline
# (from the VehicleTracker repo: README, SETUP and docs/DATA_CONTRACT)
# --------------------------------------------------------------------------
def vehicles():
    # ---- phones ----
    b = zone(20, 30, 300, 200, 'Family iPhones')
    b += node2(40, 68, 260, 52, 'Vehicles app', 'Home-screen web app',
               'A home-screen web app (Vite, TypeScript, Preact) for the family’s drivers: what’s due on each car, service history, registration and insurance cards. Hosted on GitHub Pages.', 'key')
    b += node(40, 134, 260, 80, 'On the phone',
              'A receipt scanner that finds the page edges (OpenCV.js) and builds a PDF; an offline cache and upload queue that retries until the scan lands; and the push subscription.',
              chips=['Scanner', 'Offline', 'Push'])

    # ---- the App API and its two timed jobs ----
    b += zone(360, 30, 470, 200, 'App API: Apps Script web app')
    b += node2(380, 68, 190, 110, 'App API', 'Runs as Andrew',
               'A standalone Apps Script web app. It checks sign-in, serves each car’s data and documents, takes chunked scan uploads and odometer readings, and is never allowed to write to the journal’s own tabs.', 'key')
    b += clock_node(594, 64, 216, 52, 'Every 30 min', 'Scan status',
                    'Follows each uploaded scan through the filing pipeline and tells the person who scanned it when it is filed or needs review.', 12, 30)
    b += clock_node(594, 128, 216, 52, 'Daily 7:30 AM', 'Recalls and due dates',
                    'Checks recalls, registration and warranty dates and service coming due, then sends notifications. Each is sent once, and never during quiet hours.', 7, 30)
    b += arrow([(300, 94), (380, 94)], both=True)
    b += label(340, 86, ['API'])

    # ---- outside services ----
    b += zone(870, 30, 310, 200, 'Services')
    b += node2(890, 64, 270, 52, 'Push Worker', 'Cloudflare',
               'Apps Script can’t sign Web Push messages, so the API hands each batch to this small Cloudflare Worker to sign, encrypt and deliver to the phones.', 'ext')
    b += node2(890, 128, 270, 52, 'NHTSA', 'Recalls API',
               'The federal recalls API, checked every day for each vehicle.', 'ext')
    b += node(890, 190, 270, 32, 'Google sign-in',
               'The app signs in with Google once. The API checks the token against the family allowlist and keeps a 60-day session; anyone else gets no data.', 'ext')
    b += arrow([(810, 90), (890, 90)])
    b += label(850, 82, ['notify'])
    b += arrow([(810, 154), (890, 154)])
    b += label(850, 146, ['recalls'])
    # push notifications travel back over the top to the phones
    b += arrow([(1025, 64), (1025, 14), (170, 14), (170, 68)])
    b += label(600, 18, ['push notifications'])

    # ---- receipt filing: the agent and the ingestion script ----
    b += zone(20, 270, 1160, 214, 'Receipt filing')
    b += node2(40, 312, 170, 56, 'Drive › Inbox', 'Every receipt lands here',
               'The Drive folder every receipt lands in, whether it came from the app or from the Google Drive scanner. The app saves each scan as a new file only once the last byte arrives.', 'db')
    b += node2(250, 302, 220, 76, 'Vehicles agent', 'Claude scheduled task',
               'Reads each receipt, works out the vehicle and the services, writes a queue file for the ingestion script, then renames the receipt and files it. Also syncs Todoist and sends the driver emails.', 'ai')
    b += node2(560, 312, 160, 56, 'Queue', 'JSON in Drive',
               'One JSON file per receipt. The handoff between the agent and the spreadsheet, so the agent never edits the Sheet directly.', 'db')
    b += clock_node(770, 312, 200, 56, 'Every 15 min', 'Ingestion script',
                    'Apps Script bound to the Sheet. Every 15 minutes it applies the queue to the journal, then removes the queue file.', 12, 15)
    b += node2(1010, 308, 150, 64, 'Journal', 'Google Sheet',
               'The maintenance journal: vehicles, visits, services, documents, schedule and warranties. The single source of truth the app reads.', 'db')
    b += arrow([(210, 340), (250, 340)])
    b += arrow([(470, 340), (560, 340)])
    b += label(515, 332, ['writes'])
    b += arrow([(720, 340), (770, 340)])
    b += arrow([(970, 340), (1010, 340)])

    # what the agent produces
    b += node2(100, 418, 170, 52, 'Vehicle folders', 'Renamed and filed',
               'Each receipt renamed and moved into its vehicle’s Drive folder. Anything unreadable goes to a Needs Review folder for a person to look at.', 'db')
    b += node2(290, 418, 150, 52, 'Driver emails', 'Service reminders',
               'Emails to each car’s primary driver and me about service coming due, a month ahead.')
    b += node2(460, 418, 150, 52, 'Todoist', 'Service tasks',
               'Service tasks synced to my Todoist list.', 'ext')
    b += arrow([(360, 378), (360, 396), (185, 396), (185, 418)])
    b += arrow([(360, 396), (360, 418)])
    b += arrow([(360, 396), (535, 396), (535, 418)])
    b += '<circle class="dg-dot" cx="360" cy="396" r="3.5"/>'

    # the API saves scans into the Inbox and reads the journal
    b += arrow([(420, 178), (420, 254), (180, 254), (180, 312)])
    b += label(300, 248, ['saves scans'])
    b += arrow([(1085, 308), (1085, 244), (520, 244), (520, 178)])
    b += label(800, 238, ['reads the journal'])
    return svg(494, b, 'Vehicles app architecture')

# --------------------------------------------------------------------------
# Siri -> Todoist: a hands-free to-do capture. Drawn narrow (600 wide) for the
# How half of a one-page Why/How split.
# --------------------------------------------------------------------------
def siri_todoist():
    b = node2(20, 30, 220, 64, 'Me', 'Driving or walking',
              'To-dos come to mind when my hands are busy. I just say the phrase, the task and when it’s due.', 'key')
    b += node2(360, 30, 220, 64, 'Apple Shortcut', '“Get Stuff Done”',
               'A shortcut named Get Stuff Done. Its name is the Siri phrase; its steps take the task and due date and send them to Todoist.')
    b += node2(190, 200, 220, 64, 'Siri', 'Hears the phrase',
               'Siri hears “Get Stuff Done,” runs the shortcut and passes along the task and when it’s due.', 'ai')
    b += node2(190, 380, 220, 64, 'Todoist', 'My to-do list',
               'The task lands in Todoist with its due date, waiting for me when I’m back at a screen.', 'ext')

    b += arrow([(130, 94), (130, 232), (190, 232)])
    b += label(140, 140, ['“Siri, Get Stuff Done”', '+ task + when it’s due'], 'start')
    b += arrow([(470, 94), (470, 232), (410, 232)])
    b += label(462, 140, ['phrase + steps'], 'end')
    b += arrow([(300, 264), (300, 380)])
    b += label(310, 318, ['adds the task', 'and due date'], 'start')
    return (f'<svg class="dg dg--half" viewBox="0 0 600 464" role="img" aria-label="Siri to Todoist architecture" '
            f'xmlns="http://www.w3.org/2000/svg">{DEFS}{b}</svg>')

# --------------------------------------------------------------------------
# Habits: the Spring Break challenge app. Drawn narrow (600 wide) for the
# How half of a one-page Why/How split.
# --------------------------------------------------------------------------
def habits():
    b = node2(20, 30, 220, 64, 'Claude Code', 'Vibe coding',
              'I described the app we wanted in plain language and Claude Code wrote it.', 'ai')
    b += node2(360, 30, 220, 64, 'Xcode', 'Creates the app',
               'Apple’s developer tool. It builds the iPhone app from the code Claude Code writes.')
    b += node2(360, 200, 220, 64, 'TestFlight', 'Deploys the app',
               'Apple’s beta channel. It puts the app on our phones without going through the App Store.', 'ext')
    b += node2(20, 380, 220, 64, 'Apple HealthKit', 'Our fitness stats',
               'Our Apple Watches record our activity in HealthKit, so the app tracks our goals automatically. No manual logging.', 'db')
    b += node2(360, 380, 220, 64, 'iPhone App', 'Gamifies our competition',
               'My daughter’s progress and mine, side by side, so we can see who’s winning the bet.', 'key')

    b += arrow([(240, 62), (360, 62)])
    b += label(300, 50, ['writes the code'])
    b += arrow([(470, 94), (470, 200)])
    b += label(480, 152, ['builds'], 'start')
    b += arrow([(470, 264), (470, 380)])
    b += label(480, 316, ['installs on', 'both phones'], 'start')
    b += arrow([(240, 412), (360, 412)])
    b += label(300, 400, ['Watch data'])
    return (f'<svg class="dg dg--half" viewBox="0 0 600 464" role="img" aria-label="Habit tracking app architecture" '
            f'xmlns="http://www.w3.org/2000/svg">{DEFS}{b}</svg>')

# --------------------------------------------------------------------------
# College Notes: handwritten class notes scanned into Drive, digitized by a
# daily Claude agent, filed in Notion. Drawn narrow (600 wide) for the How
# half of a one-page Why/How split.
# --------------------------------------------------------------------------
def college_notes():
    # ---- Google Drive: the scanner fills a folder per class ----
    b = zone(20, 20, 560, 196, 'Google Drive')
    b += node2(40, 98, 170, 64, 'Drive app', 'Scanner on her phone',
               'She scans each page with the scanner built into the Google Drive app and saves it to that class’s folder. Scanning is her only step; everything after it is automatic.', 'key')
    b += group(250, 50, 310, 148, 'Inbox: a folder per class')
    classes = ['Chemistry', 'Development Psych', 'Nutrition']
    for i, c in enumerate(classes):
        b += node(270, 80 + i * 36, 270, 28, c,
                  'One Inbox folder per class. The folder a scan lands in tells the agent which class it belongs to.', 'db')
    b += arrow([(210, 130), (236, 130), (236, 94), (270, 94)])
    b += arrow([(236, 130), (270, 130)])
    b += arrow([(236, 130), (236, 166), (270, 166)])
    b += '<circle class="dg-dot" cx="236" cy="130" r="3.5"/>'
    b += label(125, 182, ['saves the scan to', 'its class folder'])

    # ---- Claude: the daily agent ----
    b += node2(190, 270, 220, 64, 'Claude', 'Daily agent',
               'A scheduled Claude task that runs every day. It picks up each new scan in the Inbox, converts the handwriting to digital text, and uses the scan’s folder as its class.', 'ai')
    b += arrow([(380, 198), (380, 270)])
    b += label(390, 240, ['new scans', '+ class'], 'start')

    # ---- Notion: the notebook ----
    b += zone(20, 380, 560, 140, 'Notion')
    b += node(150, 410, 300, 90, 'Class Notes notebook',
              'A page per scan, filed by class and date: the digitized note to read and search, with the original scan alongside it for anything the text misses.',
              'db', chips=['Digitized note', 'Original scan'])
    b += arrow([(300, 334), (300, 410)])
    b += label(310, 356, ['digitized note', '+ original scan'], 'start')
    return (f'<svg class="dg dg--half" viewBox="0 0 600 540" role="img" aria-label="College Notes architecture" '
            f'xmlns="http://www.w3.org/2000/svg">{DEFS}{b}</svg>')

# --------------------------------------------------------------------------
# Document Agents: medical receipts and bank statements land in Drive inboxes,
# a scheduled Claude agent renames and files them. Drawn narrow (600 wide) for
# the How half of a one-page Why/How split.
# --------------------------------------------------------------------------
def documents():
    # ---- how files arrive ----
    b = node2(20, 20, 220, 64, 'Medical receipts', 'Scanned on my phone',
              'I invest my HSA and pay medical expenses out of pocket, so I scan every receipt with my phone.', 'key')
    b += node2(360, 20, 220, 64, 'Bank statements', 'Downloaded from the bank',
               'I download each statement from the bank’s website.', 'key')

    # ---- Google Drive inboxes ----
    b += zone(20, 128, 560, 112, 'Google Drive: Inboxes', center=True)
    b += node(30, 170, 200, 48, 'Medical Receipts',
              'The Drive inbox every scanned receipt lands in.', 'db')
    b += node(370, 170, 200, 48, 'Statements',
              'The Drive inbox every downloaded statement lands in.', 'db')
    b += arrow([(130, 84), (130, 170)])
    b += label(140, 112, ['scan'], 'start')
    b += arrow([(470, 84), (470, 170)])
    b += label(480, 112, ['download'], 'start')

    # ---- Claude: the scheduled agent ----
    b += node2(190, 280, 220, 64, 'Claude', 'Scheduled agent',
               'A scheduled Claude task. It reads each new file in either inbox, works out what it is, renames it and files it. I never touch them.', 'ai')
    b += arrow([(130, 218), (130, 312), (190, 312)])
    b += label(140, 270, ['new receipts'], 'start')
    b += arrow([(470, 218), (470, 312), (410, 312)])
    b += label(460, 270, ['new statements'], 'end')

    # ---- Google Drive, filed ----
    b += zone(20, 400, 560, 132, 'Google Drive: Filed', center=True)
    b += node2(70, 446, 230, 64, 'Medical receipts', 'Renamed and filed',
               'Each receipt renamed and filed, ready for HSA reimbursement.', 'db')
    b += node2(330, 446, 230, 64, 'Bank statements', 'Renamed and filed',
               'Each statement renamed by statement date, institution, account, account type and primary account holder, then filed.', 'db')
    b += arrow([(300, 344), (300, 372), (185, 372), (185, 446)])
    b += arrow([(300, 372), (445, 372), (445, 446)])
    b += '<circle class="dg-dot" cx="300" cy="372" r="3.5"/>'
    b += label(310, 364, ['renames and files'], 'start')
    return (f'<svg class="dg dg--half" viewBox="0 0 600 552" role="img" aria-label="Document Agents architecture" '
            f'xmlns="http://www.w3.org/2000/svg">{DEFS}{b}</svg>')

# --------------------------------------------------------------------------
# AI2FI: the coach, the spreadsheet it sets up, and the dashboard that reads it
# --------------------------------------------------------------------------
def mod(x, y, name, tip, soon=False):
    """A dashboard module: a small box inside its sidebar group."""
    return (f'<g class="dg-node dg-{"ext" if soon else "n"} dg-mod" tabindex="0" data-tip="{escape(tip)}" '
            f'aria-label="{escape(name)}: {escape(tip)}">'
            f'<rect x="{x}" y="{y}" width="98" height="30" rx="6"/>'
            f'<text class="dg-nt" x="{x+49}" y="{y+20}">{escape(name)}</text></g>')

def ai2fi():
    # ---- left: the coach ----
    b = zone(20, 20, 420, 580, 'AI2FI Coach · Claude')
    b += node2(36, 52, 388, 52, 'You', 'Life situation · goals · what you know',
               'The inputs: your life situation, your goals, and how much you already know, drawn out through conversation and quizzes.')
    b += arrow([(230, 104), (230, 140)])
    b += label(240, 126, ['interview + quizzes'], 'start')
    b += node2(36, 140, 220, 52, 'Financial check-in', '/financial-check-in',
               'Starts every session. A full two-pass assessment the first time, a light check-in after that. Then it routes you to the module that matters most right now.', 'ai')
    b += node2(292, 140, 132, 52, 'Order of Ops', '14 steps',
               'The 14-step Financial Order of Operations, from tracking net worth and a starter emergency fund through HSA, IRAs, education accounts and mortgage paydown. Steps gate the next ones.', 'db')
    b += arrow([(256, 166), (292, 166)], both=True)
    b += node2(36, 228, 190, 48, 'Module coach', '/module-coach',
               'Coaches one topic in depth: getting to know you, a walkthrough, then goal setting.', 'ai')
    b += node2(234, 228, 190, 48, 'Knowledge check', '/knowledge-check',
               'Quizzes at four levels, fundamentals to advanced, so coaching starts where you are.', 'ai')
    b += arrow([(131, 192), (131, 228)])
    b += arrow([(230, 192), (230, 210), (329, 210), (329, 228)])
    b += label(139, 214, ['routes'], 'start')
    b += node(36, 312, 388, 86, 'Coaching modules',
              'Curriculum, coaching scripts and quizzes for each topic. Financial strategy, investing (including the moat analysis framework) and mortgage today.',
              'db', chips=['Strategy', 'Investing', 'Mortgage'])
    b += arrow([(131, 276), (131, 312)])
    b += arrow([(329, 276), (329, 312)])
    b += node2(36, 432, 388, 52, 'Your profile', 'Journal · goals · competency · temperament',
               'Markdown files in a private folder that git ignores. Session notes, goals, competency by topic, and how you behave when markets move, tracked over time.', 'db')
    b += arrow([(230, 398), (230, 432)])
    b += label(238, 420, ['progress'], 'start')
    b += arrow([(36, 458), (27, 458), (27, 166), (36, 166)], both=True)
    b += node2(36, 520, 250, 52, 'Financial strategy', 'Goals and the next step',
               'The output: a strategy you agree on together, with goals and the next step on the order of operations.', 'key')
    b += node2(298, 520, 126, 52, 'Follow-ups', 'Calendar reminders',
               'Monthly or quarterly check-ins, sent as a calendar file or a Google Calendar event, so accountability actually arrives.', 'ext')
    b += arrow([(161, 484), (161, 520)])
    b += arrow([(361, 484), (361, 520)])

    # ---- middle: the spreadsheet ----
    b += zone(460, 20, 220, 580, 'Finances spreadsheet')
    b += node2(476, 52, 188, 52, 'Demo template', 'Sample data to start',
               'The dashboard opens on a sample workbook, so you can explore before entering anything of your own.', 'ext')
    b += arrow([(570, 104), (570, 140)])
    b += label(578, 126, ['swap in yours'], 'start')
    tip = 'Your private database: one Excel workbook, one tab per area. It lives in your profile folder, git ignores it, and the dashboard reads it locally.'
    b += (f'<g class="dg-node dg-db" tabindex="0" data-tip="{escape(tip)}" aria-label="Finances.xlsx: {escape(tip)}">'
          '<rect x="476" y="140" width="188" height="380" rx="8"/>'
          '<text class="dg-nt" x="570" y="172">Finances.xlsx</text>'
          '<text class="dg-sub" x="570" y="190">One tab per area</text>')
    tabs = ['Accounts', 'Net Worth MoM', 'Budget', 'Sankey', 'Mortgage', 'Education Savings', 'Brokerage Ledger',
            '401k Ledger', 'BrokerageLink', 'Pension', 'Charitable Trust', 'Tickers']
    for i, t in enumerate(tabs):
        b += f'<text class="dg-tab" x="570" y="{226 + i * 24}">{escape(t)}</text>'
    b += '</g>'
    b += arrow([(424, 458), (476, 458)])
    b += label(450, 450, ['sets up'])

    # ---- right: the dashboard ----
    b += zone(700, 20, 480, 580, 'AI2FI Dashboard · localhost:3001')
    b += node2(716, 52, 216, 52, 'Yahoo Finance', 'Prices · splits · dividends',
               'Live quotes, stock splits, dividends and the S&P 500 benchmark, cached so the dashboard stays fast.', 'ext')
    b += node2(948, 52, 216, 52, 'Brokerage CSVs', 'Trade history imports',
               'Import trade history from your brokerage as a CSV file.', 'ext')
    b += arrow([(824, 104), (824, 140)])
    b += label(832, 126, ['market data'], 'start')
    b += arrow([(1056, 104), (1056, 140)])
    b += label(1064, 126, ['lots'], 'start')
    b += node2(716, 140, 448, 52, 'Local server', 'Node + Express · 21 API routes',
               'Reads the workbook and market data and serves the dashboard. Starts at login and runs only on your computer.')
    b += arrow([(664, 166), (716, 166)])
    b += label(690, 158, ['reads'])
    b += arrow([(940, 192), (940, 228)])
    b += node2(716, 228, 448, 52, 'Dashboard', 'React + Vite · Recharts · d3-sankey',
               'Opens in your browser. A sidebar of modules, with the demo template until you onboard.', 'key')
    groups = [
        ('Strategy', [
            ('Net Worth', 'Net worth over time, its composition, and the debt ratio against a target.'),
            ('Budget', 'The annual budget as a Sankey diagram: where money comes in and where it goes.'),
            ('Education', 'Each 529 and ESA against projected tuition, semester by semester.'),
            ('Mortgage', 'Payoff progress, plus a what-if simulator for extra payments.'),
            ('Charitable', 'Stock gifts into a charitable trust and grants out to organizations.')]),
        ('Portfolio', [
            ('Brokerage', 'Every position and closed lot, returns against the S&P 500, dividends, and a detail view per stock.'),
            ('RSUs', 'Restricted stock units: what has vested and how it has performed.'),
            ('HSA', 'Health Savings Account investments, held like a brokerage account.'),
            ('ESA', 'Education savings account holdings and returns.'),
            ('Moat analysis', 'Shows each holding’s latest Moat Analysis report, from the quarterly research run.')]),
        ('Retirement', [
            ('IRAs', 'IRA holdings and returns.'),
            ('401k', 'Each 401k fund’s annualized return, compared with putting the same dollars in the S&P 500.'),
            ('BrokerageLink', 'Stocks held inside the 401k: return per holding against an S&P 500 shadow.'),
            ('Pension', 'Pension payout options compared over time, for you and a spouse.')]),
        ('Tools', [
            ('Harvester', 'Gain/loss harvesting plan: realize losses to the $3,000 limit, then pair gains against them.'),
            ('Refinance', 'Compare a refinance with the current loan: payment, months and total interest.'),
            ('Sankey', 'A flow diagram for any tab with source, target and value columns.'),
            ('Trade-offs', 'Coming soon: weigh one financial choice against another.')]),
    ]
    for gi, (title, mods) in enumerate(groups):
        gx = 710 + gi * 118
        b += group(gx, 306, 110, 30 + len(mods) * 36 + 4, title)
        b += arrow([(gx + 55, 280), (gx + 55, 306)])
        for mi, (name, mtip) in enumerate(mods):
            b += mod(gx + 6, 334 + mi * 36, name, mtip, soon=(name == 'Trade-offs'))
    b += label(1164, 556, ['18 modules, one more coming'], 'end')

    # ---- quarterly moat research ----
    b += zone(20, 620, 1160, 120, 'Quarterly moat research')
    b += clock_node(476, 654, 188, 52, 'Moat prompt', 'Every quarter',
                    'A scheduled Claude prompt reads my holdings from the workbook and runs the moat analysis framework on each one: what protects the business, and whether that is getting stronger or weaker.', 10, 10)
    b += arrow([(570, 520), (570, 654)])
    b += label(578, 590, ['holdings'], 'start')
    tip = 'One Markdown report per holding, rewritten each quarter. The dashboard and the Gemini notebook both read them.'
    b += ('<rect class="dg-stack" x="728" y="646" width="208" height="52" rx="8"/>'
          '<rect class="dg-stack" x="722" y="650" width="208" height="52" rx="8"/>')
    b += (f'<g class="dg-node dg-db" tabindex="0" data-tip="{escape(tip)}" aria-label="Moat Analysis .md files: {escape(tip)}">'
          '<rect x="716" y="654" width="208" height="52" rx="8"/>'
          '<text class="dg-nt" x="820" y="678">Moat Analysis .md</text>'
          '<text class="dg-sub" x="820" y="695">1 to N · one per holding</text></g>')
    b += arrow([(664, 680), (716, 680)])
    b += label(690, 672, ['writes'])
    b += arrow([(883, 646), (883, 520)])
    b += label(891, 590, ['reports'], 'start')
    b += node2(248, 654, 176, 52, 'Gemini notebook', 'Financial Analyst',
               'A Gemini notebook loaded with every Moat Analysis report, so I can question the whole portfolio at once.', 'ext')
    b += arrow([(780, 706), (780, 728), (336, 728), (336, 706)])
    b += label(558, 722, ['sources'])
    b += node2(36, 654, 176, 52, 'Audio summaries', 'Podcast-style reviews',
               'Gemini turns the reports into audio overviews of the moat analysis that I listen to for the quarterly portfolio review.', 'key')
    b += arrow([(248, 680), (212, 680)])

    # ---- bottom: build, release and install ----
    b += zone(20, 760, 1160, 108, 'Build, release and install')
    steps = [
        ('Claude Code', 'Builds app and skills', 'Writes the dashboard, the coaching skills and the modules.', 'ai'),
        ('GitHub', 'Source on main', 'Source and version history for everything: dashboard, skills, modules and docs.', 'ext'),
        ('Release skill', '/create-release', 'A Claude skill that cuts a versioned release from main.', 'ai'),
        ('Release branch', 'v1.0.0 · May 12, 2026', 'What people download: the dashboard plus the coach’s skills and modules.', 'n'),
        ('Install page', 'GitHub Pages', 'The public welcome page: what is in the release, a one-line installer for Mac and Windows, and how to start coaching.', 'ext'),
    ]
    for i, (t, s, tip, k) in enumerate(steps):
        x = 36 + i * 232
        b += node2(x, 800, 194, 52, t, s, tip, k)
        if i:
            b += arrow([(x - 38, 826), (x, 826)])
    b += arrow([(1061, 800), (1061, 604)])
    b += label(1053, 616, ['installs, starts at login'], 'end')
    return svg(884, b, 'AI2FI architecture')


# --------------------------------------------------------------------------
# Hiking Countdown: a countdown page for our August Colorado hike, built by
# dictating to Claude and hosted on GitHub Pages. Drawn narrow (600 wide) for
# the How half of a one-page Why/How split.
# --------------------------------------------------------------------------
def hiking_countdown():
    b = node2(20, 30, 220, 64, 'Me', 'Dictated the idea',
              'I told Claude what I wanted: a countdown timer in DD : HH : MM : SS, a picture of a Colorado peak, and hosting that was simple and quick.', 'key')
    b += node2(360, 30, 220, 64, 'Claude', 'Wrote the page',
               'Claude turned the dictated idea into the web page: the countdown timer, the Colorado peak photo and the layout.', 'ai')
    b += node2(360, 200, 220, 64, 'GitHub', 'Holds the code',
               'The page lives in a public GitHub repository. Changing the trip date or photo is one small commit.', 'db')
    b += node2(20, 200, 220, 64, 'GitHub Actions', 'Builds and deploys',
               'Every push to the repository runs a GitHub Actions workflow that publishes the latest page.')
    b += node2(20, 380, 220, 64, 'GitHub Pages', 'Hosts the countdown',
               'Free, simple hosting straight from the repository. No servers to run.', 'ext')
    b += node2(360, 380, 220, 64, 'Friends', 'Counting down together',
               'My two hiking friends and I open the link to see how long until August.', 'key')

    b += arrow([(240, 62), (360, 62)])
    b += label(300, 50, ['dictated'])
    b += arrow([(470, 94), (470, 200)])
    b += label(480, 152, ['commits the page'], 'start')
    b += arrow([(360, 232), (240, 232)])
    b += label(300, 220, ['on each push'])
    b += arrow([(130, 264), (130, 380)])
    b += label(140, 326, ['deploys'], 'start')
    b += arrow([(240, 412), (360, 412)])
    b += label(300, 400, ['shared link'])
    return (f'<svg class="dg dg--half" viewBox="0 0 600 464" role="img" aria-label="Hiking Countdown architecture" '
            f'xmlns="http://www.w3.org/2000/svg">{DEFS}{b}</svg>')

# --------------------------------------------------------------------------
# Vinyl Moon: three versions of the album-photo-to-Spotify-playlist workflow,
# each with fewer steps than the last. Drawn narrow (600 wide) for the How
# half of a one-page Why/How split.
# --------------------------------------------------------------------------
def vinyl_moon():
    def version(cy, ver, date, notes):
        """The version and date, outside the zone on the right, with a short note."""
        top = cy - 8 * len(notes)
        s = f'<text class="dg-ver" x="540" y="{top}">{escape(ver)}</text>'
        s += f'<text class="dg-date" x="540" y="{top + 22}">{escape(date)}</text>'
        s += ''.join(f'<text class="dg-note" x="540" y="{top + 44 + i*16}">{escape(t)}</text>' for i, t in enumerate(notes))
        return s

    # ---- v1: ChatGPT, a JSON file, an Apple Shortcut and a Python script ----
    b = zone(20, 20, 500, 182, '')
    b += node2(36, 36, 144, 56, 'Album photo', 'Taken on my phone',
               'The workflow starts with a picture of the record’s track list.', 'key')
    b += node2(198, 36, 144, 56, 'ChatGPT', 'Reads the songs',
               'My first vibe coding project. ChatGPT pulled the song and artist out of the photo.', 'ai')
    b += node2(360, 36, 144, 56, 'JSON file', 'Song + artist',
               'ChatGPT wrote the track list out as a JSON file for the script to read.', 'db')
    b += node2(36, 130, 144, 56, 'Apple Shortcut', 'Runs the script',
               'An Apple Shortcut kicked off the Python script with the JSON file.')
    b += node2(198, 130, 144, 56, 'Python script', 'Calls Spotify',
               'Read the JSON file and called the Spotify API, one song at a time. It took two painful days to get it working once, and it never worked again the next month.')
    b += node2(360, 130, 144, 56, 'Spotify API', 'Builds the playlist',
               'Spotify’s developer API: search each song, create the playlist, add the tracks.', 'ext')
    b += arrow([(180, 64), (198, 64)])
    b += arrow([(342, 64), (360, 64)])
    b += arrow([(432, 92), (432, 111), (108, 111), (108, 130)])
    b += arrow([(180, 158), (198, 158)])
    b += arrow([(342, 158), (360, 158)])
    b += version(111, 'v1', 'Summer ’25', ['Two painful days.', 'Worked once.'])

    # ---- v2: Claude reads the photo, Spotify's AI Playlist Creator does the rest ----
    b += zone(20, 222, 500, 88, '')
    b += node2(36, 238, 144, 56, 'Claude app', 'Photo in, songs out',
               'I take the picture in the Claude mobile app, and it gives back the list of songs and artists.', 'ai')
    b += node2(198, 238, 144, 56, 'Me', 'Copy and paste',
               'The one manual step left: copy Claude’s list and paste it into Spotify.', 'key')
    b += node2(360, 238, 144, 56, 'Spotify', 'AI Playlist Creator',
               'Spotify’s own AI Playlist Creator turns the pasted list into a playlist.', 'ext')
    b += arrow([(180, 266), (198, 266)])
    b += arrow([(342, 266), (360, 266)])
    b += version(266, 'v2', 'Feb ’26', ['Copy, paste, done.'])

    # ---- v3: Claude creates the playlist in Spotify through MCP ----
    b += zone(20, 330, 500, 88, '')
    b += node2(36, 346, 180, 56, 'Claude app', 'Photo in',
               'I take the picture in the Claude mobile app. That is the whole job on my end.', 'ai')
    b += node2(324, 346, 180, 56, 'Spotify', 'Playlist created',
               'Claude creates the playlist in my Spotify account directly, through the Spotify MCP integration.', 'ext')
    b += arrow([(216, 374), (324, 374)])
    b += label(270, 364, ['via MCP'])
    b += version(374, 'v3', 'Aug ’26', ['One step.'])
    return (f'<svg class="dg dg--half" viewBox="0 0 680 438" role="img" aria-label="Vinyl Moon: three versions of the workflow" '
            f'xmlns="http://www.w3.org/2000/svg">{DEFS}{b}</svg>')

# --------------------------------------------------------------------------
# CoS OS: my Chief of Staff Operating System at work. One diagram shared by
# every CoS app: Microsoft 365 on the left, Command Center in the middle,
# Copilot with its skills and automations on the right, the Second Brain
# underneath everything.
# --------------------------------------------------------------------------
def sched_node(x, y, w, h, title, sub, tip, hour=None, minute=0):
    """A scheduled automation: a clock set to its run time, or a calendar when it runs on a day, not a time."""
    if hour is not None:
        return clock_node(x, y, w, h, title, sub, tip, hour, minute)
    cx, cy = x + 30, y + h / 2
    return (f'<g class="dg-node dg-key" tabindex="0" data-tip="{escape(tip)}" '
            f'aria-label="{escape(title)}, {escape(sub)}: {escape(tip)}">'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/>'
            f'<path class="dg-clock" d="M{cx-13},{cy-10} h26 v22 h-26 z"/>'
            f'<path class="dg-hand" d="M{cx-13},{cy-4} h26 M{cx-6},{cy-14} v6 M{cx+6},{cy-14} v6"/>'
            f'<text class="dg-nt" x="{x+56}" y="{y+h/2-2}" text-anchor="start" style="text-anchor:start">{escape(title)}</text>'
            f'<text class="dg-sub" x="{x+56}" y="{y+h/2+15}" style="text-anchor:start">{escape(sub)}</text></g>')

def folder(x, y, w, h, title, tip):
    """A folder in the Second Brain, drawn as a folder with a tab."""
    d = (f'M{x},{y+h} L{x},{y+4} Q{x},{y} {x+4},{y} L{x+48},{y} L{x+56},{y+10} '
         f'L{x+w-4},{y+10} Q{x+w},{y+10} {x+w},{y+14} L{x+w},{y+h} Z')
    return (f'<g class="dg-node dg-fold" tabindex="0" data-tip="{escape(tip)}" '
            f'aria-label="{escape(title)} folder: {escape(tip)}">'
            f'<path class="dg-folder" d="{d}"/>'
            f'<text class="dg-nt" x="{x+w/2}" y="{y+(h+10)/2+5}">{escape(title)}</text></g>')

def cos():
    H = 640  # bottom of the top row of zones
    # ---- Microsoft 365, on the left ----
    b = zone(20, 20, 220, H - 20, 'Microsoft 365')
    b += group(32, 56, 196, 162, 'Read by Copilot')
    for i, (t, tip) in enumerate([
        ('OneNote', 'OneNote notebooks, including my core team’s. /prep-for-meeting and the Product Council Prep read them for recent, relevant notes.'),
        ('SharePoint', 'Team sites and documents. /prep-for-meeting searches the last 30 days for anything relevant to the meeting or person.'),
        ('OneDrive', 'Documents beyond the Second Brain. /prep-for-meeting searches the last 30 days for anything relevant.')]):
        b += node(44, 80 + i * 46, 172, 36, t, tip, 'ext')
    b += group(32, 338, 196, 292, 'Two-way sync')
    ms = [
        ('To-Do', 'Microsoft To-Do. Two-way with Command Center, so tasks stay in sync between My Week and To-Do.'),
        ('Outlook', 'Email and calendar. Two-way with Command Center. /prep-for-meeting also reads the last 30 days of email.'),
        ('Teams', 'Two-way with Command Center. /prep-for-meeting also reads the last 30 days of Teams chats and Teams meeting recaps.'),
        ('Microsoft Graph', 'Microsoft Graph, the API into Microsoft 365. Two-way with Command Center.')]
    for i, (t, tip) in enumerate(ms):
        b += node(44, 364 + i * 66, 172, 46, t, tip, 'ext')
    b += group(32, 236, 196, 84, 'Read by CoS Budget')
    b += node(44, 262, 172, 46, 'Excel',
              'Our budget files: the raw inputs. Complex, hard to read and easy to make mistakes in, so CoS Budget reads them for people instead.', 'ext')

    # ---- Copilot managed apps, in the middle: Command Center and CoS Budget ----
    b += zone(280, 226, 420, H - 226, 'Hosted in Copilot as managed apps')
    b += node2(292, 364, 160, 244, 'Command Center', 'Web app',
               'A web app hosted in Copilot as a managed app. It sits on the Second Brain and stays in sync with To-Do, Outlook, Teams and Microsoft Graph.', 'key')
    feats = [
        ('My Week', 'Actions, meetings, projects',
         'Top action list, daily meetings and task list, meeting note taking, and projects with their task lists and master plans.'),
        ('My Notebook', 'Edit the Second Brain',
         'Shows the Markdown files in the Second Brain, organized by folder, and lets me edit them. It looks like OneNote.'),
        ('My 1:1s', 'Filtered by relationship',
         'Every one-on-one meeting, filtered by direct reports, boss and peers, or everyone else.'),
        ('My Network', 'Network graph',
         'A network graph of the people in my system.')]
    for i, (t, sub, tip) in enumerate(feats):
        y = 364 + i * 66
        b += node2(484, y, 200, 46, t, sub, tip)
        b += arrow([(452, y + 23), (484, y + 23)])
    for i in range(4):
        y = 364 + i * 66 + 23
        b += arrow([(216, y), (292, y)], both=True)
    b += node2(292, 262, 160, 46, 'CoS Budget', 'Web app',
               'A vibe-coded web app hosted in Copilot as a managed app. It reads our budget files so people can see the summary without access to the raw inputs.', 'key')
    b += node2(484, 262, 200, 46, 'Slice, filter, visualize', 'Access by team',
               'Investments by product line, region, investment theme and investment type, without hand-built lookups and pivot tables. Finance, Engineering and Program Management each have the right access.')
    b += arrow([(216, 285), (292, 285)])
    b += arrow([(452, 285), (484, 285)])

    # ---- the /prep-for-meeting skill, above the managed apps ----
    b += node2(330, 100, 300, 60, '/prep-for-meeting', 'Copilot skill',
               'Reads my Second Brain for the meeting or person, then looks across Microsoft 365 for anything relevant from the last 30 days: Outlook, Teams chats and recaps, OneNote, SharePoint, OneDrive and more. Then it asks me questions to refine my preparation.')
    b += arrow([(330, 130), (240, 130)])
    b += label(285, 106, ['all of M365,', 'last 30 days'])
    # it also reads the Second Brain, down the gap beside Copilot (shared with My Notebook below)
    b += arrow([(630, 150), (720, 150), (720, 453), (720, H + 30)], both=True)
    b += label(675, 142, ['reads'])
    b += arrow([(480, 100), (480, 80), (751, 80)], dashed=True)
    b += label(610, 72, ['asks me questions'])

    # ---- Copilot ----
    b += zone(740, 20, 172, H - 20, 'Microsoft Copilot')
    b += node2(751, 56, 150, 48, 'Me', 'Calls /prep-for-meeting',
               'I work with Copilot in chat, calling skills like /prep-for-meeting before Product Councils, Champions meetings and 1:1s.', 'key')
    b += arrow([(826, 104), (826, 176)])
    b += node2(751, 176, 150, 120, 'Copilot', 'Skills and automations',
               'Microsoft Copilot runs my skills when I ask and my automations on a schedule. It reads and writes the Second Brain through skills, and hosts Command Center and CoS Budget as managed apps.', 'ai')
    b += arrow([(776, 176), (776, 118), (630, 118)])
    b += label(700, 110, ['runs'])

    # ---- automations, on the far right ----
    b += zone(936, 20, 244, H - 20, 'Automations')
    autos = [
        ('Your Daily Plan', 'Daily, 6:30 AM', 'Every day at 6:30 AM, an email of my tasks, to-dos, and email and Teams chat follow-ups.', 6, 30),
        ('Daily Wind Down', 'Daily, 4 PM', 'At 4 PM, an email of the tasks, to-dos, and email and Teams chat follow-ups I should finish before I leave for the day.', 16, 0),
        ('Travel to Home', 'Daily check', 'Share Travel to Home: a daily check for new travel on my work calendar. It sends a placeholder to my personal Google Calendar, so my wife and I have shared visibility at home.', None, 0),
        ('Norby’s Week', 'Sundays, 9 AM', 'Norby’s Upcoming/Prior Week: every Sunday at 9 AM, it drafts my weekly email to my organization, recapping key events, sharing context, previewing my next two weeks, and Ideas Worth Sharing / TL;DR.', 9, 0),
        ('Next Week’s Plan', 'Thursdays, 6 PM', 'Every Thursday at 6 PM, it sends me an email on the week ahead.', 18, 0),
        ('Product Council Prep', 'Wednesdays', 'Precision Upgrades Product Council Prep: every Wednesday, it reads the agenda for Thursday’s Product Council, then emails me relevant information and risks from the Second Brain, the core teams’ OneNotes, SharePoint, Outlook and Teams recaps.', None, 0)]
    for i, (t, sub, tip, hr, mn) in enumerate(autos):
        y = 60 + i * 96
        b += sched_node(946, y, 228, 56, t, sub, tip, hr, mn)
        b += arrow([(924, y + 28), (946, y + 28)])
    b += '<path class="dg-e" d="M901,236 L924,236 M924,88 L924,568"/>'
    b += '<circle class="dg-dot" cx="924" cy="236" r="3.5"/>'

    # ---- the Second Brain, underneath everything ----
    top = H + 30
    b += zone(20, top, 1160, 120, 'Second Brain')
    b += node2(40, top + 36, 200, 70, 'Second Brain', 'OneDrive folder',
               'A OneDrive folder that is the repository for my Markdown files and skills. Command Center and Copilot both read and write it, so it remembers far more than I would on my own.', 'key')
    folders = [
        ('Master Plans', 'Master plans for my projects.'),
        ('Programs', 'A Markdown file for each program I lead.'),
        ('Recurring Meetings', 'Context for each recurring meeting.'),
        ('One-on-Ones', 'Notes for each person I meet with one-on-one.'),
        ('Skills', 'Copilot skills like /prep-for-meeting, kept as files alongside the notes.')]
    for i, (t, tip) in enumerate(folders):
        b += folder(280 + i * 178, top + 36, 166, 70, t, tip)
    # My Notebook reads and edits the Second Brain, down the gap beside Copilot
    b += arrow([(720, 453), (684, 453)])
    b += '<circle class="dg-dot" cx="720" cy="453" r="3.5"/>'
    b += label(728, 457, ['reads & edits'], 'start')
    b += arrow([(866, 296), (866, top)], both=True)
    b += label(858, 560, ['reads & writes'], 'end')
    return svg(top + 132, b, 'CoS Operating System architecture')

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, '..', 'data', 'work', 'volleyball.diagrams.js')
    payload = {'suite': suite(), 'os': agentic_os(), 'stats': stats_app(), 'tournament': tournament(), 'tournamentHero': tournament_hero()}
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('volleyball', " + json.dumps(payload, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    out = os.path.join(here, '..', 'data', 'work', 'vibes.diagrams.js')
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('vibes', " + json.dumps({'arch': vibes()}, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    out = os.path.join(here, '..', 'data', 'work', 'ai2fi.diagrams.js')
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('ai2fi', " + json.dumps({'arch': ai2fi()}, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    out = os.path.join(here, '..', 'data', 'work', 'household.diagrams.js')
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('household', " + json.dumps({'arch': family_cos()}, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    out = os.path.join(here, '..', 'data', 'work', 'vehicles.diagrams.js')
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('vehicles', " + json.dumps({'arch': vehicles()}, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    out = os.path.join(here, '..', 'data', 'work', 'siri-todoist.diagrams.js')
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('siri-todoist', " + json.dumps({'arch': siri_todoist()}, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    out = os.path.join(here, '..', 'data', 'work', 'habits.diagrams.js')
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('habits', " + json.dumps({'arch': habits()}, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    out = os.path.join(here, '..', 'data', 'work', 'college-notes.diagrams.js')
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('college-notes', " + json.dumps({'arch': college_notes()}, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    out = os.path.join(here, '..', 'data', 'work', 'documents.diagrams.js')
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('documents', " + json.dumps({'arch': documents()}, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    out = os.path.join(here, '..', 'data', 'work', 'hiking-countdown.diagrams.js')
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('hiking-countdown', " + json.dumps({'arch': hiking_countdown()}, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    out = os.path.join(here, '..', 'data', 'work', 'vinyl-moon.diagrams.js')
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('vinyl-moon', " + json.dumps({'arch': vinyl_moon()}, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    out = os.path.join(here, '..', 'data', 'work', 'cos.diagrams.js')
    with open(out, 'w') as f:
        f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
        f.write("PORTFOLIO_WORK.diagrams('cos', " + json.dumps({'arch': cos()}, indent=1) + ');\n')
    print('wrote', os.path.relpath(out))
    # CoS Budget and CoS Skills & Automations have their own Why pages and share the same architecture diagram.
    for pid in ('cos-budget', 'cos-skills'):
        out = os.path.join(here, '..', 'data', 'work', pid + '.diagrams.js')
        with open(out, 'w') as f:
            f.write('/* Generated by tools/diagrams.py. Edit that file, not this one. */\n')
            f.write("PORTFOLIO_WORK.diagrams('" + pid + "', " + json.dumps({'arch': cos()}, indent=1) + ');\n')
        print('wrote', os.path.relpath(out))
