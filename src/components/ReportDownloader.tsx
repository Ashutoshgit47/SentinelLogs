import React from 'react';

interface LogEvent {
  timestamp: string;
  source_ip?: string;
  username?: string;
  event_type: string;
  status: 'success' | 'failure' | 'info';
  severity: 'low' | 'medium' | 'high';
  message: string;
  raw?: string;
}

interface Alert {
  id: string;
  name: string;
  severity: string;
  mitre_technique: string;
  evidence: string;
  timestamp: string;
  source_ips?: string[];
}

interface ReportData {
  events: LogEvent[];
  alerts: Alert[];
  enrichedData?: unknown[];
}

interface ReportDownloaderProps {
  reportData: ReportData;
}

const ReportDownloader: React.FC<ReportDownloaderProps> = ({ reportData }) => {
  const generateFileName = (type: string, extension: string) => {
    const date = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `sentinellog-${type}-${date}.${extension}`;
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        summary: {
          totalEvents: reportData.events.length,
          totalAlerts: reportData.alerts.length,
          uniqueIPs: [...new Set(reportData.events.map((e) => e.source_ip).filter(Boolean))].length,
        },
        events: reportData.events,
        alerts: reportData.alerts,
        enrichedData: reportData.enrichedData || [],
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadBlob(blob, generateFileName('report', 'json'));
  };

  const downloadEventsCSV = () => {
    let csvContent = 'Timestamp,Source IP,Username,Event Type,Status,Severity,Message\n';

    reportData.events.forEach((event) => {
      csvContent += `"${escapeCSV(event.timestamp)}","${escapeCSV(event.source_ip || '')}","${escapeCSV(event.username || '')}","${escapeCSV(event.event_type)}","${escapeCSV(event.status)}","${escapeCSV(event.severity)}","${escapeCSV(event.message)}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, generateFileName('events', 'csv'));
  };

  const downloadAlertsCSV = () => {
    let csvContent = 'ID,Name,Severity,MITRE Technique,Evidence,Timestamp,Source IPs\n';

    reportData.alerts.forEach((alert) => {
      csvContent += `"${escapeCSV(alert.id)}","${escapeCSV(alert.name)}","${escapeCSV(alert.severity)}","${escapeCSV(alert.mitre_technique)}","${escapeCSV(alert.evidence)}","${escapeCSV(alert.timestamp)}","${escapeCSV((alert.source_ips || []).join('; '))}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, generateFileName('alerts', 'csv'));
  };

  const downloadPDF = async () => {
    // Generate a simple HTML-based PDF using print dialog
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SentinelLog Security Report</title>
        <style>
          * { font-family: 'Courier New', monospace; }
          body { padding: 40px; background: #fff; color: #000; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          h2 { color: #444; margin-top: 30px; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .summary p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #333; color: #fff; }
          tr:nth-child(even) { background: #f9f9f9; }
          .alert-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .severity-critical { border-left: 4px solid #ff0000; }
          .severity-high { border-left: 4px solid #ff6600; }
          .severity-medium { border-left: 4px solid #ffcc00; }
          .severity-low { border-left: 4px solid #00cc00; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10px; color: #666; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>🛡️ SentinelLog Security Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Events:</strong> ${reportData.events.length}</p>
          <p><strong>Total Alerts:</strong> ${reportData.alerts.length}</p>
          <p><strong>Unique IPs:</strong> ${[...new Set(reportData.events.map((e) => e.source_ip).filter((ip) => ip !== 'unknown'))].length}</p>
        </div>

        ${reportData.alerts.length > 0
        ? `
          <h2>Security Alerts</h2>
          ${reportData.alerts
          .map(
            (alert) => `
            <div class="alert-card severity-${alert.severity.toLowerCase()}">
              <h3>${alert.name}</h3>
              <p><strong>Severity:</strong> ${alert.severity}</p>
              <p><strong>ID:</strong> ${alert.id}</p>
              <p><strong>MITRE Technique:</strong> ${alert.mitre_technique}</p>
              <p><strong>Evidence:</strong> ${alert.evidence}</p>
              ${alert.source_ips ? `<p><strong>Source IPs:</strong> ${alert.source_ips.join(', ')}</p>` : ''}
              <p><strong>Detected:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
            </div>
          `
          )
          .join('')}
        `
        : '<p>No security alerts detected.</p>'
      }

        ${reportData.events.length > 0
        ? `
          <h2>Event Log (First 100)</h2>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source IP</th>
                <th>Username</th>
                <th>Event</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.events
          .slice(0, 100)
          .map(
            (event) => `
                <tr>
                  <td>${escapeHTML(event.timestamp)}</td>
                  <td>${escapeHTML(event.source_ip || '-')}</td>
                  <td>${escapeHTML(event.username || '-')}</td>
                  <td>${escapeHTML(event.event_type)}</td>
                  <td>${escapeHTML(event.status)}</td>
                </tr>
              `
          )
          .join('')}
            </tbody>
          </table>
          ${reportData.events.length > 100 ? `<p><em>Showing 100 of ${reportData.events.length} events</em></p>` : ''}
        `
        : ''
      }

        <div class="footer">
          <p>Generated by SentinelLog - Privacy-First Security Log Analysis</p>
          <p>All analysis performed entirely in browser. No data transmitted to external servers.</p>
        </div>
      </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const escapeCSV = (str: string): string => {
    if (!str) return '';
    return str.replace(/"/g, '""');
  };

  const escapeHTML = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="report-downloader">
      <div className="section-header">
        <h2>
          <span className="section-icon">📥</span>
          Download Reports
        </h2>
        <p className="section-description">
          Export your analysis results
        </p>
      </div>

      <div className="download-buttons">
        <button onClick={downloadJSON} className="download-button json-button">
          <span className="button-icon">📄</span>
          <span className="button-text">
            <span className="button-title">Full Report</span>
            <span className="button-subtitle">JSON Format</span>
          </span>
        </button>

        <button onClick={downloadEventsCSV} className="download-button csv-button">
          <span className="button-icon">📊</span>
          <span className="button-text">
            <span className="button-title">Events</span>
            <span className="button-subtitle">CSV Format</span>
          </span>
        </button>

        <button onClick={downloadAlertsCSV} className="download-button csv-button">
          <span className="button-icon">🚨</span>
          <span className="button-text">
            <span className="button-title">Alerts</span>
            <span className="button-subtitle">CSV Format</span>
          </span>
        </button>

        <button onClick={downloadPDF} className="download-button pdf-button">
          <span className="button-icon">📑</span>
          <span className="button-text">
            <span className="button-title">Print Report</span>
            <span className="button-subtitle">PDF/Print</span>
          </span>
        </button>
      </div>

      <p className="privacy-note">
        <span className="note-icon">🔒</span>
        All reports are generated client-side and downloaded directly to your device.
        No data is sent to any server.
      </p>
    </div>
  );
};

export default ReportDownloader;