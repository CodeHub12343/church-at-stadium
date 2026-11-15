export type EventCategory =
  | 'Stadium Worship'
  | 'United Prayer'
  | 'Gospel Crusade'
  | 'Conference'
  | 'Youth Gathering'
  | 'Outreach';

export type EventStatus = 'Open' | 'Invitation' | 'Approved' | 'Draft';

export interface MockEvent {
  slug: string;
  title: string;
  category: EventCategory;
  start: string;
  end: string;
  dateLabel: string;
  city: string;
  country: string;
  venue: string;
  churches: number;
  expected: string;
  capacityPct: number;
  gradient: [string, string];
  status: EventStatus;
  image?: string;
}

export const events: MockEvent[] = [
  {
    slug: 'wembley-prayer-gathering-2027',
    title: 'Wembley Prayer Gathering',
    category: 'Stadium Worship',
    start: '2027-05-16',
    end: '2027-05-17',
    dateLabel: '16 — 17 May 2027',
    city: 'London',
    country: 'United Kingdom',
    venue: 'Wembley Stadium',
    churches: 240,
    expected: '82,000',
    capacityPct: 76,
    gradient: ['#101B32', '#2A3E6F'],
    status: 'Open',
    image: '/images/14.jpg',
  },
  {
    slug: 'atlanta-awakening',
    title: 'Atlanta Awakening',
    category: 'Gospel Crusade',
    start: '2027-07-04',
    end: '2027-07-06',
    dateLabel: '4 — 6 Jul 2027',
    city: 'Atlanta',
    country: 'United States',
    venue: 'Mercedes-Benz Stadium',
    churches: 412,
    expected: '60,000',
    capacityPct: 80,
    gradient: ['#8B6F2E', '#C6A45B'],
    status: 'Open',
    image: '/images/19.jpg',
  },
  {
    slug: 'sao-paulo-unity-summit',
    title: 'São Paulo Unity Summit',
    category: 'Conference',
    start: '2027-09-22',
    end: '2027-09-24',
    dateLabel: '22 — 24 Sep 2027',
    city: 'São Paulo',
    country: 'Brazil',
    venue: 'Allianz Parque',
    churches: 180,
    expected: '45,000',
    capacityPct: 64,
    gradient: ['#1B2E55', '#3B4D7A'],
    status: 'Invitation',
    image: '/images/6.jpg',
  },
  {
    slug: 'nairobi-youth-ignite',
    title: 'Nairobi Youth Ignite',
    category: 'Youth Gathering',
    start: '2027-08-09',
    end: '2027-08-11',
    dateLabel: '9 — 11 Aug 2027',
    city: 'Nairobi',
    country: 'Kenya',
    venue: 'Kasarani Stadium',
    churches: 95,
    expected: '30,000',
    capacityPct: 71,
    gradient: ['#0E7A4C', '#16A36A'],
    status: 'Open',
    image: '/images/15.jpg',
  },
  {
    slug: 'mumbai-night-of-prayer',
    title: 'Mumbai Night of Prayer',
    category: 'United Prayer',
    start: '2027-10-12',
    end: '2027-10-12',
    dateLabel: '12 Oct 2027',
    city: 'Mumbai',
    country: 'India',
    venue: 'Wankhede Stadium',
    churches: 320,
    expected: '33,000',
    capacityPct: 93,
    gradient: ['#8E2DE2', '#4A00E0'],
    status: 'Open',
    image: '/images/4.jpg',
  },
  {
    slug: 'berlin-hope-weekend',
    title: 'Berlin Hope Weekend',
    category: 'Outreach',
    start: '2027-03-19',
    end: '2027-03-20',
    dateLabel: '19 — 20 Mar 2027',
    city: 'Berlin',
    country: 'Germany',
    venue: 'Olympiastadion',
    churches: 62,
    expected: '40,000',
    capacityPct: 54,
    gradient: ['#3975CC', '#5A95E8'],
    status: 'Open',
    image: '/images/16.jpg',
  },
];

export const findEvent = (slug: string) => events.find((e) => e.slug === slug);

export interface MockTask {
  id: string;
  title: string;
  status: 'overdue' | 'high' | 'medium' | 'done';
  event: string;
  due: string;
  department: string;
}

export const tasks: MockTask[] = [
  {
    id: 'T-391',
    title: 'Confirm 40 ushers for Wembley',
    status: 'overdue',
    event: 'Wembley Prayer Gathering',
    due: 'Due 3 days ago',
    department: 'Ushering',
  },
  {
    id: 'T-410',
    title: 'Upload signed authorization letter',
    status: 'high',
    event: 'Atlanta Awakening',
    due: 'Due in 5 days',
    department: 'Documents',
  },
  {
    id: 'T-422',
    title: 'Respond to São Paulo invitation',
    status: 'medium',
    event: 'São Paulo Unity Summit',
    due: 'Due 15 Jan 2027',
    department: 'Participation',
  },
  {
    id: 'T-330',
    title: 'Submit March volunteer roster',
    status: 'done',
    event: 'Wembley Prayer Gathering',
    due: 'Completed 2 Nov',
    department: 'Volunteers',
  },
];

export interface MockChurchApp {
  id: string;
  name: string;
  city: string;
  country: string;
  submittedAgo: string;
  initials: string;
  status: 'pending' | 'under_review' | 'changes_requested';
  denomination: string;
  established: number;
  website: string;
  email: string;
  phone: string;
  seniorPastor: string;
  pastorEmail: string;
  representative: string;
  congregation: number;
  branches: number;
  documents: number;
}

export const churchApplications: MockChurchApp[] = [
  {
    id: 'CA-0412',
    name: 'Harvest Fields Fellowship',
    city: 'Nairobi',
    country: 'Kenya',
    submittedAgo: '2 days ago',
    initials: 'HF',
    status: 'under_review',
    denomination: 'Non-denominational',
    established: 2007,
    website: 'harvestfields.co.ke',
    email: 'info@harvestfields.co.ke',
    phone: '+254 20 445 8820',
    seniorPastor: 'Rev. Patrick Mwangi',
    pastorEmail: 'p.mwangi@harvestfields.co.ke',
    representative: 'Grace Mwangi',
    congregation: 2400,
    branches: 3,
    documents: 4,
  },
  {
    id: 'CA-0411',
    name: 'Light of Faith Church',
    city: 'Johannesburg',
    country: 'South Africa',
    submittedAgo: '6 days ago',
    initials: 'LF',
    status: 'pending',
    denomination: 'Pentecostal',
    established: 1998,
    website: 'lightoffaith.co.za',
    email: 'hello@lightoffaith.co.za',
    phone: '+27 11 234 5678',
    seniorPastor: 'Pastor Themba Nkosi',
    pastorEmail: 'themba@lightoffaith.co.za',
    representative: 'Nomsa Dlamini',
    congregation: 1800,
    branches: 2,
    documents: 3,
  },
  {
    id: 'CA-0410',
    name: 'New Covenant Chapel',
    city: 'Chicago',
    country: 'USA',
    submittedAgo: '4 days ago',
    initials: 'NC',
    status: 'pending',
    denomination: 'Evangelical',
    established: 2012,
    website: 'newcovenantchi.org',
    email: 'office@newcovenantchi.org',
    phone: '+1 312 555 0120',
    seniorPastor: 'Dr. Samuel Reeves',
    pastorEmail: 'sam@newcovenantchi.org',
    representative: 'Aaliyah Johnson',
    congregation: 950,
    branches: 1,
    documents: 4,
  },
];

export const findChurchApp = (id: string) =>
  churchApplications.find((c) => c.id === id);

export const platformStats = {
  users: 42318,
  churches: 1204,
  verifiedChurches: 1186,
  pendingChurches: 18,
  upcomingEvents: 28,
  pendingEvents: 6,
  registrations: 312840,
};

export interface MockVenue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  type: 'Outdoor' | 'Indoor';
  verified: boolean;
  booking: 'confirmed' | 'pending' | 'available' | 'unverified';
  bookingDate?: string;
  upcoming: number;
  initials: string;
}

export const venues: MockVenue[] = [
  { id: 'wembley', name: 'Wembley Stadium', city: 'London', country: 'United Kingdom', capacity: 90000, type: 'Outdoor', verified: true, booking: 'confirmed', bookingDate: 'May 16–17', upcoming: 1, initials: 'WS' },
  { id: 'mercedes-benz', name: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'United States', capacity: 71000, type: 'Indoor', verified: true, booking: 'pending', bookingDate: 'Jul 4–6', upcoming: 1, initials: 'MB' },
  { id: 'olympia', name: 'Olympiastadion', city: 'Berlin', country: 'Germany', capacity: 74475, type: 'Outdoor', verified: true, booking: 'pending', bookingDate: 'Mar 2027', upcoming: 1, initials: 'OB' },
  { id: 'allianz', name: 'Allianz Parque', city: 'São Paulo', country: 'Brazil', capacity: 43713, type: 'Outdoor', verified: true, booking: 'confirmed', bookingDate: 'Sep 22–24', upcoming: 1, initials: 'AP' },
  { id: 'kasarani', name: 'Kasarani Stadium', city: 'Nairobi', country: 'Kenya', capacity: 60000, type: 'Outdoor', verified: true, booking: 'available', upcoming: 1, initials: 'KS' },
  { id: 'wankhede', name: 'Wankhede Stadium', city: 'Mumbai', country: 'India', capacity: 33108, type: 'Outdoor', verified: true, booking: 'pending', bookingDate: 'Oct 12', upcoming: 1, initials: 'WK' },
  { id: 'monumental', name: 'Estadio Monumental', city: 'Buenos Aires', country: 'Argentina', capacity: 70074, type: 'Outdoor', verified: true, booking: 'available', upcoming: 1, initials: 'EM' },
  { id: 'rizal', name: 'Rizal Memorial Stadium', city: 'Manila', country: 'Philippines', capacity: 12873, type: 'Outdoor', verified: true, booking: 'pending', upcoming: 1, initials: 'RM' },
  { id: 'bmo', name: 'BMO Field', city: 'Toronto', country: 'Canada', capacity: 30000, type: 'Outdoor', verified: false, booking: 'available', upcoming: 1, initials: 'BF' },
];

export const findVenue = (id: string) => venues.find((v) => v.id === id);

export interface MockAdminEvent {
  id: string;
  title: string;
  category: EventCategory;
  venue: string;
  date: string;
  churches: number;
  registrations: number;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'changes';
  manager: string;
}

export const adminEvents: MockAdminEvent[] = [
  { id: 'evt-wmb27', title: 'Wembley Prayer Gathering 2027', category: 'Stadium Worship', venue: 'Wembley Stadium', date: '16 — 17 May 2027', churches: 240, registrations: 62480, status: 'published', manager: 'Jonah Mensah' },
  { id: 'evt-atl27', title: 'Atlanta Awakening', category: 'Gospel Crusade', venue: 'Mercedes-Benz Stadium', date: '4 — 6 Jul 2027', churches: 412, registrations: 48140, status: 'published', manager: 'Grace M.' },
  { id: 'evt-sp27', title: 'São Paulo Unity Summit', category: 'Conference', venue: 'Allianz Parque', date: '22 — 24 Sep 2027', churches: 180, registrations: 28920, status: 'pending', manager: 'Jonah Mensah' },
  { id: 'evt-bhw27', title: 'Berlin Hope Weekend', category: 'Outreach', venue: 'Olympiastadion', date: '19 — 20 Mar 2027', churches: 62, registrations: 18240, status: 'changes', manager: 'Lukas Kramer' },
  { id: 'evt-nyi27', title: 'Nairobi Youth Ignite', category: 'Youth Gathering', venue: 'Kasarani Stadium', date: '9 — 11 Aug 2027', churches: 95, registrations: 21340, status: 'approved', manager: 'Jonah Mensah' },
  { id: 'evt-mnp27', title: 'Mumbai Night of Prayer', category: 'United Prayer', venue: 'Wankhede Stadium', date: '12 Oct 2027', churches: 320, registrations: 30680, status: 'pending', manager: 'Priya Sharma' },
];

export const findAdminEvent = (id: string) => adminEvents.find((e) => e.id === id);

export interface MockChurchDirectory {
  slug: string;
  initials: string;
  name: string;
  city: string;
  country: string;
  region: 'Europe' | 'Africa' | 'Americas' | 'Asia';
  denomination: string;
  established: number;
  size: string;
  branches: number;
  website: string;
  email: string;
  pastor: string;
  bio: string;
  gradient: [string, string];
  verified: boolean;
  upcoming: string[];
}

export const churchDirectory: MockChurchDirectory[] = [
  {
    slug: 'grace-international',
    initials: 'GI',
    name: 'Grace International Fellowship',
    city: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    denomination: 'Non-denominational',
    established: 1998,
    size: '1,200',
    branches: 3,
    website: 'gracefellowship.org',
    email: 'hello@gracefellowship.org',
    pastor: 'Rev. Daniel Okonkwo',
    bio: 'A multi-generational London congregation with branches in Manchester and Accra. Committed to prayer, youth discipleship, and interchurch collaboration across Europe and West Africa.',
    gradient: ['#C6A45B', '#8B6F2E'],
    verified: true,
    upcoming: ['wembley-prayer-gathering-2027', 'sao-paulo-unity-summit'],
  },
  {
    slug: 'hope-valley',
    initials: 'HV',
    name: 'Hope Valley Church',
    city: 'Manchester',
    country: 'United Kingdom',
    region: 'Europe',
    denomination: 'Baptist',
    established: 1964,
    size: '820',
    branches: 1,
    website: 'hopevalleychurch.uk',
    email: 'office@hopevalleychurch.uk',
    pastor: 'Pastor Sarah Hopkins',
    bio: 'Manchester-based congregation known for its worship training school and its heart for the city centre.',
    gradient: ['#101B32', '#1B2E55'],
    verified: true,
    upcoming: ['wembley-prayer-gathering-2027'],
  },
  {
    slug: 'trinity-berlin',
    initials: 'TB',
    name: 'Trinity Church Berlin',
    city: 'Berlin',
    country: 'Germany',
    region: 'Europe',
    denomination: 'Evangelical',
    established: 2003,
    size: '960',
    branches: 2,
    website: 'trinity-berlin.de',
    email: 'kontakt@trinity-berlin.de',
    pastor: 'Pastor Lukas Kramer',
    bio: 'An international evangelical congregation in central Berlin, serving residents and students across 40+ nationalities.',
    gradient: ['#3975CC', '#5A95E8'],
    verified: true,
    upcoming: ['berlin-hope-weekend', 'wembley-prayer-gathering-2027'],
  },
  {
    slug: 'harvest-fields',
    initials: 'HF',
    name: 'Harvest Fields Fellowship',
    city: 'Nairobi',
    country: 'Kenya',
    region: 'Africa',
    denomination: 'Non-denominational',
    established: 2007,
    size: '2,400',
    branches: 3,
    website: 'harvestfields.co.ke',
    email: 'info@harvestfields.co.ke',
    pastor: 'Rev. Patrick Mwangi',
    bio: 'A Nairobi congregation focused on community outreach, youth discipleship, and interchurch collaboration across East Africa.',
    gradient: ['#8B6F2E', '#D99A24'],
    verified: true,
    upcoming: ['nairobi-youth-ignite'],
  },
  {
    slug: 'faithway-cathedral',
    initials: 'FC',
    name: 'Faithway Cathedral',
    city: 'Atlanta',
    country: 'United States',
    region: 'Americas',
    denomination: 'Pentecostal',
    established: 1985,
    size: '3,100',
    branches: 7,
    website: 'faithway.church',
    email: 'info@faithway.church',
    pastor: 'Pastor Daniel Thompson',
    bio: 'A longstanding Pentecostal congregation with branches across the region and a commitment to crusades and city-wide evangelism.',
    gradient: ['#C6A45B', '#8B6F2E'],
    verified: true,
    upcoming: ['atlanta-awakening'],
  },
  {
    slug: 'new-covenant-chicago',
    initials: 'NC',
    name: 'New Covenant Chapel',
    city: 'Chicago',
    country: 'United States',
    region: 'Americas',
    denomination: 'Evangelical',
    established: 2012,
    size: '950',
    branches: 1,
    website: 'newcovenantchi.org',
    email: 'office@newcovenantchi.org',
    pastor: 'Dr. Samuel Reeves',
    bio: 'Chicago church with a strong music ministry and a growing network of connected congregations across the Midwest.',
    gradient: ['#1F4F99', '#3975CC'],
    verified: true,
    upcoming: [],
  },
];

export const findChurchInDirectory = (slug: string) =>
  churchDirectory.find((c) => c.slug === slug);

export interface MockAuditEvent {
  time: string;
  action: string;
  description: string;
  actor: string;
  actorRole: string;
  actorInitials: string;
  actorColor: string;
  resource: string;
  ip: string;
  location: string;
  severity: 'info' | 'success' | 'sensitive' | 'alert';
}

export const auditLog: MockAuditEvent[] = [
  { time: '6 Nov · 14:08:22', action: 'announcement.schedule', description: 'Scheduled "Wembley 2027 · gate change" for 7 Nov 09:00', actor: 'Esther Okonkwo', actorRole: 'Super Admin', actorInitials: 'EO', actorColor: '#C6A45B', resource: 'ann_284f', ip: '82.112.44.9', location: 'London, UK', severity: 'info' },
  { time: '6 Nov · 13:52:04', action: 'event.approve', description: 'Approved "Berlin Hope Weekend" after changes', actor: 'Sade N.', actorRole: 'Platform Admin', actorInitials: 'SN', actorColor: '#3975CC', resource: 'evt_bhw27', ip: '41.218.98.3', location: 'Atlanta, US', severity: 'success' },
  { time: '6 Nov · 11:17:48', action: 'user.permission_grant', description: 'Granted role Event Director to Lukas Kramer for Europe region', actor: 'Esther Okonkwo', actorRole: 'Super Admin', actorInitials: 'EO', actorColor: '#C6A45B', resource: 'usr_lkramer', ip: '82.112.44.9', location: 'London, UK', severity: 'sensitive' },
  { time: '6 Nov · 10:43:11', action: 'church.approve', description: 'Approved application "Harvest Fields Fellowship"', actor: 'Sade N.', actorRole: 'Platform Admin', actorInitials: 'SN', actorColor: '#3975CC', resource: 'chr_hff', ip: '41.218.98.3', location: 'Atlanta, US', severity: 'success' },
  { time: '6 Nov · 09:22:51', action: 'auth.sign_in_failed', description: '4 consecutive failed attempts for admin@grace… · temporary lockout triggered', actor: '—', actorRole: '—', actorInitials: '?', actorColor: '#98A1B2', resource: 'usr_grace_admin', ip: '178.62.11.204', location: 'Unknown · NL', severity: 'alert' },
  { time: '5 Nov · 18:08:04', action: 'venue.create', description: 'Added venue "Rizal Memorial Stadium"', actor: 'Lukas Kramer', actorRole: 'Event Director', actorInitials: 'LK', actorColor: '#16A36A', resource: 'vnu_rizal', ip: '93.218.5.44', location: 'Berlin, DE', severity: 'info' },
  { time: '5 Nov · 16:33:22', action: 'church.reject', description: 'Rejected application "Rock of Ages Chapel" · reason: unverifiable leadership', actor: 'Sade N.', actorRole: 'Platform Admin', actorInitials: 'SN', actorColor: '#3975CC', resource: 'app_ca0389', ip: '41.218.98.3', location: 'Atlanta, US', severity: 'sensitive' },
];
