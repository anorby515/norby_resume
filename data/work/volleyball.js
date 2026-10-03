/*
  Eclipse Volleyball suite — product page (why / who) and engineering page (how).
  Sources: Product.md, Design.md, Tournament.md, netlify.toml and the git history in
  the volleyball-stats repo; the eclipse-calendar-sync skill; Claude outputs.
  Screenshots come from demo builds with invented players only.
*/
PORTFOLIO_WORK.register({
  id: 'volleyball',
  title: 'Eclipse Volleyball',
  kicker: 'Three products for one youth volleyball club',
  summary:
    'Des Moines Eclipse is an 11-team volunteer-run club. I coach there and run its digital side, so I built the software it runs on: a stat tracker for coaches, a platform for hosting tournaments, and an automation layer that integrates with TeamSnap, the club’s team management platform, to keep every team’s schedule right.',

  why: {
    lead: 'A volunteer club runs on spreadsheets, group texts and whoever remembers.',
    body: [
      'Eleven teams means hundreds of matches, dozens of events and a schedule that changes every week. The tools available were built for bigger organizations, cost money, or left the hard parts to a volunteer at 10 PM.',
      'Every problem here showed up on game day, when it is hardest to fix: a stat sheet nobody could read, a parent asking which court, an event that never made it into TeamSnap. I built each product to remove one of those moments.'
    ]
  },

  numbers: [
    { n: '3', label: 'products, one club' },
    { n: '543', label: 'commits since February 2026' },
    { n: '740', label: 'automated tests' },
    { n: '11', label: 'teams served' }
  ],

  products: [
    /* ------------------------------------------------------------------ */
    {
      id: 'os',
      hero: { src: 'os-homenight.webp', alt: 'A home night schedule planned with Claude' },
      name: 'Eclipse OS',
      line: 'Agents that turn the athletic director’s calendar into a correct TeamSnap schedule for every team.',
      kind: ['agent'],
      why: {
        problem:
          'The athletic director books events in a shared Google Calendar. Families live in TeamSnap. Every new tournament, home night or reschedule had to be re-typed for up to eleven teams, and a missed change meant a family at the wrong gym.',
        insight:
          'TeamSnap’s importer appends and never merges, so a changed event has to be deleted by hand before it is re-imported. The automation has to tell a person exactly what to delete, and in what order, not just what changed.'
      },
      who: [
        { name: 'Athletic director', who: 'Books courts and opponents', need: 'Keep scheduling in her calendar, in her own shorthand.', gets: 'No new tool to learn. A weekly email surfacing anything still open.' },
        { name: 'Club admin', who: 'Me, running TeamSnap for 11 teams', need: 'Turn calendar changes into TeamSnap changes without mistakes.', gets: 'A twice-daily watch, then exact import files and a delete list in the right order.' },
        { name: 'Families and coaches', who: 'Everyone reading TeamSnap', need: 'A schedule they can trust.', gets: 'Events that land in TeamSnap the same week they are booked.' }
      ],
      features: [
        { name: 'Tournament to TeamSnap', text: 'From a tournament link to which club teams are in, then a TeamSnap-ready import file and a printable schedule.' },
        { name: 'Calendar watch', text: 'Checks the club calendar twice a day and creates a task, push and email only when something changed.' },
        { name: 'Delete first, then import', text: 'On request, produces the rows to delete, the rows to import, and a plain-language summary.' },
        { name: 'Drift detection', text: 'Compares a TeamSnap export against the calendar and flags hand edits, duplicates and missed imports.' },
        { name: 'Weekly events email', text: 'Every Sunday: this week, next week and the two after, with gaps, TBDs and missing start times called out.' },
        { name: 'Roster sync', text: 'Roster changes flow into the stat tracker so every app works from the same teams.', confirm: 'Confirm how roster sync works today.' }
      ],
      value: {
        model: 'Hours back every week, and no family at the wrong gym.',
        points: [
          'Replaces re-typing every event across up to eleven teams.',
          'Mistakes are caught before families see them, not after.',
          'The athletic director keeps working exactly the way she already does.'
        ],
        confirm: 'Estimate hours saved per week?'
      }
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'stats',
      hero: { src: 'st-tracker.webp', tall: true, alt: 'The stat tracker during a match' },
      name: 'Stat Tracker',
      line: 'Live match stats on a parent’s phone, even with no signal in the gym.',
      kind: ['app'],
      why: {
        problem:
          'Coaches wanted kill and hitting percentages per player across a season. What they had was a parent with a clipboard, numbers nobody could read later, and gyms with no cell signal.',
        insight:
          'The person keeping stats is a volunteer watching their own kid, one-handed, mid-rally. If recording a play takes more than three taps, it does not get recorded.'
      },
      who: [
        { name: 'Stat keeper', who: 'A parent volunteer in the stands', need: 'Record every play without looking away from the court for long.', gets: 'Three taps per play, one-handed, and the next serve is already waiting.' },
        { name: 'Coach', who: 'Head and assistant coaches', need: 'Know who is hitting well before the next match, not next week.', gets: 'Per-player kill % and hit %, set-by-set, filterable across a season, exportable to Excel.' },
        { name: 'Club admin', who: 'Me, for eight teams and 73 players', need: 'Rosters that change all season without breaking last season’s numbers.', gets: 'One player directory, swing players across teams, and history that never rewrites itself.' }
      ],
      features: [
        { name: 'Action, player, result', text: 'Every play is the same three taps, split into our half and their half of the screen.' },
        { name: 'Works offline', text: 'Saves on the phone first and syncs when a connection returns, with a color-coded sync status.' },
        { name: 'Smart serve tracking', text: 'Knows who is still serving after a point, and suggests the likely server after a side out.' },
        { name: 'Undo with a name', text: 'Take back any of the last three plays; the confirm names exactly what will be reverted.' },
        { name: 'Season analytics', text: 'Team record, per-player stats, error tracking and match history, filtered by team, tournament and opponent.' },
        { name: 'Learn and practice', text: 'A ten-screen guide and a practice build with invented players, so new volunteers can try it before game day.' }
      ],
      value: {
        model: 'Built for the club, not for sale.',
        points: [
          'The club owns the app and its data: no per-team subscription.',
          'New stat keepers learn in ten swipes, so the job is not stuck with one parent.',
          'Coaches get numbers they previously could not get at all.'
        ],
        confirm: 'Confirm "no subscription" framing and whether hosting runs on free tiers.'
      },
      link: { label: 'Open the practice app', href: '' },
      confirm: ['Add the public demo URL if you want people to try it (the production URL stays private).']
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'tournament',
      hero: { src: 'tp-tv.webp', alt: 'The tournament TV wall' },
      name: 'Tournament Platform',
      line: 'One link for families, a scorekeeper at every court, and a live wall in the gym.',
      kind: ['app', 'agent'],
      why: {
        problem:
          'Hosting a tournament means answering the same two questions all day: where do we stand, and what is on which court right now. Brackets on a whiteboard and a group text do not scale past one court.',
        insight:
          'If one volunteer at each score table taps +1, everything else (standings, point differential, seeding, the bracket and the TV) can be derived from those taps in the same instant.'
      },
      who: [
        { name: 'Families', who: 'Parents and fans from every visiting team', need: 'Know when and where their team plays, and how the day is going.', gets: 'One link sent a week out: a swipeable preview before the event, a live hub on the day.' },
        { name: 'Scorekeepers', who: 'Volunteers at each score table', need: 'Keep score without training or logging in.', gets: 'A QR card taped to the table opens scoring for that court directly.' },
        { name: 'Organizers', who: 'The club running the event', need: 'Stay on schedule, collect waivers, and give sponsors visibility.', gets: 'Live “minutes behind” per court, a waiver tracker, and a TV wall that rotates sponsor panels.' },
        { name: 'Visiting coaches', who: 'Other clubs’ staff', need: 'Rules, format and their team’s path through the day.', gets: 'A My Team view, published rules, and both brackets as they fill in.' }
      ],
      features: [
        { name: 'Two shells, one app', text: 'An eight-page preview deck before the event; a live hub on game day. The switch is automatic.' },
        { name: 'Scorekeeper', text: 'Large +1 targets per team, set management, and a guard against two people scoring the same match.' },
        { name: 'TV wall', text: 'Live standings with the gold-bracket cut line, both courts’ scores, and what is next.' },
        { name: 'Brackets and standings', text: 'Gold and silver brackets seeded from pool play: sets won, then point differential, then head-to-head.' },
        { name: 'Waivers', text: 'A waiver page in the app, plus an agent that reconciled signed waivers against visiting rosters and emailed daily status.' },
        { name: 'Reused for Senior Night', text: 'The same platform ran a four-court Senior Night a week later, with sixteen volunteer scorekeepers.' }
      ],
      value: {
        model: 'Tournaments are how a club raises money. This makes hosting repeatable.',
        points: [
          'Gate fees and sponsors fund the club. The TV wall and splash screen give sponsors visibility they can see.',
          'Turned one-off event work into a platform: Senior Night reused it within a week.',
          'Fewer volunteers needed at the desk answering “which court?”'
        ],
        confirm: 'Any numbers: attendance, sponsors, revenue from the Invitational?'
      },
      confirm: ['The flyer artwork shows players from behind. OK to use publicly, or keep it off the page?']
    }
  ],

  /* ==================================================================== */
  how: {
    lead: 'Three products, built with three different kinds of AI help.',
    body: [
      'The two apps are vibe-coded: I wrote requirements, prototyped the experience in Claude Design, and built with Claude Code, with every change backed by tests. Eclipse OS is agentic: Claude runs on a schedule with the calendar, Drive and Todoist connected, following a skill I wrote that encodes the club’s rules.',
      'The apps share one repository, one Netlify deploy and one Supabase database, and nothing else. Each has its own service worker, its own look and its own tables, so a change to one cannot break the others.'
    ],
    workflow: [
      { label: 'Requirements', detail: 'Product, design and test docs in the repo' },
      { label: 'Claude Design', detail: 'UX prototype and design handoff' },
      { label: 'Claude Code', detail: 'Build, refactor, write tests' },
      { label: 'Jest', detail: '740 tests against the logic' },
      { label: 'Netlify', detail: 'Production and demo deploys' }
    ],
    shared: [
      { title: 'Production and demo, from one codebase', text: 'A build flag sets the mode. Demo builds seed invented teams and players, show a banner, and never write to the database.' },
      { title: 'Deploys are gated', text: 'A script decides which pushes are worth a deploy, so documentation changes do not spend build minutes.' },
      { title: 'The docs are the spec', text: 'Product.md, Design.md and Test.md are kept current with the code, and Claude Code reads them before every change.' },
      { title: 'Security headers by default', text: 'Every response ships with frame, content-type, referrer and transport security headers.' }
    ],
    tools: ['claude-code', 'claude-design', 'github', 'netlify', 'supabase', 'jest', 'pwa', 'vanilla-js'],

    products: {
      stats: {
        diagram: [
          { stage: 'Phone', nodes: ['Tracker', 'Match setup', 'Rosters'] },
          { stage: 'On device', nodes: ['localStorage, primary store', 'Service worker cache', 'Sync queue'] },
          { stage: 'Cloud', nodes: ['Supabase Postgres', 'PostgREST API'] },
          { stage: 'Coaches', nodes: ['Analytics dashboard', 'Excel export', 'Google Sheets export'] }
        ],
        decisions: [
          { title: 'Offline-first, not online-with-a-fallback', text: 'The phone is the source of truth during a match; Supabase is the sync target. A dead gym network costs nothing.' },
          { title: 'The score is derived, never stored', text: 'The score is folded from the play log, so undoing a play recalculates everything downstream with no drift.' },
          { title: 'History is immutable', text: 'Every stat row snapshots the player’s name and number at match time. Changing a roster can never rewrite a past match.' },
          { title: 'No framework, no build step', text: 'Vanilla JavaScript served as static files. Fast on old phones, and nothing to upgrade between seasons.' }
        ],
        shots: [
          { src: 'st-tracker.webp', tall: true, title: 'Two halves, two jobs', caption: 'Our half is a stat sheet; their half is a scoreboard. Every tile is at least 44 pixels, built for one thumb in portrait.', tools: ['vanilla-js', 'claude-design'] },
          { src: 'st-picker.webp', tall: true, title: 'Full-screen player step', caption: 'Picking the player takes the whole screen, one name per line, sorted the way coaches shout them.', tools: ['vanilla-js'] },
          { src: 'st-outcomes.webp', title: 'One tap for the result', caption: 'A blocked attack writes the hitting error, the point and the other team’s block in a single tap.', tools: ['vanilla-js'] },
          { src: 'st-log.webp', title: 'Play log', caption: 'Every play with the score at that moment, rebuilt from the log rather than stored.', tools: ['supabase'] },
          { src: 'st-undo.webp', title: 'Undo that says what it undoes', caption: 'The confirm names the exact play, and every stat it wrote is recalculated.', tools: ['jest'] },
          { src: 'st-home.webp', tall: true, title: 'Demo mode', caption: 'The same code in demo mode: invented players, a banner, nothing saved. It is how new volunteers practice.', tools: ['netlify'] }
        ],
        split: {
          vibe: 'The whole app: tracker, rosters, analytics, offline sync and the learning guide.',
          agentic: 'Roster updates generated by the Eclipse OS agents.'
        },
        tools: ['vanilla-js', 'pwa', 'supabase', 'netlify', 'jest', 'exceljs', 'sheets-api', 'claude-code', 'claude-design']
      },

      tournament: {
        diagram: [
          { stage: 'At the venue', nodes: ['QR card per court', 'Scorekeeper phones', 'Laptop driving the TV'] },
          { stage: 'Apps', nodes: ['/score/N scorekeeper', '/tv wall display', '/invite family app'] },
          { stage: 'Logic', nodes: ['tournament-data.js: pure derivations', 'Offline cache and retry queue'] },
          { stage: 'Cloud', nodes: ['Supabase tables', 'Netlify redirects'] }
        ],
        decisions: [
          { title: 'The URL is the access control', text: 'Scoring has no link inside the app. It is reached only from the QR card taped to the table, so the person holding it is the person scoring.' },
          { title: 'Everything is derived from taps', text: 'Standings, seeding and brackets live in one pure, fully tested module with no screen code in it.' },
          { title: 'One writer per match', text: 'If a court already has a match open, a second phone is asked whether it is really theirs before it can score.' },
          { title: 'Game day is decided by the calendar', text: 'The app switches from preview to live on the event date, with a two-day grace window. Test taps from weeks earlier cannot flip it.' }
        ],
        shots: [
          { src: 'tp-hub.webp', tall: true, title: 'Family hub on game day', caption: 'What is on each court right now, how far behind it is running, and what is next.', tools: ['vanilla-js', 'supabase'] },
          { src: 'tp-score.webp', tall: true, title: 'Scorekeeper guard', caption: 'A second phone at a court with an open match is asked to confirm before it can score, so two people never write the same match.', tools: ['supabase'] },
          { src: 'tp-tv.webp', wide: true, title: 'TV wall', caption: 'Live standings with the gold-bracket cut line and both courts. Sponsor panels rotate in between.', tools: ['vanilla-js'] },
          { src: 'tp-desk.webp', wide: true, title: 'Scales to desktop', caption: 'The same screens reflow into a sidebar layout for laptops at the desk.', tools: ['claude-design'] },
          { src: 'sn-tv.webp', wide: true, title: 'Reused for Senior Night', caption: 'A four-court version shipped a week later from the same platform, with cache headers tuned so sixteen volunteer phones always ran the latest build.', tools: ['netlify'] }
        ],
        split: {
          vibe: 'The family app, scorekeeper, TV wall, printable QR cards and Senior Night.',
          agentic: 'The waiver tracker: an hourly agent that matched signed waivers to visiting rosters, with fuzzy name matching, and emailed a daily status.'
        },
        tools: ['vanilla-js', 'pwa', 'supabase', 'netlify', 'jest', 'python', 'claude-design', 'claude-code', 'cowork', 'sheets', 'gmail']
      },

      os: {
        diagram: [
          { stage: 'Sources', nodes: ['Club Google Calendar', 'Tournament links', 'TeamSnap export'] },
          { stage: 'Agents', nodes: ['Twice-daily watch', 'On-demand analysis', 'Sunday events email'] },
          { stage: 'Rules', nodes: ['Claude skill', 'sync_check.py', 'Mapping rules'] },
          { stage: 'Outputs', nodes: ['Import CSV', 'Delete worklist', 'Todoist, push, email'] }
        ],
        decisions: [
          { title: 'Detect and analyse are separate', text: 'The scheduled run only notices and notifies. The analysis runs when I ask, after a fresh TeamSnap export, so a change is never marked handled before it is.' },
          { title: 'A silent failure must not look like a quiet week', text: 'A failed read says so and stops, and a weekly heartbeat confirms the watch is still running.' },
          { title: 'Some events belong to TeamSnap', text: 'Events I have enriched by hand are on an override list. Changes to them are flagged for review instead of regenerated.' },
          { title: 'Rules live in a skill, not in a prompt', text: 'Team-name mapping, venues and edge cases are in a versioned skill and script, so every unattended run behaves the same.' }
        ],
        shots: [
          { src: 'os-homenight.webp', title: 'A home night, planned with Claude', caption: 'Four courts, three clubs and eleven teams, revised three times. The agent flagged the conflict it found, then produced the TeamSnap import from the same plan.', tools: ['claude', 'cowork'] }
        ],
        artifact: {
          title: 'The import file it produced',
          caption: 'Real rows from that night’s TeamSnap import: one per team per match, venue and court included.',
          head: ['Team', 'Opponent', 'Date', 'Start', 'Court'],
          rows: [
            ['16UB1', 'Ottumwa Christian HSB', '10/08/2026', '5:30 pm', 'Court 3'],
            ['6th Grade Girls', 'Hardin County JHG', '10/08/2026', '5:30 pm', 'Court 5'],
            ['7th/8th Grade Girls', 'Ottumwa Christian JHG', '10/08/2026', '5:30 pm', 'Court 6'],
            ['16UB2', 'Ottumwa Christian HSB', '10/08/2026', '6:15 pm', 'Court 3']
          ]
        },
        split: {
          vibe: 'The diff script and its tests.',
          agentic: 'Everything else: watching the calendar, analysing changes, writing imports and summaries, and the weekly email, all on a schedule.'
        },
        tools: ['claude', 'cowork', 'skills', 'python', 'gcal', 'drive', 'todoist', 'gmail', 'teamsnap'],
        confirm: ['Add a screenshot of a weekly events email or a change notification (personal details blurred).']
      }
    }
  },

  /* Tools used on these pages. Merged with the site-wide registry. */
  tools: {
    'claude':        { name: 'Claude' },
    'claude-code':   { name: 'Claude Code' },
    'claude-design': { name: 'Claude Design' },
    'cowork':        { name: 'Claude scheduled tasks' },
    'skills':        { name: 'Claude skills' },
    'github':        { name: 'GitHub' },
    'netlify':       { name: 'Netlify' },
    'supabase':      { name: 'Supabase' },
    'jest':          { name: 'Jest' },
    'pwa':           { name: 'Service workers' },
    'vanilla-js':    { name: 'Vanilla JavaScript' },
    'exceljs':       { name: 'ExcelJS' },
    'sheets-api':    { name: 'Google Sheets API' },
    'sheets':        { name: 'Google Sheets' },
    'python':        { name: 'Python' },
    'gcal':          { name: 'Google Calendar' },
    'drive':         { name: 'Google Drive' },
    'todoist':       { name: 'Todoist' },
    'gmail':         { name: 'Gmail' },
    'teamsnap':      { name: 'TeamSnap' }
  }
});
