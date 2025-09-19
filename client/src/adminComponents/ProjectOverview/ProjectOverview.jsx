import React, { useState, useEffect, useCallback } from 'react';
import styles from './ProjectOverview.module.css';
import { projectOverviewFallbackRecords, projectOverviewCurrentProject } from '../fallbackData';

const ProjectDetailDashboard = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [monitoringRecords, setMonitoringRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback and sample data moved to shared module

  // Fetch records from backend with fallback
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/monitoring-records');
        if (!response.ok) throw new Error('Failed to fetch records');
        const data = await response.json();
        setMonitoringRecords(data);
      } catch (err) {
  console.warn('Using fallback records due to fetch error:', err);
  setMonitoringRecords(projectOverviewFallbackRecords);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
    setSelectedRecord(null);
  }, []);

  // Handle record selection
  const handleRecordClick = useCallback((record) => {
    setSelectedRecord(record);
  }, []);

  // Handle Accept / Reject actions with backend update
  const handleRecordAction = useCallback(async (action, recordId) => {
    const confirmAction = window.confirm(`Are you sure you want to ${action.toLowerCase()} this record?`);
    if (!confirmAction) return;

    const newStatus = action === 'Accept' ? 'PROCESSED' : 'REJECTED';

    try {
      const response = await fetch(`http://localhost:5000/api/monitoring-records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update record');

      // Update frontend state
      setMonitoringRecords(prev =>
        prev.map(record =>
          record.id === recordId ? { ...record, status: newStatus } : record
        )
      );
      setSelectedRecord(null);
      alert(`Record ${action.toLowerCase()}ed successfully!`);
    } catch (err) {
      console.warn('Backend update failed, updating locally only:', err);
      // Fallback: update locally
      setMonitoringRecords(prev =>
        prev.map(record =>
          record.id === recordId ? { ...record, status: newStatus } : record
        )
      );
      setSelectedRecord(null);
      alert(`Record ${action.toLowerCase()}ed locally (backend update failed).`);
    }
  }, []);

  // Enable buttons only when a pending record is selected
  const areButtonsDisabled = useCallback(() => {
    if (!selectedRecord) return true;
    if (activeFilter === 'Pending' && selectedRecord.status === 'PENDING') return false;
    return true;
  }, [selectedRecord, activeFilter]);

  // Filter records based on tab
  const getFilteredRecords = () => {
    switch (activeFilter) {
      case 'Pending':
        return monitoringRecords.filter(r => r.status === 'PENDING');
      case 'Processed':
        return monitoringRecords.filter(r => r.status === 'PROCESSED');
      case 'Rejected':
        return monitoringRecords.filter(r => r.status === 'REJECTED');
      default:
        return monitoringRecords;
    }
  };

  const filteredRecords = getFilteredRecords();
  const buttonsDisabled = areButtonsDisabled();

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>NCCR ADMIN</h1>
        </div>
        <nav className={styles.sidebarNav}>
          <button className={`${styles.navItem} ${styles.disabled}`}>Overview</button>
          <button className={`${styles.navItem} ${styles.active}`}>Projects</button>
          <button className={`${styles.navItem} ${styles.disabled}`}>Reports</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.contentHeader}>
          <div className={styles.breadcrumb}>NCCR ADMIN</div>
          <h2 className={styles.contentTitle}>{projectOverviewCurrentProject.name}</h2>
          <p className={styles.contentSubtitle}>Project details and monitoring records</p>
        </header>

        <div className={styles.contentBody}>
          <div className={styles.threePanelContainer}>
            {/* Panel 1 - Project Info */}
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Project Info</h3>
              <div className={styles.projectInfoContent}>
                <div className={styles.infoItem}><strong className={styles.infoLabel}>Project Name:</strong><div>{projectOverviewCurrentProject.name}</div></div>
                <div className={styles.infoItem}><strong className={styles.infoLabel}>ID:</strong><div>{projectOverviewCurrentProject.id}</div></div>
                <div className={styles.infoItem}><strong className={styles.infoLabel}>Project ID:</strong><div>{projectOverviewCurrentProject.projectId}</div></div>
                <div className={styles.infoItem}><strong className={styles.infoLabel}>Submitted by:</strong><div>{projectOverviewCurrentProject.submittedBy}</div></div>
                <div className={styles.infoItem}><strong className={styles.infoLabel}>Date:</strong><div>Sep 15, 2024, 10:30 AM</div></div>
              </div>
            </div>

            {/* Panel 2 - Records List */}
            <div className={styles.panel}>
              <div className={styles.recordsHeader}>
                <h3 className={styles.panelTitle}>Records List</h3>
                <div className={styles.filterButtons}>
                  {['All', 'Pending', 'Processed', 'Rejected'].map(f => (
                    <button
                      key={f}
                      onClick={() => handleFilterChange(f)}
                      className={`${styles.filterButton} ${activeFilter === f ? styles.active : ''}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.recordsList}>
                {loading ? (
                  <p>Loading records...</p>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map(record => (
                    <div
                      key={record.id}
                      onClick={() => handleRecordClick(record)}
                      className={`${styles.recordItem} ${selectedRecord?.id === record.id ? styles.selected : ''}`}
                    >
                      <div className={styles.recordTimestamp}>{record.timestamp}</div>
                      <div className={styles.recordEvidence}><strong>Evidence:</strong> {record.evidence}</div>
                      <div className={styles.recordType}><strong>Type:</strong> {record.evidenceType}</div>
                      <span className={`${styles.recordStatus} ${styles[record.status.toLowerCase()]}`}>{record.status}</span>
                    </div>
                  ))
                ) : (
                  <p>No records found.</p>
                )}
              </div>
            </div>

            {/* Panel 3 - Record Details */}
            <div className={styles.panel}>
              <div className={styles.recordDetailsPanel}>
                {selectedRecord ? (
                  <>
                    <div className={styles.detailsContent}>
                      <div className={styles.detailItem}><strong className={styles.detailLabel}>Timestamp:</strong><div className={styles.detailValue}>{selectedRecord.timestamp}</div></div>
                      <div className={styles.detailItem}><strong className={styles.detailLabel}>Evidence:</strong><div className={styles.detailValue}><a href="#" className={styles.evidenceLink}>{selectedRecord.evidence}</a></div></div>
                      <div className={styles.detailItem}><strong className={styles.detailLabel}>Evidence Type:</strong><div className={styles.detailValue}>{selectedRecord.evidenceType}</div></div>
                      <div className={styles.detailItem}><strong className={styles.detailLabel}>Species Planted:</strong><div className={styles.detailValue}>{selectedRecord.dataPayload.speciesPlanted}</div></div>
                      <div className={styles.detailItem}><strong className={styles.detailLabel}>Number of Trees:</strong><div className={styles.detailValue}>{selectedRecord.dataPayload.numberOfTrees}</div></div>
                      <div className={styles.detailItem}><strong className={styles.detailLabel}>Notes:</strong><p className={styles.notesText}>{selectedRecord.dataPayload.notes}</p></div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                      <button
                        disabled={buttonsDisabled}
                        onClick={() => handleRecordAction('Accept', selectedRecord.id)}
                        className={`${styles.actionButton} ${styles.acceptButton} ${buttonsDisabled ? styles.disabled : ''}`}
                      >
                        Accept
                      </button>
                      <button
                        disabled={buttonsDisabled}
                        onClick={() => handleRecordAction('Reject', selectedRecord.id)}
                        className={`${styles.actionButton} ${styles.rejectButton} ${buttonsDisabled ? styles.disabled : ''}`}
                      >
                        Reject
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.noRecordSelected}>
                    <div className={styles.placeholderIcon}>📋</div>
                    <p className={styles.placeholderTitle}>Click on a record to know more</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetailDashboard;
