import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import LogViewer from './components/LogViewer';
import AlertViewer from './components/AlertViewer';
import AbuseIPDBChecker from './components/AbuseIPDBChecker';
import ReportDownloader from './components/ReportDownloader';
import About from './components/About';
import HelpGuide from './components/HelpGuide';
import { parseLog, detectThreats, LogEvent, Alert } from './parserEngine';

// IP Reputation cache (memory only)
const ipReputationCache = new Map<string, IPReputation>();

interface IPReputation {
  ipAddress: string;
  isPublic: boolean;
  ipVersion: number;
  isWhitelisted: boolean;
  abuseConfidenceScore: number;
  countryCode: string;
  countryName: string;
  usageType: string;
  isp: string;
  domain: string;
  hostnames: string[];
  isTor: boolean;
  totalReports: number;
  numDistinctUsers: number;
  lastReportedAt: string;
}

const App: React.FC = () => {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  // API key for AbuseIPDB (user must provide their own key)
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [enrichedData, setEnrichedData] = useState<IPReputation[]>([]);
  // Demo mode ON by default - users can switch to live API mode with their own key
  const [demoMode, setDemoMode] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Handle file upload
  const handleFileLoad = useCallback((content: string, name: string) => {
    processLogFile(content, name);
  }, []);

  // Process log file using the parsing engine
  const processLogFile = useCallback(async (content: string, fileName: string = 'log.txt') => {
    setLoading(true);
    setProcessingStatus('Detecting format and parsing log file...');

    // Use setTimeout to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      // Parse log content with format detection
      const parsedEvents = parseLog(content, fileName);
      setEvents(parsedEvents);
      setProcessingStatus(`Parsed ${parsedEvents.length} events. Detecting threats...`);

      await new Promise(resolve => setTimeout(resolve, 50));

      // Detect threats
      const detectedAlerts = detectThreats(parsedEvents);
      setAlerts(detectedAlerts);
      setProcessingStatus('');
    } catch (error) {
      console.error('Error processing log file:', error);
      setProcessingStatus('Error processing log file');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check IP reputation with AbuseIPDB (real API or demo mode)
  const checkIPReputation = useCallback(async (ip: string): Promise<IPReputation | null> => {
    // Check cache first
    if (ipReputationCache.has(ip)) {
      return ipReputationCache.get(ip)!;
    }

    // Demo mode - return realistic mock data
    if (demoMode || !apiKey) {
      const mockResult = generateMockIPReputation(ip);
      ipReputationCache.set(ip, mockResult);
      return mockResult;
    }

    // Real API call
    try {
      const response = await fetch(
        `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`,
        {
          method: 'GET',
          headers: {
            'Key': apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Try again later.');
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const result: IPReputation = {
        ipAddress: data.data.ipAddress,
        isPublic: data.data.isPublic,
        ipVersion: data.data.ipVersion,
        isWhitelisted: data.data.isWhitelisted || false,
        abuseConfidenceScore: data.data.abuseConfidenceScore,
        countryCode: data.data.countryCode || 'Unknown',
        countryName: data.data.countryName || 'Unknown',
        usageType: data.data.usageType || 'Unknown',
        isp: data.data.isp || 'Unknown',
        domain: data.data.domain || 'Unknown',
        hostnames: data.data.hostnames || [],
        isTor: data.data.isTor || false,
        totalReports: data.data.totalReports || 0,
        numDistinctUsers: data.data.numDistinctUsers || 0,
        lastReportedAt: data.data.lastReportedAt || '',
      };

      // Cache the result
      ipReputationCache.set(ip, result);
      setEnrichedData(prev => [...prev, result]);
      return result;
    } catch (error) {
      // If CORS or network error, fall back to demo mode
      console.warn('AbuseIPDB API error, using demo mode:', error);
      const mockResult = generateMockIPReputation(ip);
      ipReputationCache.set(ip, mockResult);
      return mockResult;
    }
  }, [apiKey, demoMode]);

  // Generate realistic mock IP reputation data
  const generateMockIPReputation = (ip: string): IPReputation => {
    // Use IP to generate consistent mock data
    const ipSum = ip.split('.').reduce((sum, part) => sum + parseInt(part, 10), 0);
    const isKnownBad = ipSum % 5 === 0;
    const isTor = ipSum % 13 === 0;

    const countries = [
      { code: 'US', name: 'United States' },
      { code: 'CN', name: 'China' },
      { code: 'RU', name: 'Russia' },
      { code: 'DE', name: 'Germany' },
      { code: 'BR', name: 'Brazil' },
      { code: 'IN', name: 'India' },
      { code: 'NL', name: 'Netherlands' },
    ];
    const country = countries[ipSum % countries.length];

    const isps = [
      'Amazon Technologies Inc.',
      'Google LLC',
      'Microsoft Corporation',
      'DigitalOcean, LLC',
      'OVH SAS',
      'Cloudflare, Inc.',
      'Linode, LLC',
    ];

    return {
      ipAddress: ip,
      isPublic: true,
      ipVersion: 4,
      isWhitelisted: false,
      abuseConfidenceScore: isKnownBad ? Math.floor(60 + (ipSum % 40)) : Math.floor(ipSum % 30),
      countryCode: country.code,
      countryName: country.name,
      usageType: isKnownBad ? 'Data Center/Web Hosting' : 'ISP',
      isp: isps[ipSum % isps.length],
      domain: `host-${ip.replace(/\./g, '-')}.example.com`,
      hostnames: [`host-${ip.replace(/\./g, '-')}.example.com`],
      isTor,
      totalReports: isKnownBad ? Math.floor(10 + (ipSum % 100)) : Math.floor(ipSum % 5),
      numDistinctUsers: isKnownBad ? Math.floor(5 + (ipSum % 20)) : Math.floor(ipSum % 3),
      lastReportedAt: isKnownBad
        ? new Date(Date.now() - (ipSum % 7) * 24 * 60 * 60 * 1000).toISOString()
        : '',
    };
  };

  // Reset all data
  const handleReset = useCallback(() => {
    setEvents([]);
    setAlerts([]);
    setEnrichedData([]);
    setProcessingStatus('');
    ipReputationCache.clear();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">🛡️</div>
            <div className="logo-text">
              <h1>SentinelLog</h1>
              <p className="tagline">Privacy-First Security Log Analysis</p>
            </div>
          </div>
          <p className="privacy-notice">
            All log analysis is performed entirely in the browser using Rust and WebAssembly,
            ensuring privacy and eliminating server-side data exposure.
          </p>
        </div>

        <div className="header-buttons">
          <button onClick={() => setHelpOpen(true)} className="help-button">
            <span className="button-icon">📚</span> How To
          </button>
          <button onClick={() => setAboutOpen(true)} className="about-button">
            <span className="button-icon">ℹ️</span> About
          </button>
          {(events.length > 0 || alerts.length > 0) && (
            <button onClick={handleReset} className="reset-button">
              <span className="button-icon">🔄</span> Reset Analysis
            </button>
          )}
        </div>
      </header>

      <About isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <HelpGuide isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      <main className="app-main">
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>{processingStatus || 'Processing...'}</p>
          </div>
        )}

        <section className="upload-section">
          <FileUpload onFileLoad={handleFileLoad} />
        </section>

        {events.length > 0 && (
          <section className="results-section">
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-number">{events.length}</span>
                <span className="stat-label">Events Parsed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number alert-count">{alerts.length}</span>
                <span className="stat-label">Alerts Detected</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {[...new Set(events.map(e => e.source_ip).filter(ip => ip !== 'unknown'))].length}
                </span>
                <span className="stat-label">Unique IPs</span>
              </div>
            </div>
            <LogViewer events={events} />
          </section>
        )}

        {alerts.length > 0 && (
          <section className="alerts-section">
            <AlertViewer alerts={alerts} />
          </section>
        )}

        <section className="abuseipdb-section">
          <AbuseIPDBChecker
            apiKey={apiKey}
            setApiKey={setApiKey}
            onCheckIP={checkIPReputation}
            demoMode={demoMode}
            setDemoMode={setDemoMode}
            detectedIps={[...new Set(alerts.flatMap(a => a.source_ips))]}
          />
        </section>

        {(events.length > 0 || alerts.length > 0) && (
          <section className="download-section">
            <ReportDownloader
              reportData={{
                events,
                alerts,
                enrichedData,
              }}
            />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>
          SentinelLog • Built by{' '}
          <a href="https://github.com/Ashutoshgit47" target="_blank" rel="noopener noreferrer">
            Ashutosh Gautam
          </a>{' '}
          •{' '}
          <a href="https://github.com/Ashutoshgit47/SentinelLogs" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;