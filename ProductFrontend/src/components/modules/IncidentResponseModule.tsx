import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import {
  AlertTriangle,
  Search,
  Eye,
  Clock,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Activity,
  Users,
  Server,
  Globe,
  Database,
  FileText,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Swords,
  Network,
  Flag,
  Brain,
  Crosshair,
  BarChart3,
  Timer,
  ChevronRight,
  Calendar,
  MapPin,
  Scale,
  Building,
  Plus,
  Loader,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = "http://localhost:8000/api/incident-response";

// ============================================
// INTERFACES
// ============================================

interface Incident {
  incident_id: string;
  title: string;
  executiveSummary?: string; // Optional (backend might not send)
  severity: string;
  business_impact: string; // From backend
  businessImpact?: string; // Fallback for UI
  business_unit: string;
  root_cause: string; // From backend
  rootCause?: string; // Fallback for UI
  rootCauseCategory?: string; // Optional UI field
  status: string;
  owner: string;
  resolution_time: string;
  detected_at: string;
  created_on?: string; // Fallback for UI
  resolved_on?: string;
  last_updated?: string;
  regulatory_impact?: string[];
  regulatory_exposure?: string[]; // Fallback for UI
  affected_assets?: string[];
  affected_users?: number;
  estimated_loss?: string;
  containmentSummary?: string;
  residualRisk?: string;
  cisoRecommendation?: string;
  category?: string;
  priority?: number;
}

interface IncidentStats {
  high_impact_active: number;
  avg_resolution_hours: number;
  sla_compliance: number;
  regulatory_alerts: number;
}

interface IncidentResponseModuleProps {
  onModuleChange?: (module: string) => void;
}

export function IncidentResponseModule({ onModuleChange }: IncidentResponseModuleProps = {}) {

  // State
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showNewIncidentDialog, setShowNewIncidentDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    severity: '',
    business_impact: '',
    business_unit: '',
    root_cause: '',
    owner: ''
  });

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incidentsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/incidents`),
        fetch(`${API_BASE_URL}/stats`)
      ]);

      if (incidentsRes.ok) {
        const data = await incidentsRes.json();
        // Normalize backend data to UI expectations where fields differ slightly
        const normalizedIncidents = (data.data || []).map((inc: any) => ({
          ...inc,
          businessImpact: inc.business_impact, // Map snake_case to camelCase if needed
          rootCause: inc.root_cause,
          created_on: inc.detected_at,
          regulatory_exposure: inc.regulatory_impact,
          // Fill missing UI fields with defaults if not provided by backend yet
          affected_assets: inc.affected_assets || [],
          affected_users: inc.affected_users || 0,
          estimated_loss: inc.estimated_loss || 'TBD',
          category: inc.root_cause || 'Security Incident',
          priority: 50 // Default
        }));
        setIncidents(normalizedIncidents);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data || null);
      }
    } catch (err) {
      console.error("Error loading incident data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ACTIONS
  // ============================================

  const handleCreateIncident = async () => {
    setActionLoading('create');
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("✅ Incident Created Successfully!");
        setShowNewIncidentDialog(false);
        setFormData({
          title: '',
          severity: '',
          business_impact: '',
          business_unit: '',
          root_cause: '',
          owner: ''
        });
        fetchData(); // Refresh list
      } else {
        alert("Failed to create incident.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    } finally {
      setActionLoading(null);
    }
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: string) => {
    try {
      // This is a placeholder call - assuming your router has this endpoint or similar
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/status?status=${newStatus}`, {
        method: 'POST'
      });
      if (res.ok) {
        alert(`Incident ${incidentId} status updated to ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'default'; // dark
      case 'medium': return 'secondary'; // gray
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'low': return 'text-green-600 border-green-200 bg-green-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'investigation': return 'bg-blue-100 text-blue-800';
      case 'contained': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Pending';
    return new Date(timestamp).toLocaleString();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const calculateResolutionTime = (created: string, resolved?: string) => {
    if (!resolved) return 'Ongoing';
    const start = new Date(created);
    const end = new Date(resolved);
    const diffHours = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));

    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  // Filter Logic
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incident_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || incident.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || incident.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Mock Data for Charts (Backend doesn't provide chart series yet)
  const incidentsByCategory = [
    { name: 'Data Breach', value: 28, color: '#ef4444', impact: 'Critical' },
    { name: 'Malware', value: 35, color: '#f97316', impact: 'High' },
    { name: 'Service Disruption', value: 22, color: '#eab308', impact: 'Medium' },
    { name: 'Phishing', value: 18, color: '#22c55e', impact: 'Medium' },
    { name: 'Insider Threat', value: 12, color: '#8b5cf6', impact: 'High' }
  ];

  const mttrTrend = [
    { month: 'Jul', mttr: 52 },
    { month: 'Aug', mttr: 48 },
    { month: 'Sep', mttr: 45 },
    { month: 'Oct', mttr: 42 },
    { month: 'Nov', mttr: 38 },
    { month: 'Dec', mttr: 36 }
  ];

  const regulatoryExposure = [
    { framework: 'GDPR', incidents: 2, status: 'Active' },
    { framework: 'SOX', incidents: 1, status: 'Active' },
    { framework: 'PCI-DSS', incidents: 1, status: 'Active' },
    { framework: 'HIPAA', incidents: 1, status: 'Resolved' }
  ];

  const topAffectedBusinessUnits = [
    { unit: 'Finance', incidents: 5, severity: 'Critical' },
    { unit: 'Corporate IT', incidents: 4, severity: 'High' },
    { unit: 'Development', incidents: 3, severity: 'Medium' }
  ];

  const resolutionTimeMetrics = [
    { category: 'Critical', avgTime: 18, target: 24, slaCompliance: 92 },
    { category: 'High', avgTime: 45, target: 72, slaCompliance: 88 },
    { category: 'Medium', avgTime: 96, target: 168, slaCompliance: 94 },
    { category: 'Low', avgTime: 240, target: 336, slaCompliance: 96 }
  ];

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Incident Response — Executive Resilience Overview</h1>
        <p className="text-muted-foreground">
          Executive oversight of security incidents with emphasis on business impact, organizational resilience, and response performance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        {/* VIEW 1: DASHBOARD (Executive Summary) */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Top-Level Executive KPIs */}
          <div className="grid gap-4 md:grid-cols-5">
            {/* Active High-Impact Incidents */}
            <Card className="border-2 border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>High-Impact Incidents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-600">{stats?.high_impact_active || 0}</div>
                <p className="text-xs text-red-700 mt-1">Critical + High (Active)</p>
              </CardContent>
            </Card>

            {/* Avg Resolution Time */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-blue-600" />
                  <span>Avg Resolution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">{stats?.avg_resolution_hours || 0}h</div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <TrendingDown className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">12h improvement</span>
                </div>
              </CardContent>
            </Card>

            {/* SLA Compliance */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>SLA Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">{stats?.sla_compliance || 0}%</div>
                <Progress value={stats?.sla_compliance || 0} className="mt-2 h-2" />
              </CardContent>
            </Card>

            {/* Business Units Most Affected */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Building className="h-5 w-5 text-purple-600" />
                  <span>Most Affected Units</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {topAffectedBusinessUnits.map((unit, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-medium truncate">{unit.unit}</span>
                      <Badge variant="outline" className="text-xs">{unit.incidents}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* MTTR Trend */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  <span>MTTR Trend (6M)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={mttrTrend}>
                    <Line type="monotone" dataKey="mttr" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-green-600 font-medium mt-1">↓ 31% reduction</p>
              </CardContent>
            </Card>
          </div>

          {/* Regulatory Exposure Alerts */}
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-orange-600" />
                <span>Regulatory Exposure Alerts</span>
              </CardTitle>
              <CardDescription>Unresolved incidents with compliance framework implications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-4">
                {regulatoryExposure.map((item, idx) => (
                  <div key={idx} className={`p-4 border-2 rounded-lg ${item.status === 'Active' ? 'border-orange-300 bg-orange-50' : 'border-gray-300 bg-gray-50'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{item.framework}</span>
                      <Badge variant={item.status === 'Active' ? 'destructive' : 'outline'} className="text-xs">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{item.incidents}</div>
                    <p className="text-xs text-muted-foreground">incident{item.incidents !== 1 ? 's' : ''} requiring notification</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Incidents by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Incidents by Category</CardTitle>
                <CardDescription>Distribution with business impact classification</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={incidentsByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {incidentsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {incidentsByCategory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span>{entry.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{entry.value}</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.impact} Impact
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resolution Time SLA */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Resolution Time SLA Performance</CardTitle>
                    <CardDescription>Average vs target resolution times</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Overall SLA Adherence</div>
                    <div className="text-3xl font-bold text-green-600">93%</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resolutionTimeMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{metric.category}</span>
                        <span className="text-muted-foreground">{metric.avgTime}h / {metric.target}h target</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={Math.min((metric.avgTime / metric.target) * 100, 100)}
                          className="h-2 flex-1"
                        />
                        <Badge
                          variant={metric.slaCompliance >= 90 ? 'outline' : 'secondary'}
                          className={`text-xs ${metric.slaCompliance >= 90 ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                        >
                          {metric.slaCompliance}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* VIEW 2: INCIDENTS (Executive Table) */}
        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Incident Management</CardTitle>
                  <CardDescription>Executive view of security incidents and business impact</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setShowNewIncidentDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Incident
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search incidents by title, ID, or summary..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="contained">Contained</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Incident Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Executive Summary</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Business Impact</TableHead>
                      <TableHead>Business Unit</TableHead>
                      <TableHead>Root Cause</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resolution</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents.length > 0 ? filteredIncidents.map((incident) => (
                      <TableRow key={incident.incident_id}>
                        <TableCell>
                          <span className="font-mono text-sm font-medium">{incident.incident_id}</span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <div className="font-semibold mb-1">{incident.title}</div>
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {incident.executiveSummary || incident.title}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(incident.severity) as any} className="font-semibold">
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getImpactColor(incident.business_impact)} border font-semibold`}
                            variant="outline"
                          >
                            {incident.business_impact}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            <Building className="h-3 w-3 mr-1" />
                            {incident.business_unit}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs italic text-gray-500">
                            {incident.root_cause}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(incident.status) as any}>
                            {incident.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {incident.status === 'Resolved' ? 'Resolved' : 'Ongoing'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateResolutionTime(incident.created_on || incident.detected_at, incident.resolved_on)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedIncident(incident)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>{incident.title}</DialogTitle>
                                <DialogDescription>Incident ID: {incident.incident_id}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Owner</Label>
                                    <div className="font-medium">{incident.owner}</div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Detected At</Label>
                                    <div className="font-medium">{formatTimestamp(incident.created_on || incident.detected_at)}</div>
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <Label className="text-xs text-muted-foreground">Business Impact Details</Label>
                                  <p className="text-sm mt-1">{incident.businessImpactDetails || "No details provided."}</p>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => updateIncidentStatus(incident.incident_id, 'Resolved')}>
                                    Mark Resolved
                                  </Button>
                                  <Button onClick={() => onModuleChange?.('executive-report')}>
                                    Generate Report
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No incidents found matching criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredIncidents.length} of {incidents.length} incidents
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CREATE INCIDENT DIALOG */}
      <Dialog open={showNewIncidentDialog} onOpenChange={setShowNewIncidentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Incident</DialogTitle>
            <DialogDescription>Log a new security incident manually.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Incident Title</Label>
              <Input
                placeholder="e.g. Suspicious Login Activity"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, severity: val })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Business Impact</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, business_impact: val })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Unit</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, business_unit: val })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Corporate IT">Corporate IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Root Cause</Label>
                <Input
                  placeholder="e.g. Phishing"
                  value={formData.root_cause}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Input
                placeholder="Analyst Name"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowNewIncidentDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateIncident} disabled={actionLoading === 'create'}>
              {actionLoading === 'create' ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Incident
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}