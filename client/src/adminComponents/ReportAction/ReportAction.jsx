import React, { useState, useEffect } from 'react';
import styles from './ReportAction.module.css';
import { reportActionFallbackReportData, reportActionFallbackMonitoringRecords } from '../fallbackData';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const ReportViewer = ({ reportId, onNavigateBack, onReportUpdated }) => {
  const [reportData, setReportData] = useState(null);
  const [monitoringRecords, setMonitoringRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
  const [actionType, setActionType] = useState('');

  // Fallback data moved to shared module

  useEffect(() => {
    fetchReportData();
  }, [reportId]);

  const formatDate = (d) => {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      // 1) Fetch report details
      const response = await fetch(`${BACKEND_URL}/api/report/${reportId}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const report = await response.json();

      // 2) Transform to UI view model
      const viewModel = {
        reportName: report?.name || '—',
        projectName: report?.project?.name || '—',
        timeperiod: `${formatDate(report?.monitoringStartPeriod)} - ${formatDate(report?.monitoringEndPeriod)}`,
        submittedBy: report?.verifier?.name || '—',
        submittedDate: formatDate(report?.createdAt),
        status: report?.status || 'PENDING',
        id: report?._id || '—',
        lastModified: new Date(report?.updatedAt || Date.now()).toLocaleString('en-IN'),
        totalCO2Offset: typeof report?.verifiedCarbonAmount === 'number' ? report.verifiedCarbonAmount : 0,
        reportNotes: report?.notes || '—',
        // Keep originals for subsequent calls
        __projectId: report?.project?._id || report?.project,
        __start: report?.monitoringStartPeriod,
        __end: report?.monitoringEndPeriod,
      };
      setReportData(viewModel);

      // 3) Fetch monitoring records within the report's monitoring period
      const projectId = viewModel.__projectId;
      const startISO = new Date(viewModel.__start).toISOString();
      const endISO = new Date(viewModel.__end).toISOString();

      if (projectId && startISO && endISO) {
        const recordsResponse = await fetch(
          `${BACKEND_URL}/api/report/monitoring-range/${projectId}/${encodeURIComponent(startISO)}/${encodeURIComponent(endISO)}`
        );

        if (recordsResponse.ok) {
          const range = await recordsResponse.json();
          const records = Array.isArray(range?.records) ? range.records : [];
          const mapped = records.map((rec, idx) => ({
            id: rec?._id || String(idx + 1),
            date: formatDate(rec?.timestamp),
            activity: rec?.evidenceType || rec?.dataPayload?.activity || 'Monitoring Activity',
            location: (rec?.dataPayload && (rec.dataPayload.location || rec.dataPayload.site || rec.dataPayload.village)) || '—',
            co2Reduction: Number(rec?.dataPayload?.co2Reduction) || 0,
            status: rec?.status || 'PENDING',
            details: rec?.dataPayload?.notes || (rec?.dataPayload ? JSON.stringify(rec.dataPayload) : '—'),
            verifiedBy: rec?.reviewer?.name || '—',
            verificationDate: formatDate(rec?.updatedAt || rec?.timestamp),
          }));
          setMonitoringRecords(mapped);
        } else {
          setMonitoringRecords(reportActionFallbackMonitoringRecords);
        }
      } else {
        setMonitoringRecords(reportActionFallbackMonitoringRecords);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      // Use fallback data
      setReportData(reportActionFallbackReportData);
      setMonitoringRecords(reportActionFallbackMonitoringRecords);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptReport = () => {
  // Only allow when status is IN_REVIEW
  const status = String(reportData?.status || '').toUpperCase();
  if (!['IN_REVIEW', 'IN REVIEW'].includes(status)) return;
  setActionType('accept');
  setShowAcceptConfirmation(true);
  };

  const handleRejectReport = () => {
  // Only allow when status is IN_REVIEW
  const status = String(reportData?.status || '').toUpperCase();
  if (!['IN_REVIEW', 'IN REVIEW'].includes(status)) return;
  setActionType('reject');
  setShowRejectConfirmation(true);
  };

  const confirmAcceptReport = async () => {
    try {
      setIsProcessing(true);
      // Update status to APPROVED per server enums
      const response = await fetch(`${BACKEND_URL}/api/report/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'APPROVED',
          notes: reportData?.reportNotes, 
          verifiedCarbonAmount: reportData?.totalCO2Offset 
        })
      });

      if (!response.ok) throw new Error('Failed to update report');

      setShowAcceptConfirmation(false);
      
      // Navigate back or refresh parent component
      if (onReportUpdated) {
        onReportUpdated();
      }
      if (onNavigateBack) {
        onNavigateBack();
      }
  // Ensure UI reflects latest status
  setTimeout(() => window.location.reload(), 0);
    } catch (error) {
      console.error('Error accepting report:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmRejectReport = async () => {
    try {
      setIsProcessing(true);
      // Could set notes or amount; server lacks explicit reject endpoint, but a status route could be added.
      // For now, we update fields only as per available PUT route.
      const response = await fetch(`${BACKEND_URL}/api/report/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'REJECTED',
          notes: reportData?.reportNotes, 
          verifiedCarbonAmount: reportData?.totalCO2Offset 
        })
      });

      if (!response.ok) throw new Error('Failed to update report');

      setShowRejectConfirmation(false);
      
      // Navigate back or refresh parent component
      if (onReportUpdated) {
        onReportUpdated();
      }
      if (onNavigateBack) {
        onNavigateBack();
      }
  // Ensure UI reflects latest status
  setTimeout(() => window.location.reload(), 0);
    } catch (error) {
      console.error('Error rejecting report:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText, 
    isLoading,
    type 
  }) => {
    if (!isOpen) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>{title}</h3>
          </div>
          <div className={styles.modalContent}>
            <p>{message}</p>
          </div>
          <div className={styles.modalActions}>
            <button 
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              className={`${styles.confirmButton} ${type === 'reject' ? styles.rejectButton : styles.acceptButton}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading report...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className={styles.errorContainer}>
        <p>Failed to load report data</p>
        <button onClick={onNavigateBack} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  const totalCO2Reduction = monitoringRecords.reduce((sum, record) => 
    sum + parseInt(record.co2Reduction), 0
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <span onClick={onNavigateBack} className={styles.breadcrumbLink}>
            NCCR ADMIN
          </span>
          <span> &gt; </span>
          <span onClick={onNavigateBack} className={styles.breadcrumbLink}>
            Reports
          </span>
          <span> &gt; </span>
          <span>{reportData.reportName}</span>
        </div>
      </div>

      <div className={styles.contentWrapper}>
  {/* Sidebar removed as requested */}

        <div className={styles.mainContent}>
          <div className={styles.reportContainer}>
            {/* Official Report Header */}
            <div className={styles.reportHeader}>
              <div className={styles.headerTop}>
                <div className={styles.headerLeft}>
                  <h1 className={styles.reportTitle}>{reportData.reportName}</h1>
                  <div className={styles.headerMetric} title="Total CO2 Offset from server">
                    <span className={styles.metricLabel}>CO2 Offset:</span>
                    <span className={styles.metricValue}>{reportData.totalCO2Offset}</span>
                    <span className={styles.metricUnit}>tonnes</span>
                  </div>
                </div>
                <div className={styles.headerRight}>
                  <div className={styles.statusBadge}>
                    <span className={styles.statusSubmitted}>{reportData.status}</span>
                  </div>
                  <div className={styles.headerActions}>
                    <button 
                      className={styles.rejectBtn}
                      onClick={handleRejectReport}
                      disabled={isProcessing || !['IN_REVIEW','IN REVIEW'].includes(String(reportData.status || '').toUpperCase())}
                    >
                      {isProcessing && actionType === 'reject' ? 'Processing...' : 'Reject'}
                    </button>
                    <button 
                      className={styles.acceptBtn}
                      onClick={handleAcceptReport}
                      disabled={isProcessing || !['IN_REVIEW','IN REVIEW'].includes(String(reportData.status || '').toUpperCase())}
                    >
                      {isProcessing && actionType === 'accept' ? 'Processing...' : 'Accept'}
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.reportMeta}>
                <p><strong>Report ID:</strong> {reportData.id}</p>
                <p><strong>Generated:</strong> {new Date().toLocaleDateString('en-IN', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}</p>
                <p><strong>Last Modified:</strong> {reportData.lastModified}</p>
              </div>
            </div>

            {/* Report Information Section */}
            <div className={styles.reportSection}>
              <h2 className={styles.sectionTitle}>Report Information</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Project Name:</label>
                  <span>{reportData.projectName}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Time Period:</label>
                  <span>{reportData.timeperiod}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>CO2 Offset:</label>
                  <span>{reportData.totalCO2Offset} tonnes</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Submitted By:</label>
                  <span>{reportData.submittedBy}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Submission Date:</label>
                  <span>{reportData.submittedDate}</span>
                </div>
              </div>
            </div>

            {/* CO2 Offset Section removed - single metric now in header */}

            {/* Report Notes Section */}
            <div className={styles.reportSection}>
              <h2 className={styles.sectionTitle}>Report Notes</h2>
              <div className={styles.notesContent}>
                <p>{reportData.reportNotes}</p>
              </div>
            </div>

            {/* Monitoring Records Section */}
            <div className={styles.reportSection}>
              <h2 className={styles.sectionTitle}>List of Monitoring Records</h2>
              <div className={styles.recordsTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableHeaderCell}>Record ID</div>
                  <div className={styles.tableHeaderCell}>Date</div>
                  <div className={styles.tableHeaderCell}>Activity</div>
                  <div className={styles.tableHeaderCell}>Location</div>
                  <div className={styles.tableHeaderCell}>CO2 Reduction</div>
                  <div className={styles.tableHeaderCell}>Status</div>
                </div>
                <div className={styles.tableBody}>
                  {monitoringRecords.map((record) => (
                    <div key={record.id} className={styles.tableRow}>
                      <div className={styles.tableCell}>
                        <span className={styles.recordId}>{record.id}</span>
                      </div>
                      <div className={styles.tableCell}>{record.date}</div>
                      <div className={styles.tableCell}>{record.activity}</div>
                      <div className={styles.tableCell}>{record.location}</div>
                      <div className={styles.tableCell}>
                        <span className={styles.co2Value}>{record.co2Reduction} tonnes</span>
                      </div>
                      <div className={styles.tableCell}>
                        <span className={styles.statusVerified}>{record.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Records */}
              <div className={styles.detailedRecords}>
                <h3>Detailed Activity Information</h3>
                {monitoringRecords.map((record) => (
                  <div key={record.id} className={styles.recordDetail}>
                    <div className={styles.recordDetailHeader}>
                      <h4>{record.id} - {record.activity}</h4>
                      <span className={styles.recordDate}>{record.date}</span>
                    </div>
                    <div className={styles.recordDetailContent}>
                      <p><strong>Location:</strong> {record.location}</p>
                      <p><strong>CO2 Reduction:</strong> {record.co2Reduction} tonnes</p>
                      <p><strong>Description:</strong> {record.details}</p>
                      <p><strong>Verified By:</strong> {record.verifiedBy} on {record.verificationDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Old footer removed */}
          </div>
        </div>
      </div>

  {/* Action buttons moved to header */}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showAcceptConfirmation}
        onClose={() => setShowAcceptConfirmation(false)}
        onConfirm={confirmAcceptReport}
        title="Accept Report"
        message="Are you sure you want to accept this report? This action will mark the report as 'Verified' and cannot be undone. The CO2 offset credits will be officially validated."
        confirmText="Accept Report"
        isLoading={isProcessing}
        type="accept"
      />

      <ConfirmationModal
        isOpen={showRejectConfirmation}
        onClose={() => setShowRejectConfirmation(false)}
        onConfirm={confirmRejectReport}
        title="Reject Report"
        message="Are you sure you want to reject this report? This action will mark the report as 'Rejected' and return it to the submitter for corrections. Please ensure you have valid reasons for rejection."
        confirmText="Reject Report"
        isLoading={isProcessing}
        type="reject"
      />
    </div>
  );
};

export default ReportViewer;
