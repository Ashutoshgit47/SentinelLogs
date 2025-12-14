import React, { useState } from 'react';

interface Alert {
  id: string;
  name: string;
  severity: string;
  mitre_technique: string;
  evidence: string;
  timestamp: string;
  source_ips?: string[];
}

interface AlertViewerProps {
  alerts: Alert[];
}

const AlertViewer: React.FC<AlertViewerProps> = ({ alerts }) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'severity-critical';
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return '';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const closeModal = () => setSelectedAlert(null);

  return (
    <div className="alert-viewer">
      <div className="section-header">
        <h2>
          <span className="section-icon">🚨</span>
          Detection Alerts
        </h2>
        <p className="section-description">
          Security threats identified in your log files
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="no-alerts">
          <span className="no-alerts-icon">✅</span>
          <p>No security alerts detected</p>
        </div>
      ) : (
        <div className="alerts-container">
          {alerts.map((alert, index) => (
            <div
              key={`${alert.id}-${index}`}
              className={`alert-card ${getSeverityClass(alert.severity)}`}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="alert-header">
                <span className="severity-icon">{getSeverityIcon(alert.severity)}</span>
                <h3>{alert.name}</h3>
                <span className={`severity-badge ${getSeverityClass(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
              <div className="alert-preview">
                <p className="mitre-tag">
                  <span className="tag-label">MITRE:</span> {alert.mitre_technique}
                </p>
                <p className="evidence-preview">{alert.evidence}</p>
              </div>
              <div className="alert-footer">
                <span className="view-details">View Details →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>

            <div className={`modal-header ${getSeverityClass(selectedAlert.severity)}`}>
              <span className="severity-icon large">{getSeverityIcon(selectedAlert.severity)}</span>
              <div className="modal-title">
                <h2>{selectedAlert.name}</h2>
                <span className={`severity-badge ${getSeverityClass(selectedAlert.severity)}`}>
                  {selectedAlert.severity}
                </span>
              </div>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Alert ID</h4>
                <p className="mono">{selectedAlert.id}</p>
              </div>

              <div className="detail-section">
                <h4>MITRE ATT&CK Technique</h4>
                <p className="mitre-link">{selectedAlert.mitre_technique}</p>
              </div>

              <div className="detail-section">
                <h4>Evidence</h4>
                <p className="evidence">{selectedAlert.evidence}</p>
              </div>

              {selectedAlert.source_ips && selectedAlert.source_ips.length > 0 && (
                <div className="detail-section">
                  <h4>Source IPs</h4>
                  <div className="ip-list">
                    {selectedAlert.source_ips.map((ip) => (
                      <span key={ip} className="ip-tag">{ip}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h4>Detected At</h4>
                <p>{new Date(selectedAlert.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertViewer;