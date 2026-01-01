import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
// These skeletons might need to be adjusted based on your actual file structure
import { CardGridSkeleton } from "../skeletons/CardGridSkeleton";
import { TableSkeleton } from "../skeletons/TableSkeleton";
import { ChartSkeleton } from "../skeletons/ChartSkeleton";
import { AssetDependencyDrawer } from "../assets/AssetDependencyDrawer";

import {
  Shield,
  Search,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Server,
  Cloud,
  Laptop,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertTriangle,
  Building,
  Upload,
  FileWarning,
  RefreshCw,
  FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// --- MOCK AUTH CONTEXT ---
const useAuth = () => ({ user: { name: 'Demo User', role: 'Admin' } });

// --- INTERNAL UI COMPONENTS ---

const Card = ({ className, children }: any) => <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}>{children}</div>;
const CardHeader = ({ className, children }: any) => <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}>{children}</div>;
const CardTitle = ({ className, children }: any) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}>{children}</h3>;
const CardDescription = ({ className, children }: any) => <p className={`text-sm text-muted-foreground ${className || ''}`}>{children}</p>;
const CardContent = ({ className, children }: any) => <div className={`p-6 pt-0 ${className || ''}`}>{children}</div>;

const Badge = ({ variant = "default", className, children }: any) => {
  const variants: any = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };
  return <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant] || variants.default} ${className || ''}`}>{children}</div>;
};

const Button = ({ variant = "default", size = "default", className, children, ...props }: any) => {
  const variants: any = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };
  const sizes: any = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.default} ${sizes[size]} ${className || ''}`} {...props}>{children}</button>;
};

const Input = ({ className, ...props }: any) => <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`} {...props} />;

const Label = ({ className, children, htmlFor }: any) => <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}>{children}</label>;

const Alert = ({ className, children }: any) => <div className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${className || ''}`} role="alert">{children}</div>;
const AlertDescription = ({ className, children }: any) => <div className={`text-sm [&_p]:leading-relaxed ${className || ''}`}>{children}</div>;

const Table = ({ className, children }: any) => <div className="relative w-full overflow-auto"><table className={`w-full caption-bottom text-sm ${className || ''}`}>{children}</table></div>;
const TableHeader = ({ className, children }: any) => <thead className={`[&_tr]:border-b ${className || ''}`}>{children}</thead>;
const TableBody = ({ className, children }: any) => <tbody className={`[&_tr:last-child]:border-0 ${className || ''}`}>{children}</tbody>;
const TableRow = ({ className, children }: any) => <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className || ''}`}>{children}</tr>;
const TableHead = ({ className, children }: any) => <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className || ''}`}>{children}</th>;
const TableCell = ({ className, children }: any) => <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`}>{children}</td>;

const Progress = ({ value, className }: any) => <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className || ''}`}><div className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} /></div>;

const NativeSelect = ({ value, onChange, options, placeholder, className }: any) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <div className="absolute right-3 top-3 pointer-events-none">
      <ArrowDownRight className="h-4 w-4 text-muted-foreground opacity-50" />
    </div>
  </div>
);

const SimpleModal = ({ isOpen, onClose, title, description, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col space-y-1.5 p-6 pb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="p-6 pt-2">{children}</div>
      </div>
    </div>
  );
};

// --- TYPES ---

interface AssetManagementModuleProps {
  onModuleChange?: (module: string) => void;
}

interface AssetSummary {
  total_assets: number;
  critical_actions: number;
  avg_risk_score: number;
  compliance_rate: number;
}

interface AssetCategory {
  category: string;
  total: number;
  compliant: number;
  percentage: number;
}

interface TopRiskAsset {
  asset_name: string;
  risk_score: number;
  business_impact: string;
  critical_issues: number;
  business_unit: string;
  recommended_action: string;
}

interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  business_unit: string;
  exposure_level: string;
  risk_score: number;
  compliance_status: string;
  critical_issues: number;
  tasks: number;
  ip_address?: string;
  owner?: string;
  status?: string;
}

// --- MAIN MODULE ---

export function AssetManagementModule({ onModuleChange }: AssetManagementModuleProps = {}) {
  const { user } = useAuth();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'executive' | 'analyst'>('executive');

  // Drawer State
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Dialog States
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);

  // Upload States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Job History States
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [rejectedRows, setRejectedRows] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // API data states
  const [summary, setSummary] = useState<AssetSummary | null>(null);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [topRisks, setTopRisks] = useState<TopRiskAsset[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state for Add Asset
  const [newAsset, setNewAsset] = useState({
    hostname: '',
    ip_address: '',
    asset_type: 'Server',
    criticality: 'Medium',
    business_unit: '',
    owner: ''
  });

  // --- FETCHERS ---

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const res = await fetch(`${API_BASE}/api/assets/jobs`);
      const data = await res.json();
      // Handle response structure { jobs: [...] } or [...]
      setJobs(data.jobs || data);
    } catch {
      toast.error("Failed to load ingestion jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchAssetsData = async () => {
    setLoading(true);
    try {
      const fetchWithFallback = async (url: string) => {
        try {
          const res = await fetch(`${API_BASE}${url}`);
          if (!res.ok) throw new Error('Not OK');
          return await res.json();
        } catch (e) {
          console.warn(`Fetch failed for ${url}, using fallback.`);
          return null;
        }
      };

      // 🔴 FIX C: Use Promise.allSettled to prevent total failure if one API fails
      const results = await Promise.allSettled([
        fetchWithFallback('/api/assets/summary'),
        fetchWithFallback('/api/assets/distribution'),
        fetchWithFallback('/api/assets/top-risk'),
        fetchWithFallback('/api/assets/') // 🔴 FIX A: Added trailing slash for Cloud Run compatibility
      ]);

      // Extract results safely
      const [summaryRes, categoriesRes, risksRes, inventoryRes] = results.map(
        r => (r.status === 'fulfilled' ? r.value : null)
      );

      if (summaryRes) setSummary(summaryRes);

      // 🔴 FIX B: Correct category data mapping for charts
      if (categoriesRes && Array.isArray(categoriesRes)) {
        const adaptedCategories = categoriesRes.map((item: any) => {
          // Calculate mock compliance data based on total count
          const compliant = Math.floor(item.total * 0.7);
          const percentage = item.total > 0
            ? Math.round((compliant / item.total) * 100)
            : 0;

          return {
            category: item.category || item.name || "Unknown",
            total: item.total,
            compliant,
            percentage
          };
        });
        setCategories(adaptedCategories);
      }

      if (risksRes) setTopRisks(risksRes);
      if (inventoryRes && inventoryRes.assets) setAssets(inventoryRes.assets);

    } catch (err) {
      console.error('Failed to load asset data', err);
      setError('Failed to load asset data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetsData();
    fetchJobs();
  }, []);

  // --- HANDLERS ---

  const openJob = async (job: any) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
    setRejectedRows([]); // Clear previous

    try {
      // Fetch rejected rows
      const res = await fetch(`${API_BASE}/api/assets/jobs/${job.job_id}/rejected`);
      const data = await res.json();
      setRejectedRows(data.rejected_rows || data);
    } catch {
      toast.error("Failed to load rejected rows");
    }
  };

  const retryJob = async () => {
    if (!selectedJob) return;
    try {
      await fetch(`${API_BASE}/api/assets/retry/${selectedJob.job_id}`, {
        method: "POST",
      });
      toast.success("Retry initiated successfully");
      setIsJobDetailsOpen(false);
      fetchJobs(); // Refresh job list to see status change
      fetchAssetsData(); // Refresh assets to see if new ones appeared
    } catch {
      toast.error("Retry failed");
    }
  };

  const handleAddAsset = async () => {
    if (!newAsset.hostname || !newAsset.ip_address) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset),
      });

      if (response.ok) {
        toast.success(`Asset "${newAsset.hostname}" added successfully!`);
        setIsAddAssetDialogOpen(false);
        setNewAsset({
          hostname: '',
          ip_address: '',
          asset_type: 'Server',
          criticality: 'Medium',
          business_unit: '',
          owner: ''
        });
        fetchAssetsData();
      } else {
        const errData = await response.json();
        toast.error(`Error adding asset: ${errData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating asset:", error);
      toast.error("Failed to connect to backend");
    }
  };

  const handleUploadAssets = async () => {
    if (!uploadFile) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", uploadFile);

      const res = await fetch(`${API_BASE}/api/assets/import`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }

      const data = await res.json();

      toast.success(
        `Upload successful: ${data.inserted} assets added, ${data.rejected} rejected`
      );

      setIsUploadOpen(false);
      setUploadFile(null);
      fetchAssetsData();
      fetchJobs(); // Refresh jobs list to show new upload
    } catch (err: any) {
      toast.error(err.message || "Failed to upload assets");
    } finally {
      setUploading(false);
    }
  };

  // --- HELPERS ---

  const getExposureColor = (level: string) => {
    switch (String(level)) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-600 text-white';
      case 'Medium': return 'bg-yellow-600 text-white';
      case 'Low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (String(status)) {
      case 'Compliant': return 'bg-green-100 text-green-800 border-green-300';
      case 'Non-Compliant': return 'bg-red-100 text-red-800 border-red-300';
      case 'Needs Review': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 9.0) return 'text-red-600';
    if (score >= 7.0) return 'text-orange-600';
    if (score >= 4.0) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Fallback data
  const fallbackSummary = {
    total_assets: 0,
    critical_actions: 0,
    avg_risk_score: 0,
    compliance_rate: 0
  };

  const fallbackCategories: AssetCategory[] = [];
  const fallbackTopRisks: TopRiskAsset[] = [];
  const fallbackAssets: Asset[] = [];

  const currentSummary = summary || fallbackSummary;
  const currentCategories = categories;
  const currentTopRisks = topRisks.length > 0 ? topRisks : fallbackTopRisks;
  const currentAssets = assets.length > 0 ? assets : fallbackAssets;

  // ✅ SAFE REPLACEMENT
  const filteredAssets = currentAssets.filter(asset => {
    const term = searchTerm.toLowerCase();

    // Check name OR hostname (safely), plus IP and Business Unit
    const matchesSearch =
      (asset.name || asset.hostname || '').toLowerCase().includes(term) ||
      (asset.ip_address || '').toLowerCase().includes(term) ||
      (asset.business_unit || '').toLowerCase().includes(term);

    const matchesType = typeFilter === 'all' || asset.type === typeFilter;

    return matchesSearch && matchesType;
  });
  return (
    <div className="space-y-6">
      {currentSummary.critical_actions > 0 && (
        <Alert className="border-2 border-red-500 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-red-900 text-lg">
                  {currentSummary.critical_actions} critical asset{currentSummary.critical_actions > 1 ? 's' : ''} require{currentSummary.critical_actions === 1 ? 's' : ''} immediate attention.
                </span>
                <p className="text-sm text-red-800 mt-1">
                  High-risk assets exposed to active exploitation
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="destructive" size="sm">View Incident</Button>
                <Button variant="outline" size="sm" onClick={() => onModuleChange?.('vulnerabilities')}>Review Vulnerabilities</Button>
                <Button variant="outline" size="sm">Approve Remediation</Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : (
              <>
                <div className="text-4xl font-bold text-blue-600">{currentSummary.total_assets}</div>
                <div className="flex items-center space-x-1 text-xs mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-semibold">+23</span>
                  <span className="text-muted-foreground">this week</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : (
              <>
                <div className="text-4xl font-bold text-red-600">{currentSummary.critical_actions}</div>
                <div className="text-xs text-muted-foreground mt-2">requires attention</div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : (
              <>
                <div className="text-4xl font-bold text-orange-600">{(currentSummary.avg_risk_score || 0).toFixed(1)}</div>
                <div className="flex items-center space-x-1 text-xs mt-2">
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-semibold">0.4</span>
                  <span className="text-muted-foreground">improvement</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : (
              <>
                <div className="text-4xl font-bold text-green-600">{(currentSummary.compliance_rate || 0).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground mt-2">8 requires review</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Asset Distribution by Type</CardTitle>
            <CardDescription>Breakdown of organizational assets with risk indicators</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin" />
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={currentCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      dataKey="total"
                      label={(entry) => `${entry.category}: ${entry.total}`}
                    >
                      {currentCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : index === 2 ? '#ef4444' : index === 3 ? '#f97316' : '#22c55e'} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2">
                  {currentCategories.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : index === 2 ? '#ef4444' : index === 3 ? '#f97316' : '#22c55e' }} />
                        <span className="font-medium">{entry.category}</span>
                      </div>
                      <span className="font-bold text-gray-900">{entry.total}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Compliance by Asset Category</CardTitle>
            <CardDescription>Compliance percentage per asset group (85% threshold)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {currentCategories.map((item) => (
                  <div key={item.category} className={`p-3 border-2 rounded-lg ${item.percentage < 85 ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{item.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold ${item.percentage < 85 ? 'text-red-600' : 'text-green-600'}`}>
                          {(item.percentage || 0).toFixed(1)}%
                        </span>
                        {item.percentage < 85 && <AlertCircle className="h-5 w-5 text-red-600" />}
                      </div>
                    </div>
                    <Progress value={item.percentage} className={`h-3 ${item.percentage < 85 ? 'bg-red-200' : 'bg-green-200'}`} />
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{item.compliant} of {item.total} compliant</span>
                      {item.percentage < 85 && <span className="text-red-700 font-semibold">Below threshold</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileWarning className="h-5 w-5 text-red-600" />
            <span>Top At-Risk Assets</span>
          </CardTitle>
          <CardDescription>Assets requiring immediate CISO attention</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {currentTopRisks.map((asset, idx) => (
                <div key={idx} className="border-2 border-red-300 rounded-lg p-5 bg-red-50/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{asset.asset_name}</h4>
                      <p className="text-xs text-muted-foreground">Server</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getRiskColor(asset.risk_score)}`}>
                        {asset.risk_score}
                      </div>
                      <div className="text-xs text-muted-foreground">Risk Score</div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="bg-white border rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-700 mb-1">Business Impact</div>
                      <p className="text-sm text-gray-900">{asset.business_impact || "No data available"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white border rounded-lg p-2 text-center">
                      <div className="text-xl font-bold text-purple-600">{asset.critical_issues || 0}</div>
                      <div className="text-xs text-muted-foreground">Critical Issues</div>
                    </div>
                    <div className="bg-white border rounded-lg p-2 text-center">
                      <Badge variant="outline" className="text-xs">
                        <Building className="h-3 w-3 mr-1" />
                        {asset.business_unit || "Unassigned"}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mb-3">
                    <div className="text-xs font-semibold text-blue-900 mb-1">Recommended Action</div>
                    <p className="text-sm text-blue-800 font-medium">{asset.recommended_action || "Investigate"}</p>
                  </div>

                  <Button className="w-full" variant="destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Take Action
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ASSET INGESTION JOBS CARD */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Asset Ingestion Jobs</CardTitle>
              <CardDescription>CSV upload history and ingestion status</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchJobs}>
              <RefreshCw className={`h-4 w-4 ${loadingJobs ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingJobs ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left font-medium">Job ID</th>
                    <th className="p-4 text-left font-medium">Filename</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Inserted</th>
                    <th className="p-4 text-left font-medium">Rejected</th>
                    <th className="p-4 text-left font-medium">Started</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">No ingestion jobs found.</td>
                    </tr>
                  ) : (
                    jobs.map(job => (
                      <tr key={job.job_id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-mono text-xs">{job.job_id}</td>
                        <td className="p-4 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          {job.filename}
                        </td>
                        <td className="p-4">
                          <Badge variant={job.status === "completed" ? "secondary" : "outline"}>
                            {job.status}
                          </Badge>
                        </td>
                        <td className="p-4">{job.inserted}</td>
                        <td className={`p-4 ${job.rejected > 0 ? "text-red-600 font-bold" : ""}`}>
                          {job.rejected}
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">{new Date(job.started_at).toLocaleString()}</td>
                        <td className="p-4">
                          <Button size="sm" variant="ghost" onClick={() => openJob(job)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Asset Inventory</CardTitle>
              <CardDescription>
                {viewMode === 'executive' ? 'Executive overview' : 'Detailed analyst view'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <div className="inline-flex rounded-lg border-2 p-1">
                <button
                  onClick={() => setViewMode('executive')}
                  className={`px-4 py-2 text-sm rounded font-medium ${viewMode === 'executive' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  Executive View
                </button>
                <button
                  onClick={() => setViewMode('analyst')}
                  className={`px-4 py-2 text-sm rounded font-medium ${viewMode === 'analyst' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  Analyst View
                </button>
              </div>

              <Button onClick={() => setIsAddAssetDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>

              {/* Add Asset Modal */}
              <SimpleModal
                isOpen={isAddAssetDialogOpen}
                onClose={() => setIsAddAssetDialogOpen(false)}
                title="Add New Asset"
                description="Register a new asset in the inventory"
              >
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hostname">Hostname *</Label>
                      <Input id="hostname" placeholder="e.g., web-server-01" value={newAsset.hostname} onChange={(e: any) => setNewAsset({ ...newAsset, hostname: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ip_address">IP Address *</Label>
                      <Input id="ip_address" placeholder="e.g., 192.168.1.100" value={newAsset.ip_address} onChange={(e: any) => setNewAsset({ ...newAsset, ip_address: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="asset_type">Asset Type *</Label>
                      <NativeSelect
                        value={newAsset.asset_type}
                        onChange={(value: any) => setNewAsset({ ...newAsset, asset_type: value })}
                        placeholder="Select Type"
                        options={[
                          { value: 'Server', label: 'Server' },
                          { value: 'Endpoint', label: 'Endpoint' },
                          { value: 'Cloud Resource', label: 'Cloud Resource' },
                          { value: 'Network Device', label: 'Network Device' },
                          { value: 'IoT Device', label: 'IoT Device' },
                        ]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="criticality">Criticality *</Label>
                      <NativeSelect
                        value={newAsset.criticality}
                        onChange={(value: any) => setNewAsset({ ...newAsset, criticality: value })}
                        placeholder="Select Criticality"
                        options={[
                          { value: 'Critical', label: 'Critical' },
                          { value: 'High', label: 'High' },
                          { value: 'Medium', label: 'Medium' },
                          { value: 'Low', label: 'Low' },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_unit">Business Unit *</Label>
                      <Input id="business_unit" placeholder="e.g., Finance" value={newAsset.business_unit} onChange={(e: any) => setNewAsset({ ...newAsset, business_unit: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner">Owner *</Label>
                      <Input id="owner" placeholder="e.g., John Smith" value={newAsset.owner} onChange={(e: any) => setNewAsset({ ...newAsset, owner: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddAssetDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddAsset}>Add Asset</Button>
                </div>
              </SimpleModal>

              <Button variant="outline" onClick={() => setIsUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Assets
              </Button>

              {/* Upload Modal */}
              <SimpleModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                title="Upload Assets (CSV)"
                description="Upload organizational assets using the approved CSV template"
              >
                <div className="space-y-4">
                  <div>
                    <Label>CSV File</Label>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e: any) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadOpen(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>

                    <Button onClick={handleUploadAssets} disabled={uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload"
                      )}
                    </Button>
                  </div>
                </div>
              </SimpleModal>

              {/* Job Details Modal */}
              <SimpleModal
                isOpen={isJobDetailsOpen}
                onClose={() => setIsJobDetailsOpen(false)}
                title={selectedJob ? `Job Details: ${selectedJob.job_id}` : "Job Details"}
                description="Review rejected rows and status"
              >
                {selectedJob && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Filename:</span> {selectedJob.filename}
                      </div>
                      <div>
                        <span className="font-semibold">Status:</span> {selectedJob.status}
                      </div>
                      <div>
                        <span className="font-semibold">Inserted:</span> {selectedJob.inserted}
                      </div>
                      <div>
                        <span className="font-semibold">Rejected:</span> {selectedJob.rejected}
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Row</th>
                            <th className="p-2 text-left">Data</th>
                            <th className="p-2 text-left">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rejectedRows.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="p-4 text-center text-muted-foreground">No rejected rows found.</td>
                            </tr>
                          ) : (
                            rejectedRows.map((row: any, i: number) => (
                              <tr key={i} className="border-t">
                                <td className="p-2">{row.row_number}</td>
                                <td className="p-2 font-mono text-xs max-w-[200px] truncate" title={JSON.stringify(row.row_data)}>
                                  {JSON.stringify(row.row_data)}
                                </td>
                                <td className="p-2 text-red-600 text-xs">{row.reason}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsJobDetailsOpen(false)}>Close</Button>
                      <Button onClick={retryJob} disabled={rejectedRows.length === 0}>
                        Retry Rejected Rows
                      </Button>
                    </div>
                  </div>
                )}
              </SimpleModal>

            </div>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search assets or business units..." className="pl-8" value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} />
            </div>

            <div className="w-48">
              <NativeSelect
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="All Types"
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'Server', label: 'Servers' },
                  { value: 'Endpoint', label: 'Endpoints' },
                  { value: 'Cloud Resource', label: 'Cloud Resources' },
                  { value: 'Network Device', label: 'Network Devices' },
                  { value: 'IoT Device', label: 'IoT Devices' },
                ]}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Business Unit</TableHead>
                  <TableHead>Exposure Level</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Critical Issues</TableHead>
                  <TableHead>Tasks</TableHead>
                  {viewMode === 'analyst' && (
                    <>
                      <TableHead>IP Address</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Last Seen</TableHead>
                    </>
                  )}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {asset.type === 'Server' && <Server className="h-4 w-4 text-blue-600" />}
                        {asset.type === 'Endpoint' && <Laptop className="h-4 w-4 text-purple-600" />}
                        {asset.type === 'Cloud Resource' && <Cloud className="h-4 w-4 text-indigo-600" />}
                        <div>
                          <div className="font-semibold">{asset.name}</div>
                          <div className="text-xs text-muted-foreground">{asset.type}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Building className="h-3 w-3 mr-1" />
                        {asset.business_unit}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getExposureColor(asset.exposure_level)} font-bold`}>
                        {asset.exposure_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xl font-bold ${getRiskColor(asset.risk_score)}`}>
                        {asset.risk_score}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getComplianceColor(asset.compliance_status)}>
                        {asset.compliance_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {asset.critical_issues > 0 ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="font-bold text-red-600">{asset.critical_issues}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-600">0</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {asset.tasks > 0 ? (
                        <Badge variant="secondary">{asset.tasks}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {viewMode === 'analyst' && (
                      <>
                        <TableCell className="font-mono text-xs">{asset.ip_address || 'N/A'}</TableCell>
                        <TableCell className="text-xs">N/A</TableCell>
                        <TableCell className="text-xs">{asset.owner || 'Unassigned'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{asset.status || 'Active'}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedAssetId(asset.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAssets.length} of {currentAssets.length} assets
          </div>
        </CardContent>
      </Card>

      {/* RENDER ASSET DEPENDENCY DRAWER */}
      {selectedAssetId && (
        <AssetDependencyDrawer
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
        />
      )}
    </div>
  );
}