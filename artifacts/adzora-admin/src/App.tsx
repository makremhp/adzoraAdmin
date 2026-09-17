import { type Dispatch, type ReactNode, type SetStateAction, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity as ActivityIcon,
  ArrowDownLeft,
  ArrowUpLeft,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronLeft,
  CircleDollarSign,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Globe2,
  LayoutDashboard,
  ListFilter,
  Menu,
  Megaphone,
  MoreHorizontal,
  Percent,
  Plus,
  Search,
  Send,
  Settings as SettingsIcon,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  UserCheck,
  UserRound,
  Users,
  WalletCards,
  X,
  XCircle,
} from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';

const queryClient = new QueryClient();

type AccountType = 'user' | 'advertiser' | 'publisher';
type UserStatus = 'active' | 'suspended' | 'blocked';
type DepositStatus = 'pending' | 'approved' | 'rejected';
type WithdrawalStatus = 'pending' | 'review' | 'completed' | 'rejected';
type SiteStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
type CampaignStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
type TransactionType = 'deposit' | 'withdrawal' | 'credit' | 'debit' | 'earning';

type User = {
  id: string;
  name: string;
  email: string;
  type: AccountType;
  status: UserStatus;
  joinedAt: string;
  balance: number;
  linkedCount: number;
  lastActivity: string;
};

type Deposit = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: string;
  network: string;
  txid: string;
  proofLabel: string;
  status: DepositStatus;
  createdAt: string;
  note: string;
};

type Withdrawal = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: string;
  receiving: string;
  status: WithdrawalStatus;
  createdAt: string;
  note: string;
};

type Transaction = {
  id: string;
  userName: string;
  type: TransactionType;
  amount: number;
  status: 'completed' | 'pending' | 'rejected';
  createdAt: string;
  description: string;
};

type Site = {
  id: string;
  name: string;
  publisher: string;
  url: string;
  status: SiteStatus;
  addedAt: string;
  visitors: string;
  category: string;
  note: string;
};

type Campaign = {
  id: string;
  name: string;
  advertiser: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  impressions: string;
  clicks: string;
  start: string;
  end: string;
  note: string;
};

type AdminActivity = {
  id: string;
  title: string;
  detail: string;
  by: string;
  time: string;
  tone: 'blue' | 'green' | 'gold' | 'red';
};

type AdminNotification = {
  id: string;
  title: string;
  body: string;
  audience: string;
  status: 'sent' | 'draft';
  createdAt: string;
  actionLabel: string;
};

type Toast = { id: number; message: string; tone?: 'success' | 'error' };

const seededUsers: User[] = [
  { id: 'usr-01', name: 'مؤسسة أفق الإعلام', email: 'hello@ufuq.media', type: 'publisher', status: 'active', joinedAt: '14 فبراير 2024', balance: 18420.5, linkedCount: 8, lastActivity: 'منذ 8 دقائق' },
  { id: 'usr-02', name: 'مريم السالم', email: 'maryam@brightline.co', type: 'advertiser', status: 'active', joinedAt: '02 مارس 2024', balance: 7240, linkedCount: 5, lastActivity: 'منذ 22 دقيقة' },
  { id: 'usr-03', name: 'شبكة مدار', email: 'ops@madar.news', type: 'publisher', status: 'active', joinedAt: '18 يونيو 2024', balance: 0, linkedCount: 3, lastActivity: 'منذ 41 دقيقة' },
  { id: 'usr-04', name: 'سُلاف للتقنية', email: 'team@sulaf.tech', type: 'advertiser', status: 'active', joinedAt: '18 يونيو 2024', balance: 1250, linkedCount: 2, lastActivity: 'منذ ساعة' },
  { id: 'usr-05', name: 'مجلة بُعد', email: 'desk@boadmag.com', type: 'publisher', status: 'active', joinedAt: '28 يناير 2024', balance: 9320, linkedCount: 12, lastActivity: 'اليوم، 09:42' },
  { id: 'usr-06', name: 'رائد منصور', email: 'raed@northstar.io', type: 'advertiser', status: 'suspended', joinedAt: '11 أبريل 2024', balance: 460, linkedCount: 1, lastActivity: 'أمس، 16:05' },
  { id: 'usr-07', name: 'منصة تكوين', email: 'admin@takween.org', type: 'publisher', status: 'blocked', joinedAt: '03 فبراير 2024', balance: 0, linkedCount: 1, lastActivity: '12 يونيو' },
  { id: 'usr-08', name: 'شركة مدارك', email: 'growth@madarek.sa', type: 'advertiser', status: 'active', joinedAt: '27 مايو 2024', balance: 11980, linkedCount: 7, lastActivity: 'اليوم، 08:10' },
  { id: 'usr-09', name: 'نور الدين الحداد', email: 'nour@example.com', type: 'user', status: 'active', joinedAt: '08 يوليو 2024', balance: 840, linkedCount: 0, lastActivity: 'اليوم، 07:48' },
];

const seededDeposits: Deposit[] = [
  { id: 'dep-01', userId: 'usr-04', userName: 'سُلاف للتقنية', userEmail: 'team@sulaf.tech', amount: 1250, method: 'USDT', network: 'TRC20', txid: 'TX-8A90F2D1', proofLabel: 'إيصال التحويل — 1.2 MB', status: 'pending', createdAt: 'اليوم، 10:26', note: '' },
  { id: 'dep-02', userId: 'usr-06', userName: 'رائد منصور', userEmail: 'raed@northstar.io', amount: 460, method: 'تحويل بنكي', network: 'البنك الأهلي', txid: 'BNK-220491', proofLabel: 'receipt_raed.pdf', status: 'pending', createdAt: 'اليوم، 09:14', note: '' },
  { id: 'dep-03', userId: 'usr-08', userName: 'شركة مدارك', userEmail: 'growth@madarek.sa', amount: 5000, method: 'USDT', network: 'ERC20', txid: 'TX-191CA02B', proofLabel: 'proof_madarek.png', status: 'approved', createdAt: 'أمس، 15:22', note: 'تمت المطابقة.' },
  { id: 'dep-04', userId: 'usr-02', userName: 'مريم السالم', userEmail: 'maryam@brightline.co', amount: 2200, method: 'تحويل بنكي', network: 'بنك الراجحي', txid: 'BNK-220311', proofLabel: 'brightline-receipt.pdf', status: 'rejected', createdAt: '12 يونيو، 12:05', note: 'المبلغ في الإيصال لا يطابق الطلب.' },
];

const seededWithdrawals: Withdrawal[] = [
  { id: 'wd-01', userId: 'usr-01', userName: 'مؤسسة أفق الإعلام', amount: 4200, method: 'تحويل بنكي', receiving: 'SA** **** 4812', status: 'pending', createdAt: 'اليوم، 11:08', note: '' },
  { id: 'wd-02', userId: 'usr-05', userName: 'مجلة بُعد', amount: 3100, method: 'USDT — TRC20', receiving: 'TQ7…91K', status: 'review', createdAt: 'اليوم، 09:47', note: 'بانتظار مطابقة الرصيد.' },
  { id: 'wd-03', userId: 'usr-03', userName: 'شبكة مدار', amount: 870, method: 'تحويل بنكي', receiving: 'SA** **** 1020', status: 'completed', createdAt: 'أمس، 13:20', note: 'اكتملت العملية.' },
  { id: 'wd-04', userId: 'usr-07', userName: 'منصة تكوين', amount: 1600, method: 'USDT — ERC20', receiving: '0xA1…C92', status: 'rejected', createdAt: '10 يونيو، 17:33', note: 'الحساب موقوف حالياً.' },
];

const seededTransactions: Transaction[] = [
  { id: 'txn-8721', userName: 'شركة مدارك', type: 'deposit', amount: 5000, status: 'completed', createdAt: 'أمس، 15:22', description: 'اعتماد إيداع USDT' },
  { id: 'txn-8719', userName: 'مؤسسة أفق الإعلام', type: 'earning', amount: 1840, status: 'completed', createdAt: 'أمس، 12:08', description: 'أرباح عرض الإعلانات' },
  { id: 'txn-8714', userName: 'مجلة بُعد', type: 'withdrawal', amount: -3100, status: 'pending', createdAt: 'اليوم، 09:47', description: 'طلب سحب إلى محفظة الناشر' },
  { id: 'txn-8708', userName: 'مريم السالم', type: 'debit', amount: -750, status: 'completed', createdAt: '12 يونيو، 16:14', description: 'خصم ميزانية حملة' },
  { id: 'txn-8699', userName: 'نور الدين الحداد', type: 'credit', amount: 300, status: 'completed', createdAt: '12 يونيو، 09:02', description: 'إضافة رصيد تجريبية' },
  { id: 'txn-8688', userName: 'رائد منصور', type: 'deposit', amount: 460, status: 'rejected', createdAt: '11 يونيو، 18:12', description: 'إيداع مرفوض' },
];

const seededSites: Site[] = [
  { id: 'site-01', name: 'Ufuq Media', publisher: 'مؤسسة أفق الإعلام', url: 'ufuq.media', status: 'approved', addedAt: '14 فبراير 2024', visitors: '1.8M', category: 'أخبار وتقنية', note: '' },
  { id: 'site-02', name: 'Madar News', publisher: 'شبكة مدار', url: 'madar.news', status: 'pending', addedAt: 'اليوم، 10:48', visitors: '420K', category: 'أخبار', note: '' },
  { id: 'site-03', name: 'Boad Magazine', publisher: 'مجلة بُعد', url: 'boadmag.com', status: 'approved', addedAt: '28 يناير 2024', visitors: '2.4M', category: 'ثقافة', note: '' },
  { id: 'site-04', name: 'Takween', publisher: 'منصة تكوين', url: 'takween.org', status: 'suspended', addedAt: '03 فبراير 2024', visitors: '82K', category: 'تعليم', note: 'تراجع معدل الجودة.' },
  { id: 'site-05', name: 'Tech Orbit', publisher: 'شبكة مدار', url: 'techorbit.news', status: 'rejected', addedAt: '12 يونيو 2024', visitors: '65K', category: 'تقنية', note: 'المحتوى لا يطابق سياسات المنصة.' },
];

const seededCampaigns: Campaign[] = [
  { id: 'cmp-01', name: 'إطلاق الصيف 2024', advertiser: 'مريم السالم', status: 'active', budget: 28000, spent: 16480, impressions: '2.1M', clicks: '48.2K', start: '01 يونيو', end: '30 يونيو', note: '' },
  { id: 'cmp-02', name: 'حلول أعمالك تبدأ هنا', advertiser: 'شركة مدارك', status: 'active', budget: 42000, spent: 22700, impressions: '3.4M', clicks: '72.8K', start: '04 يونيو', end: '04 يوليو', note: '' },
  { id: 'cmp-03', name: 'منتجنا الجديد', advertiser: 'سُلاف للتقنية', status: 'pending', budget: 12000, spent: 0, impressions: '—', clicks: '—', start: '20 يونيو', end: '20 يوليو', note: '' },
  { id: 'cmp-04', name: 'حملة الوعي بالعلامة', advertiser: 'رائد منصور', status: 'paused', budget: 18000, spent: 8400, impressions: '890K', clicks: '19.2K', start: '01 مايو', end: '31 مايو', note: 'متوقفة بطلب المعلن.' },
  { id: 'cmp-05', name: 'عرض نهاية الأسبوع', advertiser: 'مريم السالم', status: 'draft', budget: 8000, spent: 0, impressions: '—', clicks: '—', start: '01 يوليو', end: '07 يوليو', note: '' },
];

const seededActivities: AdminActivity[] = [
  { id: 'act-01', title: 'اعتماد إيداع جديد', detail: 'شركة مدارك · 5,000 ر.س', by: 'مدير المنصة', time: 'منذ 22 دقيقة', tone: 'green' },
  { id: 'act-02', title: 'موقع جديد ينتظر المراجعة', detail: 'Madar News · شبكة مدار', by: 'النظام', time: 'منذ 48 دقيقة', tone: 'gold' },
  { id: 'act-03', title: 'تعليق حملة إعلانية', detail: 'حملة الوعي بالعلامة · رائد منصور', by: 'مدير المنصة', time: 'منذ ساعتين', tone: 'red' },
  { id: 'act-04', title: 'تسجيل ناشر جديد', detail: 'شبكة مدار · 3 مواقع مرتبطة', by: 'النظام', time: 'اليوم، 08:42', tone: 'blue' },
  { id: 'act-05', title: 'تحديث إعدادات الرسوم', detail: 'تم تعديل رسوم السحب إلى 1.5%', by: 'مدير المنصة', time: 'أمس، 15:22', tone: 'blue' },
];

const seededNotifications: AdminNotification[] = [
  { id: 'not-01', title: 'تحديث شروط الدفع', body: 'يرجى مراجعة شروط الدفع الجديدة قبل نهاية الشهر.', audience: 'الجميع', status: 'sent', createdAt: 'أمس، 14:20', actionLabel: 'مراجعة الشروط' },
  { id: 'not-02', title: 'مراجعة بيانات المواقع', body: 'تذكير للناشرين بإكمال بيانات المواقع المرتبطة.', audience: 'الناشرون', status: 'sent', createdAt: '10 يونيو، 11:10', actionLabel: '' },
  { id: 'not-03', title: 'حملة نهاية الموسم', body: 'نص إشعار قيد التجهيز للحملة القادمة.', audience: 'المعلنون', status: 'draft', createdAt: 'اليوم، 09:15', actionLabel: 'اكتشف المزيد' },
];

const statusLabels: Record<string, string> = {
  active: 'نشط', suspended: 'موقوف', blocked: 'محظور', pending: 'معلق', approved: 'مقبول',
  rejected: 'مرفوض', review: 'قيد المراجعة', completed: 'مكتمل', draft: 'مسودة', paused: 'متوقف',
  sent: 'تم الإرسال', deposit: 'إيداع', withdrawal: 'سحب', credit: 'إضافة رصيد', debit: 'خصم رصيد', earning: 'أرباح',
};

const routeLabels: Record<string, string> = {
  '/': 'لوحة الإدارة', '/users': 'المستخدمون', '/advertisers': 'المعلنون', '/publishers': 'الناشرون',
  '/deposits': 'الإيداعات', '/withdrawals': 'السحوبات', '/transactions': 'المعاملات', '/sites': 'المواقع',
  '/campaigns': 'الحملات', '/analytics': 'التحليلات', '/notifications': 'الإشعارات', '/activity': 'سجل النشاط', '/settings': 'الإعدادات',
};

function formatMoney(value: number) {
  return `${new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(Math.abs(value))} ر.س`;
}
function initials(name: string) {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('');
}
function label(value: string) { return statusLabels[value] ?? value; }
function accountLabel(value: AccountType) { return value === 'publisher' ? 'ناشر' : value === 'advertiser' ? 'معلن' : 'مستخدم عادي'; }
function toneForStatus(value: string) {
  return ['approved', 'active', 'completed', 'sent'].includes(value) ? 'success' : ['rejected', 'blocked'].includes(value) ? 'danger' : value === 'review' || value === 'pending' ? 'warning' : 'neutral';
}

type AdminData = {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  deposits: Deposit[];
  setDeposits: Dispatch<SetStateAction<Deposit[]>>;
  withdrawals: Withdrawal[];
  setWithdrawals: Dispatch<SetStateAction<Withdrawal[]>>;
  transactions: Transaction[];
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  sites: Site[];
  setSites: Dispatch<SetStateAction<Site[]>>;
  campaigns: Campaign[];
  setCampaigns: Dispatch<SetStateAction<Campaign[]>>;
  activities: AdminActivity[];
  setActivities: Dispatch<SetStateAction<AdminActivity[]>>;
  notifications: AdminNotification[];
  setNotifications: Dispatch<SetStateAction<AdminNotification[]>>;
  notify: (message: string, tone?: Toast['tone']) => void;
};

function App() {
  const [users, setUsers] = useState(seededUsers);
  const [deposits, setDeposits] = useState(seededDeposits);
  const [withdrawals, setWithdrawals] = useState(seededWithdrawals);
  const [transactions, setTransactions] = useState(seededTransactions);
  const [sites, setSites] = useState(seededSites);
  const [campaigns, setCampaigns] = useState(seededCampaigns);
  const [activities, setActivities] = useState(seededActivities);
  const [notifications, setNotifications] = useState(seededNotifications);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = (message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };
  const data: AdminData = { users, setUsers, deposits, setDeposits, withdrawals, setWithdrawals, transactions, setTransactions, sites, setSites, campaigns, setCampaigns, activities, setActivities, notifications, setNotifications, notify };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedApp data={data} />
        </WouterRouter>
        <Toaster />
        <div className="toast-stack">{toasts.map((toast) => <div className={`toast ${toast.tone ?? ''}`} key={toast.id}>{toast.message}</div>)}</div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RoutedApp({ data }: { data: AdminData }) {
  const [location] = useLocation();
  return (
    <ErrorBoundary resetKey={location}>
      <Shell notify={data.notify}>
        <Switch>
          <Route path="/users"><UsersPage data={data} /></Route>
          <Route path="/advertisers"><UsersPage data={data} roleFilter="advertiser" /></Route>
          <Route path="/publishers"><UsersPage data={data} roleFilter="publisher" /></Route>
          <Route path="/deposits"><DepositsPage data={data} /></Route>
          <Route path="/withdrawals"><WithdrawalsPage data={data} /></Route>
          <Route path="/transactions"><TransactionsPage data={data} /></Route>
          <Route path="/sites"><SitesPage data={data} /></Route>
          <Route path="/campaigns"><CampaignsPage data={data} /></Route>
          <Route path="/analytics"><AnalyticsPage data={data} /></Route>
          <Route path="/notifications"><NotificationsPage data={data} /></Route>
          <Route path="/activity"><ActivityPage data={data} /></Route>
          <Route path="/settings"><SettingsPage data={data} /></Route>
          <Route path="/"><DashboardPage data={data} /></Route>
          <Route><NotFound /></Route>
        </Switch>
      </Shell>
    </ErrorBoundary>
  );
}

const navigation = [
  { title: 'الرئيسية', items: [{ href: '/', label: 'لوحة الإدارة', icon: LayoutDashboard }] },
  { title: 'المستخدمون', items: [{ href: '/users', label: 'المستخدمون', icon: Users }, { href: '/advertisers', label: 'المعلنون', icon: Megaphone }, { href: '/publishers', label: 'الناشرون', icon: UserCheck }] },
  { title: 'المدفوعات', items: [{ href: '/deposits', label: 'الإيداعات', icon: ArrowDownLeft }, { href: '/withdrawals', label: 'السحوبات', icon: ArrowUpLeft }, { href: '/transactions', label: 'المعاملات', icon: CircleDollarSign }] },
  { title: 'المنصة', items: [{ href: '/sites', label: 'المواقع', icon: Globe2 }, { href: '/campaigns', label: 'الحملات', icon: Megaphone }] },
  { title: 'المتابعة', items: [{ href: '/analytics', label: 'التحليلات', icon: BarChart3 }, { href: '/notifications', label: 'الإشعارات', icon: Bell }, { href: '/activity', label: 'سجل النشاط', icon: ActivityIcon }] },
  { title: 'النظام', items: [{ href: '/settings', label: 'الإعدادات', icon: SettingsIcon }] },
];

function Shell({ children, notify }: { children: ReactNode; notify: AdminData['notify'] }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-overlay" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="brand"><div className="brand-mark">A</div><div className="brand-name">Ad<span>Zora</span></div></div>
        <div className="sidebar-caption">مركز العمليات</div>
        <nav className="nav" aria-label="التنقل الرئيسي">
          {navigation.map((group) => <div className="nav-group" key={group.title}>
            <div className="nav-section-label">{group.title}</div>
            {group.items.map(({ href, label: itemLabel, icon: Icon }) => <Link key={href} href={href} className={`nav-link ${location === href ? 'active' : ''}`} onClick={() => setMobileOpen(false)} data-testid={`link-nav-${href === '/' ? 'home' : href.slice(1)}`}><Icon className="nav-icon" size={17} /><span>{itemLabel}</span></Link>)}
          </div>)}
        </nav>
        <div className="sidebar-foot"><div className="admin-chip"><div className="avatar">م س</div><div><strong>مدير المنصة</strong><small>حساب مالك الشبكة</small></div><MoreHorizontal size={17} color="#8da0b2" style={{ marginRight: 'auto' }} /></div></div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-title"><button className="icon-btn menu-btn" onClick={() => setMobileOpen(true)} aria-label="فتح القائمة"><Menu size={19} /></button><div><p className="eyebrow">مساحة إدارة AdZora</p><h2>{routeLabels[location] ?? 'الصفحة'}</h2></div></div>
          <div className="topbar-actions"><button className="icon-btn" aria-label="الإشعارات" onClick={() => notify('لديك 3 إشعارات تحتاج المتابعة.')} style={{ position: 'relative' }}><Bell size={17} /><span className="notification-dot" /></button><div className="avatar topbar-avatar">م س</div></div>
        </header>
        {children}
      </main>
    </div>
  );
}

function PageHeading({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="heading-actions">{actions}</div>}</div>;
}

function DashboardPage({ data }: { data: AdminData }) {
  const pendingDeposits = data.deposits.filter((item) => item.status === 'pending').length;
  const pendingWithdrawals = data.withdrawals.filter((item) => item.status === 'pending' || item.status === 'review').length;
  const pendingSites = data.sites.filter((item) => item.status === 'pending').length;
  const pendingCampaigns = data.campaigns.filter((item) => item.status === 'pending').length;
  return <section className="content">
    <PageHeading title="لوحة الإدارة" description="ملخص سريع لحالة المنصة والإجراءات التي تحتاج مراجعتك اليوم." actions={<Link href="/deposits" className="btn btn-primary"><FileCheck2 size={15} />مراجعة الإيداعات</Link>} />
    <div className="kpi-grid">
      <StatCard label="إجمالي المستخدمين" value={data.users.length.toLocaleString('ar-SA')} detail={`${data.users.filter((u) => u.status === 'active').length} حساب نشط`} icon={<Users size={16} />} />
      <StatCard label="إجمالي المواقع" value={data.sites.length.toLocaleString('ar-SA')} detail={`${pendingSites} بانتظار الموافقة`} icon={<Globe2 size={16} />} />
      <StatCard label="الإيداعات المعلقة" value={String(pendingDeposits)} detail={`${formatMoney(6840)} هذا الشهر`} icon={<ArrowDownLeft size={16} />} warning />
      <StatCard label="السحوبات المعلقة" value={String(pendingWithdrawals)} detail={`${pendingWithdrawals + 4} عملية قيد المعالجة`} icon={<ArrowUpLeft size={16} />} warning />
    </div>
    <div className="dashboard-main">
      <div className="card wide-card"><div className="card-head"><div><h3>الإحصائيات المالية</h3><p>لقطة الإيرادات والإنفاق خلال آخر 30 يوماً</p></div><select className="select" defaultValue="30"><option value="30">آخر 30 يوماً</option><option value="7">آخر 7 أيام</option></select></div><RevenueChart /></div>
      <div className="side-stack"><div className="card wide-card"><div className="card-head"><div><h3>يحتاج إلى إجراء</h3><p>طلبات ومراجعات مفتوحة الآن</p></div><ShieldCheck size={18} color="#c9983e" /></div><div className="queue-list"><QueueRow icon={<WalletCards size={15} />} title="إيداعات" detail="مراجعة إثباتات الدفع" count={pendingDeposits} href="/deposits" /><QueueRow icon={<ArrowUpLeft size={15} />} title="سحوبات" detail="مطابقة بيانات الاستلام" count={pendingWithdrawals} href="/withdrawals" /><QueueRow icon={<Globe2 size={15} />} title="مواقع" detail="مراجعة مواقع الناشرين" count={pendingSites} href="/sites" /><QueueRow icon={<Megaphone size={15} />} title="حملات" detail="مراجعة الحملات الجديدة" count={pendingCampaigns} href="/campaigns" /></div></div></div>
      <div className="card wide-card"><div className="card-head"><div><h3>اختصارات سريعة</h3><p>الوصول إلى أكثر الإجراءات استخداماً</p></div><SlidersHorizontal size={17} color="#8da0b2" /></div><div className="quick-actions"><Link href="/deposits" className="quick-action"><WalletCards size={15} />مراجعة الإيداعات</Link><Link href="/withdrawals" className="quick-action"><ArrowUpLeft size={15} />مراجعة السحوبات</Link><Link href="/sites" className="quick-action"><Globe2 size={15} />اعتماد موقع</Link><Link href="/campaigns" className="quick-action"><Megaphone size={15} />إدارة الحملات</Link></div></div>
      <div className="card wide-card"><div className="card-head"><div><h3>آخر الأنشطة</h3><p>الإجراءات الأخيرة داخل المنصة</p></div><Link href="/activity" className="btn btn-ghost">عرض السجل <ChevronLeft size={14} /></Link></div><div className="activity-list">{data.activities.slice(0, 4).map((activity) => <ActivityRow activity={activity} key={activity.id} />)}</div></div>
    </div>
  </section>;
}

function StatCard({ label: cardLabel, value, detail, icon, warning }: { label: string; value: string; detail: string; icon: ReactNode; warning?: boolean }) {
  return <div className="card kpi-card"><div className="kpi-top"><span>{cardLabel}</span><span className="kpi-icon" style={warning ? { color: '#a2742d', background: '#fbf4e5' } : undefined}>{icon}</span></div><div className="kpi-value">{value}</div><div className={`kpi-trend ${warning ? 'neutral' : ''}`}>{warning ? '● ' : '↗ '}{detail}</div></div>;
}
function RevenueChart() {
  return <div className="chart-wrap"><svg className="chart-svg" viewBox="0 0 700 220" role="img" aria-label="مخطط الإيرادات"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2b69ae" stopOpacity=".2" /><stop offset="100%" stopColor="#2b69ae" stopOpacity="0" /></linearGradient></defs>{[35, 80, 125, 170].map((y) => <line className="chart-gridline" key={y} x1="34" x2="680" y1={y} y2={y} />)}<path className="chart-area" d="M34 170 C90 156 106 150 142 153 S205 120 242 132 S305 116 340 122 S399 78 438 102 S492 91 526 95 S573 45 610 65 S648 39 680 49 L680 180 L34 180Z" /><path className="chart-line" d="M34 170 C90 156 106 150 142 153 S205 120 242 132 S305 116 340 122 S399 78 438 102 S492 91 526 95 S573 45 610 65 S648 39 680 49" /><circle className="chart-point" cx="610" cy="65" r="4" /><text className="chart-label" x="34" y="207">١ يونيو</text><text className="chart-label" x="190" y="207">٧ يونيو</text><text className="chart-label" x="350" y="207">١٤ يونيو</text><text className="chart-label" x="510" y="207">٢١ يونيو</text><text className="chart-label" x="646" y="207">اليوم</text></svg></div>;
}
function QueueRow({ icon, title, detail, count, href }: { icon: ReactNode; title: string; detail: string; count: number; href: string }) {
  return <Link href={href} className="queue-row"><div className="queue-meta"><span className="queue-icon">{icon}</span><div><strong>{title}</strong><small>{detail}</small></div></div><span className="queue-count">{count}</span></Link>;
}
function ActivityRow({ activity }: { activity: AdminActivity }) {
  return <div className="activity-item"><span className={`activity-pin ${activity.tone}`} /><div><strong>{activity.title}</strong><p>{activity.detail}</p></div><span className="activity-time">{activity.time}</span></div>;
}

function UsersPage({ data, roleFilter }: { data: AdminData; roleFilter?: AccountType }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | UserStatus>('all');
  const [selected, setSelected] = useState<User | null>(null);
  const users = useMemo(() => data.users.filter((user) => (!roleFilter || user.type === roleFilter) && (status === 'all' || user.status === status) && `${user.name} ${user.email} ${user.id}`.toLowerCase().includes(search.toLowerCase())), [data.users, roleFilter, search, status]);
  const title = roleFilter === 'advertiser' ? 'المعلنون' : roleFilter === 'publisher' ? 'الناشرون' : 'المستخدمون';
  const description = roleFilter === 'advertiser' ? 'إدارة حسابات المعلنين وحملاتهم وإنفاقهم.' : roleFilter === 'publisher' ? 'إدارة الناشرين ومواقعهم وأرباحهم.' : 'دليل جميع الحسابات المسجلة في المنصة.';
  const toggleStatus = (user: User) => {
    const next = user.status === 'active' ? 'suspended' : 'active';
    data.setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: next } : item));
    data.setActivities((current) => [{ id: `act-${Date.now()}`, title: next === 'active' ? 'تفعيل حساب' : 'إيقاف حساب', detail: `${user.name} · ${accountLabel(user.type)}`, by: 'مدير المنصة', time: 'الآن', tone: next === 'active' ? 'green' : 'gold' }, ...current]);
    data.notify(next === 'active' ? 'تم تفعيل الحساب تجريبياً.' : 'تم إيقاف الحساب تجريبياً.');
  };
  return <section className="content">
    <PageHeading title={title} description={description} actions={<button className="btn btn-subtle" onClick={() => data.notify('تم تصدير القائمة كملف تجريبي.')}><FileText size={15} />تصدير القائمة</button>} />
    <div className="summary-strip"><StatMini title="إجمالي الحسابات" value={String(users.length)} icon={<Users size={15} />} /><StatMini title="نشط" value={String(users.filter((user) => user.status === 'active').length)} icon={<Check size={15} />} /><StatMini title="الرصيد الإجمالي" value={formatMoney(users.reduce((sum, user) => sum + user.balance, 0))} icon={<CircleDollarSign size={15} />} /></div>
    <div className="card table-card"><div className="table-toolbar"><div className="toolbar-start"><div className="search-wrap"><Search size={15} /><input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم أو البريد أو المعرف" aria-label="البحث في المستخدمين" /></div></div><div className="toolbar-end"><div className="filter-tabs">{(['all', 'active', 'suspended', 'blocked'] as const).map((item) => <button key={item} className={`filter-tab ${status === item ? 'active' : ''}`} onClick={() => setStatus(item)}>{item === 'all' ? 'الكل' : label(item)}</button>)}</div></div></div>
      {users.length ? <div className="table-scroll"><table><thead><tr><th>الحساب</th><th>نوع الحساب</th><th>الحالة</th><th>الرصيد</th><th>المواقع / الحملات</th><th>آخر نشاط</th><th>إجراءات</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><div className="user-cell"><div className="avatar">{initials(user.name)}</div><div><strong>{user.name}</strong><small>{user.email}</small><small className="muted-id">{user.id}</small></div></div></td><td><span className="type-pill">{accountLabel(user.type)}</span></td><td><StatusBadge value={user.status} /></td><td><strong className="number">{formatMoney(user.balance)}</strong></td><td>{user.linkedCount} {user.type === 'publisher' ? 'مواقع' : user.type === 'advertiser' ? 'حملات' : 'مرتبطة'}</td><td>{user.lastActivity}</td><td><div className="action-row"><button className="icon-btn" aria-label="تفاصيل المستخدم" onClick={() => setSelected(user)}><Eye size={15} /></button>{user.status !== 'blocked' && <button className="btn btn-small btn-subtle" onClick={() => toggleStatus(user)}>{user.status === 'active' ? 'إيقاف' : 'تفعيل'}</button>}</div></td></tr>)}</tbody></table></div> : <EmptyState icon={<Users size={20} />} title="لا توجد حسابات مطابقة" description="جرّب تغيير الفلتر أو عبارة البحث." />}
    </div>
    {selected && <UserDrawer user={selected} data={data} onClose={() => setSelected(null)} onToggle={() => { toggleStatus(selected); setSelected({ ...selected, status: selected.status === 'active' ? 'suspended' : 'active' }); }} />}
  </section>;
}

function UserDrawer({ user, data, onClose, onToggle }: { user: User; data: AdminData; onClose: () => void; onToggle: () => void }) {
  return <div className="drawer-backdrop" onClick={onClose}><aside className="drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><h3>تفاصيل الحساب</h3><p>{user.id} · بيانات Mock Data</p></div><button className="icon-btn" onClick={onClose} aria-label="إغلاق"><X size={16} /></button></div><div className="profile-header"><div className="avatar avatar-large">{initials(user.name)}</div><div><strong>{user.name}</strong><small>{user.email}</small><StatusBadge value={user.status} /></div></div><div className="drawer-section"><h4>معلومات الحساب</h4><div className="detail-grid"><div className="detail-item"><small>نوع الحساب</small><strong>{accountLabel(user.type)}</strong></div><div className="detail-item"><small>تاريخ التسجيل</small><strong>{user.joinedAt}</strong></div><div className="detail-item"><small>الرصيد الحالي</small><strong>{formatMoney(user.balance)}</strong></div><div className="detail-item"><small>المواقع / الحملات</small><strong>{user.linkedCount}</strong></div></div></div><div className="drawer-section"><h4>سجل الإجراءات</h4><div className="activity-list"><ActivityRow activity={{ id: 'detail-1', title: 'تم تسجيل الدخول', detail: 'من جهاز موثوق', by: 'النظام', time: user.lastActivity, tone: 'blue' }} /><ActivityRow activity={{ id: 'detail-2', title: 'تمت مراجعة الحساب', detail: 'بواسطة مدير المنصة', by: 'مدير المنصة', time: 'أمس، 14:10', tone: 'green' }} /></div></div><div className="drawer-actions"><button className="btn btn-primary" onClick={() => { data.notify('تم تعديل الرصيد تجريبياً.'); onClose(); }}>تعديل الرصيد</button><button className="btn btn-subtle" onClick={onToggle}>{user.status === 'active' ? 'إيقاف الحساب' : 'تفعيل الحساب'}</button></div></aside></div>;
}

function DepositsPage({ data }: { data: AdminData }) {
  const [filter, setFilter] = useState<'all' | DepositStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Deposit | null>(null);
  const filtered = data.deposits.filter((deposit) => (filter === 'all' || deposit.status === filter) && `${deposit.userName} ${deposit.userEmail} ${deposit.txid}`.toLowerCase().includes(search.toLowerCase()));
  const updateDeposit = (deposit: Deposit, status: DepositStatus, note = '') => {
    data.setDeposits((current) => current.map((item) => item.id === deposit.id ? { ...item, status, note } : item));
    if (status === 'approved') {
      data.setUsers((current) => current.map((user) => user.id === deposit.userId ? { ...user, balance: user.balance + deposit.amount } : user));
      data.setTransactions((current) => [{ id: `txn-${Date.now()}`, userName: deposit.userName, type: 'deposit', amount: deposit.amount, status: 'completed', createdAt: 'الآن', description: 'اعتماد إيداع' }, ...current]);
    }
    data.setActivities((current) => [{ id: `act-${Date.now()}`, title: status === 'approved' ? 'اعتماد إيداع' : 'رفض إيداع', detail: `${deposit.userName} · ${formatMoney(deposit.amount)}`, by: 'مدير المنصة', time: 'الآن', tone: status === 'approved' ? 'green' : 'red' }, ...current]);
    data.notify(status === 'approved' ? 'تم اعتماد الإيداع وتحديث الرصيد.' : 'تم رفض الإيداع مع حفظ سبب الرفض.', status === 'approved' ? 'success' : 'error');
    setSelected(null);
  };
  return <section className="content"><PageHeading title="الإيداعات" description="مراجعة إثباتات الدفع وإضافة الرصيد إلى حسابات المستخدمين." actions={<button className="btn btn-subtle" onClick={() => setFilter('pending')}><Filter size={15} />المعلقة ({data.deposits.filter((item) => item.status === 'pending').length})</button>} /><RequestSummary items={[['معلقة', data.deposits.filter((item) => item.status === 'pending').length], ['مقبولة', data.deposits.filter((item) => item.status === 'approved').length], ['مرفوضة', data.deposits.filter((item) => item.status === 'rejected').length]]} /><div className="card table-card"><TableToolbar search={search} setSearch={setSearch} placeholder="ابحث باسم المستخدم أو رقم العملية" filters={['all', 'pending', 'approved', 'rejected']} active={filter} onFilter={(value) => setFilter(value as 'all' | DepositStatus)} /><div className="table-scroll"><table><thead><tr><th>المستخدم</th><th>المبلغ</th><th>طريقة الدفع</th><th>رقم العملية</th><th>الحالة</th><th>التاريخ</th><th /></tr></thead><tbody>{filtered.map((deposit) => <tr key={deposit.id}><td><div className="user-cell"><div className="avatar">{initials(deposit.userName)}</div><div><strong>{deposit.userName}</strong><small>{deposit.userEmail}</small></div></div></td><td><strong className="number">{formatMoney(deposit.amount)}</strong></td><td>{deposit.method}<small>{deposit.network}</small></td><td><span className="number">{deposit.txid}</span></td><td><StatusBadge value={deposit.status} /></td><td>{deposit.createdAt}</td><td><button className="icon-btn" onClick={() => setSelected(deposit)} aria-label="عرض تفاصيل الإيداع"><Eye size={15} /></button></td></tr>)}</tbody></table></div></div>{selected && <DepositDrawer deposit={selected} onClose={() => setSelected(null)} onUpdate={updateDeposit} />}</section>;
}

function DepositDrawer({ deposit, onClose, onUpdate }: { deposit: Deposit; onClose: () => void; onUpdate: (deposit: Deposit, status: DepositStatus, note?: string) => void }) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState(deposit.note);
  const [expanded, setExpanded] = useState(false);
  return <div className="drawer-backdrop" onClick={onClose}><aside className="drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><h3>مراجعة طلب الإيداع</h3><p>{deposit.id} · جميع العمليات Mock Data</p></div><button className="icon-btn" onClick={onClose} aria-label="إغلاق"><X size={16} /></button></div><div className="drawer-section"><h4>تفاصيل الطلب</h4><div className="detail-grid"><div className="detail-item"><small>المستخدم</small><strong>{deposit.userName}</strong></div><div className="detail-item"><small>المبلغ</small><strong>{formatMoney(deposit.amount)}</strong></div><div className="detail-item"><small>طريقة الدفع</small><strong>{deposit.method} · {deposit.network}</strong></div><div className="detail-item"><small>تاريخ الطلب</small><strong>{deposit.createdAt}</strong></div></div></div><div className="drawer-section"><h4>إثبات الدفع</h4><button className="proof-box" onClick={() => setExpanded(true)}><FileText size={24} /><span>{deposit.proofLabel}</span><small>اضغط للتكبير</small></button></div>{deposit.note && <div className="notice-box">{deposit.note}</div>}{deposit.status === 'pending' && <div className="drawer-actions">{rejecting ? <div className="reject-form"><textarea className="input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="اكتب سبب الرفض المطلوب حفظه..." aria-label="سبب الرفض" /><button className="btn btn-danger" disabled={!note.trim()} onClick={() => onUpdate(deposit, 'rejected', note)}>تأكيد الرفض</button><button className="btn btn-subtle" onClick={() => setRejecting(false)}>إلغاء</button></div> : <><button className="btn btn-primary" onClick={() => onUpdate(deposit, 'approved')}>قبول الإيداع</button><button className="btn btn-danger" onClick={() => setRejecting(true)}>رفض الطلب</button></>}</div>}{expanded && <div className="proof-expanded" onClick={() => setExpanded(false)}><div className="proof-preview"><FileText size={58} /><strong>{deposit.proofLabel}</strong><p>معاينة إثبات الدفع التجريبي</p></div></div>}</aside></div>;
}

function WithdrawalsPage({ data }: { data: AdminData }) {
  const [filter, setFilter] = useState<'all' | WithdrawalStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Withdrawal | null>(null);
  const filtered = data.withdrawals.filter((item) => (filter === 'all' || item.status === filter) && `${item.userName} ${item.id} ${item.receiving}`.toLowerCase().includes(search.toLowerCase()));
  const update = (item: Withdrawal, status: WithdrawalStatus, note = '') => {
    data.setWithdrawals((current) => current.map((entry) => entry.id === item.id ? { ...entry, status, note } : entry));
    data.setActivities((current) => [{ id: `act-${Date.now()}`, title: `تحديث طلب سحب إلى ${label(status)}`, detail: `${item.userName} · ${formatMoney(item.amount)}`, by: 'مدير المنصة', time: 'الآن', tone: status === 'completed' ? 'green' : status === 'rejected' ? 'red' : 'gold' }, ...current]);
    data.notify(status === 'rejected' ? 'تم رفض طلب السحب وحفظ السبب.' : status === 'review' ? 'تم وضع الطلب قيد المراجعة.' : 'تم تحديث حالة طلب السحب.');
    setSelected(null);
  };
  return <section className="content"><PageHeading title="السحوبات" description="مراجعة طلبات السحب ومطابقة بيانات الاستلام والرصيد." actions={<button className="btn btn-subtle" onClick={() => setFilter('pending')}><Filter size={15} />طلبات جديدة</button>} /><RequestSummary items={[['معلقة', data.withdrawals.filter((item) => item.status === 'pending').length], ['قيد المراجعة', data.withdrawals.filter((item) => item.status === 'review').length], ['مكتملة', data.withdrawals.filter((item) => item.status === 'completed').length], ['مرفوضة', data.withdrawals.filter((item) => item.status === 'rejected').length]]} /><div className="card table-card"><TableToolbar search={search} setSearch={setSearch} placeholder="ابحث باسم المستخدم أو رقم الطلب" filters={['all', 'pending', 'review', 'completed', 'rejected']} active={filter} onFilter={(value) => setFilter(value as 'all' | WithdrawalStatus)} /><div className="table-scroll"><table><thead><tr><th>المستخدم</th><th>المبلغ</th><th>طريقة السحب</th><th>بيانات الاستلام</th><th>الحالة</th><th>التاريخ</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><div className="user-cell"><div className="avatar">{initials(item.userName)}</div><strong>{item.userName}</strong></div></td><td><strong className="number">{formatMoney(item.amount)}</strong></td><td>{item.method}</td><td><span className="number">{item.receiving}</span></td><td><StatusBadge value={item.status} /></td><td>{item.createdAt}</td><td><button className="icon-btn" onClick={() => setSelected(item)} aria-label="عرض تفاصيل السحب"><Eye size={15} /></button></td></tr>)}</tbody></table></div></div>{selected && <WithdrawalDrawer item={selected} data={data} onClose={() => setSelected(null)} onUpdate={update} />}</section>;
}

function WithdrawalDrawer({ item, data, onClose, onUpdate }: { item: Withdrawal; data: AdminData; onClose: () => void; onUpdate: (item: Withdrawal, status: WithdrawalStatus, note?: string) => void }) {
  const [note, setNote] = useState(item.note);
  const [rejecting, setRejecting] = useState(false);
  const user = data.users.find((entry) => entry.id === item.userId);
  return <div className="drawer-backdrop" onClick={onClose}><aside className="drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><h3>تفاصيل طلب السحب</h3><p>{item.id} · مراجعة تجريبية</p></div><button className="icon-btn" onClick={onClose} aria-label="إغلاق"><X size={16} /></button></div><div className="drawer-section"><h4>بيانات الطلب</h4><div className="detail-grid"><div className="detail-item"><small>المستخدم</small><strong>{item.userName}</strong></div><div className="detail-item"><small>الرصيد الحالي</small><strong>{formatMoney(user?.balance ?? 0)}</strong></div><div className="detail-item"><small>المبلغ المطلوب</small><strong>{formatMoney(item.amount)}</strong></div><div className="detail-item"><small>طريقة الاستلام</small><strong>{item.method}</strong></div></div></div><div className="notice-box"><strong>بيانات الاستلام</strong><span className="number">{item.receiving}</span></div>{item.note && <div className="notice-box">{item.note}</div>}{item.status !== 'completed' && item.status !== 'rejected' && <div className="drawer-actions">{rejecting ? <div className="reject-form"><textarea className="input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="سبب الرفض..." /><button className="btn btn-danger" disabled={!note.trim()} onClick={() => onUpdate(item, 'rejected', note)}>تأكيد الرفض</button><button className="btn btn-subtle" onClick={() => setRejecting(false)}>إلغاء</button></div> : <><button className="btn btn-primary" onClick={() => onUpdate(item, 'completed')}>قبول وإكمال</button><button className="btn btn-subtle" onClick={() => onUpdate(item, 'review')}>قيد المراجعة</button><button className="btn btn-danger" onClick={() => setRejecting(true)}>رفض الطلب</button></>}</div>}</aside></div>;
}

function TransactionsPage({ data }: { data: AdminData }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | TransactionType>('all');
  const filtered = data.transactions.filter((item) => (type === 'all' || item.type === type) && `${item.userName} ${item.id} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="content"><PageHeading title="المعاملات" description="سجل موحد لكل الحركات المالية، للعرض والمراجعة فقط." actions={<button className="btn btn-subtle" onClick={() => data.notify('تم تجهيز تصدير المعاملات التجريبي.')}><FileText size={15} />تصدير السجل</button>} /><div className="summary-strip"><StatMini title="كل العمليات" value={String(data.transactions.length)} icon={<ListFilter size={15} />} /><StatMini title="الإيداعات" value={String(data.transactions.filter((item) => item.type === 'deposit').length)} icon={<ArrowDownLeft size={15} />} /><StatMini title="الأرباح" value={formatMoney(data.transactions.filter((item) => item.type === 'earning').reduce((sum, item) => sum + item.amount, 0))} icon={<TrendingUp size={15} />} /></div><div className="card table-card"><TableToolbar search={search} setSearch={setSearch} placeholder="ابحث باسم المستخدم أو معرف العملية" filters={['all', 'deposit', 'withdrawal', 'credit', 'debit', 'earning']} active={type} onFilter={(value) => setType(value as 'all' | TransactionType)} /><div className="table-scroll"><table><thead><tr><th>معرف العملية</th><th>المستخدم</th><th>النوع</th><th>المبلغ</th><th>الحالة</th><th>التاريخ</th><th>الوصف</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><span className="number">{item.id}</span></td><td>{item.userName}</td><td><span className="type-pill">{label(item.type)}</span></td><td className={item.amount < 0 ? 'amount-negative number' : 'amount-positive number'}>{item.amount < 0 ? '-' : '+'}{formatMoney(item.amount)}</td><td><StatusBadge value={item.status} /></td><td>{item.createdAt}</td><td>{item.description}</td></tr>)}</tbody></table></div></div></section>;
}

function SitesPage({ data }: { data: AdminData }) {
  const [filter, setFilter] = useState<'all' | SiteStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Site | null>(null);
  const filtered = data.sites.filter((item) => (filter === 'all' || item.status === filter) && `${item.name} ${item.publisher} ${item.url}`.toLowerCase().includes(search.toLowerCase()));
  const update = (site: Site, status: SiteStatus, note = site.note) => {
    data.setSites((current) => current.map((item) => item.id === site.id ? { ...item, status, note } : item));
    data.setActivities((current) => [{ id: `act-${Date.now()}`, title: status === 'approved' ? 'قبول موقع' : status === 'rejected' ? 'رفض موقع' : 'إيقاف موقع', detail: `${site.name} · ${site.publisher}`, by: 'مدير المنصة', time: 'الآن', tone: status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'gold' }, ...current]);
    data.notify(status === 'approved' ? 'تم قبول الموقع تجريبياً.' : status === 'rejected' ? 'تم رفض الموقع مع حفظ السبب.' : 'تم إيقاف الموقع تجريبياً.', status === 'rejected' ? 'error' : 'success');
    setSelected(null);
  };
  return <section className="content"><PageHeading title="المواقع" description="مراجعة المواقع المضافة من الناشرين وإدارتها." actions={<button className="btn btn-subtle" onClick={() => setFilter('pending')}><Filter size={15} />المعلقة ({data.sites.filter((item) => item.status === 'pending').length})</button>} /><RequestSummary items={[['معلقة', data.sites.filter((item) => item.status === 'pending').length], ['مقبولة', data.sites.filter((item) => item.status === 'approved').length], ['مرفوضة', data.sites.filter((item) => item.status === 'rejected').length], ['موقوفة', data.sites.filter((item) => item.status === 'suspended').length]]} /><div className="card table-card"><TableToolbar search={search} setSearch={setSearch} placeholder="ابحث باسم الموقع أو الناشر" filters={['all', 'pending', 'approved', 'rejected', 'suspended']} active={filter} onFilter={(value) => setFilter(value as 'all' | SiteStatus)} /><div className="table-scroll"><table><thead><tr><th>الموقع</th><th>الناشر</th><th>التصنيف</th><th>الزوار</th><th>الحالة</th><th>تاريخ الإضافة</th><th /></tr></thead><tbody>{filtered.map((site) => <tr key={site.id}><td><div className="user-cell"><div className="avatar"><Globe2 size={15} /></div><div><strong>{site.name}</strong><small className="ltr">{site.url}</small></div></div></td><td>{site.publisher}</td><td>{site.category}</td><td className="number">{site.visitors}</td><td><StatusBadge value={site.status} /></td><td>{site.addedAt}</td><td><button className="icon-btn" onClick={() => setSelected(site)} aria-label="عرض تفاصيل الموقع"><Eye size={15} /></button></td></tr>)}</tbody></table></div></div>{selected && <SiteDrawer site={selected} onClose={() => setSelected(null)} onUpdate={update} />}</section>;
}

function SiteDrawer({ site, onClose, onUpdate }: { site: Site; onClose: () => void; onUpdate: (site: Site, status: SiteStatus, note?: string) => void }) {
  const [note, setNote] = useState(site.note);
  const [rejecting, setRejecting] = useState(false);
  return <div className="drawer-backdrop" onClick={onClose}><aside className="drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><h3>مراجعة الموقع</h3><p>{site.id} · بيانات الموقع</p></div><button className="icon-btn" onClick={onClose} aria-label="إغلاق"><X size={16} /></button></div><div className="profile-header"><div className="avatar avatar-large"><Globe2 size={21} /></div><div><strong>{site.name}</strong><small className="ltr">{site.url}</small><StatusBadge value={site.status} /></div></div><div className="drawer-section"><h4>بيانات الموقع</h4><div className="detail-grid"><div className="detail-item"><small>الناشر</small><strong>{site.publisher}</strong></div><div className="detail-item"><small>التصنيف</small><strong>{site.category}</strong></div><div className="detail-item"><small>الزوار الشهرية</small><strong>{site.visitors}</strong></div><div className="detail-item"><small>تاريخ الإضافة</small><strong>{site.addedAt}</strong></div></div></div><div className="notice-box">الرابط: <span className="ltr">{site.url}</span></div>{site.status === 'pending' && <div className="drawer-actions">{rejecting ? <div className="reject-form"><textarea className="input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="سبب الرفض..." /><button className="btn btn-danger" disabled={!note.trim()} onClick={() => onUpdate(site, 'rejected', note)}>تأكيد الرفض</button><button className="btn btn-subtle" onClick={() => setRejecting(false)}>إلغاء</button></div> : <><button className="btn btn-primary" onClick={() => onUpdate(site, 'approved')}>قبول الموقع</button><button className="btn btn-danger" onClick={() => setRejecting(true)}>رفض الموقع</button></>}</div>}{site.status === 'approved' && <div className="drawer-actions"><button className="btn btn-danger" onClick={() => onUpdate(site, 'suspended')}>إيقاف الموقع</button></div>}</aside></div>;
}

function CampaignsPage({ data }: { data: AdminData }) {
  const [filter, setFilter] = useState<'all' | CampaignStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Campaign | null>(null);
  const filtered = data.campaigns.filter((item) => (filter === 'all' || item.status === filter) && `${item.name} ${item.advertiser}`.toLowerCase().includes(search.toLowerCase()));
  const update = (campaign: Campaign, status: CampaignStatus, note = campaign.note) => {
    data.setCampaigns((current) => current.map((item) => item.id === campaign.id ? { ...item, status, note } : item));
    data.setActivities((current) => [{ id: `act-${Date.now()}`, title: status === 'active' ? 'تفعيل حملة' : status === 'rejected' ? 'رفض حملة' : 'تحديث حملة', detail: `${campaign.name} · ${campaign.advertiser}`, by: 'مدير المنصة', time: 'الآن', tone: status === 'rejected' ? 'red' : status === 'active' ? 'green' : 'gold' }, ...current]);
    data.notify(status === 'rejected' ? 'تم رفض الحملة مع حفظ السبب.' : 'تم تحديث حالة الحملة تجريبياً.', status === 'rejected' ? 'error' : 'success');
    setSelected(null);
  };
  return <section className="content"><PageHeading title="الحملات" description="مراجعة الحملات الإعلانية ومتابعة الميزانيات والأداء." actions={<button className="btn btn-gold" onClick={() => data.notify('إنشاء حملة جديدة متاح عند ربط Backend.') }><Plus size={15} />حملة جديدة</button>} /><RequestSummary items={[['مسودة', data.campaigns.filter((item) => item.status === 'draft').length], ['معلقة', data.campaigns.filter((item) => item.status === 'pending').length], ['نشطة', data.campaigns.filter((item) => item.status === 'active').length], ['متوقفة', data.campaigns.filter((item) => item.status === 'paused').length]]} /><div className="card table-card"><TableToolbar search={search} setSearch={setSearch} placeholder="ابحث باسم الحملة أو المعلن" filters={['all', 'draft', 'pending', 'active', 'paused', 'completed', 'rejected']} active={filter} onFilter={(value) => setFilter(value as 'all' | CampaignStatus)} /><div className="table-scroll"><table><thead><tr><th>الحملة</th><th>المعلن</th><th>الميزانية</th><th>المصروف</th><th>المشاهدات / النقرات</th><th>الحالة</th><th /></tr></thead><tbody>{filtered.map((campaign) => <tr key={campaign.id}><td><strong>{campaign.name}</strong><small>{campaign.start} — {campaign.end}</small></td><td>{campaign.advertiser}</td><td className="number">{formatMoney(campaign.budget)}</td><td className="number">{formatMoney(campaign.spent)}</td><td>{campaign.impressions}<small>{campaign.clicks} نقرة</small></td><td><StatusBadge value={campaign.status} /></td><td><button className="icon-btn" onClick={() => setSelected(campaign)} aria-label="عرض تفاصيل الحملة"><Eye size={15} /></button></td></tr>)}</tbody></table></div></div>{selected && <CampaignDrawer campaign={selected} onClose={() => setSelected(null)} onUpdate={update} />}</section>;
}

function CampaignDrawer({ campaign, onClose, onUpdate }: { campaign: Campaign; onClose: () => void; onUpdate: (campaign: Campaign, status: CampaignStatus, note?: string) => void }) {
  const [note, setNote] = useState(campaign.note);
  const [rejecting, setRejecting] = useState(false);
  return <div className="drawer-backdrop" onClick={onClose}><aside className="drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><h3>تفاصيل الحملة</h3><p>{campaign.id} · إعدادات Mock Data</p></div><button className="icon-btn" onClick={onClose} aria-label="إغلاق"><X size={16} /></button></div><div className="profile-header"><div className="avatar avatar-large"><Megaphone size={21} /></div><div><strong>{campaign.name}</strong><small>{campaign.advertiser}</small><StatusBadge value={campaign.status} /></div></div><div className="drawer-section"><h4>أداء الحملة</h4><div className="detail-grid"><div className="detail-item"><small>الميزانية</small><strong>{formatMoney(campaign.budget)}</strong></div><div className="detail-item"><small>المصروف</small><strong>{formatMoney(campaign.spent)}</strong></div><div className="detail-item"><small>المشاهدات</small><strong>{campaign.impressions}</strong></div><div className="detail-item"><small>النقرات</small><strong>{campaign.clicks}</strong></div></div></div><div className="progress-line"><span style={{ width: `${campaign.budget ? Math.min(100, (campaign.spent / campaign.budget) * 100) : 0}%` }} /></div>{campaign.note && <div className="notice-box">{campaign.note}</div>}<div className="drawer-actions">{campaign.status === 'pending' && (rejecting ? <div className="reject-form"><textarea className="input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="سبب الرفض..." /><button className="btn btn-danger" disabled={!note.trim()} onClick={() => onUpdate(campaign, 'rejected', note)}>تأكيد الرفض</button><button className="btn btn-subtle" onClick={() => setRejecting(false)}>إلغاء</button></div> : <><button className="btn btn-primary" onClick={() => onUpdate(campaign, 'active')}>تفعيل الحملة</button><button className="btn btn-danger" onClick={() => setRejecting(true)}>رفض الحملة</button></>)}{campaign.status === 'active' && <button className="btn btn-subtle" onClick={() => onUpdate(campaign, 'paused')}>إيقاف مؤقت</button>}{campaign.status === 'paused' && <button className="btn btn-primary" onClick={() => onUpdate(campaign, 'active')}>استئناف الحملة</button>}</div></aside></div>;
}

function AnalyticsPage({ data }: { data: AdminData }) {
  const [period, setPeriod] = useState('30');
  const bars = period === '7' ? [42, 58, 48, 70, 62, 80, 92] : period === 'today' ? [36, 54, 46, 74, 68, 88] : [35, 48, 44, 62, 58, 73, 68, 82, 78, 91, 84, 96];
  return <section className="content"><PageHeading title="التحليلات" description="قراءة واضحة لحركة المنصة والأداء المالي — البيانات الحالية Mock Data قابلة للربط لاحقاً." actions={<select className="select" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="today">اليوم</option><option value="7">آخر 7 أيام</option><option value="30">آخر 30 يوماً</option><option value="custom">فترة مخصصة</option></select>} /><div className="kpi-grid"><StatCard label="مستخدمون جدد" value="86" detail="+14.2% عن الفترة السابقة" icon={<Users size={16} />} /><StatCard label="مواقع جديدة" value="24" detail="18 موقعاً مقبولاً" icon={<Globe2 size={16} />} /><StatCard label="إجمالي الإيداعات" value={formatMoney(68400)} detail="+8.6% عن الفترة السابقة" icon={<ArrowDownLeft size={16} />} /><StatCard label="أرباح الناشرين" value={formatMoney(42780)} detail="نسبة الدفع 96.7%" icon={<TrendingUp size={16} />} /></div><div className="analytics-grid"><div className="card wide-card"><div className="card-head"><div><h3>نمو النشاط المالي</h3><p>الإيداعات والسحوبات والإنفاق خلال الفترة المحددة</p></div><BarChart3 size={18} color="#2866ad" /></div><div className="bar-chart">{bars.map((height, index) => <div className="bar-column" key={index}><div className="bar-value">{height * 10}K</div><div className="bar" style={{ height: `${height}%` }} /><small>{index + 1} {period === '30' ? 'يونيو' : ''}</small></div>)}</div></div><div className="card wide-card"><div className="card-head"><div><h3>توزيع المنصة</h3><p>الوضع الحالي للكيانات الرئيسية</p></div><CircleDollarSign size={18} color="#c9983e" /></div><div className="metric-list"><MetricLine label="المعلنين" value={data.users.filter((user) => user.type === 'advertiser').length} color="blue" /><MetricLine label="الناشرين" value={data.users.filter((user) => user.type === 'publisher').length} color="gold" /><MetricLine label="الحملات النشطة" value={data.campaigns.filter((item) => item.status === 'active').length} color="green" /><MetricLine label="المواقع المقبولة" value={data.sites.filter((item) => item.status === 'approved').length} color="purple" /></div></div></div></section>;
}

function NotificationsPage({ data }: { data: AdminData }) {
  const [form, setForm] = useState({ title: '', body: '', audience: 'الجميع', actionLabel: '' });
  const createNotification = () => {
    if (!form.title.trim() || !form.body.trim()) { data.notify('أكمل عنوان الإشعار ومحتواه أولاً.', 'error'); return; }
    data.setNotifications((current) => [{ id: `not-${Date.now()}`, ...form, status: 'draft', createdAt: 'الآن' }, ...current]);
    data.notify('تم حفظ الإشعار كمسودة تجريبية.');
    setForm({ title: '', body: '', audience: 'الجميع', actionLabel: '' });
  };
  return <section className="content"><PageHeading title="الإشعارات" description="إنشاء وإدارة رسائل المنصة — لا يوجد إرسال حقيقي في هذه المرحلة." actions={<button className="btn btn-primary" onClick={createNotification}><Send size={15} />حفظ الإشعار</button>} /><div className="settings-grid"><div className="card settings-card"><div className="card-head"><div><h3>إنشاء إشعار جديد</h3><p>ستحفظ الرسالة كـ Mock Data قابلة للربط لاحقاً.</p></div><Bell size={18} color="#c9983e" /></div><div className="form-grid"><div className="field field-full"><label>العنوان</label><input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="عنوان الإشعار" /></div><div className="field field-full"><label>المحتوى</label><textarea className="input textarea" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="اكتب محتوى الرسالة..." /></div><div className="field"><label>المستلمون</label><select className="select" value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })}><option>الجميع</option><option>المعلنون</option><option>الناشرون</option><option>مستخدمون محددون</option></select></div><div className="field"><label>نص الزر (اختياري)</label><input className="input" value={form.actionLabel} onChange={(event) => setForm({ ...form, actionLabel: event.target.value })} placeholder="مثال: اعرف المزيد" /></div></div></div><div className="card settings-card"><div className="card-head"><div><h3>سجل الإشعارات</h3><p>{data.notifications.length} إشعارات محفوظة</p></div><FileText size={18} color="#8da0b2" /></div><div className="notification-list">{data.notifications.map((item) => <div className="notification-row" key={item.id}><div className="notification-icon"><Bell size={16} /></div><div><strong>{item.title}</strong><p>{item.body}</p><small>{item.audience} · {item.createdAt}</small></div><StatusBadge value={item.status} /></div>)}</div></div></div></section>;
}

function ActivityPage({ data }: { data: AdminData }) {
  const [search, setSearch] = useState('');
  const [tone, setTone] = useState('all');
  const items = data.activities.filter((item) => (tone === 'all' || item.tone === tone) && `${item.title} ${item.detail} ${item.by}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="content"><PageHeading title="سجل النشاط" description="كل إجراءات الأدمن على المستخدمين والعناصر، جاهز للربط مع Audit Log حقيقي." actions={<button className="btn btn-subtle" onClick={() => data.notify('تم تجهيز تصدير سجل النشاط التجريبي.')}><FileText size={15} />تصدير السجل</button>} /><div className="card table-card"><TableToolbar search={search} setSearch={setSearch} placeholder="ابحث في سجل الإجراءات" filters={['all', 'blue', 'green', 'gold', 'red']} active={tone} onFilter={setTone} /><div className="timeline">{items.map((item) => <div className="timeline-row" key={item.id}><span className={`activity-pin ${item.tone}`} /><div className="timeline-main"><strong>{item.title}</strong><p>{item.detail}</p><small>بواسطة {item.by}</small></div><span className="activity-time">{item.time}</span><button className="icon-btn" onClick={() => data.notify(`تفاصيل العملية: ${item.title}`)} aria-label="تفاصيل النشاط"><Eye size={15} /></button></div>)}</div></div></section>;
}

function SettingsPage({ data }: { data: AdminData }) {
  const [settings, setSettings] = useState({ minDeposit: '100', minWithdrawal: '250', platformFee: '2.5', withdrawalFee: '1.5', currency: 'ر.س', review: true, notifications: true, autoApprove: false });
  const save = () => { data.notify('تم حفظ إعدادات المنصة في Mock State.'); };
  return <section className="content"><PageHeading title="الإعدادات" description="إعدادات المنصة العامة والرسوم وقواعد المراجعة." actions={<button className="btn btn-primary" onClick={save}><Check size={15} />حفظ التغييرات</button>} /><div className="settings-grid"><div className="grid"><div className="card settings-card"><div className="card-head"><div><h3>الإعدادات المالية</h3><p>القيم الحالية تجريبية وتجهز للربط مع Backend.</p></div><CircleDollarSign size={18} color="#2866ad" /></div><div className="form-grid"><SettingField label="الحد الأدنى للإيداع" value={settings.minDeposit} onChange={(value) => setSettings({ ...settings, minDeposit: value })} suffix={settings.currency} /><SettingField label="الحد الأدنى للسحب" value={settings.minWithdrawal} onChange={(value) => setSettings({ ...settings, minWithdrawal: value })} suffix={settings.currency} /><SettingField label="رسوم المنصة" value={settings.platformFee} onChange={(value) => setSettings({ ...settings, platformFee: value })} suffix="%" /><SettingField label="رسوم السحب" value={settings.withdrawalFee} onChange={(value) => setSettings({ ...settings, withdrawalFee: value })} suffix="%" /><div className="field"><label>العملة الأساسية</label><select className="select" value={settings.currency} onChange={(event) => setSettings({ ...settings, currency: event.target.value })}><option>ر.س</option><option>دولار</option><option>يورو</option></select></div></div></div><div className="card settings-card"><div className="card-head"><div><h3>حسابات المستخدمين</h3><p>قواعد تفعيل الحسابات والمراجعات.</p></div><Users size={18} color="#2b947d" /></div><SettingToggle title="مراجعة الحسابات الجديدة" description="ضع الحسابات الجديدة في طابور المراجعة." value={settings.review} onChange={() => setSettings({ ...settings, review: !settings.review })} /><SettingToggle title="الموافقة التلقائية على المواقع" description="لا يوصى بها قبل ربط نظام الجودة." value={settings.autoApprove} onChange={() => setSettings({ ...settings, autoApprove: !settings.autoApprove })} /></div></div><div className="side-stack"><div className="card settings-card"><div className="card-head"><div><h3>الإشعارات</h3><p>قنوات التنبيه داخل لوحة الإدارة.</p></div><Bell size={18} color="#c9983e" /></div><SettingToggle title="تنبيهات الإجراءات المهمة" description="الإيداعات والسحوبات والموافقات." value={settings.notifications} onChange={() => setSettings({ ...settings, notifications: !settings.notifications })} /><SettingToggle title="ملخص أسبوعي" description="تذكير بأداء الشبكة كل أسبوع." value={true} onChange={() => data.notify('تم تبديل الملخص الأسبوعي تجريبياً.')} /></div><div className="card settings-card"><div className="card-head"><div><h3>حالة البيئة</h3><p>جاهز للربط مع خدمات الإنتاج.</p></div><ShieldCheck size={18} color="#2b947d" /></div><div className="environment-row"><span className="status-dot green" />Mock Data نشطة</div><div className="environment-row"><span className="status-dot blue" />واجهة API جاهزة للتكامل</div></div></div></div></section>;
}

function SettingField({ label: fieldLabel, value, onChange, suffix }: { label: string; value: string; onChange: (value: string) => void; suffix: string }) {
  return <div className="field"><label>{fieldLabel}</label><div className="input-with-suffix"><input className="input" value={value} onChange={(event) => onChange(event.target.value)} dir="ltr" /><span>{suffix}</span></div></div>;
}
function SettingToggle({ title, description, value, onChange }: { title: string; description: string; value: boolean; onChange: () => void }) {
  return <div className="setting-line"><div><strong>{title}</strong><small>{description}</small></div><button className={`switch ${value ? 'on' : ''}`} onClick={onChange} aria-label={title}><span /></button></div>;
}

function RequestSummary({ items }: { items: [string, number][] }) {
  return <div className="summary-strip">{items.map(([title, value]) => <StatMini title={title} value={String(value)} key={title} />)}</div>;
}
function StatMini({ title, value, icon }: { title: string; value: string; icon?: ReactNode }) {
  return <div className="stat-mini"><span>{icon ?? <ActivityIcon size={15} />}</span><div><small>{title}</small><strong>{value}</strong></div></div>;
}
function TableToolbar({ search, setSearch, placeholder, filters, active, onFilter }: { search: string; setSearch: (value: string) => void; placeholder: string; filters: string[]; active: string; onFilter: (value: string) => void }) {
  return <div className="table-toolbar"><div className="toolbar-start"><div className="search-wrap"><Search size={15} /><input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={placeholder} aria-label={placeholder} /></div></div><div className="toolbar-end"><div className="filter-tabs">{filters.map((item) => <button key={item} className={`filter-tab ${active === item ? 'active' : ''}`} onClick={() => onFilter(item)}>{item === 'all' ? 'الكل' : label(item)}</button>)}</div></div></div>;
}
function StatusBadge({ value }: { value: string }) {
  return <span className={`status ${toneForStatus(value)}`}>{label(value)}</span>;
}
function MetricLine({ label: metricLabel, value, color }: { label: string; value: number; color: string }) {
  return <div className="metric-line"><span className={`metric-dot ${color}`} /><span>{metricLabel}</span><strong>{value}</strong></div>;
}
function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><strong>{title}</strong><p>{description}</p></div>;
}
function NotFound() {
  return <section className="content"><div className="card empty-state" style={{ marginTop: 50 }}><div className="empty-icon"><XCircle size={20} /></div><strong>الصفحة غير موجودة</strong><p>عد إلى <Link href="/" style={{ color: '#2866ad', fontWeight: 700 }}>لوحة الإدارة</Link> للمتابعة.</p></div></section>;
}

export default App;