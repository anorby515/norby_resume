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
    headline: 'Solving customer problems for nearly 30 years through Deere Tech Stack product delivery.',
    intro:
      'Twenty-six years in technology and engineering. Today I lead both the engineers who build products and the product managers who decide what is worth building. Outside work I build too: apps, agents and automations that run real operations for a youth sports club, a music discovery platform and my own household.',
    introDraft: true,
    photo: '', // e.g. 'assets/andy.jpg'
    links: [
      // { label: 'LinkedIn', href: 'https://www.linkedin.com/in/…' },
      // { label: 'GitHub', href: 'https://github.com/…' }
    ],
    confirm: [
      'Intro is a draft. Rewrite in your voice.',
      'Add photo and LinkedIn/GitHub links.',
      'Is "Andy Norby" the name you want on the public page?'
    ]
  },

  attributes: [
    {
      id: 'executor',
      name: 'Executor',
      line: 'I’ve held leadership roles in some of Deere’s largest tech stack investments, including JDLink and the Gen4 Display. Most of my career has been in embedded software, followed by leading cross-functional electronics hardware organizations. Today I lead the Precision Upgrades product line, which now includes product management alongside engineering.'
    },
    {
      id: 'leader',
      name: 'Leader',
      line: 'I lead through collaboration, high transparency and a focus on empowering my teams. I lead by example to build a shared consciousness of what\u2019s important, for myself and the organization. I grow my teams\u2019 capabilities through empowerment with accountability, and I share with them the Leadership Model I strive to live by: Coach, Mentor, Manage.'
    },
    {
      id: 'collaborator',
      name: 'Collaborator',
      line: 'Trust is the most efficient and effective path to delivering enterprise-wide programs. A career in the tech stack has given me a broad network across product lines and functions. I want my personal brand to be built on authenticity, trustworthiness and following through on commitments.'
    },
    {
      id: 'innovator',
      name: 'Innovator / Continuous Learner',
      line: 'I\u2019m always looking for better, faster ways to produce at higher quality, and I love to experiment with new tools and methods early. Lately that means getting my hands dirty putting AI to work, then teaching and inspiring others to do the same. Beyond AI, I\u2019ve spent the past couple of years studying business strategy and product management.'
    }
  ],

  /* Page order. Corporate layer can insert sections by giving an `after` id. */
  sections: [
    { id: 'leader', type: 'hero', nav: 'Andy Norby' },
    {
      id: 'career',
      type: 'timeline',
      nav: 'My Career',
      title: 'My Career',
      lede: [
        'My career started at John Deere as an intern. I’ve been part of the Tech Stack since before the Tech Stack was cool. I have led the electronics and hardware platforms at the foundation of the Tech Stack, and I currently lead the Precision Upgrades teams adopting it, recently adding product management. The vast majority of my career has been leading delivery of embedded software, from vehicle software and controls to precision tech displays to telematics.',
        'Beyond my direct teams, I’ve built things that reach across the company. I established JD TechCon, our internal technology conference, and founded the John Deere Tech Mentorship Program with Pi515, which brings high school students on site to learn coding and earn college credit. For ten years I’ve spoken internally and advocated for women in the workplace, which led to a Society of Women Engineers award nomination. Recently I taught The Leadership Switch as part of Upgrade U, a training where I shared my leadership model with our students: Coach, Mentor, Manage. Lately, my passion project has been creating the AI Advantage Lab series to help teams put AI into practice at work.'
      ],
      items: 'roles',
      compact: true,
      split: true,
      confirm: [
        'Gen4 and PLMT dates: resume says Program Manager 2011–2014, bio says PLMT Manager from 2013. Shown as 2011–2013 and 2013–2014.'
      ]
    },
    {
      id: 'portfolio',
      type: 'apps',
      nav: 'AI Portfolio',
      title: 'AI Portfolio',
      lede: 'Apps and agents I have built, grouped by who they serve. Open one to see why and how.',
      items: 'appRows',
      footnote: 'CoS is short for Chief of Staff.'
    }
  ],

  /* AI Portfolio home screen. Rows merge by id, so the internal build can
     replace a row (for example to give the work apps real icons and links). */
  appRows: [
    {
      id: 'work', title: 'AI at Work', tone: 'work',
      confirm: ['AI Advantage Lab and the CoS apps are live. The Leadership Switch is still a placeholder.'],
      apps: [
        { id: 'labs', name: 'AI Advantage Lab', icon: 'flask', href: '#/portfolio/labs' },
        { id: 'cos-os', name: 'CoS OS', icon: 'grid', href: '#/portfolio/cos' },
        { id: 'cos-skills', name: 'CoS Skills & Automations', icon: 'cycle', href: '#/portfolio/cos-skills' },
        { id: 'cos-command', name: 'CoS Command Center', icon: 'gauge', href: '#/portfolio/cos' },
        { id: 'cos-budget', name: 'CoS Budget', icon: 'coin', href: '#/portfolio/cos-budget' },
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
      apps: [
        { id: 'family-cos', name: 'Norby Family CoS', icon: 'home', href: '#/portfolio/household' },
        { id: 'muse', name: 'Personal Assistant', note: '(via Muse)', img: 'assets/icons/muse.webp', href: '#/portfolio/muse' },
        { id: 'vehicles', name: 'Vehicles', img: 'assets/icons/vehicles.webp', href: '#/portfolio/vehicles' },
        { id: 'siri-todoist', name: 'Siri → Todoist', img: 'assets/icons/todo.webp', href: '#/portfolio/siri-todoist' },
        { id: 'habits', name: 'Habit Tracking App', note: '(Apple HealthKit integrated)', icon: 'flame', href: '#/portfolio/habits' },
        { id: 'college-notes', name: 'College Notes', icon: 'notebook', href: '#/portfolio/college-notes' },
        { id: 'document-agent', name: 'Document Agents', icon: 'folder', href: '#/portfolio/documents' }
      ]
    },
    {
      id: 'public', title: 'Public & Friends', tone: 'public',
      apps: [
        { id: 'vibes', name: 'Vibes.live', note: '(available in App Store for iOS)', img: 'assets/icons/vibes.webp', href: '#/portfolio/vibes' },
        { id: 'ai2fi', name: 'AI2FI', note: '(available on GitHub)', icon: 'trend', href: '#/portfolio/ai2fi' },
        { id: 'hiking-countdown', name: 'Hiking Countdown', icon: 'mountain', href: '#/portfolio/hiking-countdown' },
        { id: 'vinyl-moon', name: 'Vinyl Moon', icon: 'disc', href: '#/portfolio/vinyl-moon' }
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
      id: 'labs',
      title: 'AI Advantage Lab',
      layout: 'halves', // one page: Why on the left, How on the right
      context: 'work',
      attributes: ['innovator', 'learner', 'leader'],
      summary: 'A learning series, “Agency with Urgency”, that made AI accessible, exciting and fun across my organization.',
      why: {
        problem: 'During the December 2025 shutdown, I discovered AI was having its breakthrough moment.',
        points: [
          'Over the next two months, I experimented and learned.',
          'I recognized the gap between what I was experiencing and the general sentiment about the current state of the art in AI.',
          'I started the AI Advantage Lab learning series with the tagline “Agency with Urgency.” The goal was to make learning AI accessible, exciting and fun.',
          'I created and curated four training sessions exploring many aspects of AI harnesses, agents and workflows.'
        ]
      },
      how: {
        lead: 'Each session focused on what’s happening in the industry, taught new skills, and provided more resources.',
        points: [
          'We started with a “WOW” session, where a colleague and I demoed several solutions we had built with different AI tools and showed how we built them.',
          'Each session, I brought in new people from the organization to demonstrate what they’d built, to keep inspiring more builders.'
        ]
      }
    },

    {
      id: 'cos',
      title: 'CoS Operating System',
      context: 'work',
      kind: ['app', 'agent'],
      attributes: ['leader', 'innovator', 'executor'],
      summary: 'My Chief of Staff Operating System: apps, skills and automations on Microsoft 365 and Copilot, built on a second brain.',
      why: {
        problem: 'My Chief of Staff Operating System is a suite of apps and features that integrate with Office 365 and Copilot to maximize my focus on what matters most, while building a second brain with much better memory than I have on my own.',
        points: [
          'Staying informed and context switching are the hardest parts of being a leader working across many product lines.',
          'Being equipped with information heading into Product Councils, Champions meetings and 1:1s lets me be in the moment, focused on the conversation, and a better leader and decision maker.'
        ]
      },
      how: {
        svg: 'arch' // data/work/cos.diagrams.js, generated by tools/diagrams.py
      },
      confirm: [
        'Microsoft Graph tip only says it is two-way with Command Center. What does Command Center use it for?'
      ]
    },

    {
      id: 'cos-skills',
      title: 'CoS Skills & Automations',
      context: 'work',
      kind: ['agent'],
      attributes: ['executor', 'leader'],
      summary: 'Copilot skills and scheduled automations that keep me prepared and my organization informed.',
      why: {
        problem: 'Copilot skills and automations that do the recurring work of staying informed, so I walk into every week prepared.',
        points: [
          'Drafts my weekly email to my organization, recapping key events, sharing context, previewing my next two weeks, and Ideas Worth Sharing / TL;DR.',
          'A Product Council automation reads the upcoming agenda and emails me the day before with relevant information and risks from the core teams’ OneNotes, SharePoint, Outlook and Teams recaps.',
          'A daily morning email to start my day.',
          'A daily evening email to wrap it up.',
          'A daily check for new travel on my calendar, which sends a placeholder to my personal Google Calendar so my wife and I have shared visibility at home.'
        ]
      },
      how: {
        svg: 'arch' // data/work/cos-skills.diagrams.js: the CoS OS diagram, generated by tools/diagrams.py
      },
      confirm: ['The lead line is Claude’s draft. Rewrite it or drop it.']
    },

    {
      id: 'cos-budget',
      title: 'CoS Budget',
      context: 'work',
      kind: ['app'],
      attributes: ['executor', 'collaborator'],
      summary: 'A Copilot-hosted app to slice, filter and visualize our budget, with the right access for each team.',
      why: {
        problem: 'Our budget files are overly complex, hard to read, and easy to make mistakes in.',
        points: [
          'I had to create complex lookups and pivot tables to slice and dice our investments by product line, region, investment theme and investment type.',
          'Not everyone needs access to the raw inputs, but many people need to see the summary.'
        ]
      },
      how: {
        svg: 'arch', // data/work/cos-budget.diagrams.js: the CoS OS diagram, generated by tools/diagrams.py
        practices: [
          'I vibe coded a Copilot-hosted app to slice and dice, filter and visualize our budget, so Finance, Engineering and Program Management each have the right access.'
        ]
      }
    },

    {
      id: 'vibes',
      title: 'Vibes.live',
      kind: ['product', 'agent'],
      attributes: ['innovator', 'learner', 'executor'],
      summary: 'A live music tracker for iPhone, on the App Store, with an agent-based next generation in development.',
      why: {
        // One slide: the story and features on the left; the App Store button and three phone screenshots on the right.
        problem: 'I enjoy concerts and didn’t want to miss a show by my favorite artists within 250 miles.',
        pointsTitle: 'How it grew',
        points: [
          'I started with a simple agent and an automated weekly email, and it worked well.',
          'I shared it with friends, and they wanted in.',
          'Then it quickly morphed into a website.',
          'Then I decided I wanted to see if I could build an iOS app.',
          'It’s only grown from there.',
          'I’m now working on v2, built around FOMO, sharing concerts with friends, and your concert history.'
        ],
        featuresTitle: 'What it does',
        features: [
          'Tracks your favorite artists, venues and festivals.',
          'Sends daily notifications of concerts and tickets going on sale soon.',
          'Links out to ticket brokers and artists’ social media.',
          'Syncs to your calendar of choice.'
        ],
        shots: [
          { src: 'assets/work/vibes/shows.webp', alt: 'Shows: upcoming concerts by date for followed artists and venues' },
          { src: 'assets/work/vibes/updates.webp', alt: 'Updates: new dates for followed venues and artists, grouped by day' },
          { src: 'assets/work/vibes/your-week.webp', alt: 'Your Week: shows going on sale soon' }
        ]
      },
      how: {
        svg: 'arch' // data/work/vibes.diagrams.js, generated by tools/diagrams.py
      },
      links: [{ label: 'See it on the App Store', href: 'https://apps.apple.com/us/app/vibes-live/id6760623065' }]
    },

    {
      id: 'ai2fi',
      title: 'AI2FI',
      kind: ['product', 'app', 'agent'],
      attributes: ['innovator', 'learner'],
      summary: 'An AI financial coach and a financial dashboard, built on a 14-step Financial Order of Operations.',
      why: {
        problem: 'I have children who are becoming adults, and I wanted a system that could coach their financial decision making. What I built combines an agent with a Progressive Web App financial dashboard.',
        groups: [
          {
            title: 'AI2FI Coach', kind: ['agent'],
            points: [
              'Based on a 14-step Financial Order of Operations.',
              'Interviews and quizzes the user to assess their financial literacy and life situation.',
              'Collaborates with the user to set strategy and goals.',
              'Helps the user set up the dashboard and tools.',
              'Sets goals, follow-ups and an accountability schedule.'
            ]
          },
          {
            title: 'Financial Dashboard', kind: ['app'], columns: 2,
            points: [
              'Net Worth Tracking',
              'Annual Budget Sankey Diagram',
              'Portfolio Analyzer',
              'Stock Analyzer',
              'Education Savings',
              'Mortgage Paydown Calculator',
              'Gain/Loss Harvester',
              'Charitable Donation Tracking / Stocks to Donate',
              'And many more…'
            ]
          }
        ],
        shots: [
          { src: 'assets/work/ai2fi/welcome.webp', alt: 'AI2FI version 1.0 on GitHub' },
          { src: 'assets/work/ai2fi/networth.webp', alt: 'Net Worth, demo data' },
          { src: 'assets/work/ai2fi/budget.webp', alt: 'Annual Budget Sankey diagram, demo data' }
        ]
      },
      how: {
        svg: 'arch' // data/work/ai2fi.diagrams.js, generated by tools/diagrams.py
      },
      links: [{ label: 'View AI2FI Site', href: 'https://anorby515.github.io/AI2FI/' }],
      confirm: ['The dashboard has no web manifest or service worker yet, so it runs as a local web app rather than an installable PWA. Keep “Progressive Web App”, or say “web app”?']
    },

    {
      id: 'household',
      title: 'Norby Family CoS',
      kind: ['agent'],
      attributes: ['executor', 'collaborator'],
      summary: 'A Sunday and a daily email that keep the Norby house in sync on schedules, travel and to-dos.',
      why: {
        problem: 'We’re adopting agents in the Norby house to help us stay in sync and automate the tedious.',
        points: [
          '9 AM Sunday email of our schedule, Andy’s travel and the to-do list, plus a look two more weeks out for travel or major events.',
          '6:30 AM daily email of the day’s events and to-dos.',
          'Helps reduce miscommunication between Shauna and me, especially travel surprises.'
        ],
        shot: { src: 'assets/work/household/weekly-email.webp', alt: 'The Sunday email: the week day by day, travel flagged, to-dos with due dates, and the two weeks after. Sample data.' }
      },
      how: {
        svg: 'arch' // data/work/household.diagrams.js, generated by tools/diagrams.py
      }
    },

    {
      id: 'muse',
      title: 'Muse Personal Agent',
      layout: 'halves', // one page: Why on the left, How on the right
      kind: ['agent'],
      attributes: ['learner'],
      summary: 'A personal agent that handles my recurring purchases and errands.',
      why: {
        problem: 'I didn’t, Meta did!',
        points: ['But I did want an agent to help me with recurring purchases.']
      },
      how: {
        points: [
          'My hair stylist is always booked. So Muse books appointments 6 weeks in advance.',
          'Muse buys me a 5 lb bag of coffee beans from my roaster every 3 weeks so I don’t have to.',
          'Muse has helped find all the parts I needed for a household project, including putting it in a cart at Lowe’s.',
          'Muse found me the best place to buy tires for my car.'
        ]
      }
    },

    {
      id: 'siri-todoist',
      title: 'Siri → Todoist',
      layout: 'halves', // one page: Why on the left, How on the right
      kind: ['agent'],
      attributes: ['executor'],
      summary: 'A hands-free way to add to-dos to Todoist by voice.',
      why: {
        problem: 'Without fail, the things I need to do come to mind when I’m driving or walking.',
        points: [
          'I needed a hands-free way to add to-do items to my Todoist list.',
          'Now it’s as simple as “Siri, Get Stuff Done” + the task + when it’s due.'
        ]
      },
      how: {
        svg: 'arch' // data/work/siri-todoist.diagrams.js, generated by tools/diagrams.py
      }
    },

    {
      id: 'vehicles',
      title: 'Vehicles',
      kind: ['app', 'agent'],
      attributes: ['executor'],
      summary: 'A family app for every vehicle, with receipts filed and service reminders sent automatically.',
      why: {
        problem: 'Everything about our vehicles in one family app, kept current by an agent.',
        points: [
          'Maintenance journal and schedule, registration, insurance cards, and what to do in case of an accident.',
          'Scan and upload receipts, and the maintenance journal updates automatically.',
          'One month ahead of maintenance, the agent emails service reminders to the primary driver and me.'
        ]
      },
      how: {
        svg: 'arch', // data/work/vehicles.diagrams.js, generated by tools/diagrams.py
        stack: ['claude-code', 'cowork', 'gh-pages', 'apps-script', 'sheets', 'drive', 'cloudflare', 'gmail', 'todoist'],
        practices: [
          'The app never touches the agent or the ingestion script: a scan from the app lands in the Inbox exactly like one from the Google Drive app.',
          'The API can’t write to the journal’s own tabs, so the Sheet stays the single source of truth.',
          'No family data in the public repo: tests run against a synthetic copy of the Sheet.'
        ]
      },
      cover: { src: 'assets/work/vehicles/home.webp' }
    },

    {
      id: 'college-notes',
      title: 'College Notes',
      layout: 'halves', // one page: Why on the left, How on the right
      kind: ['agent'],
      attributes: ['executor'],
      summary: 'Handwritten class notes scanned, converted to digital and filed into Notion by class.',
      why: {
        problem: 'Handwritten notes, kept digital, without a $700 tablet.',
        points: [
          'My daughter wants to handwrite her notes and keep them digital, without paying $700 for a tablet and digital pencil.',
          'She scans notes into a Google Drive folder per class; the agent converts them to digital and uploads them to a Notion notebook.',
          'My son has started using it too.'
        ]
      },
      how: {
        svg: 'arch' // data/work/college-notes.diagrams.js, generated by tools/diagrams.py
      },
      confirm: ['The diagram shows real class folders (Chemistry, Development Psych, Nutrition). OK to show publicly, or make them generic?']
    },

    {
      id: 'documents',
      title: 'Document Agents',
      layout: 'halves', // one page: Why on the left, How on the right
      kind: ['agent'],
      attributes: ['executor'],
      summary: 'Medical receipts and bank statements renamed and filed automatically.',
      why: {
        problem: 'Bank statements and medical receipts, renamed and filed without me touching them.',
        points: [
          'I invest my HSA and pay medical expenses out of pocket. I scan receipts into a Medical Receipts inbox, and an agent renames and files them.',
          'I download bank statements to an inbox, and the agent renames each by statement date, institution, account, account type and primary account holder, then files it.'
        ]
      },
      how: {
        svg: 'arch' // data/work/documents.diagrams.js, generated by tools/diagrams.py
      }
    },

    {
      id: 'habits',
      title: 'Habits',
      layout: 'halves', // one page: Why on the left, How on the right
      kind: ['app'],
      attributes: ['learner'],
      summary: 'An iPhone app that turned a Spring Break fitness bet with my daughter into a competition.',
      why: {
        problem: 'I respond best to fitness goals when I have an accountability partner.',
        points: [
          'Spring Break was coming, and my daughter and I made a bet on who could meet their goals.',
          'We wanted an app to track our competition, using our Apple Watches to automate the tracking.'
        ]
      },
      how: {
        svg: 'arch' // data/work/habits.diagrams.js, generated by tools/diagrams.py
      },
      confirm: ['Supabase (used for the challenge) is left off the diagram. Add it if it syncs our scores?']
    },

    {
      id: 'hiking-countdown',
      title: 'Hiking Countdown',
      layout: 'halves', // one page: Why on the left, How on the right
      kind: ['app'],
      attributes: ['learner'],
      summary: 'A countdown web page for our annual Colorado hike, built by dictating to Claude.',
      why: {
        problem: 'My two friends and I hike in Colorado every August, and I wanted something fun to keep us looking forward to it.',
        points: [
          'I also wanted to see if I could use Claude to create a web page in less than 15 minutes. I failed: it took 25 minutes.',
          'Now it’s being reused for next year’s trips to Las Vegas and Steamboat.'
        ]
      },
      how: {
        points: [
          'I dictated to Claude that I wanted a website with a countdown timer (DD : HH : MM : SS), a picture of a Colorado peak, and hosting that was simple and quick.'
        ],
        svg: 'arch' // data/work/hiking-countdown.diagrams.js, generated by tools/diagrams.py
      },
      links: [{ label: 'See the countdown', href: 'https://anorby515.github.io/CO-Hike-Countdown/' }]
    },

    {
      id: 'vinyl-moon',
      title: 'Vinyl Moon',
      layout: 'halves', // one page: Why on the left, How on the right
      kind: ['agent'],
      attributes: ['learner'],
      summary: 'An album photo turned into a Spotify playlist, rebuilt three times as the AI tools caught up.',
      why: {
        problem: 'I subscribe to Vinyl Moon, a monthly mixtape on vinyl.',
        points: [
          'About six weeks after the record arrives, the mixtape comes to Spotify too.',
          'I didn’t want to wait six weeks, and this became my first AI project.',
          'It’s a simple example of how quickly AI tools are changing, and making earlier workflows obsolete.'
        ]
      },
      how: {
        lead: 'Three versions in a year, each with fewer steps.',
        svg: 'arch' // data/work/vinyl-moon.diagrams.js, generated by tools/diagrams.py
      }
    }
  ],

  /* My Career timeline. Roles and highlights (highlight: true) share one list;
     the page sorts newest first and the Roles / Highlights / All switch filters it.
     A highlight with parent: '<role id>' sits under that role (in list order); with no
     period it borrows the role's period in the Highlights view. */
  roles: [
    {
      id: 'pu-pm', period: '2026 – Present',
      title: 'Manager, Engineering & Product Management · Precision Upgrades'
    },
    {
      id: 'pu', period: '2024 – 2026',
      title: 'Engineering Manager · Precision Upgrades'
    },
    {
      id: 'electronics', period: '2020 – 2024',
      title: 'Engineering Manager · ISG Electronic & Electrification Systems'
    },
    {
      id: 'software-delivery', period: '2014 – 2020',
      title: 'Engineering Manager · EEG Software Delivery'
    },
    {
      id: 'plmt', period: '2013 – 2014',
      title: 'PLMT Manager · ISG'
    },
    {
      id: 'gen4', period: '2011 – 2013',
      title: 'Lead Program Manager + Engineering Manager · Gen4 Displays'
    },
    {
      id: 'supervisor', period: '2007 – 2011',
      title: 'Embedded Software Supervisor · ISG'
    },
    {
      id: 'systems', period: '2006 – 2007',
      title: 'Systems Engineer · ISG'
    },
    {
      id: 'robotics', period: '2004 – 2006',
      title: 'Embedded Software Engineer · Turf Advanced Engineering, Charlotte, NC'
    },
    {
      id: 'combines', period: '2003 – 2004',
      title: 'Embedded Software Engineer · Combines, Silvis, IL'
    },
    {
      id: 'oem', period: '2000 – 2003',
      title: 'Embedded Software Engineer · JDES OEM'
    },
    {
      id: 'intern', period: '1997 – 2000',
      title: 'Intern & Part-time Student · JDES Embedded Software'
    },
    {
      id: 'discovery-labs', period: '2026', highlight: true,
      title: 'Discovery Labs (Oxford)'
    },
    {
      id: 'product-operating-model', period: '', highlight: true, parent: 'pu',
      title: 'Leading the Product Operating Model in Precision Upgrades'
    },
    {
      id: 'product-engineering', period: '', highlight: true, parent: 'pu',
      title: 'Leading Product Engineering teams'
    },
    {
      id: 'swe-nomination', period: '2023', highlight: true,
      title: 'SWE Advocating for Women in Engineering Nomination'
    },
    {
      id: 'jd-techcon', period: '2022 – 2025', highlight: true,
      title: 'Launched JD TechCon and Executive Sponsor'
    },
    {
      id: 'pi515-mentorship', period: '2022', highlight: true,
      title: 'Founded Tech Mentorship Program · Pi515'
    },
    {
      id: 'electronics-pvv', period: '', highlight: true, parent: 'electronics',
      title: 'Leading cross-functional teams: Electronics, Software, Mechanical, Manufacturing Test and PVV'
    },
    {
      id: 'autosar', period: '2020', highlight: true, parent: 'software-delivery',
      title: 'Launched and co-led a small team to re-evaluate AUTOSAR, the start of Embedded32'
    },
    {
      id: 'coaching', period: '2018', highlight: true,
      title: 'Essential Coaching Skills for Leaders (18 months)'
    },
    {
      id: 'eeg-growth', period: '2016 – 2020', highlight: true, parent: 'software-delivery',
      title: 'Led EEG Software for A&T Platforms · 4x growth in global workforce'
    },
    {
      id: 'booth', period: '2016', highlight: true,
      title: 'Executive Development Program · Chicago Booth'
    },
    {
      id: 'gen4-ft4', period: '2014', highlight: true, parent: 'gen4',
      title: 'Led Gen4 Command Center™ initial launch with FT4 tractors. Largest technology platform investment at the time.'
    },
    {
      id: 'jdlink', period: '2011', highlight: true, parent: 'supervisor',
      title: 'Software Lead on MTG for JDLink iT4 launch'
    },
    {
      id: 'bsp', period: '2010', highlight: true, parent: 'supervisor',
      title: 'Bootstrapped the first BSP team · Innovation Award'
    },
    {
      id: 'cc-8r', period: '2009', highlight: true, parent: 'supervisor',
      title: 'Software Lead on Command Center launch on 8R (first ISG display in base)'
    },
    {
      id: 'rgator', period: '', highlight: true, parent: 'robotics',
      title: 'Robotic Gator and Autonomous Stadium Mower'
    }
  ]
});
