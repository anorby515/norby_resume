/*
  PUBLIC LAYER — safe for the public GitHub repo.
  Anything employer-internal (programs, people, roles, interview answers)
  belongs in the corporate layer, never here.

  `confirm` fields are notes to self. They only show with ?review in the URL.
  Fields marked draft:true are Claude-drafted copy waiting for Andy's edit.
*/
PORTFOLIO.register({
  layer: 'public',

  profile: {
    name: 'Andy Norby',
    location: 'Des Moines, Iowa',
    headline: 'I lead engineering and product teams, and I build with the tools I ask them to adopt.',
    headlineDraft: true,
    intro:
      'Twenty-six years in technology and engineering. Today I lead both the engineers who build products and the product managers who decide what is worth building. Outside work I build too: apps, agents and automations that run real operations for a youth sports club, a music discovery platform and my own household.',
    introDraft: true,
    photo: '', // e.g. 'assets/andy.jpg'
    links: [
      // { label: 'LinkedIn', href: 'https://www.linkedin.com/in/…' },
      // { label: 'GitHub', href: 'https://github.com/…' }
    ],
    confirm: [
      'Positioning line and intro are drafts. Rewrite in your voice.',
      'Add photo and LinkedIn/GitHub links.',
      'Is "Andy Norby" the name you want on the public page?'
    ]
  },

  attributes: [
    {
      id: 'innovator',
      name: 'Innovator',
      line: 'Spots the problem nobody has automated yet, and ships the first working version.',
      draft: true
    },
    {
      id: 'learner',
      name: 'Continuous learner',
      line: 'Picks up a new tool when the problem calls for it, then teaches it forward.',
      draft: true
    },
    {
      id: 'collaborator',
      name: 'Collaborator',
      line: 'Builds for the people on the other end: coaches, parents, family, teams.',
      draft: true
    },
    {
      id: 'executor',
      name: 'Executor',
      line: 'Runs things in production, with monitoring, fallbacks and a test environment.',
      draft: true
    }
  ],

  /* Page order. Corporate layer can insert sections by giving an `after` id. */
  sections: [
    { id: 'leader', type: 'hero', nav: 'Andy Norby' },
    {
      id: 'career',
      type: 'prose',
      nav: 'My Career',
      title: 'My Career',
      body: [
        'Twenty-six years in technology and engineering. I have led embedded software teams, the electronics and hardware platforms beneath them, and the product-level engineering and product management above them.'
      ],
      draft: true,
      confirm: ['Public career summary is a draft. Add titles and years at whatever level you are comfortable sharing publicly, or a LinkedIn link. The internal build replaces this with the full timeline.']
    },
    {
      id: 'beyond',
      type: 'cards',
      nav: 'Beyond Work',
      title: 'Beyond Work',
      lede: 'Where I spend the rest of my time.',
      items: 'community'
    },
    {
      id: 'about',
      type: 'prose',
      title: 'Outside the résumé',
      body: [],
      confirm: ['Personal section is empty. Add family, interests, what drives you.']
    },
    {
      id: 'portfolio',
      type: 'apps',
      nav: 'AI Portfolio',
      title: 'AI Portfolio',
      lede: 'Apps and agents I have built, grouped by who they serve. Open one to see why and how.',
      items: 'appRows',
      footnote: 'CoS is short for Chief of Staff.'
    },
    {
      id: 'questions',
      type: 'placeholder',
      nav: 'Pre-Interview Questions',
      title: 'Pre-Interview Questions',
      lede: 'My answers to the three questions the panel shared ahead of the interview.',
      items: ['Question 1', 'Question 2', 'Question 3'],
      note: 'Shared in person.'
    }
  ],

  /* AI Portfolio home screen. Rows merge by id, so the internal build can
     replace a row (for example to give the work apps real icons and links). */
  appRows: [
    {
      id: 'work', title: 'AI at Work', tone: 'work',
      confirm: ['Placeholders on the public site. The internal build replaces this row with real icons and links.'],
      apps: [
        { id: 'labs', name: 'AI Dev Labs', placeholder: true },
        { id: 'cos-os', name: 'CoS OS', placeholder: true },
        { id: 'cos-agent', name: 'CoS Agent', placeholder: true },
        { id: 'cos-command', name: 'CoS Command Center', placeholder: true },
        { id: 'cos-automation', name: 'CoS Automation', placeholder: true },
        { id: 'cos-budget', name: 'CoS Budget', placeholder: true },
        { id: 'leadership-switch', name: 'The Leadership Switch', placeholder: true }
      ]
    },
    {
      id: 'eclipse', title: 'Eclipse Volleyball', tone: 'eclipse',
      apps: [
        { id: 'eclipse-os', name: 'Eclipse OS', img: 'assets/icons/eclipse.webp', href: '#/portfolio/volleyball' },
        { id: 'eclipse-cos', name: 'Eclipse CoS', img: 'assets/icons/eclipse.webp', href: '#/portfolio/volleyball' },
        { id: 'tourney', name: 'Tourney', img: 'assets/icons/eclipse-invitational.webp', href: '#/portfolio/volleyball' },
        { id: 'tourney-tv', name: 'Tourney TV', img: 'assets/icons/eclipse-invitational.webp', href: '#/portfolio/volleyball' },
        { id: 'tourney-score', name: 'Tourney Scorekeeper', img: 'assets/icons/eclipse-invitational.webp', href: '#/portfolio/volleyball' },
        { id: 'stats', name: 'Stats', img: 'assets/icons/eclipse-stats.webp', href: '#/portfolio/volleyball' },
        { id: 'stats-analyzer', name: 'Stats Analyzer', img: 'assets/icons/eclipse-stats.webp', href: '#/portfolio/volleyball' },
        { id: 'volunteers', name: 'Volunteers', icon: 'people', href: '#/portfolio/volleyball' }
      ]
    },
    {
      id: 'family', title: 'Family & Home', tone: 'family',
      confirm: ['Muse has no deck yet, so its icon does not open anything.'],
      apps: [
        { id: 'personal-cos', name: 'Personal CoS', icon: 'sun', href: '#/portfolio/household' },
        { id: 'family-cos', name: 'Family CoS', icon: 'home', href: '#/portfolio/household' },
        { id: 'muse', name: 'Muse', icon: 'bag' },
        { id: 'vehicles', name: 'Vehicles', icon: 'car', href: '#/portfolio/household' },
        { id: 'habits', name: 'Habits', icon: 'flame', href: '#/portfolio/habits' },
        { id: 'college-notes', name: 'College Notes', icon: 'notebook', href: '#/portfolio/household' },
        { id: 'document-agent', name: 'Document Agent', icon: 'folder', href: '#/portfolio/household' }
      ]
    },
    {
      id: 'public', title: 'Public & Friends', tone: 'public',
      confirm: ['Countdown apps and Vinyl Moon have no deck or public URL yet. Add a URL to open them directly, or a one-line description for a deck.'],
      apps: [
        { id: 'vibes', name: 'Vibes.live', note: '(available in App Store for iOS)', img: 'assets/icons/vibes.webp', href: '#/portfolio/vibes' },
        { id: 'ai2fi', name: 'AI2FI', note: '(published on GitHub)', icon: 'trend', href: '#/portfolio/ai2fi' },
        { id: 'financial-analyst', name: 'Financial Analyst', icon: 'pie', href: '#/portfolio/ai2fi' },
        { id: 'hawaii', name: 'Hawaii or Bust', icon: 'palm' },
        { id: 'co-hiking', name: 'CO Hiking', icon: 'mountain' },
        { id: 'vinyl-moon', name: 'Vinyl Moon', icon: 'disc' }
      ]
    }
  ],

  /* Tool registry. Projects reference these ids. */
  tools: {
    'claude':        { name: 'Claude',              group: 'AI' },
    'claude-code':   { name: 'Claude Code',         group: 'AI' },
    'claude-design': { name: 'Claude Design',       group: 'AI' },
    'cowork':        { name: 'Claude scheduled tasks', group: 'AI' },
    'gemini-nb':     { name: 'Gemini notebooks',    group: 'AI' },
    'together':      { name: 'Together.ai',         group: 'AI' },
    'github':        { name: 'GitHub',              group: 'Build and host' },
    'gh-pages':      { name: 'GitHub Pages',        group: 'Build and host' },
    'netlify':       { name: 'Netlify',             group: 'Build and host' },
    'cloudflare':    { name: 'Cloudflare',          group: 'Build and host' },
    'swiftui':       { name: 'SwiftUI',             group: 'Build and host' },
    'supabase':      { name: 'Supabase',            group: 'Data' },
    'sheets':        { name: 'Google Sheets',       group: 'Data' },
    'apps-script':   { name: 'Apps Script',         group: 'Data' },
    'notion':        { name: 'Notion',              group: 'Data' },
    'drive':         { name: 'Google Drive',        group: 'Data' },
    'gmail':         { name: 'Gmail',               group: 'Integrations' },
    'gcal':          { name: 'Google Calendar',     group: 'Integrations' },
    'teamsnap':      { name: 'TeamSnap',            group: 'Integrations' },
    'todoist':       { name: 'Todoist',             group: 'Integrations' },
    'healthkit':     { name: 'HealthKit',           group: 'Integrations' }
  },

  projects: [
    {
      id: 'volleyball',
      title: 'Eclipse Volleyball',
      page: 'volleyball',
      cover: { src: 'assets/work/volleyball/tp-tv.webp' },
      kind: ['app', 'agent'],
      attributes: ['innovator', 'executor', 'collaborator', 'learner'],
      summary: 'Three products for an 11-team club: a stats app, a tournament suite and an automation layer integrated with TeamSnap.',
      why: {
        problem:
          'A volunteer-run club juggles dozens of teams, tournaments, rosters and parents across disconnected tools. Errors surface on game day, when they are hardest to fix.',
        decisions: [
          'Build the game-day apps people touch, and automate the back-office work nobody wants to do by hand.',
          'Treat the club calendar and TeamSnap as two sources that must agree, and let an agent check them every week.',
          'Design for coaches and parents on phones first, using Claude Design to prototype the experience before writing code.'
        ],
        outcome: 'Fewer schedule surprises, live scoring and stats on game day, and a weekly read on what still needs attention.'
      },
      how: {
        flow: [
          { label: 'Tournament link', detail: 'Event published by the host' },
          { label: 'Team scoping', detail: 'Iterate with Claude on which club teams are in' },
          { label: 'TeamSnap import', detail: 'Schedule generated for bulk import' },
          { label: 'Change watch', detail: 'Calendar monitored for updates' },
          { label: 'Stats app', detail: 'Rosters flow in automatically' }
        ],
        stack: ['claude', 'claude-code', 'claude-design', 'cowork', 'github', 'netlify', 'supabase', 'gcal', 'gmail', 'sheets', 'drive', 'todoist', 'teamsnap'],
        practices: [
          'Separate production and demo environments for the stats app, so features are tested without touching live data.',
          'Agents distinguish real gaps from import artifacts, and only flag what is actionable this week.',
          'Workflow: requirements document, then UX prototype in Claude Design, then build with Claude Code on GitHub.'
        ]
      },
      components: [
        { title: 'Stat Tracker', kind: 'app', text: 'Live match stats on a parent’s phone, even with no signal in the gym. Offline-first, with season analytics for coaches.' },
        { title: 'Tournament Suite', kind: 'app', text: 'A family app, a scorekeeper at every court, a live TV wall and waiver tracking. Reused for a four-court Senior Night a week later.' },
        { title: 'Eclipse Agentic OS', kind: 'agent', text: 'Agents that watch the club calendar, write TeamSnap imports, and send a weekly read on what is still open.' }
      ],
    },

    {
      id: 'vibes',
      title: 'Vibes.live',
      kind: ['product', 'agent'],
      attributes: ['innovator', 'learner', 'executor'],
      summary: 'A live music discovery platform, rebuilt around specialized AI agents.',
      why: {
        problem: 'Finding live music you will love, in the place you will be, takes too many apps and too much luck.',
        decisions: [
          'Moved from a mobile app with affiliate referrals to an agentic architecture.',
          'Split the job across four specialist agents rather than one general assistant.',
          'Modeled per-query inference cost before setting a paid tier, so pricing holds at scale.'
        ],
        outcome: 'A product I run end to end: strategy, UX, architecture and operations.'
      },
      how: {
        flow: [
          { label: 'Show Finder', detail: 'What is playing, where' },
          { label: 'Artist Advisor', detail: 'Who you will like' },
          { label: 'Festival Matcher', detail: 'Which festivals fit' },
          { label: 'Trip Planner', detail: 'How to get there' }
        ],
        stack: ['claude', 'claude-design', 'claude-code', 'github', 'together'],
        practices: [
          'Five-layer architecture with four specialized agents.',
          'Daily analytics email and automated server health checks, so I hear about problems before users do.',
          'UX designed with Claude Design before build.',
          'Three-phase mobile roadmap.'
        ]
      },
      confirm: ['Confirm hosting (Netlify? Cloudflare?) and data store for Vibes.live.', 'Add the public URL.']
    },

    {
      id: 'ai2fi',
      title: 'AI2FI',
      kind: ['product', 'app', 'agent'],
      attributes: ['innovator', 'learner'],
      summary: 'A financial coaching platform built on a 14-step order of operations. I am its designer and its first user.',
      why: {
        problem: 'Most financial advice is either generic or expensive. People need a sequence they can follow and a coach that remembers where they are.',
        decisions: [
          'Anchor the coaching on a 14-step Financial Order of Operations.',
          'Dogfood every part on my own finances before anyone else sees it.',
          'Turn deep research into formats I will actually consume: podcasts and slides.'
        ],
        outcome: 'Coaching, a strategy dashboard and a research pipeline that I use weekly.'
      },
      how: {
        flow: [
          { label: 'Coaching', detail: 'Two-pass LLM question system' },
          { label: 'Dashboard', detail: 'Full strategy plus planning tools' },
          { label: 'Moat research', detail: 'Prompts score each holding' },
          { label: 'Gemini notebooks', detail: 'Analysis becomes podcasts and decks' }
        ],
        stack: ['claude', 'claude-code', 'gemini-nb', 'drive'],
        practices: [
          'Markdown as the source of truth, rendered into a canvas-style UI.',
          'Longitudinal tracking of financial temperament across sessions.',
          'Research runs as one markdown file per holding with a progress file for continuity across sessions.'
        ]
      },
      confirm: ['Dashboard stack and hosting?', 'Comfortable naming AI2FI publicly?']
    },

    {
      id: 'household',
      title: 'Household automation',
      kind: ['agent'],
      attributes: ['executor', 'collaborator'],
      summary: 'Agents that take paperwork off my family’s plate: notes, receipts, statements and the weekly calendar.',
      why: {
        problem: 'Household admin is a stream of paper and dates that nobody wants to file.',
        decisions: [
          'The only manual step should be taking a photo. Everything after is automated.',
          'Use the tools the family already has (Google Drive, phones) instead of new devices.'
        ],
        outcome: 'Filed, searchable records and reminders the family did not have to set up.'
      },
      how: {
        flow: [
          { label: 'Phone scan', detail: 'Drive app scanner into an inbox' },
          { label: 'Scheduled agent', detail: 'Reads, renames, files' },
          { label: 'Record', detail: 'Sheet, Notion or folder' },
          { label: 'Nudge', detail: 'Reminders and exceptions' }
        ],
        stack: ['cowork', 'drive', 'apps-script', 'sheets', 'notion', 'todoist', 'gmail', 'gcal', 'gh-pages'],
        practices: [
          'Unreadable scans raise a task for a human instead of failing silently.',
          'A separate script for the family web app, so new features cannot break ingestion.'
        ]
      },
      components: [
        { title: 'Class notes', kind: 'agent', text: 'Handwritten notes scanned by phone, transcribed and filed into a Notion notebook by class.' },
        { title: 'Vehicle maintenance', kind: 'app', text: 'Receipts filed per vehicle into a shared journal, service reminders in Todoist, and a family phone app with Google sign-in.' },
        { title: 'Weekly family brief', kind: 'agent', text: 'A Sunday email with the week ahead and the next three weeks, plus a daily brief of tasks.' },
        { title: 'Document filing', kind: 'agent', text: 'Statements filed by date, account holder and institution; medical receipts filed for HSA claims.' }
      ]
    },

    {
      id: 'habits',
      title: 'Habits',
      kind: ['app'],
      attributes: ['learner'],
      summary: 'An iOS habit app, being extended into a two-player challenge.',
      why: {
        problem: 'Habits stick better with a little competition.',
        decisions: ['Native iOS with Health data, then a head-to-head challenge mode.'],
        outcome: 'In TestFlight.'
      },
      how: {
        flow: [],
        stack: ['swiftui', 'supabase', 'healthkit'],
        practices: ['Design handoff document for the challenge dashboard before build.']
      },
      confirm: ['Include this one? Not mentioned in the interview planning.']
    }
  ],

  community: [
    {
      id: 'pi515',
      title: 'Tech mentorship with PI 515',
      meta: 'Founded the program about 5 years ago',
      text:
        'PI 515 is a Des Moines nonprofit bringing STEM access to students in underserved schools. I founded a mentorship program that partners engineers from my employer with PI 515: students come on site twice a week, learn hands-on skills and earn college credit. I recruit the volunteer teachers, and we built the platform the program runs on. Each year, 12 to 18 students graduate.',
      confirm: [
        'Add impact stats and a scholarship story or two.',
        'Board of directors: mention publicly yet?',
        'OK to say "my employer", or name Deere?'
      ]
    },
    {
      id: 'coaching',
      title: 'Youth volleyball',
      meta: 'About 8 years',
      text:
        'Assistant coach and digital coordinator for an 11-team club. I coach on the court and run every digital system the club uses, which is where the Eclipse Volleyball apps in my AI Portfolio came from.'
    }
  ]
});
