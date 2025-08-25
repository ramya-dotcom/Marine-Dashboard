import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Ship, Wifi, WifiOff, Download, RefreshCw, Search, Filter, AlertTriangle, Users, Activity, Database, TrendingUp } from 'lucide-react';

// Mock data generation
const generateMockData = () => {
  const vesselNames = [
    'Atlantic Explorer', 'Pacific Dawn', 'Ocean Master', 'Sea Guardian', 'Marine Pioneer',
    'Coastal Ranger', 'Deep Sea Hunter', 'Wave Rider', 'Storm Chaser', 'Blue Horizon',
    'Arctic Voyager', 'Tropical Wind', 'Ocean Spirit', 'Sea Breeze', 'Maritime Glory',
    'Neptune\'s Pride', 'Coral Explorer', 'Tide Runner', 'Seafarer', 'Ocean Quest'
  ];

  const locations = [
    'North Atlantic', 'Pacific Ocean', 'Mediterranean Sea', 'Indian Ocean', 'Gulf of Mexico',
    'Caribbean Sea', 'Red Sea', 'Baltic Sea', 'North Sea', 'Arabian Sea'
  ];

  const vessels = vesselNames.map((name, index) => {
    const isOnline = Math.random() > 0.2;
    const signalStrength = isOnline ? Math.floor(Math.random() * 40) + 60 : 0;
    const dataUsage = isOnline ? Math.floor(Math.random() * 500) + 50 : 0;
    const lastContact = new Date(Date.now() - Math.random() * 86400000 * 7);
    
    // Generate 30 days of historical data
    const historicalData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        signalStrength: Math.floor(Math.random() * 40) + 40 + (isOnline ? 20 : -20),
        dataUsage: Math.floor(Math.random() * 400) + 100,
        uptime: Math.random() * 24
      };
    });

    return {
      id: index + 1,
      name,
      location: locations[Math.floor(Math.random() * locations.length)],
      status: isOnline ? 'online' : 'offline',
      signalStrength,
      dataUsage,
      lastContact: lastContact.toLocaleString(),
      alert: signalStrength < 30 || !isOnline,
      alertType: !isOnline ? 'offline' : signalStrength < 30 ? 'weak-signal' : 'none',
      historicalData,
      coordinates: {
        lat: (Math.random() * 180 - 90).toFixed(4),
        lng: (Math.random() * 360 - 180).toFixed(4)
      }
    };
  });

  return vessels;
};

const Dashboard = () => {
  const [vessels, setVessels] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [userRole, setUserRole] = useState('admin'); // admin or client
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [signalFilter, setSignalFilter] = useState('all');
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [currentView, setCurrentView] = useState('overview');

  useEffect(() => {
    const mockData = generateMockData();
    setVessels(mockData);
    setFilteredVessels(mockData);
  }, []);

  useEffect(() => {
    let filtered = vessels.filter(vessel => {
      const matchesSearch = vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vessel.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || vessel.status === statusFilter;
      const matchesSignal = signalFilter === 'all' || 
                           (signalFilter === 'strong' && vessel.signalStrength >= 70) ||
                           (signalFilter === 'weak' && vessel.signalStrength < 70 && vessel.signalStrength > 0) ||
                           (signalFilter === 'none' && vessel.signalStrength === 0);
      
      return matchesSearch && matchesStatus && matchesSignal;
    });
    
    setFilteredVessels(filtered);
  }, [searchTerm, statusFilter, signalFilter, vessels]);

  const refreshData = () => {
    const mockData = generateMockData();
    setVessels(mockData);
    setFilteredVessels(mockData);
  };

  const exportData = (format) => {
    const data = filteredVessels.map(vessel => ({
      Name: vessel.name,
      Location: vessel.location,
      Status: vessel.status,
      'Signal Strength': `${vessel.signalStrength}%`,
      'Data Usage': `${vessel.dataUsage} MB`,
      'Last Contact': vessel.lastContact
    }));

    if (format === 'csv') {
      const csvContent = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vessel_data.csv';
      a.click();
    }
  };

  // Calculate metrics
  const totalVessels = vessels.length;
  const onlineVessels = vessels.filter(v => v.status === 'online').length;
  const alertCount = vessels.filter(v => v.alert).length;
  const avgDataUsage = vessels.reduce((sum, v) => sum + v.dataUsage, 0) / totalVessels;
  const avgSignalStrength = vessels.filter(v => v.status === 'online')
                                  .reduce((sum, v) => sum + v.signalStrength, 0) / onlineVessels;

  // Chart data
  const usageChartData = filteredVessels.slice(0, 10).map(vessel => ({
    name: vessel.name.split(' ')[0],
    usage: vessel.dataUsage
  }));

  const statusChartData = [
    { name: 'Online', value: onlineVessels, color: '#10b981' },
    { name: 'Offline', value: totalVessels - onlineVessels, color: '#ef4444' }
  ];

  // AI Insights
  const generateInsights = () => {
    const insights = [];
    
    if (avgSignalStrength < 60) {
      insights.push({
        type: 'warning',
        title: 'Signal Optimization Needed',
        description: 'Average signal strength is below optimal. Consider repositioning antennas or upgrading equipment.',
        action: 'Review vessel positioning and satellite coverage maps'
      });
    }

    if (avgDataUsage > 300) {
      insights.push({
        type: 'info',
        title: 'High Data Usage Detected',
        description: 'Fleet average data usage is above normal. Bandwidth optimization recommended.',
        action: 'Implement data compression protocols'
      });
    }

    const offlineVessels = vessels.filter(v => v.status === 'offline');
    if (offlineVessels.length > 3) {
      insights.push({
        type: 'alert',
        title: 'Multiple Vessels Offline',
        description: `${offlineVessels.length} vessels are currently offline. Immediate attention required.`,
        action: 'Contact vessel operators for status update'
      });
    }

    return insights;
  };

  const LoginScreen = () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <Ship className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Marine Dashboard</h1>
          <p className="text-gray-600">Tri Tech Marine Connectivity Platform</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => setUserRole('admin')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login as Administrator
          </button>
          <button
            onClick={() => setUserRole('client')}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Login as Client
          </button>
        </div>
      </div>
    </div>
  );

  if (!userRole) {
    return <LoginScreen />;
  }

  const MetricCard = ({ title, value, icon: Icon, color = 'blue', trend }) => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700 hover:border-cyan-500 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className={`text-3xl font-bold ${
            color === 'blue' ? 'text-cyan-400' :
            color === 'green' ? 'text-emerald-400' :
            color === 'red' ? 'text-red-400' :
            color === 'yellow' ? 'text-yellow-400' :
            color === 'purple' ? 'text-purple-400' : 'text-cyan-400'
          }`}>{value}</p>
          {trend && (
            <p className="text-xs text-gray-400 mt-1 flex items-center">
              <TrendingUp className="inline h-3 w-3 mr-1 text-emerald-400" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${
          color === 'blue' ? 'bg-cyan-500/20 border border-cyan-500/30' :
          color === 'green' ? 'bg-emerald-500/20 border border-emerald-500/30' :
          color === 'red' ? 'bg-red-500/20 border border-red-500/30' :
          color === 'yellow' ? 'bg-yellow-500/20 border border-yellow-500/30' :
          color === 'purple' ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-cyan-500/20 border border-cyan-500/30'
        }`}>
          <Icon className={`h-8 w-8 ${
            color === 'blue' ? 'text-cyan-400' :
            color === 'green' ? 'text-emerald-400' :
            color === 'red' ? 'text-red-400' :
            color === 'yellow' ? 'text-yellow-400' :
            color === 'purple' ? 'text-purple-400' : 'text-cyan-400'
          }`} />
        </div>
      </div>
    </div>
  );

  const AlertCard = ({ vessel }) => (
    <div className={`p-4 border-l-4 ${vessel.alertType === 'offline' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'} rounded-r-lg`}>
      <div className="flex items-center">
        <AlertTriangle className={`h-5 w-5 ${vessel.alertType === 'offline' ? 'text-red-500' : 'text-yellow-500'} mr-2`} />
        <div>
          <p className="font-semibold text-gray-800">{vessel.name}</p>
          <p className="text-sm text-gray-600">
            {vessel.alertType === 'offline' ? 'Vessel offline' : `Weak signal: ${vessel.signalStrength}%`}
          </p>
          <p className="text-xs text-gray-500">Last contact: {vessel.lastContact}</p>
        </div>
      </div>
    </div>
  );

  const VesselTable = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Vessel Status</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vessel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVessels.map((vessel) => (
              <tr key={vessel.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Ship className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vessel.name}</div>
                      <div className="text-sm text-gray-500">{vessel.location}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    vessel.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {vessel.status === 'online' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                    {vessel.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900">{vessel.signalStrength}%</div>
                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          vessel.signalStrength > 70 ? 'bg-green-500' : 
                          vessel.signalStrength > 30 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${vessel.signalStrength}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vessel.dataUsage} MB</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vessel.lastContact}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => setSelectedVessel(vessel)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const VesselDetails = ({ vessel }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{vessel.name}</h2>
        <button 
          onClick={() => setSelectedVessel(null)}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Current Status"
          value={vessel.status}
          icon={vessel.status === 'online' ? Wifi : WifiOff}
          color={vessel.status === 'online' ? 'green' : 'red'}
        />
        <MetricCard
          title="Signal Strength"
          value={`${vessel.signalStrength}%`}
          icon={Activity}
          color={vessel.signalStrength > 70 ? 'green' : vessel.signalStrength > 30 ? 'yellow' : 'red'}
        />
        <MetricCard
          title="Data Usage Today"
          value={`${vessel.dataUsage} MB`}
          icon={Database}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Signal Strength Trend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={vessel.historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getDate()} />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`${value}%`, 'Signal Strength']}
              />
              <Line type="monotone" dataKey="signalStrength" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Data Usage Trend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vessel.historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getDate()} />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`${value} MB`, 'Data Usage']}
              />
              <Bar dataKey="dataUsage" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const AIInsights = () => {
    const insights = generateInsights();
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              insight.type === 'alert' ? 'border-red-500 bg-red-50' :
              insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <h4 className="font-semibold text-gray-800">{insight.title}</h4>
              <p className="text-gray-600 mt-1">{insight.description}</p>
              <p className="text-sm font-medium text-gray-700 mt-2">
                Recommended Action: {insight.action}
              </p>
            </div>
          ))}
          {insights.length === 0 && (
            <p className="text-gray-500 text-center py-4">All systems operating normally. No recommendations at this time.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Ship className="h-8 w-8 text-cyan-400 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-white">Tri Tech Marine</h1>
                <p className="text-xs text-cyan-300">Vessel Connectivity Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {userRole === 'admin' && (
                <button 
                  onClick={refreshData}
                  className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              )}
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => exportData('csv')}
                  className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              </div>
              
              <div className="flex items-center bg-gray-700 px-3 py-2 rounded-lg">
                <Users className="h-5 w-5 text-cyan-400 mr-2" />
                <span className="text-sm text-white capitalize font-medium">{userRole}</span>
              </div>
              
              <button 
                onClick={() => setUserRole(null)}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'vessels', 'analytics', 'insights'].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-all duration-200 ${
                  currentView === view
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-cyan-500'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedVessel ? (
          <VesselDetails vessel={selectedVessel} />
        ) : (
          <>
            {/* Filters */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6 mb-8">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Search vessels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 w-64 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-cyan-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                  
                  <select
                    value={signalFilter}
                    onChange={(e) => setSignalFilter(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="all">All Signals</option>
                    <option value="strong">Strong (≥70%)</option>
                    <option value="weak">Weak (&lt;70%)</option>
                    <option value="none">No Signal</option>
                  </select>
                </div>
              </div>
            </div>

            {currentView === 'overview' && (
              <>
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <MetricCard
                    title="Total Vessels"
                    value={totalVessels}
                    icon={Ship}
                    color="blue"
                    trend="+2 this month"
                  />
                  <MetricCard
                    title="Online Vessels"
                    value={onlineVessels}
                    icon={Wifi}
                    color="green"
                    trend={`${Math.round((onlineVessels/totalVessels)*100)}% uptime`}
                  />
                  <MetricCard
                    title="Active Alerts"
                    value={alertCount}
                    icon={AlertTriangle}
                    color="red"
                  />
                  <MetricCard
                    title="Avg Data Usage"
                    value={`${Math.round(avgDataUsage)} MB`}
                    icon={Activity}
                    color="purple"
                    trend="-5% vs last week"
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                      <Database className="h-5 w-5 text-cyan-400 mr-2" />
                      Data Usage by Vessel
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={usageChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151', 
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                          formatter={(value) => [`${value} MB`, 'Data Usage']} 
                        />
                        <Bar dataKey="usage" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06B6D4" />
                            <stop offset="100%" stopColor="#0891B2" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                      <Activity className="h-5 w-5 text-emerald-400 mr-2" />
                      Fleet Status Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151', 
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center mt-4 space-x-6">
                      {statusChartData.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm text-gray-300 font-medium">{item.name}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {alertCount > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      Active Alerts ({alertCount})
                    </h3>
                    <div className="space-y-3">
                      {vessels.filter(v => v.alert).slice(0, 5).map(vessel => (
                        <AlertCard key={vessel.id} vessel={vessel} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {currentView === 'vessels' && <VesselTable />}

            {currentView === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Average Signal Strength Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={vessels[0]?.historicalData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getDate()} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value) => [`${value}%`, 'Signal Strength']}
                      />
                      <Line type="monotone" dataKey="signalStrength" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Fleet Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Average Uptime</span>
                      <span className="font-semibold text-green-600">{Math.round((onlineVessels/totalVessels)*100)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Total Data Usage</span>
                      <span className="font-semibold text-blue-600">{Math.round(vessels.reduce((sum, v) => sum + v.dataUsage, 0))} MB</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Average Signal Strength</span>
                      <span className="font-semibold text-yellow-600">{Math.round(avgSignalStrength || 0)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Critical Alerts</span>
                      <span className="font-semibold text-red-600">{alertCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'insights' && <AIInsights />}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;