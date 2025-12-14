/**
 * SentinelLog Parser Engine v3.0
 * 
 * CRITICAL RULES:
 * - ONE CSV row = ONE event (never split Message field)
 * - Event ID-based mapping (never keyword guessing)
 * - Extract username/IP from Message via regex
 * - All formats normalize to NormalizedEvent
 * - Never throw, always fail gracefully
 */

// ============ Types ============

export interface NormalizedEvent {
  timestamp: string;
  source_ip: string;
  username: string;
  event_type: string;
  status: 'success' | 'failure' | 'info';
  severity: 'low' | 'medium' | 'high';
  message: string;
  raw: string;
}

export interface Alert {
  id: string;
  name: string;
  severity: string;
  mitre_technique: string;
  evidence: string;
  timestamp: string;
  source_ips: string[];
}

// Legacy compatibility
export type LogEvent = NormalizedEvent;

// ============ Event ID Mappings ============

interface EventMapping {
  event_type: string;
  status: 'success' | 'failure' | 'info';
  severity: 'low' | 'medium' | 'high';
}

const WINDOWS_EVENT_MAP: Record<string, EventMapping> = {
  // Authentication Events
  '4624': { event_type: 'login_success', status: 'success', severity: 'low' },
  '4625': { event_type: 'login_failed', status: 'failure', severity: 'high' },
  '4634': { event_type: 'logoff', status: 'info', severity: 'low' },
  '4647': { event_type: 'user_initiated_logoff', status: 'info', severity: 'low' },
  '4648': { event_type: 'explicit_credential_logon', status: 'info', severity: 'medium' },
  '4672': { event_type: 'privilege_escalation', status: 'success', severity: 'high' },

  // Account Management
  '4720': { event_type: 'user_created', status: 'info', severity: 'high' },
  '4722': { event_type: 'user_enabled', status: 'info', severity: 'medium' },
  '4723': { event_type: 'password_change_attempt', status: 'info', severity: 'medium' },
  '4724': { event_type: 'password_reset', status: 'info', severity: 'high' },
  '4725': { event_type: 'user_disabled', status: 'info', severity: 'medium' },
  '4726': { event_type: 'user_deleted', status: 'info', severity: 'high' },
  '4740': { event_type: 'account_locked', status: 'failure', severity: 'high' },
  '4767': { event_type: 'account_unlocked', status: 'info', severity: 'medium' },

  // Credential Validation
  '4776': { event_type: 'credential_validation', status: 'info', severity: 'low' },
  '4768': { event_type: 'kerberos_tgt_requested', status: 'info', severity: 'low' },
  '4769': { event_type: 'kerberos_service_ticket', status: 'info', severity: 'low' },
  '4771': { event_type: 'kerberos_preauth_failed', status: 'failure', severity: 'medium' },

  // System Events
  '1102': { event_type: 'audit_log_cleared', status: 'info', severity: 'high' },
  '4616': { event_type: 'system_time_changed', status: 'info', severity: 'medium' },
  '4688': { event_type: 'process_created', status: 'info', severity: 'low' },
  '4689': { event_type: 'process_terminated', status: 'info', severity: 'low' },

  // Firewall Events (include IP addresses)
  '5156': { event_type: 'firewall_allowed', status: 'success', severity: 'low' },
  '5157': { event_type: 'firewall_blocked', status: 'failure', severity: 'medium' },
};

/**
 * Event IDs that reliably contain IP address information in Message field
 * - Network logons and authentication events
 * - Firewall events
 * 
 * Note: 4624 only includes IP for network logons (Logon Type 3, 10)
 * Local logons and privilege assignments do NOT include IPs
 */
const EVENTS_WITH_IP = new Set(['4624', '4625', '4648', '4776', '5156', '5157']);

// ============ Format Detection ============

type LogFormat = 'windows_csv' | 'generic_csv' | 'json_array' | 'ndjson' | 'windows_xml' | 'generic_xml' | 'syslog' | 'authlog' | 'apache' | 'generic';

function detectFormat(content: string, fileName: string): LogFormat {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const trimmed = content.trim();

  // JSON detection
  if (ext === 'json') {
    if (trimmed.startsWith('[')) return 'json_array';
    if (trimmed.startsWith('{')) return 'ndjson';
  }

  // XML detection
  if (ext === 'xml' || trimmed.startsWith('<?xml') || trimmed.startsWith('<Event')) {
    if (trimmed.includes('<Event') || trimmed.includes('<Events')) {
      return 'windows_xml';
    }
    return 'generic_xml';
  }

  // CSV detection
  if (ext === 'csv') {
    const firstLine = trimmed.split('\n')[0].toLowerCase();
    // Windows Security CSV has specific headers
    if ((firstLine.includes('message') || firstLine.includes('description')) &&
      (firstLine.includes('event') || firstLine.includes('id'))) {
      return 'windows_csv';
    }
    return 'generic_csv';
  }

  // Content-based JSON detection
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try { JSON.parse(trimmed); return 'json_array'; } catch { /* not JSON */ }
  }
  if (trimmed.startsWith('{')) {
    try { JSON.parse(trimmed.split('\n')[0]); return 'ndjson'; } catch { /* not JSON */ }
  }

  // Line-based log detection
  const firstLine = trimmed.split('\n')[0] || '';

  // Apache/Nginx Combined Log Format
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}.*\[.+\]\s+"[A-Z]+/.test(firstLine)) {
    return 'apache';
  }

  // Syslog/Auth.log detection
  if (/^[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}/.test(firstLine)) {
    if (firstLine.toLowerCase().includes('sshd') ||
      firstLine.toLowerCase().includes('pam') ||
      firstLine.toLowerCase().includes('sudo')) {
      return 'authlog';
    }
    return 'syslog';
  }

  return 'generic';
}

// ============ Main Parse Function ============

export function parseLog(content: string, fileName: string = 'log.txt'): NormalizedEvent[] {
  if (!content || typeof content !== 'string') return [];

  const format = detectFormat(content, fileName);

  try {
    switch (format) {
      case 'windows_csv':
        return parseWindowsSecurityCSV(content);
      case 'generic_csv':
        return parseGenericCSV(content);
      case 'json_array':
        return parseJsonArray(content);
      case 'ndjson':
        return parseNdjson(content);
      case 'windows_xml':
        return parseWindowsXML(content);
      case 'generic_xml':
        return parseGenericXML(content);
      case 'apache':
        return parseApacheNginx(content);
      case 'authlog':
        return parseAuthLog(content);
      case 'syslog':
        return parseSyslog(content);
      default:
        return parseGenericLines(content);
    }
  } catch (error) {
    console.error('Parse error:', error);
    return parseGenericLines(content);
  }
}

// ============ Windows Security CSV Parser (CRITICAL FIX) ============

function parseWindowsSecurityCSV(content: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];
  const rows = parseCSVRows(content);

  if (rows.length < 2) return events;

  // Parse header to find column indices
  const header = rows[0].map(h => h.toLowerCase().trim());
  const cols = {
    timestamp: findColumnIndex(header, ['date', 'time', 'timestamp', 'timecreated', 'date and time']),
    eventId: findColumnIndex(header, ['event id', 'eventid', 'id', 'event']),
    message: findColumnIndex(header, ['message', 'description', 'details']),
    level: findColumnIndex(header, ['level', 'type', 'keywords']),
    source: findColumnIndex(header, ['source', 'provider', 'providername']),
  };

  // Process each row as ONE event
  for (let i = 1; i < rows.length; i++) {
    try {
      const row = rows[i];
      if (row.length === 0 || row.every(cell => !cell.trim())) continue;

      // Extract fields
      const eventId = cols.eventId !== -1 ? row[cols.eventId]?.trim() : '';
      const message = cols.message !== -1 ? row[cols.message] : row.join(' ');
      const rawTimestamp = cols.timestamp !== -1 ? row[cols.timestamp] : '';

      // Get event mapping from Event ID (NEVER keyword guess)
      const mapping = WINDOWS_EVENT_MAP[eventId];

      // Extract username from Message using regex (use SECOND match for target account)
      const username = extractWindowsUsername(message);

      // Extract source IP ONLY from events that include IP addresses
      // Local logons and privilege assignments do NOT include IPs
      const sourceIp = EVENTS_WITH_IP.has(eventId)
        ? extractWindowsSourceIP(message)
        : 'unknown';

      // Get first line of message for display
      const displayMessage = getFirstMeaningfulLine(message);

      const event = normalize({
        timestamp: normalizeTimestamp(rawTimestamp),
        source_ip: sourceIp,
        username: username,
        event_type: mapping?.event_type || `event_${eventId || 'unknown'}`,
        status: mapping?.status || 'info',
        severity: mapping?.severity || 'low',
        message: displayMessage,
        raw: message.slice(0, 1000),
      });

      events.push(event);
    } catch {
      // Skip malformed rows
    }
  }

  return events;
}

/**
 * Parse CSV content into rows, handling quoted fields correctly
 */
function parseCSVRows(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // End of quoted field
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField);
        if (currentRow.some(f => f.trim())) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        if (char === '\r') i++; // Skip \n in \r\n
      } else if (char !== '\r') {
        currentField += char;
      }
    }
  }

  // Handle last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim())) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Extract username from Windows Message field
 * Uses SECOND "Account Name:" match (target account, not subject)
 */
function extractWindowsUsername(message: string): string {
  // Pattern: Account Name: <username>
  const matches = message.match(/Account Name:\s*([^\r\n\t]+)/gi);

  if (matches && matches.length >= 2) {
    // Use SECOND match (target account)
    const match = matches[1].match(/Account Name:\s*([^\r\n\t]+)/i);
    if (match && match[1]) {
      const username = match[1].trim();
      if (username && username !== '-' && username.length < 100) {
        return username;
      }
    }
  } else if (matches && matches.length === 1) {
    // Only one match available
    const match = matches[0].match(/Account Name:\s*([^\r\n\t]+)/i);
    if (match && match[1]) {
      const username = match[1].trim();
      if (username && username !== '-' && username.length < 100) {
        return username;
      }
    }
  }

  // Fallback: Try other patterns
  const patterns = [
    /TargetUserName:\s*([^\r\n\t]+)/i,
    /User:\s*([^\r\n\t]+)/i,
    /Logon Account:\s*([^\r\n\t]+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const username = match[1].trim();
      if (username && username !== '-' && username.length < 100) {
        return username;
      }
    }
  }

  return 'unknown';
}

/**
 * Extract source IP from Windows Message field
 */
function extractWindowsSourceIP(message: string): string {
  // Primary: Source Network Address
  const sourceNetMatch = message.match(/Source Network Address:\s*([^\r\n\t]+)/i);
  if (sourceNetMatch && sourceNetMatch[1]) {
    const ip = sourceNetMatch[1].trim();
    if (isValidIPv4(ip)) return ip;
  }

  // Fallback: Client Address
  const clientMatch = message.match(/Client Address:\s*([^\r\n\t]+)/i);
  if (clientMatch && clientMatch[1]) {
    const ip = clientMatch[1].trim();
    if (isValidIPv4(ip)) return ip;
  }

  // Fallback: Any IPv4 in message
  const ipMatch = message.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
  if (ipMatch && isValidIPv4(ipMatch[1])) {
    // Exclude localhost
    if (ipMatch[1] !== '127.0.0.1' && ipMatch[1] !== '0.0.0.0') {
      return ipMatch[1];
    }
  }

  return 'unknown';
}

/**
 * Get first meaningful line from message (skip empty lines)
 */
function getFirstMeaningfulLine(message: string): string {
  const lines = message.split(/[\r\n]+/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && trimmed.length > 5) {
      return sanitize(trimmed.slice(0, 200));
    }
  }
  return sanitize(message.slice(0, 200));
}

// ============ Generic CSV Parser ============

function parseGenericCSV(content: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];
  const rows = parseCSVRows(content);

  if (rows.length < 2) return events;

  const header = rows[0].map(h => h.toLowerCase().trim());

  for (let i = 1; i < rows.length; i++) {
    try {
      const row = rows[i];
      if (row.length === 0) continue;

      const obj: Record<string, string> = {};
      header.forEach((h, idx) => {
        obj[h] = row[idx] || '';
      });

      const event = normalize({
        timestamp: obj['timestamp'] || obj['time'] || obj['date'] || new Date().toISOString(),
        source_ip: obj['ip'] || obj['source_ip'] || obj['src'] || extractIPFromText(row.join(' ')),
        username: obj['user'] || obj['username'] || obj['account'] || 'unknown',
        event_type: obj['event'] || obj['type'] || obj['action'] || 'csv_entry',
        status: (obj['status'] || 'info') as 'success' | 'failure' | 'info',
        severity: 'low',
        message: row.slice(0, 3).join(' | '),
        raw: row.join(','),
      });

      events.push(event);
    } catch {
      // Skip
    }
  }

  return events;
}

// ============ JSON Parsers ============

function parseJsonArray(content: string): NormalizedEvent[] {
  try {
    const arr = JSON.parse(content);
    if (!Array.isArray(arr)) return [];
    return arr.map(obj => normalizeJsonObject(obj)).filter(Boolean) as NormalizedEvent[];
  } catch {
    return [];
  }
}

function parseNdjson(content: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('{')) continue;

    try {
      const obj = JSON.parse(trimmed);
      const event = normalizeJsonObject(obj);
      if (event) events.push(event);
    } catch {
      // Skip invalid JSON lines
    }
  }

  return events;
}

function normalizeJsonObject(obj: Record<string, unknown>): NormalizedEvent | null {
  if (!obj || typeof obj !== 'object') return null;

  const getString = (keys: string[]): string => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return String(obj[key]);
      }
    }
    return 'unknown';
  };

  const eventId = getString(['EventID', 'eventId', 'event_id', 'id']);
  const mapping = WINDOWS_EVENT_MAP[eventId];

  return normalize({
    timestamp: getString(['timestamp', 'time', '@timestamp', 'date', 'datetime']),
    source_ip: getString(['ip', 'source_ip', 'client_ip', 'remote_addr', 'sourceAddress']),
    username: getString(['user', 'username', 'user_name', 'account', 'userName']),
    event_type: mapping?.event_type || getString(['event', 'action', 'type', 'event_type']),
    status: mapping?.status || 'info',
    severity: mapping?.severity || 'low',
    message: getString(['message', 'msg', 'description', 'log']),
    raw: JSON.stringify(obj).slice(0, 1000),
  });
}

// ============ Windows XML Parser ============

function parseWindowsXML(content: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];

  // Extract individual Event elements
  const eventMatches = content.match(/<Event[\s\S]*?<\/Event>/g) || [];

  for (const eventXml of eventMatches) {
    try {
      // Extract TimeCreated
      const timeMatch = eventXml.match(/SystemTime=["']([^"']+)["']/);
      const timestamp = timeMatch ? timeMatch[1] : '';

      // Extract EventID
      const eventIdMatch = eventXml.match(/<EventID[^>]*>(\d+)<\/EventID>/);
      const eventId = eventIdMatch ? eventIdMatch[1] : '';

      // Get mapping
      const mapping = WINDOWS_EVENT_MAP[eventId];

      // Extract from EventData
      const ipMatch = eventXml.match(/IpAddress[^>]*>([^<]+)</);
      const userMatch = eventXml.match(/TargetUserName[^>]*>([^<]+)</) ||
        eventXml.match(/SubjectUserName[^>]*>([^<]+)</);

      // Extract message
      const messageMatch = eventXml.match(/<Message>([^<]*)<\/Message>/);
      const message = messageMatch ? messageMatch[1] : `Event ${eventId}`;

      events.push(normalize({
        timestamp: normalizeTimestamp(timestamp),
        source_ip: ipMatch ? ipMatch[1].trim() : 'unknown',
        username: userMatch ? userMatch[1].trim() : 'unknown',
        event_type: mapping?.event_type || `event_${eventId || 'unknown'}`,
        status: mapping?.status || 'info',
        severity: mapping?.severity || 'low',
        message: sanitize(message.slice(0, 200)),
        raw: eventXml.slice(0, 1000),
      }));
    } catch {
      // Skip malformed events
    }
  }

  return events;
}

function parseGenericXML(content: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];
  const logMatches = content.match(/<(?:log|entry|record|item)[^>]*>[\s\S]*?<\/(?:log|entry|record|item)>/gi) || [];

  for (const logXml of logMatches) {
    events.push(normalize({
      timestamp: new Date().toISOString(),
      source_ip: extractIPFromText(logXml),
      username: 'unknown',
      event_type: 'xml_entry',
      status: 'info',
      severity: 'low',
      message: sanitize(logXml.replace(/<[^>]+>/g, ' ').trim().slice(0, 200)),
      raw: logXml.slice(0, 1000),
    }));
  }

  return events;
}

// ============ Apache/Nginx Parser ============

function parseApacheNginx(content: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];
  const lines = content.split('\n');

  // Combined Log Format regex
  const logRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+\S+\s+(\S+)\s+\[([^\]]+)\]\s+"([^"]+)"\s+(\d{3})\s+(\d+|-)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(logRegex);

    if (match) {
      const [, ip, user, timestamp, request, statusCode] = match;
      const status = parseInt(statusCode);

      events.push(normalize({
        timestamp: normalizeTimestamp(timestamp),
        source_ip: ip,
        username: user !== '-' ? user : 'unknown',
        event_type: `http_${request.split(' ')[0]?.toLowerCase() || 'request'}`,
        status: status >= 400 ? 'failure' : status >= 200 && status < 300 ? 'success' : 'info',
        severity: status >= 500 ? 'high' : status >= 400 ? 'medium' : 'low',
        message: sanitize(request),
        raw: trimmed.slice(0, 1000),
      }));
    } else {
      events.push(createGenericEvent(trimmed));
    }
  }

  return events;
}

// ============ Auth.log Parser ============

function parseAuthLog(content: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();

    let event_type = 'auth';
    let status: 'success' | 'failure' | 'info' = 'info';
    let severity: 'low' | 'medium' | 'high' = 'low';

    if (lower.includes('accepted') || lower.includes('session opened')) {
      event_type = 'login_success';
      status = 'success';
    } else if (lower.includes('failed') || lower.includes('invalid user') || lower.includes('authentication failure')) {
      event_type = 'login_failed';
      status = 'failure';
      severity = 'medium';
    } else if (lower.includes('sudo') && lower.includes('command=')) {
      event_type = 'sudo_command';
      severity = 'medium';
    } else if (lower.includes('session closed')) {
      event_type = 'logoff';
    }

    // Check for root/admin
    if (lower.includes('root') || lower.includes('admin')) {
      severity = 'high';
    }

    // Extract timestamp
    const timestampMatch = trimmed.match(/^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/);

    events.push(normalize({
      timestamp: normalizeTimestamp(timestampMatch?.[1]),
      source_ip: extractIPFromText(trimmed),
      username: extractUsernameFromLine(trimmed),
      event_type,
      status,
      severity,
      message: sanitize(trimmed.slice(0, 200)),
      raw: trimmed.slice(0, 1000),
    }));
  }

  return events;
}

// ============ Syslog Parser ============

function parseSyslog(content: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];
  const lines = content.split('\n');

  const syslogRegex = /^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(\S+?)(?:\[\d+\])?\s*:\s*(.*)$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(syslogRegex);

    if (match) {
      const [, timestamp, , process, message] = match;

      events.push(normalize({
        timestamp: normalizeTimestamp(timestamp),
        source_ip: extractIPFromText(message),
        username: extractUsernameFromLine(message),
        event_type: determineSyslogEventType(process, message),
        status: determineStatus(message),
        severity: determineSeverity(message),
        message: sanitize(message.slice(0, 200)),
        raw: trimmed.slice(0, 1000),
      }));
    } else {
      events.push(createGenericEvent(trimmed));
    }
  }

  return events;
}

// ============ Generic Line Parser ============

function parseGenericLines(content: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    events.push(createGenericEvent(trimmed));
  }

  return events;
}

function createGenericEvent(line: string): NormalizedEvent {
  return normalize({
    timestamp: extractTimestamp(line) || new Date().toISOString(),
    source_ip: extractIPFromText(line),
    username: extractUsernameFromLine(line),
    event_type: 'unknown',
    status: 'info',
    severity: 'low',
    message: sanitize(line.slice(0, 200)),
    raw: line.slice(0, 1000),
  });
}

// ============ Normalization Pipeline ============

function normalize(input: Partial<NormalizedEvent>): NormalizedEvent {
  return {
    timestamp: input.timestamp || new Date().toISOString(),
    source_ip: sanitize(input.source_ip) || 'unknown',
    username: sanitize(input.username) || 'unknown',
    event_type: sanitize(input.event_type) || 'unknown',
    status: input.status || 'info',
    severity: input.severity || 'low',
    message: sanitize(input.message) || '',
    raw: sanitize(input.raw) || '',
  };
}

// ============ Helper Functions ============

function findColumnIndex(header: string[], names: string[]): number {
  for (const name of names) {
    const idx = header.findIndex(h => h.includes(name));
    if (idx !== -1) return idx;
  }
  return -1;
}

function normalizeTimestamp(input: string | undefined): string {
  if (!input) return new Date().toISOString();

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}T/.test(input)) return input;

  // Try parsing
  try {
    const date = new Date(input);
    if (!isNaN(date.getTime())) return date.toISOString();
  } catch { /* continue */ }

  // Syslog format: "Mon DD HH:MM:SS"
  const syslogMatch = input.match(/^([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2})$/);
  if (syslogMatch) {
    const year = new Date().getFullYear();
    try {
      const date = new Date(`${syslogMatch[1]} ${syslogMatch[2]} ${year} ${syslogMatch[3]}`);
      if (!isNaN(date.getTime())) return date.toISOString();
    } catch { /* continue */ }
  }

  return input;
}

function extractTimestamp(text: string): string | undefined {
  // ISO format
  const isoMatch = text.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  if (isoMatch) return isoMatch[0];

  // Syslog format
  const syslogMatch = text.match(/^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/);
  if (syslogMatch) return normalizeTimestamp(syslogMatch[1]);

  return undefined;
}

function extractIPFromText(text: string): string {
  const match = text.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
  if (match && isValidIPv4(match[1])) {
    return match[1];
  }
  return 'unknown';
}

function isValidIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  return parts.length === 4 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255);
}

function extractUsernameFromLine(text: string): string {
  const patterns = [
    /for\s+(?:invalid\s+user\s+)?(\S+)\s+from/i,
    /user[=:\s]+(\S+)/i,
    /(?:accepted|failed)\s+\S+\s+for\s+(\S+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length < 50) {
      const username = match[1];
      if (!/^\d+\.\d+\.\d+\.\d+$/.test(username) && !username.startsWith('port')) {
        return username;
      }
    }
  }

  return 'unknown';
}

function determineSyslogEventType(process: string, message: string): string {
  const proc = process.toLowerCase();
  const msg = message.toLowerCase();

  if (proc.includes('sshd')) return msg.includes('accepted') ? 'ssh_success' : 'ssh';
  if (proc.includes('sudo')) return 'sudo';
  if (proc.includes('cron')) return 'cron';
  if (proc.includes('systemd')) return 'systemd';
  if (proc.includes('kernel')) return 'kernel';

  return 'syslog';
}

function determineStatus(message: string): 'success' | 'failure' | 'info' {
  const lower = message.toLowerCase();
  if (lower.includes('success') || lower.includes('accepted') || lower.includes('allowed')) return 'success';
  if (lower.includes('fail') || lower.includes('denied') || lower.includes('invalid') || lower.includes('error')) return 'failure';
  return 'info';
}

function determineSeverity(message: string): 'low' | 'medium' | 'high' {
  const lower = message.toLowerCase();
  if (lower.includes('root') || lower.includes('admin') || lower.includes('critical')) return 'high';
  if (lower.includes('fail') || lower.includes('denied') || lower.includes('warning')) return 'medium';
  return 'low';
}

function sanitize(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

// ============ Threat Detection ============

export function detectThreats(events: NormalizedEvent[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  const failedByIp: Map<string, NormalizedEvent[]> = new Map();
  const failedByUser: Map<string, NormalizedEvent[]> = new Map();
  const adminEvents: NormalizedEvent[] = [];
  const httpErrorsByIp: Map<string, number> = new Map();

  for (const event of events) {
    // Track failed logins
    if (event.status === 'failure' && event.event_type.includes('login')) {
      if (event.source_ip !== 'unknown') {
        if (!failedByIp.has(event.source_ip)) failedByIp.set(event.source_ip, []);
        failedByIp.get(event.source_ip)!.push(event);
      }
      if (event.username !== 'unknown') {
        if (!failedByUser.has(event.username)) failedByUser.set(event.username, []);
        failedByUser.get(event.username)!.push(event);
      }
    }

    // Track admin/privilege events
    if (event.event_type === 'privilege_escalation' ||
      event.event_type === 'admin_login' ||
      ['root', 'admin', 'administrator'].includes(event.username.toLowerCase())) {
      adminEvents.push(event);
    }

    // Track HTTP errors
    if (event.event_type.startsWith('http_') && event.status === 'failure' && event.source_ip !== 'unknown') {
      httpErrorsByIp.set(event.source_ip, (httpErrorsByIp.get(event.source_ip) || 0) + 1);
    }
  }

  // Rule 1: Brute Force
  for (const [ip, attempts] of failedByIp) {
    if (attempts.length >= 3) {
      const users = [...new Set(attempts.map(e => e.username).filter(u => u !== 'unknown'))];
      alerts.push({
        id: `BRUTE_${ip.replace(/\./g, '_')}`,
        name: 'Brute Force Attack',
        severity: attempts.length >= 10 ? 'Critical' : attempts.length >= 5 ? 'High' : 'Medium',
        mitre_technique: 'T1110 - Brute Force',
        evidence: `${attempts.length} failed logins from ${ip}${users.length ? ` targeting: ${users.join(', ')}` : ''}`,
        timestamp: now,
        source_ips: [ip],
      });
    }
  }

  // Rule 2: Password Spraying
  for (const [username, attempts] of failedByUser) {
    const ips = [...new Set(attempts.map(e => e.source_ip).filter(i => i !== 'unknown'))];
    if (ips.length >= 3) {
      alerts.push({
        id: `SPRAY_${username}`,
        name: 'Password Spraying',
        severity: 'High',
        mitre_technique: 'T1110.003 - Password Spraying',
        evidence: `User '${username}' targeted from ${ips.length} IPs`,
        timestamp: now,
        source_ips: ips,
      });
    }
  }

  // Rule 3: Privilege Escalation
  for (const event of adminEvents) {
    alerts.push({
      id: `PRIV_${event.username}_${event.source_ip.replace(/\./g, '_')}`,
      name: 'Privilege Escalation',
      severity: 'High',
      mitre_technique: 'T1078 - Valid Accounts',
      evidence: `Admin activity: ${event.event_type} by ${event.username}`,
      timestamp: event.timestamp,
      source_ips: event.source_ip !== 'unknown' ? [event.source_ip] : [],
    });
  }

  // Rule 4: Web Scanning
  for (const [ip, count] of httpErrorsByIp) {
    if (count >= 10) {
      alerts.push({
        id: `SCAN_${ip.replace(/\./g, '_')}`,
        name: 'Web Scanning',
        severity: count >= 50 ? 'High' : 'Medium',
        mitre_technique: 'T1595 - Active Scanning',
        evidence: `${count} HTTP errors from ${ip}`,
        timestamp: now,
        source_ips: [ip],
      });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return alerts.filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}
