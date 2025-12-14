import React, { useState, useMemo } from 'react';
import { NormalizedEvent } from '../parserEngine';

interface LogViewerProps {
  events: NormalizedEvent[];
}

const LogViewer: React.FC<LogViewerProps> = ({ events }) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRaw, setShowRaw] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesText =
        !filter ||
        (event.source_ip || '').toLowerCase().includes(filter.toLowerCase()) ||
        (event.username || '').toLowerCase().includes(filter.toLowerCase()) ||
        event.event_type.toLowerCase().includes(filter.toLowerCase()) ||
        event.timestamp.toLowerCase().includes(filter.toLowerCase()) ||
        event.message.toLowerCase().includes(filter.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        event.status === statusFilter;

      return matchesText && matchesStatus;
    });
  }, [events, filter, statusFilter]);

  const displayedEvents = filteredEvents.slice(0, visibleCount);

  const getStatusClass = (status: string) => {
    if (status === 'failure') return 'status-failure';
    if (status === 'success') return 'status-success';
    return '';
  };

  const getSeverityClass = (severity: string) => {
    if (severity === 'high') return 'severity-high';
    if (severity === 'medium') return 'severity-medium';
    return 'severity-low';
  };

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 50, filteredEvents.length));
  };

  if (events.length === 0) {
    return (
      <div className="log-viewer empty">
        <p>No log events to display</p>
      </div>
    );
  }

  return (
    <div className="log-viewer">
      <div className="section-header">
        <h2>
          <span className="section-icon">📋</span>
          Parsed Events
        </h2>
        <span className="event-count">
          {filteredEvents.length} of {events.length} events
        </span>
      </div>

      <div className="log-controls">
        <input
          type="text"
          placeholder="Search events..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />

        <div className="filter-buttons">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn status-success ${statusFilter === 'success' ? 'active' : ''}`}
            onClick={() => setStatusFilter('success')}
          >
            Success
          </button>
          <button
            className={`filter-btn status-failure ${statusFilter === 'failure' ? 'active' : ''}`}
            onClick={() => setStatusFilter('failure')}
          >
            Failures
          </button>
          <button
            className={`filter-btn ${statusFilter === 'info' ? 'active' : ''}`}
            onClick={() => setStatusFilter('info')}
          >
            Info
          </button>
        </div>

        <label className="toggle-raw">
          <input
            type="checkbox"
            checked={showRaw}
            onChange={(e) => setShowRaw(e.target.checked)}
          />
          Show Raw Lines
        </label>
      </div>

      {displayedEvents.length === 0 ? (
        <div className="no-events">
          <p>No events match your filter criteria</p>
        </div>
      ) : (
        <>
          <div className="events-table-container">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Source IP</th>
                  <th>Username</th>
                  <th>Event Type</th>
                  <th>Status</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {displayedEvents.map((event, index) => (
                  <React.Fragment key={index}>
                    <tr className={getStatusClass(event.status)}>
                      <td className="mono">{event.timestamp}</td>
                      <td className="mono">{event.source_ip || '-'}</td>
                      <td>{event.username || '-'}</td>
                      <td>
                        <span className="event-badge">{event.event_type}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td>
                        <span className={`severity-badge ${getSeverityClass(event.severity)}`}>
                          {event.severity}
                        </span>
                      </td>
                    </tr>
                    {showRaw && event.raw && (
                      <tr className="raw-line-row">
                        <td colSpan={6}>
                          <code className="raw-line">{event.raw}</code>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {visibleCount < filteredEvents.length && (
            <div className="load-more">
              <button onClick={loadMore} className="load-more-btn">
                Load More ({filteredEvents.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LogViewer;