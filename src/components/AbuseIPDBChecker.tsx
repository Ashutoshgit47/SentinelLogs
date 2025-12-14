import React, { useState } from 'react';

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

interface AbuseIPDBCheckerProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onCheckIP: (ip: string) => Promise<IPReputation | null>;
  demoMode: boolean;
  setDemoMode: (mode: boolean) => void;
  detectedIps: string[];
}

const AbuseIPDBChecker: React.FC<AbuseIPDBCheckerProps> = ({
  apiKey,
  setApiKey,
  onCheckIP,
  demoMode,
  setDemoMode,
  detectedIps,
}) => {
  const [ipAddress, setIpAddress] = useState('');
  const [reputation, setReputation] = useState<IPReputation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (ip?: string) => {
    const ipToCheck = ip || ipAddress;

    if (!demoMode && !apiKey) {
      setError('Please enter your AbuseIPDB API key or enable Demo Mode');
      return;
    }

    if (!ipToCheck) {
      setError('Please enter an IP address');
      return;
    }

    // Validate IP format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipToCheck)) {
      setError('Invalid IP address format');
      return;
    }

    setLoading(true);
    setError('');
    setReputation(null);
    setIpAddress(ipToCheck);

    try {
      const result = await onCheckIP(ipToCheck);
      if (result) {
        setReputation(result);
      } else {
        setError('Failed to retrieve IP reputation data');
      }
    } catch (err) {
      setError('Error checking IP reputation: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return '#ff4444';
    if (score >= 40) return '#ffaa00';
    return '#44ff44';
  };

  const getThreatLevel = (score: number): string => {
    if (score >= 80) return 'Critical Threat';
    if (score >= 60) return 'High Threat';
    if (score >= 40) return 'Moderate Threat';
    if (score >= 20) return 'Low Threat';
    return 'Clean';
  };

  return (
    <div className="abuseipdb-checker">
      <div className="section-header">
        <h2>
          <span className="section-icon">🔍</span>
          IP Threat Intelligence
        </h2>
        <p className="section-description">
          Check IP reputation using AbuseIPDB
        </p>
      </div>

      <div className="mode-toggle">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={demoMode}
            onChange={(e) => setDemoMode(e.target.checked)}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-text">
            {demoMode ? 'Demo Mode (No API Key Required)' : 'Live API Mode'}
          </span>
        </label>
      </div>

      {!demoMode && (
        <div className="api-key-section">
          <label htmlFor="api-key">AbuseIPDB API Key:</label>
          <input
            type="password"
            id="api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key (stored in memory only)"
          />
          <div className="api-notice">
            <div className="notice-item">
              <span className="note-icon">🔒</span>
              <span>Your API key is stored in browser memory only and never persisted.</span>
            </div>
            <div className="notice-item">
              <span className="note-icon">🎁</span>
              <span>
                Get a <strong>free API key</strong> at{' '}
                <a href="https://www.abuseipdb.com" target="_blank" rel="noopener noreferrer">
                  abuseipdb.com
                </a>{' '}
                for live threat intelligence. Free tier offers <strong>1,000 requests/day</strong>.
              </span>
            </div>
            <div className="notice-item recommendation">
              <span className="note-icon">💡</span>
              <span>
                <strong>Recommended:</strong> Use <strong>Demo Mode</strong> for testing,
                or get your own free API key at{' '}
                <a href="https://www.abuseipdb.com" target="_blank" rel="noopener noreferrer">
                  abuseipdb.com
                </a>
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="ip-check-section">
        <label htmlFor="ip-address">IP Address to Check:</label>
        <div className="ip-input-group">
          <input
            type="text"
            id="ip-address"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="Enter IP address (e.g., 192.168.1.1)"
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          />
          <button
            onClick={() => handleCheck()}
            disabled={loading}
            className="check-button"
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Checking...
              </>
            ) : (
              <>
                <span className="button-icon">🔎</span>
                Check IP
              </>
            )}
          </button>
        </div>
      </div>

      {detectedIps.length > 0 && (
        <div className="detected-ips-section">
          <h3>Detected Suspicious IPs</h3>
          <div className="ip-chips">
            {detectedIps.slice(0, 10).map((ip) => (
              <button
                key={ip}
                className="ip-chip"
                onClick={() => handleCheck(ip)}
                disabled={loading}
              >
                {ip}
              </button>
            ))}
            {detectedIps.length > 10 && (
              <span className="ip-chip-more">+{detectedIps.length - 10} more</span>
            )}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {reputation && (
        <div className="reputation-results">
          <div className="reputation-header">
            <h3>IP Reputation Results</h3>
            {demoMode && <span className="demo-badge">Demo Data</span>}
          </div>

          <div className="threat-score-container">
            <div
              className="threat-score"
              style={{ borderColor: getScoreColor(reputation.abuseConfidenceScore) }}
            >
              <span className="score-value">{reputation.abuseConfidenceScore}</span>
              <span className="score-label">Abuse Score</span>
            </div>
            <div
              className="threat-level"
              style={{ color: getScoreColor(reputation.abuseConfidenceScore) }}
            >
              {getThreatLevel(reputation.abuseConfidenceScore)}
            </div>
          </div>

          <div className="reputation-grid">
            <div className="reputation-item">
              <span className="item-label">IP Address</span>
              <span className="item-value">{reputation.ipAddress}</span>
            </div>
            <div className="reputation-item">
              <span className="item-label">Country</span>
              <span className="item-value">
                {reputation.countryName} ({reputation.countryCode})
              </span>
            </div>
            <div className="reputation-item">
              <span className="item-label">ISP</span>
              <span className="item-value">{reputation.isp}</span>
            </div>
            <div className="reputation-item">
              <span className="item-label">Usage Type</span>
              <span className="item-value">{reputation.usageType}</span>
            </div>
            <div className="reputation-item">
              <span className="item-label">Total Reports</span>
              <span className="item-value highlight">{reputation.totalReports}</span>
            </div>
            <div className="reputation-item">
              <span className="item-label">Distinct Reporters</span>
              <span className="item-value">{reputation.numDistinctUsers}</span>
            </div>
            {reputation.isTor && (
              <div className="reputation-item warning">
                <span className="item-label">TOR Network</span>
                <span className="item-value">⚠️ Yes</span>
              </div>
            )}
            {reputation.lastReportedAt && (
              <div className="reputation-item">
                <span className="item-label">Last Reported</span>
                <span className="item-value">
                  {new Date(reputation.lastReportedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="confidence-meter">
            <div className="meter-header">
              <span>Abuse Confidence</span>
              <span>{reputation.abuseConfidenceScore}%</span>
            </div>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${reputation.abuseConfidenceScore}%`,
                  backgroundColor: getScoreColor(reputation.abuseConfidenceScore),
                }}
              ></div>
            </div>
            <div className="meter-labels">
              <span>Safe</span>
              <span>Moderate</span>
              <span>Dangerous</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbuseIPDBChecker;