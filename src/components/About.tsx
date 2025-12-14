import React from 'react';

interface AboutProps {
    isOpen: boolean;
    onClose: () => void;
}

const About: React.FC<AboutProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content about-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="about-header">
                    <div className="about-logo">🛡️</div>
                    <h2>SentinelLog</h2>
                    <p className="about-version">v1.0.0 • Privacy-First Security Analysis</p>
                </div>

                <div className="about-body">
                    {/* Purpose Section */}
                    <section className="about-section">
                        <h3>🎯 Purpose</h3>
                        <p>
                            SentinelLog is a privacy-first, client-side log monitoring tool designed for
                            security analysts and cybersecurity enthusiasts. It performs comprehensive
                            security analysis entirely in your browser, ensuring your sensitive log data
                            never leaves your machine.
                        </p>
                    </section>

                    {/* How It Works */}
                    <section className="about-section">
                        <h3>⚙️ How It Works</h3>
                        <div className="how-it-works">
                            <div className="step">
                                <span className="step-number">1</span>
                                <div className="step-content">
                                    <strong>Upload Log Files</strong>
                                    <p>Drag & drop or browse for .log, .txt, or .csv files (max 5MB)</p>
                                </div>
                            </div>
                            <div className="step">
                                <span className="step-number">2</span>
                                <div className="step-content">
                                    <strong>Automated Parsing</strong>
                                    <p>Logs are parsed in-browser using advanced pattern matching for multiple formats</p>
                                </div>
                            </div>
                            <div className="step">
                                <span className="step-number">3</span>
                                <div className="step-content">
                                    <strong>Threat Detection</strong>
                                    <p>Detection rules identify brute force attacks, admin logins, and scanning activity</p>
                                </div>
                            </div>
                            <div className="step">
                                <span className="step-number">4</span>
                                <div className="step-content">
                                    <strong>IP Enrichment</strong>
                                    <p>Check suspicious IPs against AbuseIPDB for reputation data</p>
                                </div>
                            </div>
                            <div className="step">
                                <span className="step-number">5</span>
                                <div className="step-content">
                                    <strong>Export Reports</strong>
                                    <p>Download analysis results in JSON, CSV, or PDF format</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="about-section">
                        <h3>✨ Key Features</h3>
                        <div className="features-grid">
                            <div className="feature">
                                <span className="feature-icon">🔒</span>
                                <span>100% Client-Side Processing</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">📊</span>
                                <span>Multi-Format Log Support</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🚨</span>
                                <span>Real-Time Threat Detection</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🌐</span>
                                <span>AbuseIPDB Integration</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">📱</span>
                                <span>Mobile Responsive Design</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">📥</span>
                                <span>Multiple Export Formats</span>
                            </div>
                        </div>
                    </section>

                    {/* Detection Rules */}
                    <section className="about-section">
                        <h3>🎯 Detection Rules</h3>
                        <div className="detection-rules">
                            <div className="rule">
                                <span className="rule-tag high">T1110</span>
                                <span>Brute Force Login Attempts</span>
                            </div>
                            <div className="rule">
                                <span className="rule-tag high">T1110.003</span>
                                <span>Password Spraying / Distributed Attacks</span>
                            </div>
                            <div className="rule">
                                <span className="rule-tag medium">T1078</span>
                                <span>Administrative User Activity</span>
                            </div>
                            <div className="rule">
                                <span className="rule-tag medium">T1595</span>
                                <span>Web Scanning / Directory Enumeration</span>
                            </div>
                        </div>
                    </section>

                    {/* About Developer */}
                    <section className="about-section developer-section">
                        <h3>👨‍💻 About the Developer</h3>
                        <div className="developer-card">
                            <div className="developer-avatar">AG</div>
                            <div className="developer-info">
                                <h4>Ashutosh Gautam</h4>
                                <p className="developer-title">Cybersecurity Enthusiast & Developer</p>
                                <p className="developer-bio">
                                    Passionate about building security tools and exploring the intersection
                                    of cybersecurity and modern web technologies. This project demonstrates
                                    how privacy-first security applications can be built using cutting-edge
                                    browser technologies.
                                </p>
                                <div className="developer-links">
                                    <a
                                        href="https://github.com/Ashutoshgit47"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="github-link"
                                    >
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        GitHub Profile
                                    </a>
                                    <a
                                        href="https://github.com/Ashutoshgit47/SentinelLogs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="project-link"
                                    >
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        Project Repository
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Privacy Notice */}
                    <section className="about-section privacy-section">
                        <h3>🔐 Privacy Commitment</h3>
                        <p>
                            <strong>Your data never leaves your browser.</strong> SentinelLog is designed
                            with privacy as the core principle. All log parsing, threat detection, and
                            analysis happens locally in your browser. The only external communication is
                            with the AbuseIPDB API (when you choose to check an IP), and even then, only
                            the IP address is transmitted - never your log content.
                        </p>
                    </section>
                </div>

                <div className="about-footer">
                    <p>Made with ❤️ for the cybersecurity community</p>
                </div>
            </div>
        </div>
    );
};

export default About;
