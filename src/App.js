import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Ship, Wifi, WifiOff, Download, RefreshCw, Search, Filter, AlertTriangle, Users, Activity, Database, TrendingUp, Upload, ArrowUpDown, Building2, Anchor } from 'lucide-react';

// Mock data generation with fleet structure
const generateMockData = () => {
  const clients = [
    'Maritime Solutions Inc', 'Ocean Fleet Corp', 'Coastal Shipping Ltd', 'Deep Sea Logistics',
    'Pacific Marine Group', 'Atlantic Vessels Co', 'Nordic Shipping', 'Mediterranean Fleet',
    'Caribbean Marine', 'Gulf Coast Operations'
  ];

  const vesselNamesByType = {
    'Cargo': ['Atlantic Explorer', 'Pacific Dawn', 'Ocean Master', 'Sea Guardian', 'Marine Pioneer'],
    'Tanker': ['Coastal Ranger', 'Deep Sea Hunter', 'Wave Rider', 'Storm Chaser', 'Blue Horizon'],
    'Container': ['Arctic Voyager', 'Tropical Wind', 'Ocean Spirit', 'Sea Breeze', 'Maritime Glory'],
    'Bulk': ['Neptune Pride', 'Coral Explorer', 'Tide Runner', 'Seafarer', 'Ocean Quest']
  };

  const locations = [
    'North Atlantic', 'Pacific Ocean', 'Mediterranean Sea', 'Indian Ocean', 'Gulf of Mexico',
    'Caribbean Sea', 'Red Sea', 'Baltic Sea', 'North Sea', 'Arabian Sea'
  ];

  const fleets = [];
  
  clients.forEach((clientName, clientIndex) => {
    const numFleets = Math.floor(Math.random() * 3) + 2; // 2-4 fleets per client
    
    for (let fleetIndex = 0; fleetIndex < numFleets; fleetIndex++) {
      const fleetName = `Fleet ${String.fromCharCode(65 + fleetIndex)}`; // Fleet A, B, C, etc.
      const vesselTypes = Object.keys(vesselNamesByType);
      const fleetType = vesselTypes[Math.floor(Math.random() * vesselTypes.length)];
      const numVessels = Math.floor(Math.random() * 8) + 3; // 3-10 vessels per fleet
      
      const vessels = [];
      
      for (let vesselIndex = 0; vesselIndex < numVessels; vesselIndex++) {
        const isOnline = Math.random() > 0.2;
        const signalStrength = isOnline ? Math.floor(Math.random() * 40) + 60 : 0;
        const dataUsage = isOnline ? Math.floor(Math.random() * 500) + 50 : 0;
        const downloadSpeed = isOnline ? Math.floor(Math.random() * 50) + 10 : 0;
        const uploadSpeed = isOnline ? Math.floor(Math.random() * 20) + 5 : 0;
        const lastContact = new Date(Date.now() - Math.random() * 86400000 * 7);
        
        // Generate 30 days of historical data
        const historicalData = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          const baseSignal = Math.floor(Math.random() * 40) + 40 + (isOnline ? 20 : -20);
          return {
            date: date.toISOString().split('T')[0],
            signalStrength: Math.max(0, baseSignal + (Math.random() - 0.5) * 20),
            dataUsage: Math.floor(Math.random() * 400) + 100,
            downloadSpeed: Math.floor(Math.random() * 45) + 15,
            uploadSpeed: Math.floor(Math.random() * 18) + 7,
            uptime: Math.random() * 24
          };
        });

        // Generate real-time data points for streaming effect
        const realtimeData = Array.from({ length: 60 }, (_, i) => {
          const timestamp = new Date(Date.now() - (59 - i) * 1000);
          return {
            timestamp: timestamp.toISOString(),
            signalStrength: Math.max(0, signalStrength + (Math.random() - 0.5) * 10),
            downloadSpeed: Math.max(0, downloadSpeed + (Math.random() - 0.5) * 10),
            uploadSpeed: Math.max(0, uploadSpeed + (Math.random() - 0.5) * 5),
            dataUsage: Math.floor(Math.random() * 10) + 1
          };
        });

        const availableNames = vesselNamesByType[fleetType];
        const vesselName = availableNames[vesselIndex % availableNames.length] + 
                          (vesselIndex >= availableNames.length ? ` ${Math.floor(vesselIndex / availableNames.length) + 1}` : '');

        vessels.push({
          id: `${clientIndex}-${fleetIndex}-${vesselIndex}`,
          name: vesselName,
          type: fleetType,
          location: locations[Math.floor(Math.random() * locations.length)],
          status: isOnline ? 'online' : 'offline',
          signalStrength,
          dataUsage,
          downloadSpeed,
          uploadSpeed,
          lastContact: lastContact.toLocaleString(),
          alert: signalStrength < 30 || !isOnline,
          alertType: !isOnline ? 'offline' : signalStrength < 30 ? 'weak-signal' : 'none',
          historicalData,
          realtimeData,
          coordinates: {
            lat: (Math.random() * 180 - 90).toFixed(4),
            lng: (Math.random() * 360 - 180).toFixed(4)
          }
        });
      }

      fleets.push({
        id: `${clientIndex}-${fleetIndex}`,
        name: fleetName,
        client: clientName,
        type: fleetType,
        vessels: vessels,
        totalVessels: vessels.length,
        onlineVessels: vessels.filter(v => v.status === 'online').length,
        avgSignalStrength: vessels.filter(v => v.status === 'online')
                                 .reduce((sum, v) => sum + v.signalStrength, 0) / vessels.filter(v => v.status === 'online').length || 0,
        totalDataUsage: vessels.reduce((sum, v) => sum + v.dataUsage, 0)
      });
    }
  });

  return fleets;
};

const App = () => {
  const [fleets, setFleets] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [userRole, setUserRole] = useState('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [signalFilter, setSignalFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [fleetFilter, setFleetFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [currentView, setCurrentView] = useState('overview');
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  // Real-time data updates
  useEffect(() => {
    if (!realtimeEnabled) return;
    
    const interval = setInterval(() => {
      setFleets(prevFleets => 
        prevFleets.map(fleet => ({
          ...fleet,
          vessels: fleet.vessels.map(vessel => {
            if (vessel.status === 'offline') return vessel;
            
            // Update real-time data
            const newDataPoint = {
              timestamp: new Date().toISOString(),
              signalStrength: Math.max(0, vessel.signalStrength + (Math.random() - 0.5) * 5),
              downloadSpeed: Math.max(0, vessel.downloadSpeed + (Math.random() - 0.5) * 8),
              uploadSpeed: Math.max(0, vessel.uploadSpeed + (Math.random() - 0.5) * 3),
              dataUsage: Math.floor(Math.random() * 10) + 1
            };
            
            const updatedRealtimeData = [...vessel.realtimeData.slice(1), newDataPoint];
            
            return {
              ...vessel,
              signalStrength: newDataPoint.signalStrength,
              downloadSpeed: newDataPoint.downloadSpeed,
              uploadSpeed: newDataPoint.uploadSpeed,
              realtimeData: updatedRealtimeData
            };
          })
        }))
      );
    }, 50000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [realtimeEnabled]);

  useEffect(() => {
    const mockData = generateMockData();
    setFleets(mockData);
  }, []);

  // Memoize allVessels to prevent infinite loops
  const allVessels = React.useMemo(() => 
    fleets.flatMap(fleet => 
      fleet.vessels.map(vessel => ({ ...vessel, fleet: fleet.name, client: fleet.client }))
    ), [fleets]);

  // Get unique clients and fleets for filters
  const clients = React.useMemo(() => [...new Set(fleets.map(fleet => fleet.client))], [fleets]);
  const availableFleets = React.useMemo(() => 
    clientFilter === 'all' ? fleets : fleets.filter(fleet => fleet.client === clientFilter),
    [fleets, clientFilter]
  );

  useEffect(() => {
    let filtered = allVessels.filter(vessel => {
      const matchesSearch = vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vessel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vessel.fleet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vessel.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || vessel.status === statusFilter;
      const matchesSignal = signalFilter === 'all' || 
                           (signalFilter === 'strong' && vessel.signalStrength >= 70) ||
                           (signalFilter === 'weak' && vessel.signalStrength < 70 && vessel.signalStrength > 0) ||
                           (signalFilter === 'none' && vessel.signalStrength === 0);
      const matchesClient = clientFilter === 'all' || vessel.client === clientFilter;
      const matchesFleet = fleetFilter === 'all' || vessel.fleet === fleetFilter;
      
      return matchesSearch && matchesStatus && matchesSignal && matchesClient && matchesFleet;
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'signal':
          aVal = a.signalStrength;
          bVal = b.signalStrength;
          break;
        case 'dataUsage':
          aVal = a.dataUsage;
          bVal = b.dataUsage;
          break;
        case 'fleet':
          aVal = a.fleet.toLowerCase();
          bVal = b.fleet.toLowerCase();
          break;
        case 'client':
          aVal = a.client.toLowerCase();
          bVal = b.client.toLowerCase();
          break;
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredVessels(filtered);
  }, [searchTerm, statusFilter, signalFilter, clientFilter, fleetFilter, sortBy, sortOrder, allVessels]);

  const refreshData = () => {
    const mockData = generateMockData();
    setFleets(mockData);
  };

  const exportData = (format) => {
    const data = filteredVessels.map(vessel => ({
      Name: vessel.name,
      Client: vessel.client,
      Fleet: vessel.fleet,
      Type: vessel.type,
      Location: vessel.location,
      Status: vessel.status,
      'Signal Strength': `${vessel.signalStrength}%`,
      'Data Usage': `${vessel.dataUsage} MB`,
      'Download Speed': `${vessel.downloadSpeed} Mbps`,
      'Upload Speed': `${vessel.uploadSpeed} Mbps`,
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

  // Calculate metrics with memoization
  const totalVessels = React.useMemo(() => allVessels.length, [allVessels]);
  const onlineVessels = React.useMemo(() => allVessels.filter(v => v.status === 'online').length, [allVessels]);
  const alertCount = React.useMemo(() => allVessels.filter(v => v.alert).length, [allVessels]);
  const avgDataUsage = React.useMemo(() => allVessels.reduce((sum, v) => sum + v.dataUsage, 0) / totalVessels, [allVessels, totalVessels]);
  const avgSignalStrength = React.useMemo(() => {
    const onlineVesselsList = allVessels.filter(v => v.status === 'online');
    return onlineVesselsList.length > 0 ? 
      onlineVesselsList.reduce((sum, v) => sum + v.signalStrength, 0) / onlineVesselsList.length : 0;
  }, [allVessels]);

  // Chart data for selected vessels with memoization
  const usageChartData = React.useMemo(() => 
    filteredVessels.slice(0, 10).map(vessel => ({
      name: vessel.name.split(' ')[0],
      usage: vessel.dataUsage,
      download: vessel.downloadSpeed,
      upload: vessel.uploadSpeed
    })), [filteredVessels]);

  const statusChartData = React.useMemo(() => [
    { name: 'Online', value: onlineVessels, color: '#10b981' },
    { name: 'Offline', value: totalVessels - onlineVessels, color: '#ef4444' }
  ], [onlineVessels, totalVessels]);

  // Fleet-wise data usage with memoization
  const fleetDataUsage = React.useMemo(() => 
    availableFleets.map(fleet => ({
      name: fleet.name,
      client: fleet.client,
      usage: fleet.totalDataUsage,
      vessels: fleet.totalVessels,
      online: fleet.onlineVessels
    })), [availableFleets]);

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
            Fleet: {vessel.fleet} | Client: {vessel.client}
          </p>
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
        <h3 className="text-lg font-semibold text-gray-900">Vessel Status ({filteredVessels.length} vessels)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vessel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fleet/Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speeds</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Usage</th>
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
                  <div className="text-sm text-gray-900">{vessel.fleet}</div>
                  <div className="text-sm text-gray-500">{vessel.client}</div>
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
                    <div className="text-sm text-gray-900">{Math.round(vessel.signalStrength)}%</div>
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Download className="h-3 w-3 mr-1 text-green-600" />
                    {Math.round(vessel.downloadSpeed)} Mbps
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Upload className="h-3 w-3 mr-1 text-blue-600" />
                    {Math.round(vessel.uploadSpeed)} Mbps
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vessel.dataUsage} MB</td>
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{vessel.name}</h2>
          <p className="text-gray-600">{vessel.fleet} - {vessel.client}</p>
        </div>
        <button 
          onClick={() => setSelectedVessel(null)}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Current Status"
          value={vessel.status}
          icon={vessel.status === 'online' ? Wifi : WifiOff}
          color={vessel.status === 'online' ? 'green' : 'red'}
        />
        <MetricCard
          title="Signal Strength"
          value={`${Math.round(vessel.signalStrength)}%`}
          icon={Activity}
          color={vessel.signalStrength > 70 ? 'green' : vessel.signalStrength > 30 ? 'yellow' : 'red'}
        />
        <MetricCard
          title="Download Speed"
          value={`${Math.round(vessel.downloadSpeed)} Mbps`}
          icon={Download}
          color="green"
        />
        <MetricCard
          title="Upload Speed"
          value={`${Math.round(vessel.uploadSpeed)} Mbps`}
          icon={Upload}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Real-time streaming chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Real-time Performance</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={vessel.realtimeData.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString().split(':').slice(0,2).join(':')} 
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                formatter={(value, name) => [
                  name === 'signalStrength' ? `${Math.round(value)}%` : 
                  name === 'downloadSpeed' ? `${Math.round(value)} Mbps` : 
                  `${Math.round(value)} Mbps`, 
                  name === 'signalStrength' ? 'Signal' : 
                  name === 'downloadSpeed' ? 'Download' : 'Upload'
                ]}
              />
              <Line type="monotone" dataKey="signalStrength" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="downloadSpeed" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="uploadSpeed" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Speed Trends (30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={vessel.historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getDate()} />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [
                  `${Math.round(value)} Mbps`, 
                  name === 'downloadSpeed' ? 'Download Speed' : 'Upload Speed'
                ]}
              />
              <Area type="monotone" dataKey="downloadSpeed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="uploadSpeed" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
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
                formatter={(value) => [`${Math.round(value)}%`, 'Signal Strength']}
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

  const FleetOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Fleet-wise Data Usage</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fleetDataUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value} MB`, 'Total Usage']} />
                <Bar dataKey="usage" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Fleet Status Summary</h4>
            <div className="space-y-3">
              {fleetDataUsage.map((fleet, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{fleet.name}</div>
                    <div className="text-sm text-gray-500">{fleet.client}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{fleet.online}/{fleet.vessels} Online</div>
                    <div className="text-xs text-gray-500">{Math.round((fleet.online/fleet.vessels)*100)}% Uptime</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRealtimeEnabled(!realtimeEnabled)}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    realtimeEnabled 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${realtimeEnabled ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></div>
                  {realtimeEnabled ? 'Live' : 'Paused'}
                </button>
              </div>

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
            {['overview', 'fleets', 'vessels', 'analytics', 'insights'].map((view) => (
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
            {/* Enhanced Filters */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Search vessels, fleets, clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                
                {/* Client Filter */}
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-cyan-400" />
                  <select
                    value={clientFilter}
                    onChange={(e) => {
                      setClientFilter(e.target.value);
                      setFleetFilter('all'); // Reset fleet filter when client changes
                    }}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full"
                  >
                    <option value="all">All Clients</option>
                    {clients.map(client => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                </div>
                
                {/* Fleet Filter */}
                <div className="flex items-center space-x-2">
                  <Anchor className="h-5 w-5 text-cyan-400" />
                  <select
                    value={fleetFilter}
                    onChange={(e) => setFleetFilter(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full"
                  >
                    <option value="all">All Fleets</option>
                    {availableFleets.map(fleet => (
                      <option key={fleet.id} value={fleet.name}>{fleet.name} ({fleet.client})</option>
                    ))}
                  </select>
                </div>
                
                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-cyan-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
              
              {/* Sort Controls - Only show for vessels view */}
              {currentView === 'vessels' && (
                <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="h-5 w-5 text-cyan-400" />
                    <span className="text-sm text-gray-300">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="name">Name</option>
                      <option value="client">Client</option>
                      <option value="fleet">Fleet</option>
                      <option value="status">Status</option>
                      <option value="signal">Signal Strength</option>
                      <option value="dataUsage">Data Usage</option>
                    </select>
                    
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={signalFilter}
                      onChange={(e) => setSignalFilter(e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="all">All Signals</option>
                      <option value="strong">Strong (≥70%)</option>
                      <option value="weak">Weak (&lt;70%)</option>
                      <option value="none">No Signal</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {currentView === 'overview' && (
              <>
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                    title="Total Clients"
                    value={clients.length}
                    icon={Building2}
                    color="purple"
                  />
                  <MetricCard
                    title="Active Fleets"
                    value={fleets.length}
                    icon={Anchor}
                    color="yellow"
                  />
                  <MetricCard
                    title="Active Alerts"
                    value={alertCount}
                    icon={AlertTriangle}
                    color="red"
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Enhanced Data Usage Chart */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                      <Database className="h-5 w-5 text-cyan-400 mr-2" />
                      Fleet Performance Overview
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
                          formatter={(value, name) => [
                            name === 'usage' ? `${value} MB` :
                            name === 'download' ? `${value} Mbps` :
                            `${value} Mbps`,
                            name === 'usage' ? 'Data Usage' :
                            name === 'download' ? 'Download Speed' :
                            'Upload Speed'
                          ]} 
                        />
                        <Bar dataKey="usage" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="download" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="upload" fill="#F59E0B" radius={[4, 4, 0, 0]} />
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
                      {allVessels.filter(v => v.alert).slice(0, 5).map(vessel => (
                        <AlertCard key={vessel.id} vessel={vessel} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {currentView === 'fleets' && <FleetOverview />}
            {currentView === 'vessels' && <VesselTable />}

            {currentView === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Fleet-wise Performance Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={fleetDataUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'usage' ? `${value} MB` : value,
                          name === 'usage' ? 'Data Usage' : name
                        ]}
                      />
                      <Bar dataKey="usage" fill="#3b82f6" />
                      <Bar dataKey="online" fill="#10b981" />
                    </BarChart>
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
                      <span className="font-semibold text-blue-600">{Math.round(allVessels.reduce((sum, v) => sum + v.dataUsage, 0))} MB</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Average Signal Strength</span>
                      <span className="font-semibold text-yellow-600">{Math.round(avgSignalStrength || 0)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Active Clients</span>
                      <span className="font-semibold text-purple-600">{clients.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'insights' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
                <div className="space-y-4">
                  {avgSignalStrength < 60 && (
                    <div className="p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50">
                      <h4 className="font-semibold text-gray-800">Signal Optimization Needed</h4>
                      <p className="text-gray-600 mt-1">Average signal strength across fleet is below optimal. Consider repositioning antennas or upgrading equipment.</p>
                      <p className="text-sm font-medium text-gray-700 mt-2">Recommended Action: Review vessel positioning and satellite coverage maps</p>
                    </div>
                  )}
                  
                  {alertCount > 5 && (
                    <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
                      <h4 className="font-semibold text-gray-800">Multiple Alerts Detected</h4>
                      <p className="text-gray-600 mt-1">{alertCount} vessels require immediate attention. Priority response recommended.</p>
                      <p className="text-sm font-medium text-gray-700 mt-2">Recommended Action: Contact vessel operators for status update</p>
                    </div>
                  )}
                  
                  {clients.length > 8 && (
                    <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
                      <h4 className="font-semibold text-gray-800">Fleet Expansion Opportunity</h4>
                      <p className="text-gray-600 mt-1">Strong client base of {clients.length} active clients. Consider expanding service offerings.</p>
                      <p className="text-sm font-medium text-gray-700 mt-2">Recommended Action: Analyze client growth patterns and service utilization</p>
                    </div>
                  )}
                  
                  {(totalVessels - onlineVessels) === 0 && (
                    <div className="p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
                      <h4 className="font-semibold text-gray-800">Excellent Fleet Performance</h4>
                      <p className="text-gray-600 mt-1">All vessels are currently online with strong connectivity. System performance is optimal.</p>
                      <p className="text-sm font-medium text-gray-700 mt-2">Status: All systems operating normally</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;