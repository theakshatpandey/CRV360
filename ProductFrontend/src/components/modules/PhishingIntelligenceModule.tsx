import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import {
  Shield,
  Mail,
  AlertTriangle,
  Globe,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  Search,
  Flag,
  Activity,
  UserX,
  Lock,
  Loader,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  Inbox,
  FileCode,
  Terminal,
  AlertOctagon,
  Ban,
  Play,
  Pause,
  RotateCcw,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  List,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Plus,
  CheckCircle2,
  Users,
  Radio,
  Zap,
  FileText,
  Paperclip,
  Code,
  Server,
  User,
  Calendar,
  Clock,
  MousePointer,
  Siren,
  Megaphone,
  Brain
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend
} from 'recharts';

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = "/api/phishing-intelligence";

// ============================================
// INTERFACES & TYPES
// ============================================

type ThreatStatus = 'Pending' | 'Analyzed' | 'Malicious' | 'Safe' | 'Quarantined';
type DomainStatus = 'Active' | 'Takedown Requested' | 'Offline' | 'Whitelisted';
type SimulationStatus = 'Scheduled' | 'Running' | 'Completed' | 'Draft' | 'Paused';

interface Attachment {
  name: string;
  size: string;
  type: string;
  scan_status: 'Clean' | 'Malware' | 'Suspicious';
  hash: string;
}

interface SuspiciousEmail {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  received_at: string;
  risk_score: number;
  status: ThreatStatus;
  tags: string[];
  attachments: Attachment[];
  has_links: boolean;
  body_text: string;
  body_html: string;
  headers: Record<string, string>;
  analysis_report: {
    spf: 'pass' | 'fail' | 'neutral';
    dkim: 'pass' | 'fail' | 'neutral';
    dmarc: 'pass' | 'fail' | 'neutral';
    malicious_urls: string[];
    ai_verdict: string;
    threat_indicators: string[];
  };
}

interface DomainReputation {
  id: string;
  domain: string;
  reputation_score: number; // 0-100 (100 is safe)
  category: string;
  age_days: number;
  registrar: string;
  hosting_provider: string;
  ip_address: string;
  country: string;
  detected_at: string;
  status: DomainStatus;
  mx_records: boolean;
  ssl_valid: boolean;
  whois_data?: {
    created_date: string;
    expires_date: string;
    registrant_org: string;
  };
  screenshot_url?: string;
}

interface PhishingSimulation {
  id: string;
  name: string;
  template: string;
  target_group: string;
  sent_count: number;
  open_rate: number;
  click_rate: number;
  report_rate: number;
  status: SimulationStatus;
  start_date: string;
  end_date?: string;
  departments_targeted: string[];
}

interface PhishingStats {
  emails_scanned_24h: number;
  threats_blocked_24h: number;
  user_reports_24h: number;
  avg_takedown_time: string;
  active_simulations: number;
  click_rate_trend: number;
  top_target_dept: string;
}

interface TargetedUser {
  id: number;
  name: string;
  email: string;
  role: string;
  riskScore: number;
  targetingCount: number;
  clicks: number;
  reports: number;
  suggestedAction: string;
  department: string;
  isExecutive: boolean;
}

// ============================================
// MOCK DATA GENERATORS (EXTENSIVE)
// ============================================

const generateMockEmails = (count: number): SuspiciousEmail[] => {
  const statuses: ThreatStatus[] = ['Pending', 'Analyzed', 'Malicious', 'Safe', 'Quarantined'];
  const subjects = [
    "URGENT: Password Expiry Notice", "Invoice #99238 Payment Overdue",
    "Package Delivery Failed", "CEO Request: Gift Cards Needed",
    "SharePoint File Shared", "Security Alert: Unusual Login",
    "HR: Annual Benefits", "Zoom: You missed a meeting"
  ];

  return Array.from({ length: count }).map((_, i) => ({
    id: `MAIL-${1000 + i}`,
    subject: subjects[i % subjects.length],
    sender: i % 3 === 0 ? `attacker${i}@bad-domain.com` : `support@legit.net`,
    recipient: `user${i}@company.com`,
    received_at: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString(),
    risk_score: Math.floor(Math.random() * 100),
    status: ['Pending', 'Analyzed', 'Malicious', 'Safe'][Math.floor(Math.random() * 4)] as ThreatStatus,
    tags: i % 2 === 0 ? ['Credential Harvesting'] : ['Malware', 'Spoofing'],
    attachments: i % 5 === 0 ? [{ name: "Invoice.pdf", size: "450KB", type: "application/pdf", scan_status: "Malware", hash: "a1b2c3d4e5" }] : [],
    has_links: true,
    body_text: "Please click the link below to verify your account immediately. Failure to do so will result in account suspension.",
    body_html: `<div><p>Please click the link below to verify your account immediately.</p><br/><a href="http://evil.com">Verify Now</a></div>`,
    headers: {
      "Return-Path": "<bounce@bad.com>",
      "X-Mailer": "PHP/7.4",
      "Received": "from mail.bad.com ([192.168.1.1])"
    },
    analysis_report: {
      spf: Math.random() > 0.5 ? 'fail' : 'pass',
      dkim: Math.random() > 0.5 ? 'fail' : 'pass',
      dmarc: 'fail',
      malicious_urls: ["http://evil.com/login", "http://fake-login.net/auth"],
      ai_verdict: "High confidence phishing attempt using brand impersonation.",
      threat_indicators: ["Newly Registered Domain", "Urgency in Subject", "Spoofed Branding"]
    }
  }));
};

const generateMockDomains = (count: number): DomainReputation[] => {
  const registrars = ["GoDaddy", "NameCheap", "Tucows", "Google"];
  return Array.from({ length: count }).map((_, i) => ({
    id: `DOM-${500 + i}`,
    domain: `secure-login-${i}.com`,
    reputation_score: Math.floor(Math.random() * 40),
    category: "Credential Phishing",
    age_days: Math.floor(Math.random() * 30),
    registrar: registrars[i % 3],
    hosting_provider: "DigitalOcean",
    ip_address: "192.168.1.1",
    country: "RU",
    detected_at: new Date().toISOString(),
    status: ['Active', 'Offline'][Math.floor(Math.random() * 2)] as DomainStatus,
    mx_records: true,
    ssl_valid: true,
    whois_data: {
      created_date: "2024-12-01",
      expires_date: "2025-12-01",
      registrant_org: "Privacy Protected"
    }
  }));
};

const MOCK_SIMULATIONS: PhishingSimulation[] = [
  {
    id: "SIM-001", name: "Q4 Credential Harvest", template: "Microsoft 365 Reset", target_group: "All Employees",
    sent_count: 450, open_rate: 68, click_rate: 12, report_rate: 45, status: "Completed",
    start_date: "2024-11-01", departments_targeted: ["Sales", "HR", "Finance"]
  },
  {
    id: "SIM-002", name: "Finance Invoice Fraud", template: "Urgent Wire", target_group: "Finance",
    sent_count: 25, open_rate: 85, click_rate: 4, report_rate: 80, status: "Running",
    start_date: "2024-12-10", departments_targeted: ["Finance"]
  },
  {
    id: "SIM-003", name: "Holiday Gift Card Scam", template: "Amazon Reward", target_group: "Marketing",
    sent_count: 150, open_rate: 0, click_rate: 0, report_rate: 0, status: "Scheduled",
    start_date: "2024-12-25", departments_targeted: ["Marketing"]
  }
];

const TARGETED_USERS: TargetedUser[] = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@company.com', role: 'CFO', riskScore: 8.7, targetingCount: 23, clicks: 3, reports: 18, suggestedAction: 'Enroll in executive protection', department: 'Finance', isExecutive: true },
  { id: 2, name: 'Michael Chen', email: 'm.chen@company.com', role: 'VP Eng', riskScore: 7.8, targetingCount: 19, clicks: 2, reports: 15, suggestedAction: 'Advanced training assigned', department: 'Engineering', isExecutive: true },
  { id: 3, name: 'Amit Patel', email: 'a.patel@company.com', role: 'Accountant', riskScore: 7.2, targetingCount: 17, clicks: 4, reports: 11, suggestedAction: 'Review wire protocols', department: 'Finance', isExecutive: false },
  { id: 4, name: 'Lisa Ray', email: 'l.ray@company.com', role: 'HR Lead', riskScore: 6.5, targetingCount: 14, clicks: 1, reports: 20, suggestedAction: 'Monitor', department: 'HR', isExecutive: false }
];

const MOCK_STATS: PhishingStats = {
  emails_scanned_24h: 12450,
  threats_blocked_24h: 342,
  user_reports_24h: 58,
  avg_takedown_time: "4.5 Hours",
  active_simulations: 1,
  click_rate_trend: -2.5,
  top_target_dept: "Finance"
};

const CHART_DATA_TRENDS = [
  { day: 'Mon', scanned: 4000, blocked: 120, reported: 15 },
  { day: 'Tue', scanned: 3500, blocked: 98, reported: 22 },
  { day: 'Wed', scanned: 4200, blocked: 145, reported: 18 },
  { day: 'Thu', scanned: 4800, blocked: 160, reported: 30 },
  { day: 'Fri', scanned: 3900, blocked: 110, reported: 25 },
  { day: 'Sat', scanned: 1200, blocked: 45, reported: 5 },
  { day: 'Sun', scanned: 900, blocked: 30, reported: 3 },
];

const CHART_DATA_VECTORS = [
  { name: 'Credential Harvesting', value: 45, color: '#ef4444' },
  { name: 'Malware Delivery', value: 25, color: '#f97316' },
  { name: 'BEC (CEO Fraud)', value: 15, color: '#eab308' },
  { name: 'Extortion/Scams', value: 15, color: '#3b82f6' }
];

// ============================================
// MAIN COMPONENT DEFINITION
// ============================================

export function PhishingIntelligenceModule({ onModuleChange }: any = {}) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // Core Data
  const [stats, setStats] = useState<PhishingStats>(MOCK_STATS);
  const [emails, setEmails] = useState<SuspiciousEmail[]>([]);
  const [domains, setDomains] = useState<DomainReputation[]>([]);
  const [simulations, setSimulations] = useState<PhishingSimulation[]>(MOCK_SIMULATIONS);

  // Filters & Pagination
  const [emailSearch, setEmailSearch] = useState("");
  const [domainSearch, setDomainSearch] = useState("");
  const [emailPage, setEmailPage] = useState(1);
  const itemsPerPage = 10;
  const [filterRiskLevel, setFilterRiskLevel] = useState("all");

  // Modals & Drawers
  const [selectedEmail, setSelectedEmail] = useState<SuspiciousEmail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState("");
  const [isCreateSimOpen, setIsCreateSimOpen] = useState(false);
  const [newSimInput, setNewSimInput] = useState({ name: "", template: "Microsoft 365", target: "All" });

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    // Initial Data Load Simulation
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulating network delay
        setTimeout(() => {
          setEmails(generateMockEmails(100));
          setDomains(generateMockDomains(50));
          setIsLoading(false);
        }, 1200);
      } catch (e) {
        console.error("Failed to load data", e);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const filteredEmails = useMemo(() => {
    return emails.filter(e => {
      const matchesSearch = e.subject.toLowerCase().includes(emailSearch.toLowerCase()) ||
        e.sender.toLowerCase().includes(emailSearch.toLowerCase());
      const matchesRisk = filterRiskLevel === "all" ? true :
        filterRiskLevel === "critical" ? e.risk_score >= 90 :
          filterRiskLevel === "high" ? e.risk_score >= 70 :
            filterRiskLevel === "medium" ? e.risk_score >= 40 :
              e.risk_score < 40;
      return matchesSearch && matchesRisk;
    });
  }, [emails, emailSearch, filterRiskLevel]);

  const paginatedEmails = useMemo(() => {
    const start = (emailPage - 1) * itemsPerPage;
    return filteredEmails.slice(start, start + itemsPerPage);
  }, [filteredEmails, emailPage]);

  const filteredDomains = useMemo(() => {
    return domains.filter(d => d.domain.toLowerCase().includes(domainSearch.toLowerCase()));
  }, [domains, domainSearch]);

  // ============================================
  // ACTION HANDLERS
  // ============================================

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setEmails(generateMockEmails(100)); // Refresh with new random data
      setIsLoading(false);
      alert("Dashboard refreshed with latest intelligence.");
    }, 1000);
  };

  const handleExportReport = () => {
    const headers = "ID,Subject,Sender,Recipient,Risk Score,Status\n";
    const rows = emails.map(e => `${e.id},"${e.subject}",${e.sender},${e.recipient},${e.risk_score},${e.status}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `phishing_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTakedownRequest = (domainId: string) => {
    setDomains(prev => prev.map(d => d.id === domainId ? { ...d, status: 'Takedown Requested' } : d));
    alert(`Legal takedown request sent to registrar for domain ${domainId}.`);
  };

  const handleAddDomain = () => {
    if (!newDomainInput) return;
    const newDom: DomainReputation = {
      id: `DOM-${Math.floor(Math.random() * 10000)}`,
      domain: newDomainInput,
      reputation_score: 50,
      category: "Manual Entry",
      age_days: 0,
      registrar: "Unknown",
      hosting_provider: "Pending Scan",
      ip_address: "Pending",
      country: "Unknown",
      detected_at: new Date().toISOString(),
      status: 'Active',
      mx_records: false,
      ssl_valid: false
    };
    setDomains([newDom, ...domains]);
    setNewDomainInput("");
    setIsAddDomainOpen(false);
    alert(`Domain ${newDomainInput} added to surveillance list.`);
  };

  const handleCreateSimulation = () => {
    if (!newSimInput.name) return;
    const newSim: PhishingSimulation = {
      id: `SIM-${Math.floor(Math.random() * 1000)}`,
      name: newSimInput.name,
      template: newSimInput.template,
      target_group: newSimInput.target,
      sent_count: 0, open_rate: 0, click_rate: 0, report_rate: 0,
      status: "Scheduled",
      start_date: new Date().toISOString().split('T')[0],
      departments_targeted: [newSimInput.target]
    };
    setSimulations([...simulations, newSim]);
    setIsCreateSimOpen(false);
    setNewSimInput({ name: "", template: "Microsoft 365", target: "All" });
    alert("Phishing simulation campaign created successfully.");
  };

  const toggleSimulationStatus = (id: string) => {
    setSimulations(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = s.status === 'Running' ? 'Paused' : 'Running';
        alert(`Simulation ${s.name} is now ${newStatus}`);
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const handleQuarantineEmail = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, status: 'Quarantined' } : e));
    setIsDetailOpen(false);
    alert(`Email ${id} moved to secure quarantine.`);
  };

  const handleMarkSafe = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, status: 'Safe', risk_score: 0 } : e));
    setIsDetailOpen(false);
    alert(`Email ${id} released to user inbox.`);
  };

  // --- Helpers ---
  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 50) return "text-orange-600";
    return "text-green-600";
  };

  const getRiskBadgeColor = (score: number) => {
    if (score >= 90) return "destructive";
    if (score >= 70) return "default";
    if (score >= 40) return "secondary";
    return "outline";
  };

  // ============================================
  // RENDER
  // ============================================

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center flex-col gap-4">
        <Loader className="h-16 w-16 animate-spin text-blue-600" />
        <h2 className="text-xl font-semibold">Initializing Phishing Defense Grid...</h2>
        <p className="text-muted-foreground">Connecting to Threat Feeds & Analyzing Emails</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phishing Intelligence Center</h1>
          <p className="text-muted-foreground">
            Advanced email threat detection, domain monitoring, and user simulation platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Intelligence
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Scanned (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emails_scanned_24h.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% volume spike</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.threats_blocked_24h}</div>
            <p className="text-xs text-muted-foreground">32 auto-quarantined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Reports</CardTitle>
            <Flag className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.user_reports_24h}</div>
            <p className="text-xs text-muted-foreground">Avg response: 12m</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate (Sims)</CardTitle>
            <PieChartIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" /> 2.5% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TABS CONFIGURATION */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="inbox" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Suspicious Inbox</TabsTrigger>
          <TabsTrigger value="domains" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Domain Watchlist</TabsTrigger>
          <TabsTrigger value="simulation" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Simulations</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-4 p-4 border rounded-lg bg-white dark:bg-slate-950">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {/* Main Chart */}
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>Threat Detection Trend</CardTitle>
                <CardDescription>Volume of scanned vs blocked emails over the last 7 days.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={CHART_DATA_TRENDS}>
                    <defs>
                      <linearGradient id="colorScanned" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="scanned" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScanned)" name="Scanned" />
                    <Area type="monotone" dataKey="blocked" stroke="#ef4444" fillOpacity={1} fill="url(#colorBlocked)" name="Blocked" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Side Charts */}
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>Attack Vectors</CardTitle>
                <CardDescription>Distribution of threat types.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={CHART_DATA_VECTORS}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {CHART_DATA_VECTORS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertOctagon className="text-red-500" /> Top Target: Finance
                </CardTitle>
                <CardDescription>Finance received 45% of attacks this week.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" size="sm" onClick={() => alert("Policy Review initiated for Finance Dept.")}>Review Finance Policy</Button>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" /> New Tactic: Qrishing
                </CardTitle>
                <CardDescription>QR Code phishing attempts detected.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" onClick={() => alert("Email filters updated with latest QR patterns.")}>Update Filters</Button>
              </CardContent>
            </Card>
          </div>

          {/* Most Targeted Users Table */}
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Most Targeted Users</span>
              </CardTitle>
              <CardDescription>High-risk individuals with recommended actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {TARGETED_USERS.map((user) => (
                  <div
                    key={user.id}
                    className={`border-2 rounded-lg p-4 ${user.isExecutive ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold">{user.name}</h4>
                          {user.isExecutive && (
                            <Badge variant="destructive" className="text-xs">
                              Executive
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.role} • {user.department}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getRiskColor(user.riskScore)}`}>
                          {user.riskScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Risk Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-white border rounded p-2 text-center">
                        <div className="text-lg font-bold text-purple-600">{user.targetingCount}</div>
                        <div className="text-xs text-muted-foreground">Targeted</div>
                      </div>
                      <div className="bg-white border rounded p-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {user.clicks > 0 ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                          <span className={`text-lg font-bold ${user.clicks > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {user.clicks}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Clicks</div>
                      </div>
                      <div className="bg-white border rounded p-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">{user.reports}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Reports</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-blue-800 font-semibold">{user.suggestedAction}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => alert(`Applied action: ${user.suggestedAction} for ${user.name}`)}>
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SUSPICIOUS INBOX (Detailed Table) */}
        <TabsContent value="inbox" className="p-4 border rounded-lg bg-white dark:bg-slate-950">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <CardTitle>Suspicious Inbox</CardTitle>
                  <Badge variant="secondary" className="ml-2">{filteredEmails.length} Items</Badge>
                </div>
                <div className="flex gap-2">
                  <Select value={filterRiskLevel} onValueChange={setFilterRiskLevel}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Risk Level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk</SelectItem>
                      <SelectItem value="critical">Critical (90+)</SelectItem>
                      <SelectItem value="high">High (70+)</SelectItem>
                      <SelectItem value="medium">Medium (40+)</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Search subject..." className="w-64" value={emailSearch} onChange={e => setEmailSearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Risk</TableHead><TableHead>Subject</TableHead><TableHead>Sender</TableHead><TableHead>Action</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmails.map(email => (
                    <TableRow key={email.id} className="cursor-pointer hover:bg-slate-50" onClick={() => { setSelectedEmail(email); setIsDetailOpen(true); }}>
                      <TableCell><Badge variant={getRiskBadgeColor(email.risk_score) as any}>{email.risk_score}</Badge></TableCell>
                      <TableCell className="font-medium max-w-[300px] truncate">{email.subject}</TableCell>
                      <TableCell className="text-muted-foreground">{email.sender}</TableCell>
                      <TableCell><Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setEmailPage(p => Math.max(1, p - 1))} disabled={emailPage === 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setEmailPage(p => p + 1)} disabled={paginatedEmails.length < itemsPerPage}>Next</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: DOMAIN WATCHLIST */}
        <TabsContent value="domains" className="p-4 border rounded-lg bg-white dark:bg-slate-950">
          <div className="flex gap-4 mb-4">
            <Input placeholder="Search monitored domains..." value={domainSearch} onChange={e => setDomainSearch(e.target.value)} className="max-w-md" />
            <Dialog open={isAddDomainOpen} onOpenChange={setIsAddDomainOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Domain Monitor</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Monitor New Domain</DialogTitle></DialogHeader>
                <div className="py-4 space-y-2">
                  <Label>Domain Name</Label>
                  <Input placeholder="example-phish.com" value={newDomainInput} onChange={e => setNewDomainInput(e.target.value)} />
                  <p className="text-xs text-muted-foreground">We will scan for lookalike domains and WHOIS changes.</p>
                </div>
                <DialogFooter><Button onClick={handleAddDomain}>Start Monitoring</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDomains.map(domain => (
              <Card key={domain.id}>
                <CardHeader className="pb-2"><CardTitle className="text-lg truncate">{domain.domain}</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div className="flex justify-between"><span>Risk Score:</span> <span className="font-bold text-red-600">{domain.reputation_score}/100</span></div>
                  <div className="flex justify-between"><span>Registrar:</span> <span className="text-muted-foreground">{domain.registrar}</span></div>
                  <div className="flex justify-between"><span>Detected:</span> <span>{new Date(domain.detected_at).toLocaleDateString()}</span></div>
                  <div className="mt-2"><Badge variant="outline">{domain.status}</Badge></div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="w-1/2" onClick={() => window.open(`https://who.is/whois/${domain.domain}`, '_blank')}>Whois</Button>
                  <Button variant="destructive" size="sm" className="w-1/2" onClick={() => handleTakedownRequest(domain.id)} disabled={domain.status === 'Takedown Requested'}>Takedown</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 4: SIMULATIONS */}
        <TabsContent value="simulation" className="p-4 border rounded-lg bg-white dark:bg-slate-950">
          <Card>
            <CardHeader>
              <CardTitle>Phishing Simulations</CardTitle>
              <CardDescription>Launch and manage employee awareness campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Click Rate</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {simulations.map(sim => (
                    <TableRow key={sim.id}>
                      <TableCell>
                        <div className="font-medium">{sim.name}</div>
                        <div className="text-xs text-muted-foreground">{sim.template}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{sim.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={sim.click_rate} className="w-16 h-2" />
                          <span>{sim.click_rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {sim.status === 'Running' ? (
                          <Button variant="outline" size="sm" onClick={() => toggleSimulationStatus(sim.id)}><Pause className="h-4 w-4 mr-2" /> Pause</Button>
                        ) : sim.status === 'Completed' ? (
                          <Button variant="ghost" size="sm" disabled><CheckCircle className="h-4 w-4 mr-2" /> Done</Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => toggleSimulationStatus(sim.id)}><Play className="h-4 w-4 mr-2" /> Start</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 flex justify-end">
                <Dialog open={isCreateSimOpen} onOpenChange={setIsCreateSimOpen}>
                  <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Create New Simulation</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>New Campaign</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2"><Label>Campaign Name</Label><Input value={newSimInput.name} onChange={e => setNewSimInput({ ...newSimInput, name: e.target.value })} placeholder="Q1 Awareness Drill" /></div>
                      <div className="space-y-2"><Label>Target Group</Label><Select onValueChange={v => setNewSimInput({ ...newSimInput, target: v })} defaultValue="All"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All Employees</SelectItem><SelectItem value="Finance">Finance</SelectItem></SelectContent></Select></div>
                    </div>
                    <DialogFooter><Button onClick={handleCreateSimulation}>Launch Campaign</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* EMAIL FORENSICS DRAWER (DIALOG) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedEmail && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Mail className="h-5 w-5" /> {selectedEmail.subject}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      ID: {selectedEmail.id} • Received: {new Date(selectedEmail.received_at).toLocaleString()}
                    </DialogDescription>
                  </div>
                  <Badge variant={getRiskBadgeColor(selectedEmail.risk_score) as any} className="text-lg px-3 py-1">
                    Risk: {selectedEmail.risk_score}/100
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
                {/* Left Column: Metadata */}
                <div className="space-y-4 col-span-1">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Sender Analysis</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div><span className="font-semibold">From:</span> <span className="block break-all text-muted-foreground">{selectedEmail.sender}</span></div>
                      <div><span className="font-semibold">Return-Path:</span> <span className="block break-all text-muted-foreground">{selectedEmail.headers?.["Return-Path"] || "N/A"}</span></div>
                      <Separator />
                      <div className="flex justify-between"><span>SPF:</span> <Badge variant={selectedEmail.analysis_report?.spf === 'pass' ? 'outline' : 'destructive'}>{selectedEmail.analysis_report?.spf.toUpperCase()}</Badge></div>
                      <div className="flex justify-between"><span>DKIM:</span> <Badge variant={selectedEmail.analysis_report?.dkim === 'pass' ? 'outline' : 'destructive'}>{selectedEmail.analysis_report?.dkim.toUpperCase()}</Badge></div>
                      <div className="flex justify-between"><span>DMARC:</span> <Badge variant={selectedEmail.analysis_report?.dmarc === 'pass' ? 'outline' : 'destructive'}>{selectedEmail.analysis_report?.dmarc.toUpperCase()}</Badge></div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Threat Indicators</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmail.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                        {selectedEmail.has_attachment && <Badge variant="destructive" className="flex gap-1"><Paperclip className="h-3 w-3" /> Attachment</Badge>}
                        {selectedEmail.has_links && <Badge variant="destructive" className="flex gap-1"><ExternalLink className="h-3 w-3" /> Malicious Links</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Content & AI Verdict */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <Card className="bg-slate-50 border-dashed border-2">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> AI Verdict</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-800 italic">"{selectedEmail.analysis_report?.ai_verdict}"</p>
                    </CardContent>
                  </Card>

                  <div className="border rounded-md p-0 overflow-hidden bg-white shadow-sm">
                    <div className="bg-gray-100 px-4 py-2 border-b text-xs font-semibold text-gray-500 flex justify-between">
                      <span>EMAIL PREVIEW</span>
                      <span className="flex gap-2"><Code className="h-3 w-3" /> Source View</span>
                    </div>
                    <div className="p-4 text-sm font-mono whitespace-pre-wrap h-40 overflow-y-auto">
                      {selectedEmail.content_snippet}
                      <br />
                      <br />
                      <span className="text-blue-600 underline cursor-pointer">[Link to external site]</span>
                    </div>
                  </div>

                  {selectedEmail.analysis_report?.malicious_urls && selectedEmail.analysis_report.malicious_urls.length > 0 && (
                    <div className="border border-red-200 bg-red-50 rounded-md p-3">
                      <h4 className="font-semibold text-red-800 text-sm mb-1 flex gap-2"><AlertTriangle className="h-4 w-4" /> Malicious URLs Detected</h4>
                      <ul className="list-disc list-inside text-xs text-red-700 font-mono">
                        {selectedEmail.analysis_report.malicious_urls.map(url => (
                          <li key={url} className="break-all">{url}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <div className="flex w-full justify-between items-center">
                  <Button variant="outline" onClick={() => handleMarkSafe(selectedEmail.id)}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> False Positive (Safe)
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => handleQuarantineEmail(selectedEmail.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Quarantine Email
                    </Button>
                    <Button className="bg-red-700 hover:bg-red-800">
                      <Shield className="mr-2 h-4 w-4" /> Block Sender Domain
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}