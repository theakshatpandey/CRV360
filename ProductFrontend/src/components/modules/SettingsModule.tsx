import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import {
  Settings,
  User,
  Shield,
  Bell,
  Database,
  Globe,
  Cloud,
  Key,
  Monitor,
  Mail,
  Smartphone,
  Slack,
  Webhook,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Save,
  RefreshCw,
  Download,
  Upload,
  Server,
  Network,
  Cpu,
  HardDrive,
  Router,
  Building,
  MapPin,
  Calendar,
  FileText,
  BarChart3,
  Target,
  Activity,
  Zap,
  ExternalLink,
  Copy,
  Code,
  Terminal,
  Loader,
  LogOut
} from 'lucide-react';

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = "http://localhost:8000/api/settings";

interface SettingsModuleProps {
  onModuleChange?: (module: string) => void;
}

export function SettingsModule({ onModuleChange }: SettingsModuleProps = {}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for all settings sections
  const [profileData, setProfileData] = useState<any>({
    firstName: '', lastName: '', email: '', title: '', department: '', phone: '', timezone: 'est', dateFormat: 'mdy'
  });
  const [notifications, setNotifications] = useState<any>({
    email: true, sms: false, slack: true, teams: false, webhook: true
  });
  const [securitySettings, setSecuritySettings] = useState<any>({
    mfa_enforced: true, session_timeout_minutes: 30, password_expiry_days: 90, failed_login_threshold: 5, ip_whitelist_enabled: true, api_key: ''
  });
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>({});
  const [webhookConfig, setWebhookConfig] = useState<any>({ url: '', secret_key: '', events: [] });

  // UI State for Modals
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Analyst' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // DATA FETCHING
  // ============================================
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [settingsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/`),
        fetch(`${API_BASE_URL}/users`)
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        const s = data.data;
        // Map backend data to frontend state
        setProfileData(s.profile || {});
        setNotifications(s.notifications || {});
        setSecuritySettings(s.security_policy || {});
        setIntegrations(s.integrations || []);
        setWebhookConfig(s.webhook_config || {});
        setSystemMetrics(s.system_metrics || {});
      }

      if (usersRes.ok) {
        const userData = await usersRes.json();
        setUsers(userData.data || []);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      toast.error("Failed to load settings from server.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ACTIONS
  // ============================================

  // --- Profile ---
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE_URL}/update-section?section=profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      toast.success('Profile settings saved successfully!');
    } catch (err) {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelProfile = () => {
    fetchSettings(); // Revert to server state
    setProfilePhoto(null);
    toast.info('Changes discarded. Form reset.');
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPG or PNG image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Optimistic UI update
    const reader = new FileReader();
    reader.onload = (e) => setProfilePhoto(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      await fetch(`${API_BASE_URL}/profile/upload-photo`, { method: 'POST', body: formData });
      toast.success('Profile photo uploaded successfully!');
    } catch (err) {
      toast.error("Failed to upload photo.");
    }
  };

  // --- Security ---
  const handleSaveSecurity = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE_URL}/update-section?section=security_policy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securitySettings)
      });
      toast.success('Security configuration saved!');
    } catch (err) {
      toast.error("Failed to save security settings.");
    } finally {
      setSaving(false);
    }
  };

  const regenerateApiKey = async () => {
    if (!confirm("Regenerate API Key? This will break existing integrations.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/security/regenerate-api-key`, { method: 'POST' });
      const data = await res.json();
      setSecuritySettings(prev => ({ ...prev, api_key: data.api_key }));
      toast.success("API Key regenerated.");
    } catch (err) {
      toast.error("Failed to regenerate key.");
    }
  };

  // --- Notifications ---
  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE_URL}/update-section?section=notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications)
      });
      toast.success('Notification preferences updated!');
    } catch (err) {
      toast.error("Failed to save notifications.");
    } finally {
      setSaving(false);
    }
  };

  // --- Integrations ---
  const toggleIntegration = async (name: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/integrations/${name}/toggle`, { method: 'POST' });
      const data = await res.json();
      // Update local state
      setIntegrations(prev => prev.map(i => i.name === name ? { ...i, status: data.new_status } : i));
      toast.success(`Integration ${name} is now ${data.new_status}`);
    } catch (err) {
      toast.error("Failed to toggle integration.");
    }
  };

  const handleAddIntegration = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/integrations/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "New Integration Demo" })
      });
      if (res.ok) {
        fetchSettings(); // Refresh list
        toast.success("New integration added.");
      }
    } catch (err) {
      toast.error("Failed to add integration.");
    }
  };

  const saveWebhook = async () => {
    try {
      await fetch(`${API_BASE_URL}/update-section?section=webhook_config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookConfig)
      });
      toast.success("Webhook configuration saved.");
    } catch (err) {
      toast.error("Failed to save webhook.");
    }
  };

  // --- Users ---
  const handleAddUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowAddUser(false);
        setNewUser({ name: '', email: '', role: 'Analyst' });
        const userData = await (await fetch(`${API_BASE_URL}/users`)).json();
        setUsers(userData.data);
        toast.success("User added successfully.");
      }
    } catch (err) {
      toast.error("Failed to add user.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User deleted.");
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  // --- System ---
  const handleClearCache = async () => {
    try {
      await fetch(`${API_BASE_URL}/system/clear-cache`, { method: 'POST' });
      toast.success("System cache cleared.");
    } catch (err) {
      toast.error("Failed to clear cache.");
    }
  };

  const handleExportLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/system/logs/export`);
      const data = await res.json();
      const blob = new Blob([data.content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'system_logs.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Logs downloaded.");
    } catch (err) {
      toast.error("Failed to export logs.");
    }
  };

  // Helper for icons
  const getIntegrationIcon = (name: string) => {
    if (name.includes('Slack')) return <Slack className="h-5 w-5" />;
    if (name.includes('AWS')) return <Cloud className="h-5 w-5" />;
    if (name.includes('ServiceNow') || name.includes('Jira')) return <Settings className="h-5 w-5" />;
    if (name.includes('CrowdStrike') || name.includes('Splunk')) return <Shield className="h-5 w-5" />;
    if (name.includes('Sentinel')) return <Database className="h-5 w-5" />;
    return <Globe className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'connected':
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
      case 'disconnected':
      case 'inactive': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin h-10 w-10 text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CRV360 Settings</h1>
        <p className="text-muted-foreground">Configure your security platform and user preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b bg-white px-4">
          <TabsList className="h-12 w-full justify-start gap-6 bg-transparent p-0">
            {['Profile', 'Security', 'Notifications', 'Integrations', 'Users', 'System'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase()}
                className="rounded-none px-4
                           text-slate-900
                           opacity-100
                           hover:text-slate-900
                           hover:opacity-100
                           data-[state=active]:text-slate-900
                           data-[state=active]:opacity-100
                           data-[state=active]:font-semibold
                           data-[state=active]:border-b-2
                           data-[state=active]:border-slate-900
                           data-[state=active]:bg-transparent"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* TAB 1: PROFILE */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>Manage your personal account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profilePhoto || "/api/placeholder/80/80"} />
                  <AvatarFallback>{profileData.firstName?.[0]}{profileData.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" /> Upload Photo
                  </Button>
                  <p className="text-sm text-muted-foreground">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={profileData.title}
                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={profileData.department}
                    onValueChange={(value) => setProfileData({ ...profileData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Information Security">Information Security</SelectItem>
                      <SelectItem value="IT Operations">IT Operations</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Risk Management">Risk Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Preferences</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={profileData.timezone}
                      onValueChange={(value) => setProfileData({ ...profileData, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="est">Eastern Standard Time</SelectItem>
                        <SelectItem value="pst">Pacific Standard Time</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={profileData.dateFormat}
                      onValueChange={(value) => setProfileData({ ...profileData, dateFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveProfile} disabled={saving} variant="default">
                  {saving ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelProfile}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SECURITY */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Security Configuration</span>
              </CardTitle>
              <CardDescription>Manage platform security settings and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Multi-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require MFA for all user accounts</p>
                  </div>
                  <Switch
                    checked={securitySettings.mfa_enforced}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, mfa_enforced: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>IP Address Whitelist</Label>
                    <p className="text-sm text-muted-foreground">Restrict access to approved IP ranges</p>
                  </div>
                  <Switch
                    checked={securitySettings.ip_whitelist_enabled}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, ip_whitelist_enabled: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={securitySettings.session_timeout_minutes}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, session_timeout_minutes: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password Expiry (days)</Label>
                  <Input
                    type="number"
                    value={securitySettings.password_expiry_days}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, password_expiry_days: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Failed Login Attempts Threshold</Label>
                  <Input
                    type="number"
                    value={securitySettings.failed_login_threshold}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, failed_login_threshold: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">API Access</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>API Key</Label>
                      <p className="text-sm text-muted-foreground">Primary API key for external integrations</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {showApiKey ? securitySettings.api_key : '••••••••••••••••'}
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={regenerateApiKey}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate API Key
                  </Button>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveSecurity} disabled={saving} variant="default">
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Configure how you receive security alerts and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notification Channels</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(c) => setNotifications({ ...notifications, email: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Critical alerts via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(c) => setNotifications({ ...notifications, sms: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Slack className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <Label>Slack Integration</Label>
                      <p className="text-sm text-muted-foreground">Send alerts to Slack channels</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.slack}
                    onCheckedChange={(c) => setNotifications({ ...notifications, slack: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Webhook className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <Label>Webhook Notifications</Label>
                      <p className="text-sm text-muted-foreground">Custom webhook endpoints</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.webhook}
                    onCheckedChange={(c) => setNotifications({ ...notifications, webhook: c })}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveNotifications} disabled={saving} variant="default">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
                <Button variant="outline">Test Notifications</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: INTEGRATIONS */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>System Integrations</span>
                  </CardTitle>
                  <CardDescription>Manage connections to external security tools</CardDescription>
                </div>
                <Button onClick={handleAddIntegration} variant="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {getIntegrationIcon(integration.name)}
                      </div>
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        <div className="text-sm text-muted-foreground">{integration.details}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={`text-xs border ${getStatusColor(integration.status)}`}
                        variant="outline"
                      >
                        {integration.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => toggleIntegration(integration.name)}>
                        {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Webhook className="h-4 w-4" />
                <span>Webhook Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  value={webhookConfig.url}
                  onChange={(e) => setWebhookConfig({ ...webhookConfig, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  value={webhookConfig.secret_key}
                  onChange={(e) => setWebhookConfig({ ...webhookConfig, secret_key: e.target.value })}
                />
              </div>
              <Button onClick={saveWebhook} variant="default">
                <Save className="h-4 w-4 mr-2" /> Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: USERS */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>User Management</span>
                  </CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
                <Button onClick={() => setShowAddUser(true)} variant="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{user.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email} • {user.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{user.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Analyst">Analyst</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
                <Button onClick={handleAddUser} variant="default">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB 6: SYSTEM */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{systemMetrics.uptime || '99.9%'}</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{systemMetrics.avg_response_time || '120ms'}</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{systemMetrics.data_processed || '1.2TB'}</div>
                  <div className="text-sm text-muted-foreground">Data Processed</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{systemMetrics.alerts_processed?.toLocaleString() || 0}</div>
                  <div className="text-sm text-muted-foreground">Alerts Processed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Backup & Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Automated Daily Backup</div>
                  <div className="text-sm text-muted-foreground">Last: Today 2:00 AM</div>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Maintenance Window</div>
                  <div className="text-sm text-muted-foreground">Next: Sun 2AM-4AM</div>
                </div>
                <Button variant="outline">Schedule</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" onClick={handleExportLogs}>
                  <Download className="h-4 w-4 mr-2" /> Export Logs
                </Button>
                <Button variant="outline" onClick={handleClearCache}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div >
  );
}