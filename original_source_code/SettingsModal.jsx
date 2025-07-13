import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useResources, useSpaces } from '../hooks/useSupabase'

export const SettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  // Profile settings
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  
  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    autoSync: true,
    defaultView: 'dashboard',
    itemsPerPage: 20
  })

  const { user, profile, updateProfile, signOut } = useAuth()
  const { resources } = useResources()
  const { spaces } = useSpaces()

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setEmail(profile.email || '')
      setAvatarUrl(profile.avatar_url || '')
      setPreferences(prev => ({ ...prev, ...profile.preferences }))
    }
  }, [profile])

  const handleSaveProfile = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await updateProfile({
      full_name: fullName,
      avatar_url: avatarUrl,
      preferences
    })

    if (error) {
      setError(error)
    } else {
      setMessage('Profile updated successfully!')
    }

    setLoading(false)
  }

  const handleExportData = async () => {
    try {
      const exportData = {
        profile,
        resources,
        spaces,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `second-brain-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage('Data exported successfully!')
    } catch (error) {
      setError('Failed to export data')
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account and preferences</CardDescription>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r bg-slate-50 p-4">
            <nav className="space-y-2">
              <Button
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('profile')}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button
                variant={activeTab === 'preferences' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('preferences')}
              >
                <Palette className="w-4 h-4 mr-2" />
                Preferences
              </Button>
              <Button
                variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button
                variant={activeTab === 'data' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('data')}
              >
                <Database className="w-4 h-4 mr-2" />
                Data & Privacy
              </Button>
              <Button
                variant={activeTab === 'security' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('security')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Security
              </Button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {message && (
              <Alert className="mb-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        value={email}
                        disabled
                        className="bg-slate-100"
                      />
                      <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Avatar URL</label>
                      <Input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Account Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{resources.length}</div>
                        <div className="text-sm text-slate-600">Total Resources</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{spaces.length}</div>
                        <div className="text-sm text-slate-600">Active Spaces</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Display Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Theme</label>
                      <div className="flex gap-2">
                        {['light', 'dark', 'auto'].map(theme => (
                          <Button
                            key={theme}
                            variant={preferences.theme === theme ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreferences(prev => ({ ...prev, theme }))}
                            className="capitalize"
                          >
                            {theme}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Default View</label>
                      <div className="flex gap-2">
                        {['dashboard', 'spaces', 'classification'].map(view => (
                          <Button
                            key={view}
                            variant={preferences.defaultView === view ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreferences(prev => ({ ...prev, defaultView: view }))}
                            className="capitalize"
                          >
                            {view}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Items per Page</label>
                      <div className="flex gap-2">
                        {[10, 20, 50, 100].map(count => (
                          <Button
                            key={count}
                            variant={preferences.itemsPerPage === count ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreferences(prev => ({ ...prev, itemsPerPage: count }))}
                          >
                            {count}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* Data & Privacy Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Export Your Data</h4>
                            <p className="text-sm text-slate-600">Download all your resources and settings</p>
                          </div>
                          <Button onClick={handleExportData}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Vector Database</h4>
                            <p className="text-sm text-slate-600">Semantic search powered by Pinecone</p>
                          </div>
                          <Badge variant="secondary">Connected</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Database Storage</h4>
                            <p className="text-sm text-slate-600">Secure data storage with Supabase</p>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Account Security</h3>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Sign Out</h4>
                            <p className="text-sm text-slate-600">Sign out of your account on this device</p>
                          </div>
                          <Button variant="outline" onClick={handleSignOut}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div>
                          <h4 className="font-medium mb-2">Account Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">User ID:</span>
                              <span className="font-mono text-xs">{user?.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Created:</span>
                              <span>{new Date(user?.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Last Sign In:</span>
                              <span>{new Date(user?.last_sign_in_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

