import React from 'react';

interface HelpGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpGuide: React.FC<HelpGuideProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content help-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="help-header">
                    <div className="help-logo">📚</div>
                    <h2>How To Guide</h2>
                    <p className="help-subtitle">Get started with SentinelLog</p>
                </div>

                <div className="help-body">
                    {/* Windows Event Logs Section */}
                    <section className="help-section">
                        <h3>🪟 Getting Windows Event Logs</h3>
                        <p className="section-intro">
                            Export security-relevant logs from Windows Event Viewer for analysis.
                        </p>

                        {/* Windows 11 */}
                        <div className="os-guide">
                            <h4>
                                <span className="os-badge win11">Windows 11</span>
                            </h4>
                            <ol className="steps-list">
                                <li>Press <kbd>Win</kbd> + <kbd>R</kbd>, type <code>eventvwr.msc</code>, press Enter</li>
                                <li>Navigate to <strong>Windows Logs → Security</strong> (or Application/System)</li>
                                <li>Click <strong>Filter Current Log</strong> to filter specific events (optional)</li>
                                <li>Click <strong>Save All Events As...</strong> in the right panel</li>
                                <li>Choose <strong>CSV (Comma-Separated Value)</strong> format</li>
                                <li>Save file and upload to SentinelLog</li>
                            </ol>
                        </div>

                        {/* Windows 10 */}
                        <div className="os-guide">
                            <h4>
                                <span className="os-badge win10">Windows 10</span>
                            </h4>
                            <ol className="steps-list">
                                <li>Search for <strong>"Event Viewer"</strong> in Start Menu</li>
                                <li>Expand <strong>Windows Logs</strong> in left panel</li>
                                <li>Select <strong>Security</strong>, <strong>Application</strong>, or <strong>System</strong></li>
                                <li>Click <strong>Action → Save All Events As...</strong></li>
                                <li>Save as <strong>CSV</strong> or <strong>Text (Tab Delimited)</strong></li>
                                <li>Upload the exported file to SentinelLog</li>
                            </ol>
                        </div>

                        {/* Windows 7 */}
                        <div className="os-guide">
                            <h4>
                                <span className="os-badge win7">Windows 7</span>
                            </h4>
                            <ol className="steps-list">
                                <li>Click <strong>Start → Control Panel → Administrative Tools</strong></li>
                                <li>Double-click <strong>Event Viewer</strong></li>
                                <li>Expand <strong>Windows Logs</strong></li>
                                <li>Right-click on <strong>Security</strong> and select <strong>Save All Events As...</strong></li>
                                <li>Choose <strong>Text (Tab Delimited) (*.txt)</strong></li>
                                <li>Upload the exported .txt file</li>
                            </ol>
                        </div>

                        {/* PowerShell Alternative */}
                        <div className="os-guide powershell-guide">
                            <h4>
                                <span className="os-badge powershell">PowerShell</span>
                                <span className="os-subtitle">Advanced Users</span>
                            </h4>
                            <p className="guide-note">Export logs directly using PowerShell (requires Admin privileges):</p>
                            <div className="code-block">
                                <code>
                                    # Export Security events (last 1000)<br />
                                    Get-EventLog -LogName Security -Newest 1000 | <br />
                                    &nbsp;&nbsp;Export-Csv -Path "C:\security_logs.csv" -NoTypeInformation<br /><br />
                                    # Export failed login attempts<br />
                                    Get-EventLog -LogName Security | <br />
                                    &nbsp;&nbsp;Where-Object {`{$_.EventID -eq 4625}`} | <br />
                                    &nbsp;&nbsp;Export-Csv -Path "C:\failed_logins.csv"
                                </code>
                            </div>
                        </div>

                        {/* Windows Event ID Reference */}
                        <div className="os-guide event-id-guide">
                            <h4>
                                <span className="os-badge win-events">Event IDs</span>
                                <span className="os-subtitle">Security Reference</span>
                            </h4>
                            <div className="event-id-table">
                                <div className="event-row header">
                                    <span>Event ID</span>
                                    <span>Description</span>
                                    <span>Has IP?</span>
                                </div>
                                <div className="event-row">
                                    <span className="event-id">4624</span>
                                    <span>Successful Logon</span>
                                    <span className="has-ip">Network only</span>
                                </div>
                                <div className="event-row">
                                    <span className="event-id">4625</span>
                                    <span>Failed Logon</span>
                                    <span className="has-ip yes">✓ Yes</span>
                                </div>
                                <div className="event-row">
                                    <span className="event-id">4672</span>
                                    <span>Admin Privileges Assigned</span>
                                    <span className="has-ip no">✗ No</span>
                                </div>
                                <div className="event-row">
                                    <span className="event-id">4648</span>
                                    <span>Explicit Credentials Used</span>
                                    <span className="has-ip yes">✓ Yes</span>
                                </div>
                                <div className="event-row">
                                    <span className="event-id">4740</span>
                                    <span>Account Locked Out</span>
                                    <span className="has-ip no">✗ No</span>
                                </div>
                                <div className="event-row">
                                    <span className="event-id">5156/5157</span>
                                    <span>Firewall Allow/Block</span>
                                    <span className="has-ip yes">✓ Yes</span>
                                </div>
                            </div>
                            <p className="guide-note" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
                                💡 Local logons and privilege assignments don't include IP addresses in Windows logs.
                            </p>
                        </div>
                    </section>

                    {/* Linux Logs Section */}
                    <section className="help-section">
                        <h3>🐧 Getting Linux/Server Logs</h3>

                        <div className="os-guide">
                            <h4>
                                <span className="os-badge linux">Linux</span>
                            </h4>
                            <div className="log-locations">
                                <div className="log-item">
                                    <code>/var/log/auth.log</code>
                                    <span>Authentication & SSH logs (Debian/Ubuntu)</span>
                                </div>
                                <div className="log-item">
                                    <code>/var/log/secure</code>
                                    <span>Authentication logs (RHEL/CentOS)</span>
                                </div>
                                <div className="log-item">
                                    <code>/var/log/apache2/access.log</code>
                                    <span>Apache web server access logs</span>
                                </div>
                                <div className="log-item">
                                    <code>/var/log/nginx/access.log</code>
                                    <span>Nginx web server access logs</span>
                                </div>
                            </div>
                            <div className="code-block">
                                <code>
                                    # Copy last 1000 lines of auth.log<br />
                                    tail -n 1000 /var/log/auth.log &gt; ~/auth_export.log
                                </code>
                            </div>
                        </div>
                    </section>

                    {/* AbuseIPDB API Section */}
                    <section className="help-section">
                        <h3>🔑 Getting AbuseIPDB API Key</h3>
                        <p className="section-intro">
                            Get a free API key to check IP reputation against real threat intelligence data.
                        </p>

                        <div className="api-guide">
                            <ol className="steps-list">
                                <li>
                                    Go to <a href="https://www.abuseipdb.com" target="_blank" rel="noopener noreferrer">
                                        abuseipdb.com
                                    </a>
                                </li>
                                <li>Click <strong>Sign Up</strong> (free account)</li>
                                <li>Verify your email address</li>
                                <li>Go to <strong>API</strong> tab in your account dashboard</li>
                                <li>Click <strong>Create Key</strong></li>
                                <li>Copy your API key and paste it in SentinelLog</li>
                            </ol>

                            <div className="api-limits">
                                <h5>Free Tier Limits</h5>
                                <ul>
                                    <li>✅ 1,000 checks per day</li>
                                    <li>✅ Full IP reputation data</li>
                                    <li>✅ Abuse reports & categories</li>
                                    <li>⚠️ Rate limited to prevent abuse</li>
                                </ul>
                            </div>

                            <div className="api-note">
                                <span className="note-icon">💡</span>
                                <div>
                                    <strong>Tip:</strong> Use <strong>Demo Mode</strong> for quick testing without an API key,
                                    or get your own free API key for live threat intelligence data.
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Supported Log Formats */}
                    <section className="help-section">
                        <h3>📄 Supported Log Formats</h3>
                        <div className="formats-grid">
                            <div className="format-item">
                                <span className="format-icon">📋</span>
                                <div>
                                    <strong>Syslog (RFC3164)</strong>
                                    <span>Standard Linux system logs</span>
                                </div>
                            </div>
                            <div className="format-item">
                                <span className="format-icon">📡</span>
                                <div>
                                    <strong>Syslog (RFC5424)</strong>
                                    <span>Modern structured syslog</span>
                                </div>
                            </div>
                            <div className="format-item">
                                <span className="format-icon">🔐</span>
                                <div>
                                    <strong>Auth.log</strong>
                                    <span>SSH & authentication events</span>
                                </div>
                            </div>
                            <div className="format-item">
                                <span className="format-icon">🌐</span>
                                <div>
                                    <strong>Apache/Nginx</strong>
                                    <span>Web server access logs</span>
                                </div>
                            </div>
                            <div className="format-item">
                                <span className="format-icon">📊</span>
                                <div>
                                    <strong>W3C Extended</strong>
                                    <span>IIS, Azure web logs</span>
                                </div>
                            </div>
                            <div className="format-item">
                                <span className="format-icon">🪟</span>
                                <div>
                                    <strong>Windows Event</strong>
                                    <span>Event Viewer exports</span>
                                </div>
                            </div>
                            <div className="format-item">
                                <span className="format-icon">📦</span>
                                <div>
                                    <strong>JSON / NDJSON</strong>
                                    <span>Structured JSON logs</span>
                                </div>
                            </div>
                            <div className="format-item">
                                <span className="format-icon">📄</span>
                                <div>
                                    <strong>CSV</strong>
                                    <span>Comma-separated values</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tips */}
                    <section className="help-section tips-section">
                        <h3>💡 Tips for Best Results</h3>
                        <ul className="tips-list">
                            <li>Export logs from the last 24-48 hours for focused analysis</li>
                            <li>Include failed login events for brute force detection</li>
                            <li>Filter by Event ID 4625 (Windows) for failed logins</li>
                            <li>Use CSV format for best parsing accuracy</li>
                            <li>Keep file size under 5MB for faster processing</li>
                        </ul>
                    </section>
                </div>

                <div className="help-footer">
                    <p>Need more help? Check the <a href="https://github.com/Ashutoshgit47/SentinelLogs" target="_blank" rel="noopener noreferrer">GitHub repository</a></p>
                </div>
            </div>
        </div>
    );
};

export default HelpGuide;
