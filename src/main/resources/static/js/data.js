/* ══════════════════════════════════════════
   NovaCRM — State & Initial Data Store
   Centralized store with multi-currency, firmographics & automations
   ══════════════════════════════════════════ */
let activeUserName = 'Daksh Patel';
let activePipelineId = 'pipe-sales';
let pipelineFilterMode = 'all'; // 'all' or 'my'
let pipelineSortMode = 'value-desc';
let clientFilterMode = 'all';   // 'all' or 'my'
let selectedQuarter = 'Q3';
let currentCurrency = 'USD';
let nextLeadNumber = 10;
let logs = [];

let pipelines = [
  {
    id: 'pipe-sales',
    name: 'Sales Pipeline',
    description: 'Track and manage core enterprise deals across every stage.',
    stages: [
      { name: 'Lead In', color: 'purple' },
      { name: 'Contacted', color: 'blue' },
      { name: 'Proposal Sent', color: 'orange' },
      { name: 'Closed Won', color: 'green' }
    ]
  },
  {
    id: 'pipe-renewals',
    name: 'Renewals & Expansion',
    description: 'Track account retention, contract renewals, and upsell expansions.',
    stages: [
      { name: 'Account Review', color: 'purple' },
      { name: 'Upsell Scoped', color: 'blue' },
      { name: 'Contract Sent', color: 'orange' },
      { name: 'Renewed Won', color: 'green' }
    ]
  },
  {
    id: 'pipe-partnerships',
    name: 'Strategic Partnerships',
    description: 'Manage integrations, co-selling, and affiliate partner channels.',
    stages: [
      { name: 'Prospect Partner', color: 'purple' },
      { name: 'Partner Evaluation', color: 'blue' },
      { name: 'Agreement Review', color: 'orange' },
      { name: 'Active Alliance', color: 'green' }
    ]
  }
];

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹'
};

const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  INR: 83.5
};

let users = [
  { name: 'Admin User', email: 'admin@novacrm.com', phone: '+1 (555) 000-0001', role: 'System Administrator', dept: 'Operations', accountsCount: 1, dealsCount: 1 },
  { name: 'Sarah Sales', email: 's.sales@novacrm.com', phone: '+1 (555) 222-3333', role: 'Enterprise Sales Rep', dept: 'Revenue', accountsCount: 3, dealsCount: 3 },
  { name: 'Daksh Patel', email: 'daksh@novacrm.com', phone: '+91 98765 00000', role: 'Senior Account Manager', dept: 'Client Growth', accountsCount: 4, dealsCount: 5 },
];

let clients = [
  { id: 'ACC-1045', name: 'TechCorp Solutions', industry: 'Software', email: 'contact@techcorp.com', phone: '+1 (555) 123-4567', location: 'New York, NY', owner: 'Daksh Patel', lastContact: 'Aug 14, 2026', status: 'Active', arr: '$120k ARR', arrNum: 120000, healthScore: 92, techStack: ['AWS', 'React', 'Snowflake'], employees: '250–500', funding: 'Series B', seats: 84, apiUsage: '1.2M req/mo' },
  { id: 'ACC-1046', name: 'Globalize Inc.', industry: 'Logistics', email: 'info@globalize.net', phone: '+1 (555) 987-6543', location: 'London, UK', owner: 'Sarah Sales', lastContact: 'Aug 12, 2026', status: 'Active', arr: '$85k ARR', arrNum: 85000, healthScore: 88, techStack: ['Azure', 'Node.js', 'Kafka'], employees: '500–1000', funding: 'Series C', seats: 45, apiUsage: '650k req/mo' },
  { id: 'ACC-1047', name: 'Quantum Dynamics', industry: 'Engineering', email: 's.jenkins@quantum.io', phone: '+1 (555) 456-7890', location: 'Austin, TX', owner: 'Daksh Patel', lastContact: 'Aug 13, 2026', status: 'Active', arr: '$450k ARR', arrNum: 450000, healthScore: 95, techStack: ['GCP', 'Kubernetes', 'Go'], employees: '1000+', funding: 'Public (IPO)', seats: 320, apiUsage: '8.5M req/mo' },
  { id: 'ACC-1048', name: 'Meridian Healthcare', industry: 'Healthcare', email: 'admin@meridian.org', phone: '+1 (555) 333-2222', location: 'Chicago, IL', owner: 'Sarah Sales', lastContact: 'Aug 10, 2026', status: 'Active', arr: '$320k ARR', arrNum: 320000, healthScore: 97, techStack: ['AWS', 'PostgreSQL', 'Python'], employees: '500–1000', funding: 'Series D', seats: 190, apiUsage: '4.1M req/mo' },
  { id: 'ACC-1049', name: 'LJ Education Trust', industry: 'Education', email: 'admin@ljpoly.edu', phone: '+91 98765 43210', location: 'Ahmedabad, India', owner: 'Daksh Patel', lastContact: 'Aug 14, 2026', status: 'Onboarding', arr: '$110k ARR', arrNum: 110000, healthScore: 78, techStack: ['AWS', 'PHP', 'MySQL'], employees: '100–250', funding: 'Self-funded', seats: 60, apiUsage: '320k req/mo' },
  { id: 'ACC-1050', name: 'Royal Challengers Sports', industry: 'Entertainment', email: 'partnerships@rcb.in', phone: '+91 99887 77665', location: 'Bengaluru, India', owner: 'Daksh Patel', lastContact: 'Aug 12, 2026', status: 'Active', arr: '$850k ARR', arrNum: 850000, healthScore: 98, techStack: ['GCP', 'Flutter', 'BigQuery'], employees: '500–1000', funding: 'Corporate', seats: 450, apiUsage: '12M req/mo' },
  { id: 'ACC-1051', name: 'Nirman Educational Group', industry: 'Education', email: 'admin@nirman.edu', phone: '+91 88776 55443', location: 'Ahmedabad, India', owner: 'Admin User', lastContact: 'Aug 05, 2026', status: 'Inactive', arr: '$42k ARR', arrNum: 42000, healthScore: 42, techStack: ['Linux', 'Java', 'Oracle'], employees: '50–100', funding: 'Self-funded', seats: 15, apiUsage: '80k req/mo' },
  { id: 'ACC-1052', name: 'Apex Corp', industry: 'Retail', email: 'vendor@apex.com', phone: '+1 (555) 000-1111', location: 'Seattle, WA', owner: 'Sarah Sales', lastContact: 'Aug 01, 2026', status: 'Churned', arr: '$0 ARR', arrNum: 0, healthScore: 15, techStack: ['Azure', '.NET', 'SQL Server'], employees: '250–500', funding: 'Series A', seats: 0, apiUsage: '0 req/mo' },
];

let leads = [
  { id: 'lead-1', name: 'TechCorp Solutions', tag: 'Software', contact: 'John Doe (CTO)', email: 'john@techcorp.com', phone: '+1 (555) 123-4567', assigned: 'Daksh Patel', date: 'Aug 30, 2026', probability: 25, value: 50000, stage: 'Lead In', nextStep: 'Initial architectural review', priority: 'Medium', stageAge: '4d in stage', stallDays: 4, liveViewers: ['DP'] },
  { id: 'lead-2', name: 'Globalize Inc.', tag: 'Logistics', contact: 'Emma Stone (VP Ops)', email: 'e.stone@globalize.net', phone: '+1 (555) 987-6543', assigned: 'Sarah Sales', date: 'Sep 12, 2026', probability: 35, value: 85000, stage: 'Lead In', nextStep: 'Product demo with EU director', priority: 'Medium', stageAge: '2d in stage', stallDays: 2, liveViewers: ['SS'] },
  { id: 'lead-8', name: 'Nirman Educational', tag: 'Education', contact: 'Dr. V. K. Patel (Dean)', email: 'principal@nirman.edu', phone: '+91 88776 55443', assigned: 'Daksh Patel', date: 'Oct 01, 2026', probability: 20, value: 110000, stage: 'Lead In', nextStep: 'Campus ERP security scoping', priority: 'High', stageAge: '14d in stage', stallDays: 14, liveViewers: ['DP', 'Admin'] },
  { id: 'lead-5', name: 'Alpha Industries', tag: 'Manufacturing', contact: 'Robert King (Director)', email: 'rking@alphaind.com', phone: '+1 (555) 777-8899', assigned: 'Admin User', date: 'Sep 20, 2026', probability: 15, value: 42500, stage: 'Lead In', nextStep: 'Enterprise license agreement', priority: 'Low', stageAge: '8d in stage', stallDays: 8, liveViewers: ['Admin'] },
  { id: 'lead-3', name: 'NexaLogistics', tag: 'Supply Chain', contact: 'Marcus Chen (Head Supply)', email: 'm.chen@nexalog.com', phone: '+1 (555) 345-6789', assigned: 'Daksh Patel', date: 'Aug 22, 2026', probability: 55, value: 125000, stage: 'Contacted', nextStep: 'Send custom integration specs', priority: 'High', stageAge: '3d in stage', stallDays: 3, liveViewers: ['DP'] },
  { id: 'lead-6', name: 'Zenith Financial', tag: 'Finance & Banking', contact: 'Amanda Roberts (VP Risk)', email: 'aroberts@zenithfin.com', phone: '+1 (555) 654-3210', assigned: 'Sarah Sales', date: 'Aug 28, 2026', probability: 60, value: 210000, stage: 'Contacted', nextStep: 'Security & compliance sign-off', priority: 'High', stageAge: '5d in stage', stallDays: 5, liveViewers: ['SS', 'DP'] },
  { id: 'lead-4', name: 'Quantum Dynamics', tag: 'DeepTech AI', contact: 'Sarah Jenkins (CPO)', email: 'sjenkins@quantum.io', phone: '+1 (555) 456-7890', assigned: 'Daksh Patel', date: 'Aug 25, 2026', probability: 85, value: 450000, stage: 'Proposal Sent', nextStep: 'Final pricing committee review', priority: 'Urgent', stageAge: '2d in stage', stallDays: 2, liveViewers: ['DP', 'SS'] },
  { id: 'lead-9', name: 'Royal Challengers', tag: 'Sports & Entertainment', contact: 'Virat K. (Sponsorship Head)', email: 'partnerships@rcb.in', phone: '+91 99887 77665', assigned: 'Daksh Patel', date: 'Aug 29, 2026', probability: 90, value: 850000, stage: 'Proposal Sent', nextStep: 'Sign finalized multi-season deal', priority: 'Urgent', stageAge: '1d in stage', stallDays: 1, liveViewers: ['DP'] },
  { id: 'lead-7', name: 'Meridian Healthcare', tag: 'Health Tech', contact: 'Dr. Alan Smith (CIO)', email: 'asmith@meridian.org', phone: '+1 (555) 333-2222', assigned: 'Sarah Sales', date: 'Aug 10, 2026', probability: 100, value: 320000, stage: 'Closed Won', nextStep: 'Enterprise deployment underway', priority: 'Won', stageAge: 'Closed Aug 10', stallDays: 0, liveViewers: ['SS'] },
];

let automationsList = [
  { id: 'auto-1', title: 'High-Value Deal Escalation', trigger: 'Deal Value > $100,000', action: 'Auto-set priority to Urgent & ping Admin', active: true, runs: 14, icon: '⚡' },
  { id: 'auto-2', title: 'Customer Onboarding Kickoff', trigger: 'Deal moves to Closed Won', action: 'Generate 4-step onboarding checklist', active: true, runs: 9, icon: '🚀' },
  { id: 'auto-3', title: 'Executive Churn Prevention', trigger: 'Account Health < 60%', action: 'Schedule VP retention strategy session', active: true, runs: 5, icon: '🛡️' },
  { id: 'auto-4', title: 'Stalled Deal AI Re-engagement', trigger: 'Stalled in Proposal > 7 Days', action: 'Generate AI revival pitch draft', active: true, runs: 12, icon: '🤖' },
];

let inboxFeed = [
  { id: 'msg-1', type: 'email', sender: 'Sarah Jenkins', company: 'Quantum Dynamics', subject: 'Re: Executive Proposal & SLA Terms', preview: 'The board approved the Core License. Looking forward to contract signature.', time: '10 min ago', unread: true, leadId: 'lead-4' },
  { id: 'msg-2', type: 'call', sender: 'Virat K.', company: 'Royal Challengers', subject: 'Call Summary: Stadium Signage Scoping', preview: '18 min call • Outcome: Contract Approved. Requested quote printout.', time: '45 min ago', unread: false, leadId: 'lead-9' },
  { id: 'msg-3', type: 'system', sender: 'Automation Copilot', company: 'Zenith Financial', subject: 'Automated Alert: Deal Value > $100k', preview: 'Priority automatically upgraded to High. Compliance review required.', time: '2 hrs ago', unread: true, leadId: 'lead-6' },
  { id: 'msg-4', type: 'meeting', sender: 'Marcus Chen', company: 'NexaLogistics', subject: 'Confirmed: Architecture Kickoff Demo', preview: 'Thursday 3:00 PM EST • Zoom link generated and synced with calendar.', time: '4 hrs ago', unread: false, leadId: 'lead-3' },
];

let userSpecificData = {
  'Daksh Patel': {
    title: 'Welcome back, Daksh 👋',
    roleTag: 'Senior Account Manager · West & India',
    subtitle: 'Managing 4 key accounts ($1,475,000 active pipeline across 5 opportunities).',
    note: 'Follow up with Virat K. regarding RCB sponsorship contract timeline and stadium signage.',
    tasks: [
      'Finalize $850,000 RCB sponsorship contract revision',
      'Follow up with Quantum Dynamics CPO on proposal approval ($450k)',
      'Conduct LJ Education Trust ERP onboarding kickoff meeting',
      'Schedule NexaLogistics technical scoping session'
    ],
    notifications: [
      { type: 'deal', title: 'RCB Sponsorship ($850k)', desc: 'Virat K. approved the updated multi-season clause.', time: '3 min ago' },
      { type: 'client', title: 'LJ Education Trust', desc: 'Onboarding packet confirmed by registrar office.', time: '18 min ago' },
      { type: 'deal', title: 'Quantum Dynamics Proposal', desc: 'Pricing committee scheduled review for 4:00 PM.', time: '1 hr ago' },
      { type: 'access', title: 'Regional Cluster Sync', desc: 'Node verified 100% data sync.', time: '3 hrs ago' }
    ]
  },
  'Sarah Sales': {
    title: 'Welcome back, Sarah 🎯',
    roleTag: 'Enterprise Sales Rep · US & EU Revenue',
    subtitle: 'Leading Q3 outbound revenue pipeline ($615,000 across 3 strategic opportunities).',
    note: 'Dr. Alan Smith requested updated SLA terms for Meridian healthcare regional expansion.',
    tasks: [
      'Send finalized contract to Amanda Roberts at Zenith Financial ($210k)',
      'Coordinate Meridian Healthcare expansion deployment ($320k won)',
      'Review Globalize Inc. EU logistics renewal terms'
    ],
    notifications: [
      { type: 'deal', title: 'Zenith Financial ($210k)', desc: 'Amanda Roberts requested digital contract signing.', time: '1 min ago' },
      { type: 'client', title: 'Meridian Healthcare Won', desc: 'Contract successfully marked Closed Won for $320,000.', time: '25 min ago' },
      { type: 'deal', title: 'Globalize Inc. Demo', desc: 'EU logistics director accepted demo invite.', time: '2 hrs ago' }
    ]
  },
  'Admin User': {
    title: 'System Administration Console 🛡️',
    roleTag: 'Lead System Administrator · Security & Ops',
    subtitle: 'Enterprise workspace online • 3 active operators • Security telemetry active.',
    note: 'Scheduled maintenance window on Sunday 02:00 AM UTC for database index compaction.',
    tasks: [
      'Audit new user permissions and API scope policies',
      'Review churned account investigation: Apex Corp',
      'Verify immutable telemetry ledger and cryptographic logs',
      'Execute cluster health scan across all accounts'
    ],
    notifications: [
      { type: 'access', title: 'Security Audit Clear', desc: 'All 3 operator tokens verified with zero anomalies.', time: 'Just now' },
      { type: 'deal', title: 'Company Pipeline Peak', desc: 'Total CRM pipeline crossed $2,092,500 total value.', time: '12 min ago' },
      { type: 'client', title: 'Automated Snapshot', desc: 'Database telemetry snapshot saved successfully.', time: '40 min ago' }
    ]
  },
};

const QUARTER_TARGETS = {
  'Q1': { target: 1200000, actual: 1180000, gap: 20000, pct: 98, winRate: 72, quota: 95, health: 91 },
  'Q2': { target: 1500000, actual: 1420000, gap: 80000, pct: 94, winRate: 68, quota: 91, health: 89 },
  'Q3': { target: 1800000, actual: 1475000, gap: 325000, pct: 82, winRate: 74, quota: 82, health: 90 },
  'Q4': { target: 2200000, actual: 1750000, gap: 450000, pct: 79, winRate: 76, quota: 80, health: 93 },
};

const EMAIL_TEMPLATES = {
  'demo-followup': {
    subject: 'NovaCRM Follow-up — Platform Architecture & Next Steps',
    body: 'Hi there,\n\nThank you for taking the time to discuss your CRM operations today. As discussed, our platform can centralize your pipeline telemetry and provide real-time reporting.\n\nPlease let me know if Thursday 3 PM works for the technical walkthrough.\n\nBest regards,\n'
  },
  'proposal-send': {
    subject: 'Executive Proposal & Licensing Summary — NovaCRM',
    body: 'Hello,\n\nFollowing up on our scoping call, I have finalized your customized solution architecture proposal. The terms and SLA schedule are aligned with your Q3 targets.\n\nLooking forward to your committee review.\n\nBest,\n'
  },
  'check-in': {
    subject: 'Quick Q3 Check-in — Account Milestones',
    body: 'Hi,\n\nHope you are having a productive week! I wanted to check in regarding your team\'s roadmap and see if there are any immediate questions we can address.\n\nBest,\n'
  },
  'custom': {
    subject: '',
    body: ''
  }
};
