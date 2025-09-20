import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import AdminHeader from '../AdminHeader/AdminHeader';
import styles from './ProjectOverview.module.css';
import { projectOverviewCurrentProject } from '../fallbackData';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProjectDetailDashboard = () => {
  const { projectID } = useParams();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [monitoringRecords, setMonitoringRecords] = useState([]);
  const [projectInfo, setProjectInfo] = useState({ name: projectOverviewCurrentProject.name, id: projectOverviewCurrentProject.id, projectId: projectOverviewCurrentProject.projectId, submittedBy: projectOverviewCurrentProject.submittedBy });
  const [loading, setLoading] = useState(true);

  // Fallback and sample data moved to shared module

  // Fetch project info and monitoring updates for the given projectID
  useEffect(() => {
    const load = async () => {
      if (!projectID) return;
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/project/${projectID}/monitoring`);
        if (!res.ok) throw new Error(`Failed to fetch monitoring for project ${projectID}: ${res.status}`);
        const data = await res.json();

        // data shape from server: { projectName, projectInfo: { id, projectId }, monitoringRecords: [...] }
        setProjectInfo({
          name: data.projectName || 'Project',
          id: data.projectInfo?.id || projectID,
          projectId: data.projectInfo?.projectId || projectID,
          submittedBy: projectOverviewCurrentProject.submittedBy
        });
        setMonitoringRecords(
          Array.isArray(data.monitoringRecords) 
            ? data.monitoringRecords.map((r, idx) => ({
                id: r.id || String(idx + 1),
                timestamp: r.timestamp || '',
                evidence: r.evidence || '',
                evidenceType: r.evidenceType || '',
                dataPayload: {
                  speciesPlanted: r.dataPayload?.speciesPlanted || '',
                  numberOfTrees: r.dataPayload?.numberOfTrees || '',
                  notes: r.dataPayload?.notes || ''
                },
                status: (r.status || 'PENDING').toUpperCase()
              })) 
            : []
        );
      } catch (err) {
        console.warn('Fetch error, showing empty records:', err);
        // Keep minimal project info; leave records empty to reflect server state
        setProjectInfo((prev) => ({ ...prev, id: projectID, projectId: projectID }));
        setMonitoringRecords([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectID]);

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'accept' | 'reject'
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingRecordId, setPendingRecordId] = useState(null);

  const openConfirm = useCallback((action, recordId) => {
    setConfirmAction(action);
    setPendingRecordId(recordId);
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setConfirmAction(null);
    setPendingRecordId(null);
  }, []);

  const confirmRecordAction = useCallback(async () => {
    if (!pendingRecordId || !confirmAction) return;
    setIsProcessing(true);
    try {
      const endpoint = confirmAction === 'accept' ? 'accept' : 'reject';
      const resp = await fetch(`${BACKEND_URL}/api/monitoring-updates/${pendingRecordId}/${endpoint}`, {
        method: 'POST'
      });
      if (!resp.ok) throw new Error('Failed to update record');

      const newStatus = confirmAction === 'accept' ? 'ACCEPTED' : 'REJECTED';
      setMonitoringRecords(prev => prev.map(r => (r.id === pendingRecordId ? { ...r, status: newStatus } : r)));
      setSelectedRecord(null);
      closeConfirm();
    } catch (e) {
      console.error(e);
      closeConfirm();
    } finally {
      setIsProcessing(false);
    }
  }, [pendingRecordId, confirmAction, BACKEND_URL, closeConfirm]);

  // Enable buttons only when a pending record is selected
  const areButtonsDisabled = useCallback(() => {
    if (!selectedRecord) return true;
    return String(selectedRecord.status || '').toUpperCase() !== 'PENDING';
  }, [selectedRecord]);

  // Filter records based on tab
  const getFilteredRecords = () => {
    switch (activeFilter) {
      case 'Pending':
        return monitoringRecords.filter(r => r.status === 'PENDING');
      case 'Accepted':
        return monitoringRecords.filter(r => r.status === 'ACCEPTED');
      case 'Rejected':
        return monitoringRecords.filter(r => r.status === 'REJECTED');
      default:
        return monitoringRecords;
    }
  };

  const filteredRecords = getFilteredRecords();
  const buttonsDisabled = areButtonsDisabled();

  // Helpers to build evidence URL and detect images
  const buildEvidenceUrl = (evidence) => {
    if (!evidence) return '';
    // If looks like a filename (has extension), serve from backend uploads
    if (/\./.test(evidence)) {
      return `${BACKEND_URL}/uploads/monitoring/${encodeURIComponent(evidence)}`;
    }
    // Otherwise treat as IPFS CID
    return `https://ipfs.io/ipfs/${evidence}`;
  };

  const isImageEvidence = (evidence) => /\.(png|jpe?g|webp|gif)$/i.test(evidence || '');

  // Lightbox state
  const [lightbox, setLightbox] = useState({ open: false, src: '', filename: '' });
  const openLightbox = (src, filename) => setLightbox({ open: true, src, filename });
  const closeLightbox = () => setLightbox({ open: false, src: '', filename: '' });

  return (
    <div className={styles.dashboard}>
      <AdminHeader />
      {/* Main Content */}
      <main className={styles.mainContent}>

        <div className={styles.contentBody}>
          <div className={styles.threePanelContainer}>
            {/* Panel 1 - Project Info */}
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Project Info</h3>
              <div className={styles.projectInfoContent}>
                <div className={styles.infoItem}><strong className={styles.infoLabel}>Project Name:</strong><div>{projectInfo.name}</div></div>
                <div className={styles.infoItem}><strong className={styles.infoLabel}>ID:</strong><div>{projectInfo.id}</div></div>
                <div className={styles.infoItem}><strong className={styles.infoLabel}>Project ID:</strong><div>{projectInfo.projectId}</div></div>
                <div className={styles.infoItem}><strong className={styles.infoLabel}>Submitted by:</strong><div>{projectInfo.submittedBy}</div></div>
                <div className={styles.infoItem}><strong className={styles.infoLabel}>Date:</strong><div>Sep 15, 2024, 10:30 AM</div></div>
              </div>
            </div>

            {/* Panel 2 - Records List */}
            <div className={styles.panel}>
              <div className={styles.recordsHeader}>
                <h3 className={styles.panelTitle}>Records List</h3>
                <div className={styles.filterButtons}>
                  {['All', 'Pending', 'Accepted', 'Rejected'].map(f => (
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
                      <div className={styles.recordEvidence}>
                        <strong>Evidence:</strong>{' '}
                        {record.evidence ? (
                          <a
                            href={buildEvidenceUrl(record.evidence)}
                            target="_blank"
                            rel="noreferrer noopener"
                            className={styles.evidenceLink}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {record.evidence}
                          </a>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                      <div className={styles.recordType}><strong>Type:</strong> {record.evidenceType}</div>
                      <span className={`${styles.recordStatus} ${styles[record.status.toLowerCase()]}`}>{record.status}</span>
                    </div>
                  ))
                ) : (
                  <p>no records to show</p>
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
                      <div className={styles.detailItem}>
                        <strong className={styles.detailLabel}>Evidence:</strong>
                        <div className={styles.detailValue}>
                          {selectedRecord.evidence ? (
                            <a
                              href={buildEvidenceUrl(selectedRecord.evidence)}
                              target="_blank"
                              rel="noreferrer noopener"
                              className={styles.evidenceLink}
                            >
                              {selectedRecord.evidence}
                            </a>
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                      </div>
                      {selectedRecord.evidence && isImageEvidence(selectedRecord.evidence) && (
                        <div className={styles.detailItem}>
                          <strong className={styles.detailLabel}>Preview:</strong>
                          <div className={styles.detailValue}>
                            <div
                              className={styles.imagePreviewFrame}
                              onClick={() => openLightbox(buildEvidenceUrl(selectedRecord.evidence), selectedRecord.evidence)}
                              role="button"
                              title="Click to enlarge"
                            >
                              <img
                                src={buildEvidenceUrl(selectedRecord.evidence)}
                                alt="Evidence preview"
                                className={styles.imagePreview}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className={styles.detailItem}><strong className={styles.detailLabel}>Evidence Type:</strong><div className={styles.detailValue}>{selectedRecord.evidenceType}</div></div>
                      <div className={styles.detailItem}><strong className={styles.detailLabel}>Species Planted:</strong><div className={styles.detailValue}>{selectedRecord.dataPayload.speciesPlanted}</div></div>
                      <div className={styles.detailItem}><strong className={styles.detailLabel}>Number of Trees:</strong><div className={styles.detailValue}>{selectedRecord.dataPayload.numberOfTrees}</div></div>
                      <div className={styles.detailItem}><strong className={styles.detailLabel}>Notes:</strong><p className={styles.notesText}>{selectedRecord.dataPayload.notes}</p></div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                      <button
                        disabled={buttonsDisabled}
                        onClick={() => openConfirm('accept', selectedRecord.id)}
                        className={`${styles.actionButton} ${styles.acceptButton} ${buttonsDisabled ? styles.disabled : ''}`}
                      >
                        Accept
                      </button>
                      <button
                        disabled={buttonsDisabled}
                        onClick={() => openConfirm('reject', selectedRecord.id)}
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
      {lightbox.open && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox} role="dialog" aria-modal="true">
          <div className={styles.lightboxContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxTopBar}>
              <div className={styles.lightboxTitle} title={lightbox.filename}>{lightbox.filename}</div>
              <button className={styles.lightboxCloseBtn} onClick={closeLightbox} aria-label="Close preview">×</button>
            </div>
            <div className={styles.lightboxBody}>
              <img src={lightbox.src} alt={lightbox.filename || 'Evidence image'} className={styles.lightboxImage} />
            </div>
          </div>
        </div>
      )}

      {/* Small Confirmation Modal */}
      {confirmOpen && (
        <div className={styles.confirmOverlay} role="dialog" aria-modal="true" onClick={closeConfirm}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmHeader}>
              {confirmAction === 'accept' ? 'Accept Record' : 'Reject Record'}
            </div>
            <div className={styles.confirmBody}>
              Are you sure you want to {confirmAction} this record? This cannot be easily undone.
            </div>
            <div className={styles.confirmActions}>
              <button onClick={closeConfirm} className={styles.confirmCancel} disabled={isProcessing}>Cancel</button>
              <button
                onClick={confirmRecordAction}
                className={`${styles.confirmPrimary} ${confirmAction === 'accept' ? styles.confirmAccept : styles.confirmReject}`}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : (confirmAction === 'accept' ? 'Confirm Accept' : 'Confirm Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailDashboard;

