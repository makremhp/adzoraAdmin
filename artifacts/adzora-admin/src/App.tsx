import { type Dispatch, type ReactNode, type SetStateAction, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity as ActivityIcon,
  ArrowDownLeft,
  ArrowUpLeft,
  Bell,
  Blocks,
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
  Menu,
  MoreHorizontal,
  Percent,
  Plus,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Trash2,
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

type Role = 'publisher' | 'advertiser';
type UserStatus = 'active' | 'pending' | 'suspended' | 'blocked';
type DepositStatus = 'pending' | 'approved' | 'rejected';

type User = {
  id: string; name: string; email: string; role: Role; status: UserStatus;
  joinedAt: string; balance: number; sitesOrCampaignsCount: number; lastActivity: string;
};
type Deposit = {
  id: string; userName: string; userEmail: string; amount: number; method: string;
  network: string; txid: string; proofLabel: string; status: DepositStatus; createdAt: string; note: string;
};
type PricingRule = {
  format: string; pricingModel: string; defaultRate: number; publisherShare: number; platformShare: number; updatedAt: string;
};
type Activity = { id: string; title: string; detail: string; type: string; time: string; tone: string };
type Toast = { id: number; message: string; tone?: 'success' | 'error' };

const seededUsers: User[] = [
  { id: 'usr-01', name: 'مؤسسة أفق الإعلام', email: 'hello@ufuq.media', role: 'publisher', status: 'active', joinedAt: '2024-02-14', balance: 18420.5, sitesOrCampaignsCount: 8, lastActivity: 'منذ 8 دقائق' },
  { id: 'usr-02', name: 'مريم السالم', email: 'maryam@brightline.co', role: 'advertiser', status: 'active', joinedAt: '2024-03-02', balance: 7240, sitesOrCampaignsCount: 5, lastActivity: 'منذ 22 دقيقة' },
  { id: 'usr-03', name: 'شبكة مدار', email: 'ops@madar.news', role: 'publisher', status: 'pending', joinedAt: '2024-06-18', balance: 0, sitesOrCampaignsCount: 3, lastActivity: 'منذ 41 دقيقة' },
  { id: 'usr-04', name: 'سُلاف للتقنية', email: 'team@sulaf.tech', role: 'advertiser', status: 'pending', joinedAt: '2024-06-18', balance: 1250, sitesOrCampaignsCount: 2, lastActivity: 'منذ ساعة' },
  { id: 'usr-05', name: 'مجلة بُعد', email: 'desk@boadmag.com', role: 'publisher', status: 'active', joinedAt: '2024-01-28', balance: 9320, sitesOrCampaignsCount: 12, lastActivity: 'اليوم، 09:42' },
  { id: 'usr-06', name: 'رائد منصور', email: 'raed@northstar.io', role: 'advertiser', status: 'suspended', joinedAt: '2024-04-11', balance: 460, sitesOrCampaignsCount: 1, lastActivity: 'أمس، 16:05' },
  { id: 'usr-07', name: 'منصة تكوين', email: 'admin@takween.org', role: 'publisher', status: 'blocked', joinedAt: '2024-02-03', balance: 0, sitesOrCampaignsCount: 1, lastActivity: '12 يونيو' },
  { id: 'usr-08', name: 'شركة مدارك', email: 'growth@madarek.sa', role: 'advertiser', status: 'active', joinedAt: '2024-05-27', balance: 11980, sitesOrCampaignsCount: 7, lastActivity: 'اليوم، 08:10' },
];
const seededDeposits: Deposit[] = [
  { id: 'dep-01', userName: 'سُلاف للتقنية', userEmail: 'team@sulaf.tech', amount: 1250, method: 'USDT', network: 'TRC20', txid: 'TX-8A90F2D1', proofLabel: 'إيصال التحويل — 1.2 MB', status: 'pending', createdAt: 'اليوم، 10:26', note: '' },
  { id: 'dep-02', userName: 'رائد منصور', userEmail: 'raed@northstar.io', amount: 460, method: 'تحويل بنكي', network: 'البنك الأهلي', txid: 'BNK-220491', proofLabel: 'receipt_raed.pdf', status: 'pending', createdAt: 'اليوم، 09:48', note: '' },
  { id: 'dep-03', userName: 'مريم السالم', userEmail: 'maryam@brightline.co', amount: 3000, method: 'USDT', network: 'ERC20', txid: 'TX-7751C10A', proofLabel: 'transfer-proof.png', status: 'approved', createdAt: 'أمس، 15:22', note: 'تمت المطابقة مع المحفظة.' },
  { id: 'dep-04', userName: 'شركة مدارك', userEmail: 'growth@madarek.sa', amount: 5000, method: 'USDT', network: 'TRC20', txid: 'TX-1119B2C4', proofLabel: 'proof_5000.jpg', status: 'rejected', createdAt: '16 يونيو، 12:04', note: 'المبلغ الظاهر في الإيصال غير واضح.' },
  { id: 'dep-05', userName: 'أفق الإعلام', userEmail: 'hello@ufuq.media', amount: 8500, method: 'تحويل بنكي', network: 'الراجحي', txid: 'BNK-218802', proofLabel: 'bank-slip.pdf', status: 'approved', createdAt: '15 يونيو، 11:32', note: '' },
];
const seededPricing: PricingRule[] = [
  { format: 'بانر قياسي', pricingModel: 'CPM', defaultRate: 3.2, publisherShare: 68, platformShare: 32, updatedAt: '18 يونيو 2024' },
  { format: 'بانر مميز', pricingModel: 'CPM', defaultRate: 7.5, publisherShare: 72, platformShare: 28, updatedAt: '18 يونيو 2024' },
  { format: 'إعلان أصلي', pricingModel: 'CPC', defaultRate: 0.42, publisherShare: 65, platformShare: 35, updatedAt: '12 يونيو 2024' },
  { format: 'فيديو قصير', pricingModel: 'CPV', defaultRate: 0.08, publisherShare: 60, platformShare: 40, updatedAt: '12 يونيو 2024' },
];
const seededActivities: Activity[] = [
  { id: 'act-1', title: 'تم اعتماد إيداع جديد', detail: 'مريم السالم · 3,000 ر.س', type: 'deposit', time: 'منذ 22 دقيقة', tone: 'green' },
  { id: 'act-2', title: 'حساب ينتظر المراجعة', detail: 'شبكة مدار · ناشر', type: 'user', time: 'منذ 41 دقيقة', tone: 'blue' },
  { id: 'act-3', title: 'حملة جديدة قيد التشغيل', detail: 'شركة مدارك · بانر مميز', type: 'campaign', time: 'منذ ساعة', tone: 'gold' },
  { id: 'act-4', title: 'تم تحديث قاعدة تسعير', detail: 'بانر قياسي · CPM', type: 'settings', time: 'أمس، 17:20', tone: 'blue' },
];

const labels: Record<string, string> = {
  '/': 'نظرة عامة', '/deposits': 'الإيداعات', '/publishers': 'الناشرون',
  '/advertisers': 'المعلنون', '/users': 'دليل المستخدمين', '/pricing': 'التسعير', '/settings': 'الإعدادات',
};
const formatMoney = (value: number) => `${value.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ر.س`;
const initials = (name: string) => name.split(' ').slice(0, 2).map((part) => part[0]).join('');
const roleLabel = (role: Role) => role === 'publisher' ? 'ناشر' : 'معلن';
const statusLabel = (status: UserStatus | DepositStatus) => ({
  active: 'نشط', pending: 'قيد المراجعة', suspended: 'موقوف', blocked: 'محظور',
  approved: 'معتمد', rejected: 'مرفوض',
}[status]);

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : initial;
    } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue] as const;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedApp />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RoutedApp() {
  const [location] = useLocation();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [users, setUsers] = useStoredState<User[]>('adzora-users', seededUsers);
  const [deposits, setDeposits] = useStoredState<Deposit[]>('adzora-deposits', seededDeposits);
  const [pricing, setPricing] = useStoredState<PricingRule[]>('adzora-pricing', seededPricing);
  const [activities, setActivities] = useStoredState<Activity[]>('adzora-activities', seededActivities);
  const notify = (message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200);
  };
  const addActivity = (title: string, detail: string, tone = 'blue') => {
    setActivities((current) => [{ id: `act-${Date.now()}`, title, detail, type: 'admin', time: 'الآن', tone }, ...current].slice(0, 8));
  };
  const data = { users, setUsers, deposits, setDeposits, pricing, setPricing, activities, addActivity, notify };
  return (
    <ErrorBoundary resetKey={location}>
      <AdminShell notify={notify}>
        <Switch>
          <Route path="/deposits"><DepositsPage {...data} /></Route>
          <Route path="/publishers"><UsersPage {...data} roleFilter="publisher" /></Route>
          <Route path="/advertisers"><UsersPage {...data} roleFilter="advertiser" /></Route>
          <Route path="/users"><UsersPage {...data} /></Route>
          <Route path="/pricing"><PricingPage {...data} /></Route>
          <Route path="/settings"><SettingsPage {...data} /></Route>
          <Route path="/"><DashboardPage {...data} /></Route>
          <Route><NotFound /></Route>
        </Switch>
      </AdminShell>
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => <div className={`toast ${toast.tone ?? ''}`} key={toast.id} data-testid={`toast-${toast.id}`}>{toast.message}</div>)}
      </div>
    </ErrorBoundary>
  );
}

type DataProps = {
  users: User[]; setUsers: Dispatch<SetStateAction<User[]>>;
  deposits: Deposit[]; setDeposits: Dispatch<SetStateAction<Deposit[]>>;
  pricing: PricingRule[]; setPricing: Dispatch<SetStateAction<PricingRule[]>>;
  activities: Activity[]; addActivity: (title: string, detail: string, tone?: string) => void;
  notify: (message: string, tone?: Toast['tone']) => void;
};

function AdminShell({ children, notify }: { children: ReactNode; notify: DataProps['notify'] }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [
    { href: '/', label: 'نظرة عامة', icon: LayoutDashboard },
    { href: '/deposits', label: 'الإيداعات', icon: WalletCards },
    { href: '/publishers', label: 'الناشرون', icon: Globe2 },
    { href: '/advertisers', label: 'المعلنون', icon: Building2 },
    { href: '/users', label: 'دليل المستخدمين', icon: Users },
  ];
  const management = [
    { href: '/pricing', label: 'التسعير', icon: Percent },
    { href: '/settings', label: 'الإعدادات', icon: SettingsIcon },
  ];
  return (
    <div className="app-shell" dir="rtl">
      {mobileOpen && <button className="mobile-overlay" aria-label="إغلاق القائمة" data-testid="button-close-menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="brand"><div className="brand-mark">A</div><div className="brand-name">Ad<span>Zora</span></div></div>
        <div className="sidebar-caption">مركز العمليات</div>
        <nav className="nav" aria-label="التنقل الرئيسي">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${location === href ? 'active' : ''}`} data-testid={`link-nav-${href === '/' ? 'home' : href.slice(1)}`} onClick={() => setMobileOpen(false)}>
              <Icon className="nav-icon" /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-caption" style={{ marginTop: 28 }}>إدارة المنصة</div>
        <nav className="nav">
          {management.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${location === href ? 'active' : ''}`} data-testid={`link-nav-${href.slice(1)}`} onClick={() => setMobileOpen(false)}>
              <Icon className="nav-icon" /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot"><div className="admin-chip"><div className="avatar">م س</div><div><strong>مدير المنصة</strong><small>حساب مالك الشبكة</small></div><MoreHorizontal size={17} color="#8da0b2" /></div></div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <button className="icon-btn menu-btn" onClick={() => setMobileOpen(true)} aria-label="فتح القائمة" data-testid="button-open-menu"><Menu size={19} /></button>
            <div><p className="eyebrow">مساحة إدارة AdZora</p><h2>{labels[location] ?? 'الصفحة'}</h2></div>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" aria-label="الإشعارات" onClick={() => notify('لا توجد تنبيهات جديدة حالياً.')} data-testid="button-notifications" style={{ position: 'relative' }}><Bell size={17} /><span className="notification-dot" /></button>
            <div className="avatar topbar-avatar">م س</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function PageHeading({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="heading-actions">{actions}</div>}</div>;
}

function DashboardPage({ users, deposits, activities }: DataProps) {
  const pendingUsers = users.filter((user) => user.status === 'pending').length;
  const pendingDeposits = deposits.filter((deposit) => deposit.status === 'pending').length;
  return (
    <section className="content">
      <PageHeading title="نظرة عامة" description="صباح الخير، هذه صورة مركّزة لأهم ما يحدث على الشبكة اليوم." actions={<Link href="/deposits" className="btn btn-primary" data-testid="link-review-deposits"><FileCheck2 size={15} />مراجعة الإيداعات</Link>} />
      <div className="kpi-grid">
        <KpiCard label="إجمالي الإيرادات" value="184,260 ر.س" trend="+12.8% هذا الشهر" icon={<CircleDollarSign size={16} />} />
        <KpiCard label="الرصيد المعلّق" value="27,840 ر.س" trend="14 عملية تنتظر التسوية" icon={<Clock3 size={16} />} warning />
        <KpiCard label="المستخدمون النشطون" value="1,248" trend="+86 خلال آخر 30 يوماً" icon={<Users size={16} />} />
        <KpiCard label="الظهور هذا الشهر" value="8.42M" trend="معدل امتلاء 74.2%" icon={<TrendingUp size={16} />} />
      </div>
      <div className="dashboard-main">
        <div className="card wide-card">
          <div className="card-head"><div><h3>لقطة الإيرادات</h3><p>صافي الإيرادات خلال آخر 30 يوماً</p></div><select className="select" defaultValue="30"><option value="30">آخر 30 يوماً</option><option value="90">آخر 90 يوماً</option></select></div>
          <RevenueChart />
        </div>
        <div className="side-stack">
          <div className="card wide-card">
            <div className="card-head"><div><h3>طابور الموافقات</h3><p>مساحتك الأهم الآن</p></div><ShieldCheck size={18} color="#c9983e" /></div>
            <div className="queue-list">
              <QueueRow icon={<WalletCards size={15} />} title="إيداعات" detail="مراجعة إثباتات الدفع" count={pendingDeposits} href="/deposits" />
              <QueueRow icon={<UserCheck size={15} />} title="حسابات ناشرين" detail="تحقق من المواقع" count={users.filter((user) => user.role === 'publisher' && user.status === 'pending').length} href="/publishers" />
              <QueueRow icon={<UserRound size={15} />} title="حسابات معلنين" detail="بيانات نشاط جديدة" count={users.filter((user) => user.role === 'advertiser' && user.status === 'pending').length} href="/advertisers" />
            </div>
          </div>
          <div className="card wide-card">
            <div className="card-head"><div><h3>إجراءات سريعة</h3><p>الاختصارات الأكثر استخداماً</p></div><ArrowUpLeft size={17} color="#8da0b2" /></div>
            <div className="quick-actions">
              <Link href="/deposits" className="quick-action" data-testid="quick-deposits"><WalletCards size={15} /> مراجعة دفعات</Link>
              <Link href="/users" className="quick-action" data-testid="quick-users"><Users size={15} /> دليل المستخدمين</Link>
              <Link href="/pricing" className="quick-action" data-testid="quick-pricing"><Percent size={15} /> تحديث التسعير</Link>
            </div>
          </div>
        </div>
        <div className="card wide-card">
          <div className="card-head"><div><h3>آخر النشاطات</h3><p>تغييرات وحركة المنصة في الوقت الفعلي</p></div><Link href="/settings" className="btn btn-ghost" data-testid="link-audit-log">سجل التدقيق <ChevronLeft size={14} /></Link></div>
          <div className="activity-list">{activities.slice(0, 4).map((activity) => <ActivityRow activity={activity} key={activity.id} />)}</div>
        </div>
        <div className="card wide-card">
          <div className="card-head"><div><h3>نبض الشبكة</h3><p>مؤشرات تشغيلية سريعة</p></div><ActivityIcon size={17} color="#8da0b2" /></div>
          <div className="detail-grid">
            <div className="detail-item"><small>متوسط زمن الاعتماد</small><strong>18 دقيقة</strong></div>
            <div className="detail-item"><small>نسبة النزاعات</small><strong>0.38%</strong></div>
            <div className="detail-item"><small>معدل الدفع للناشرين</small><strong>96.7%</strong></div>
            <div className="detail-item"><small>طلبات الدعم المفتوحة</small><strong>7 طلبات</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, value, trend, icon, warning }: { label: string; value: string; trend: string; icon: ReactNode; warning?: boolean }) {
  return <div className="card kpi-card"><div className="kpi-top"><span>{label}</span><span className="kpi-icon" style={warning ? { color: '#a2742d', background: '#fbf4e5' } : undefined}>{icon}</span></div><div className="kpi-value">{value}</div><div className={`kpi-trend ${warning ? 'neutral' : ''}`}>{warning ? '● ' : '↗ '}{trend}</div></div>;
}

function RevenueChart() {
  return <div className="chart-wrap"><svg className="chart-svg" viewBox="0 0 700 220" role="img" aria-label="مخطط الإيرادات"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2b69ae" stopOpacity=".2" /><stop offset="100%" stopColor="#2b69ae" stopOpacity="0" /></linearGradient></defs>{[35, 80, 125, 170].map((y) => <line className="chart-gridline" key={y} x1="34" x2="680" y1={y} y2={y} />)}<path className="chart-area" d="M34 170 C90 156 106 150 142 153 S205 120 242 132 S305 116 340 122 S399 78 438 102 S492 91 526 95 S573 45 610 65 S648 39 680 49 L680 180 L34 180Z" /><path className="chart-line" d="M34 170 C90 156 106 150 142 153 S205 120 242 132 S305 116 340 122 S399 78 438 102 S492 91 526 95 S573 45 610 65 S648 39 680 49" /><circle className="chart-point" cx="610" cy="65" r="4" /><text className="chart-label" x="34" y="207">١ يونيو</text><text className="chart-label" x="190" y="207">٧ يونيو</text><text className="chart-label" x="350" y="207">١٤ يونيو</text><text className="chart-label" x="510" y="207">٢١ يونيو</text><text className="chart-label" x="646" y="207">اليوم</text><text className="chart-label" x="659" y="31" textAnchor="end">٢٤.٨K</text></svg></div>;
}

function QueueRow({ icon, title, detail, count, href }: { icon: ReactNode; title: string; detail: string; count: number; href: string }) {
  return <Link href={href} className="queue-row" data-testid={`queue-${href.slice(1)}`}><div className="queue-meta"><span className="queue-icon">{icon}</span><div><strong>{title}</strong><small>{detail}</small></div></div><span className="queue-count">{count}</span></Link>;
}
function ActivityRow({ activity }: { activity: Activity }) {
  return <div className="activity-item" data-testid={`activity-${activity.id}`}><span className={`activity-pin ${activity.tone === 'gold' ? '' : activity.tone}`} /><div><strong>{activity.title}</strong><p>{activity.detail}</p></div><span className="activity-time">{activity.time}</span></div>;
}

function DepositsPage({ deposits, setDeposits, setUsers, addActivity, notify }: DataProps) {
  const [filter, setFilter] = useState<'all' | DepositStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Deposit | null>(null);
  const [noteDeposit, setNoteDeposit] = useState<Deposit | null>(null);
  const filtered = deposits.filter((deposit) => (filter === 'all' || deposit.status === filter) && `${deposit.userName} ${deposit.userEmail} ${deposit.txid}`.toLowerCase().includes(search.toLowerCase()));
  const updateDeposit = (id: string, status: DepositStatus, note = '') => {
    const deposit = deposits.find((item) => item.id === id);
    setDeposits((current) => current.map((item) => item.id === id ? { ...item, status, note } : item));
    if (deposit && status === 'approved') {
      setUsers((current) => current.map((user) => user.email === deposit.userEmail ? { ...user, balance: user.balance + deposit.amount } : user));
    }
    if (deposit) addActivity(status === 'approved' ? 'تم اعتماد إيداع' : 'تم رفض إيداع', `${deposit.userName} · ${formatMoney(deposit.amount)}`, status === 'approved' ? 'green' : 'gold');
    notify(status === 'approved' ? 'تم اعتماد الإيداع وتحديث الرصيد.' : 'تم رفض الإيداع مع حفظ الملاحظة.');
    setSelected(null); setNoteDeposit(null);
  };
  return <section className="content">
    <PageHeading title="الإيداعات" description="طابق إثباتات الدفع قبل إضافة الرصيد إلى حسابات المعلنين." actions={<button className="btn btn-subtle" onClick={() => { setFilter('pending'); notify('تم عرض الإيداعات قيد المراجعة.'); }} data-testid="button-pending-deposits"><Filter size={15} />قيد المراجعة ({deposits.filter((d) => d.status === 'pending').length})</button>} />
    <div className="card table-card">
      <div className="table-toolbar"><div className="toolbar-start"><div className="search-wrap"><Search size={15} /><input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم أو رقم العملية" aria-label="البحث في الإيداعات" data-testid="input-search-deposits" /></div></div><div className="toolbar-end"><div className="filter-tabs">{(['all', 'pending', 'approved', 'rejected'] as const).map((status) => <button key={status} className={`filter-tab ${filter === status ? 'active' : ''}`} onClick={() => setFilter(status)} data-testid={`filter-deposits-${status}`}>{status === 'all' ? 'الكل' : statusLabel(status)}</button>)}</div></div></div>
      {filtered.length === 0 ? <EmptyState icon={<WalletCards size={20} />} title="لا توجد إيداعات مطابقة" description="جرّب تغيير الفلتر أو عبارة البحث." /> : <div className="table-scroll"><table><thead><tr><th>المستخدم</th><th>المبلغ</th><th>الطريقة / الشبكة</th><th>رقم العملية</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead><tbody>{filtered.map((deposit) => <tr key={deposit.id} data-testid={`row-deposit-${deposit.id}`}><td><div className="user-cell"><div className="avatar">{initials(deposit.userName)}</div><div><strong>{deposit.userName}</strong><small>{deposit.userEmail}</small></div></div></td><td><strong className="number">{formatMoney(deposit.amount)}</strong></td><td>{deposit.method}<small style={{ display: 'block', color: '#8795a3', fontSize: 10 }}>{deposit.network}</small></td><td><span className="number">{deposit.txid}</span></td><td><span className={`status ${deposit.status}`}>{statusLabel(deposit.status)}</span></td><td>{deposit.createdAt}</td><td><div className="action-row"><button className="icon-btn" aria-label="عرض الإيداع" onClick={() => setSelected(deposit)} data-testid={`button-view-deposit-${deposit.id}`}><Eye size={15} /></button>{deposit.status === 'pending' && <><button className="icon-btn" aria-label="اعتماد الإيداع" onClick={() => updateDeposit(deposit.id, 'approved')} data-testid={`button-approve-deposit-${deposit.id}`}><Check size={15} color="#247e68" /></button><button className="icon-btn" aria-label="رفض الإيداع" onClick={() => setNoteDeposit(deposit)} data-testid={`button-reject-deposit-${deposit.id}`}><XCircle size={15} color="#ad622d" /></button></>}</div></td></tr>)}</tbody></table></div>}
    </div>
    {selected && <DepositDrawer deposit={selected} onClose={() => setSelected(null)} onApprove={() => updateDeposit(selected.id, 'approved')} onReject={() => { setSelected(null); setNoteDeposit(selected); }} onViewProof={() => notify('تم فتح معاينة إثبات الدفع.')} />}
    {noteDeposit && <NoteDialog title="رفض الإيداع" description={`أضف سبباً واضحاً لرفض إيداع ${noteDeposit.userName}. ستظهر الملاحظة في سجل العملية.`} onClose={() => setNoteDeposit(null)} onSubmit={(note) => updateDeposit(noteDeposit.id, 'rejected', note)} />}
  </section>;
}

function DepositDrawer({ deposit, onClose, onApprove, onReject, onViewProof }: { deposit: Deposit; onClose: () => void; onApprove: () => void; onReject: () => void; onViewProof: () => void }) {
  return <div className="drawer-backdrop" onClick={onClose}><aside className="drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><h3>تفاصيل الإيداع</h3><p>{deposit.id} · {deposit.createdAt}</p></div><button className="icon-btn" onClick={onClose} aria-label="إغلاق التفاصيل" data-testid="button-close-deposit-drawer"><X size={17} /></button></div><div className="drawer-section"><h4>صاحب العملية</h4><div className="user-cell"><div className="avatar">{initials(deposit.userName)}</div><div><strong>{deposit.userName}</strong><small>{deposit.userEmail}</small></div></div></div><div className="drawer-section"><h4>بيانات التحويل</h4><div className="detail-grid"><div className="detail-item"><small>المبلغ</small><strong className="number">{formatMoney(deposit.amount)}</strong></div><div className="detail-item"><small>الحالة</small><span className={`status ${deposit.status}`}>{statusLabel(deposit.status)}</span></div><div className="detail-item"><small>الطريقة</small><strong>{deposit.method}</strong></div><div className="detail-item"><small>الشبكة</small><strong>{deposit.network}</strong></div><div className="detail-item" style={{ gridColumn: '1/-1' }}><small>TXID</small><strong className="number">{deposit.txid}</strong></div></div></div><div className="drawer-section"><h4>إثبات الدفع</h4><div className="proof-box"><div><FileText size={25} /><div style={{ fontSize: 11, marginTop: 7 }}>{deposit.proofLabel}</div><button className="btn btn-ghost btn-small" onClick={onViewProof} data-testid="button-view-proof">عرض الملف <ArrowDownLeft size={13} /></button></div></div></div>{deposit.note && <div className="drawer-section"><h4>ملاحظة المراجعة</h4><div className="detail-item">{deposit.note}</div></div>}{deposit.status === 'pending' && <div className="drawer-actions"><button className="btn btn-primary" onClick={onApprove} data-testid="button-drawer-approve"><Check size={15} />اعتماد وإضافة الرصيد</button><button className="btn btn-subtle" onClick={onReject} data-testid="button-drawer-reject">رفض</button></div>}</aside></div>;
}

function NoteDialog({ title, description, onClose, onSubmit }: { title: string; description: string; onClose: () => void; onSubmit: (note: string) => void }) {
  const [note, setNote] = useState('');
  return <div className="dialog-backdrop"><div className="dialog-wrap"><div className="dialog"><h3>{title}</h3><p>{description}</p><textarea className="input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="اكتب الملاحظة هنا..." aria-label="ملاحظة العملية" data-testid="textarea-action-note" /><div className="dialog-actions"><button className="btn btn-danger" onClick={() => onSubmit(note || 'لم يتم تقديم سبب إضافي.')} data-testid="button-confirm-note">تأكيد الرفض</button><button className="btn btn-subtle" onClick={onClose} data-testid="button-cancel-note">إلغاء</button></div></div></div></div>;
}

function UsersPage({ users, setUsers, roleFilter, notify, addActivity }: DataProps & { roleFilter?: Role }) {
  const [filter, setFilter] = useState<'all' | UserStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const [confirm, setConfirm] = useState<{ user: User; action: 'delete' | 'block' } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const roleTitle = roleFilter === 'publisher' ? 'الناشرون' : roleFilter === 'advertiser' ? 'المعلنون' : 'دليل المستخدمين';
  const scoped = users.filter((user) => !roleFilter || user.role === roleFilter);
  const filtered = scoped.filter((user) => (filter === 'all' || user.status === filter) && `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()));
  const updateUser = (id: string, update: Partial<User>, message: string) => {
    setUsers((current) => current.map((user) => user.id === id ? { ...user, ...update } : user));
    notify(message);
    const changed = users.find((user) => user.id === id);
    if (changed) addActivity(message, `${changed.name} · ${roleLabel(changed.role)}`);
    if (selected?.id === id) setSelected((current) => current ? { ...current, ...update } : current);
  };
  const performConfirm = () => {
    if (!confirm) return;
    if (confirm.action === 'delete') { setUsers((current) => current.filter((user) => user.id !== confirm.user.id)); notify('تم حذف الحساب نهائياً.'); }
    else updateUser(confirm.user.id, { status: 'blocked' }, 'تم حظر الحساب.');
    setConfirm(null); setSelected(null);
  };
  return <section className="content">
    <PageHeading title={roleTitle} description={roleFilter === 'publisher' ? 'راجع جودة المواقع وأدر مستحقات الناشرين.' : roleFilter === 'advertiser' ? 'تابع حسابات المعلنين وحالة حملاتهم.' : 'مركز موحد للبحث وإدارة كل حسابات الشبكة.'} actions={<button className="btn btn-primary" onClick={() => setCreateOpen(true)} data-testid="button-add-user"><Plus size={15} />إضافة حساب</button>} />
    <div className="card table-card">
      <div className="table-toolbar"><div className="toolbar-start"><div className="search-wrap"><Search size={15} /><input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم أو البريد الإلكتروني" aria-label="البحث في المستخدمين" data-testid={`input-search-${roleFilter ?? 'users'}`} /></div></div><div className="toolbar-end"><div className="filter-tabs">{(['all', 'active', 'pending', 'suspended', 'blocked'] as const).map((status) => <button key={status} className={`filter-tab ${filter === status ? 'active' : ''}`} onClick={() => setFilter(status)} data-testid={`filter-users-${status}`}>{status === 'all' ? 'الكل' : statusLabel(status)}</button>)}</div></div></div>
      {filtered.length === 0 ? <EmptyState icon={<Users size={20} />} title="لا توجد حسابات مطابقة" description="لا يوجد مستخدمون بهذه المواصفات حالياً." /> : <div className="table-scroll"><table><thead><tr><th>الحساب</th><th>النوع</th><th>الحالة</th><th>الرصيد</th><th>المواقع / الحملات</th><th>آخر نشاط</th><th>إجراءات</th></tr></thead><tbody>{filtered.map((user) => <tr key={user.id} data-testid={`row-user-${user.id}`}><td><div className="user-cell"><div className="avatar">{initials(user.name)}</div><div><strong>{user.name}</strong><small>{user.email}</small></div></div></td><td>{roleLabel(user.role)}</td><td><span className={`status ${user.status}`}>{statusLabel(user.status)}</span></td><td><strong className="number">{formatMoney(user.balance)}</strong></td><td>{user.sitesOrCampaignsCount}</td><td>{user.lastActivity}</td><td><div className="action-row"><button className="icon-btn" aria-label="عرض الحساب" onClick={() => setSelected(user)} data-testid={`button-view-user-${user.id}`}><Eye size={15} /></button>{user.status === 'pending' && <button className="icon-btn" aria-label="اعتماد الحساب" onClick={() => updateUser(user.id, { status: 'active' }, 'تم اعتماد الحساب.')} data-testid={`button-approve-user-${user.id}`}><Check size={15} color="#247e68" /></button>}{user.status !== 'blocked' && <button className="icon-btn" aria-label="حظر الحساب" onClick={() => setConfirm({ user, action: 'block' })} data-testid={`button-block-user-${user.id}`}><Blocks size={15} color="#ad622d" /></button>}<button className="icon-btn" aria-label="حذف الحساب" onClick={() => setConfirm({ user, action: 'delete' })} data-testid={`button-delete-user-${user.id}`}><Trash2 size={15} color="#a8423e" /></button></div></td></tr>)}</tbody></table></div>}
    </div>
    {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} onUpdate={(update, message) => updateUser(selected.id, update, message)} onBlock={() => setConfirm({ user: selected, action: 'block' })} />}
    {confirm && <ConfirmDialog title={confirm.action === 'delete' ? 'حذف الحساب؟' : 'حظر الحساب؟'} description={confirm.action === 'delete' ? `سيتم حذف حساب ${confirm.user.name} وجميع بياناته من هذا المركز.` : `لن يتمكن ${confirm.user.name} من تسجيل الدخول أو تنفيذ عمليات جديدة.`} confirmLabel={confirm.action === 'delete' ? 'حذف نهائياً' : 'حظر الحساب'} danger onClose={() => setConfirm(null)} onConfirm={performConfirm} />}
    {createOpen && <CreateUserDialog defaultRole={roleFilter} onClose={() => setCreateOpen(false)} onSubmit={(newUser) => { setUsers((current) => [newUser, ...current]); notify('تم إنشاء الحساب وإرساله إلى قائمة المراجعة.'); addActivity('تم إنشاء حساب جديد', `${newUser.name} · ${roleLabel(newUser.role)}`); setCreateOpen(false); }} />}
  </section>;
}

function CreateUserDialog({ defaultRole, onClose, onSubmit }: { defaultRole?: Role; onClose: () => void; onSubmit: (user: User) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(defaultRole ?? 'advertiser');
  const canSubmit = name.trim().length > 2 && email.includes('@');
  return <div className="dialog-backdrop"><div className="dialog-wrap"><div className="dialog"><h3>إضافة حساب جديد</h3><p>سيظهر الحساب بحالة قيد المراجعة حتى يتم التحقق من بياناته.</p><div className="form-grid"><div className="field field-full"><label>اسم الحساب</label><input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: شركة روافد" autoFocus data-testid="input-new-user-name" /></div><div className="field field-full"><label>البريد الإلكتروني</label><input className="input" value={email} onChange={(event) => setEmail(event.target.value)} type="email" dir="ltr" placeholder="team@company.com" data-testid="input-new-user-email" /></div><div className="field field-full"><label>نوع الحساب</label><select className="select" value={role} onChange={(event) => setRole(event.target.value as Role)} data-testid="select-new-user-role"><option value="advertiser">معلن</option><option value="publisher">ناشر</option></select></div></div><div className="dialog-actions"><button className="btn btn-primary" disabled={!canSubmit} onClick={() => onSubmit({ id: `usr-${Date.now()}`, name, email, role, status: 'pending', joinedAt: 'اليوم', balance: 0, sitesOrCampaignsCount: 0, lastActivity: 'الآن' })} data-testid="button-submit-new-user"><Check size={15} />إنشاء الحساب</button><button className="btn btn-subtle" onClick={onClose} data-testid="button-cancel-new-user">إلغاء</button></div></div></div></div>;
}

function UserDrawer({ user, onClose, onUpdate, onBlock }: { user: User; onClose: () => void; onUpdate: (update: Partial<User>, message: string) => void; onBlock: () => void }) {
  const [balance, setBalance] = useState('');
  const [suspend, setSuspend] = useState(user.status === 'suspended');
  return <div className="drawer-backdrop" onClick={onClose}><aside className="drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><h3>ملف الحساب</h3><p>{roleLabel(user.role)} · انضم في {user.joinedAt}</p></div><button className="icon-btn" onClick={onClose} aria-label="إغلاق الملف" data-testid="button-close-user-drawer"><X size={17} /></button></div><div className="drawer-section"><div className="user-cell"><div className="avatar" style={{ width: 47, height: 47 }}>{initials(user.name)}</div><div><strong style={{ fontSize: 15 }}>{user.name}</strong><small>{user.email}</small><span className={`status ${user.status}`} style={{ marginTop: 7 }}>{statusLabel(user.status)}</span></div></div></div><div className="drawer-section"><h4>ملخص الحساب</h4><div className="detail-grid"><div className="detail-item"><small>الرصيد الحالي</small><strong className="number">{formatMoney(user.balance)}</strong></div><div className="detail-item"><small>{user.role === 'publisher' ? 'المواقع' : 'الحملات'}</small><strong>{user.sitesOrCampaignsCount}</strong></div><div className="detail-item" style={{ gridColumn: '1/-1' }}><small>آخر نشاط</small><strong>{user.lastActivity}</strong></div></div></div><div className="drawer-section"><h4>تعديل الرصيد</h4><div style={{ display: 'flex', gap: 8 }}><input className="input" value={balance} onChange={(event) => setBalance(event.target.value)} placeholder="مثال: 250" type="number" aria-label="قيمة تعديل الرصيد" data-testid="input-balance-adjustment" /><button className="btn btn-subtle" onClick={() => { const amount = Number(balance); if (amount) { onUpdate({ balance: user.balance + amount }, 'تم تعديل الرصيد بنجاح.'); setBalance(''); } }} data-testid="button-adjust-balance">حفظ التعديل</button></div><small style={{ display: 'block', color: '#8795a3', marginTop: 7, fontSize: 10 }}>استخدم رقماً سالباً للخصم.</small></div><div className="drawer-section"><h4>حالة الوصول</h4><div className="setting-line"><div><strong>تعليق الحساب مؤقتاً</strong><small>يوقف النشاط دون حذف البيانات.</small></div><button className={`switch ${suspend ? 'on' : ''}`} onClick={() => { setSuspend(!suspend); onUpdate({ status: !suspend ? 'suspended' : 'active' }, !suspend ? 'تم تعليق الحساب.' : 'تم إعادة تفعيل الحساب.'); }} aria-label="تبديل تعليق الحساب" data-testid="switch-suspend-user"><span /></button></div></div><div className="drawer-actions"><button className="btn btn-subtle" onClick={onBlock} data-testid="button-drawer-block"><Blocks size={15} />حظر الحساب</button><button className="btn btn-ghost" onClick={() => onUpdate({ status: 'active' }, 'تمت إعادة تفعيل الحساب.')} data-testid="button-reactivate-user">إعادة تفعيل</button></div></aside></div>;
}

function PricingPage({ pricing, setPricing, notify, addActivity }: DataProps) {
  const [draft, setDraft] = useState(pricing);
  useEffect(() => setDraft(pricing), [pricing]);
  const update = (index: number, key: 'defaultRate' | 'publisherShare', value: string) => setDraft((current) => current.map((rule, ruleIndex) => ruleIndex === index ? { ...rule, [key]: Number(value) } : rule).map((rule) => ({ ...rule, platformShare: 100 - rule.publisherShare })));
  const save = () => { const updated = draft.map((rule) => ({ ...rule, updatedAt: 'الآن' })); setPricing(updated); addActivity('تم تحديث قواعد التسعير', 'تعديلات الأسعار ونسب المشاركة', 'gold'); notify('تم حفظ إعدادات التسعير.'); };
  return <section className="content"><PageHeading title="التسعير" description="اضبط افتراضيات السوق قبل تطبيقها على الحملات الجديدة." actions={<button className="btn btn-primary" onClick={save} data-testid="button-save-pricing"><Check size={15} />حفظ التغييرات</button>} /><div className="settings-grid"><div className="card settings-card"><div className="card-head"><div><h3>قواعد الأسعار</h3><p>يمكن تعديل السعر الافتراضي ونسبة الناشر لكل صيغة.</p></div><Percent size={18} color="#c9983e" /></div><div className="price-table"><div className="price-row header"><span>الصيغة</span><span>النموذج</span><span>السعر</span><span>حصة الناشر</span><span>حصة المنصة</span></div>{draft.map((rule, index) => <div className="price-row" key={rule.format} data-testid={`row-pricing-${index}`}><strong className="price-format">{rule.format}</strong><span data-label="النموذج">{rule.pricingModel}</span><label className="price-field" data-label="السعر"><input className="price-input" type="number" step="0.01" value={rule.defaultRate} onChange={(event) => update(index, 'defaultRate', event.target.value)} aria-label={`السعر الافتراضي ${rule.format}`} data-testid={`input-rate-${index}`} /></label><label className="price-field share-field" data-label="حصة الناشر"><span className="share-input-wrap"><input className="price-input" type="number" value={rule.publisherShare} onChange={(event) => update(index, 'publisherShare', event.target.value)} aria-label={`حصة الناشر ${rule.format}`} data-testid={`input-publisher-share-${index}`} /><span>%</span></span></label><strong className="price-field price-share" data-label="حصة المنصة">{rule.platformShare}%</strong></div>)}</div><div style={{ marginTop: 15, fontSize: 10, color: '#8795a3' }}>آخر تحديث محفوظ: {pricing[0]?.updatedAt}</div></div><div className="side-stack"><div className="card settings-card"><div className="card-head"><div><h3>ملخص المشاركة</h3><p>متوسط توزيع الإيراد عبر الصيغ.</p></div><CircleDollarSign size={18} color="#2b947d" /></div><div className="detail-grid"><div className="detail-item"><small>متوسط حصة الناشر</small><strong>66.2%</strong></div><div className="detail-item"><small>متوسط حصة المنصة</small><strong>33.8%</strong></div><div className="detail-item"><small>أعلى صيغة</small><strong>بانر مميز</strong></div><div className="detail-item"><small>نطاق الأسعار</small><strong>0.08 — 7.50</strong></div></div></div><div className="card settings-card"><div className="card-head"><div><h3>ملاحظة تشغيلية</h3><p>تظل الأسعار المتفق عليها للحملات الحالية دون تغيير.</p></div><ShieldCheck size={18} color="#2866ad" /></div><p style={{ lineHeight: 1.9, fontSize: 11, color: '#687b8d', marginBottom: 0 }}>تؤثر هذه القواعد على الحملات الجديدة فقط. راجع النسب قبل مواسم الإنفاق المرتفع.</p></div></div></div></section>;
}

function SettingsPage({ notify }: DataProps) {
  const [profile, setProfile] = useStoredState('adzora-profile', { name: 'مدير المنصة', email: 'admin@adzora.network', phone: '+966 55 341 2088' });
  const [alerts, setAlerts] = useStoredState('adzora-alerts', { deposits: true, accounts: true, weekly: false });
  const [notes, setNotes] = useStoredState('adzora-safety-notes', 'لا تعتمد أي إثبات دفع قبل مطابقة رقم العملية والشبكة والمبلغ. الحسابات ذات النشاط غير المعتاد تحتاج مراجعة يدوية.');
  const [draft, setDraft] = useState(profile);
  const updateAlert = (key: keyof typeof alerts) => setAlerts((current) => ({ ...current, [key]: !current[key] }));
  return <section className="content"><PageHeading title="الإعدادات" description="اضبط حسابك وإشعارات التشغيل وقواعد السلامة في مكان واحد." actions={<button className="btn btn-primary" onClick={() => { setProfile(draft); notify('تم حفظ بيانات الملف الشخصي.'); }} data-testid="button-save-profile"><Check size={15} />حفظ الإعدادات</button>} /><div className="settings-grid"><div className="grid"><div className="card settings-card"><div className="card-head"><div><h3>ملف المدير</h3><p>هذه البيانات تظهر داخل مساحة الإدارة فقط.</p></div><UserRound size={18} color="#2866ad" /></div><div className="form-grid"><div className="field"><label>الاسم</label><input className="input" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} data-testid="input-profile-name" /></div><div className="field"><label>البريد الإلكتروني</label><input className="input" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} type="email" dir="ltr" data-testid="input-profile-email" /></div><div className="field"><label>رقم الهاتف</label><input className="input" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} dir="ltr" data-testid="input-profile-phone" /></div></div></div><div className="card settings-card"><div className="card-head"><div><h3>تفضيلات الإشعارات</h3><p>اختر ما يصل إلى بريدك داخل المركز.</p></div><Bell size={18} color="#c9983e" /></div><div className="setting-line"><div><strong>إيداعات جديدة</strong><small>تنبيه فوري عند رفع إثبات دفع.</small></div><button className={`switch ${alerts.deposits ? 'on' : ''}`} onClick={() => updateAlert('deposits')} aria-label="إشعارات الإيداعات" data-testid="switch-alert-deposits"><span /></button></div><div className="setting-line"><div><strong>طلبات حسابات جديدة</strong><small>تنبيه عند تسجيل ناشر أو معلن.</small></div><button className={`switch ${alerts.accounts ? 'on' : ''}`} onClick={() => updateAlert('accounts')} aria-label="إشعارات الحسابات" data-testid="switch-alert-accounts"><span /></button></div><div className="setting-line"><div><strong>ملخص أسبوعي</strong><small>أداء الشبكة والأرقام المهمة كل أحد.</small></div><button className={`switch ${alerts.weekly ? 'on' : ''}`} onClick={() => updateAlert('weekly')} aria-label="الملخص الأسبوعي" data-testid="switch-alert-weekly"><span /></button></div></div></div><div className="side-stack"><div className="card settings-card"><div className="card-head"><div><h3>ملاحظات السلامة</h3><p>مرجع قصير لفريق التشغيل.</p></div><ShieldCheck size={18} color="#2b947d" /></div><textarea className="input" value={notes} onChange={(event) => setNotes(event.target.value)} aria-label="ملاحظات السلامة" data-testid="textarea-safety-notes" /><button className="btn btn-subtle" style={{ marginTop: 10 }} onClick={() => notify('تم حفظ ملاحظات السلامة.')} data-testid="button-save-safety-notes"><Check size={14} />حفظ الملاحظة</button></div><AuditPreview notify={notify} /></div></div></section>;
}

function AuditPreview({ notify }: { notify: DataProps['notify'] }) {
  const rows = [{ action: 'تحديث قاعدة التسعير', by: 'مدير المنصة', time: 'اليوم، 09:14' }, { action: 'اعتماد إيداع dep-03', by: 'مدير المنصة', time: 'أمس، 15:22' }, { action: 'تعليق حساب رائد منصور', by: 'مدير المنصة', time: 'أمس، 16:05' }];
  return <div className="card settings-card"><div className="card-head"><div><h3>سجل التدقيق</h3><p>آخر تغييرات حساسة على المنصة.</p></div><FileText size={18} color="#8da0b2" /></div><div className="activity-list">{rows.map((row, index) => <div className="activity-item" key={row.action}><span className={`activity-pin ${index === 1 ? 'green' : 'blue'}`} /><div><strong>{row.action}</strong><p>{row.by}</p></div><span className="activity-time">{row.time}</span></div>)}</div><button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => notify('سجل التدقيق الكامل متاح ضمن صلاحيات المالك.')} data-testid="button-view-audit">عرض السجل الكامل <ChevronLeft size={14} /></button></div>;
}

function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="empty-state" data-testid="empty-state"><div className="empty-icon">{icon}</div><strong>{title}</strong><p>{description}</p></div>;
}
function ConfirmDialog({ title, description, confirmLabel, danger, onClose, onConfirm }: { title: string; description: string; confirmLabel: string; danger?: boolean; onClose: () => void; onConfirm: () => void }) {
  return <div className="dialog-backdrop"><div className="dialog-wrap"><div className="dialog"><h3>{title}</h3><p>{description}</p><div className="dialog-actions"><button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} data-testid="button-confirm-dialog">{confirmLabel}</button><button className="btn btn-subtle" onClick={onClose} data-testid="button-cancel-dialog">إلغاء</button></div></div></div></div>;
}
function NotFound() {
  return <section className="content"><div className="card empty-state" style={{ marginTop: 50 }}><div className="empty-icon"><XCircle size={20} /></div><strong>الصفحة غير موجودة</strong><p>عد إلى <Link href="/" style={{ color: '#2866ad', fontWeight: 700 }}>نظرة عامة</Link> للمتابعة.</p></div></section>;
}

export default App;