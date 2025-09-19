import React, { useState, useEffect } from 'react';
import styles from './ReportAction.module.css';

const ReportViewer = ({ reportId, onNavigateBack, onReportUpdated }) => {
  const [reportData, setReportData] = useState(null);
  const [monitoringRecords, setMonitoringRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
  const [actionType, setActionType] = useState('');

  // Fallback data for demo purposes
  const fallbackReportData = {
    id: 'RPT001',
    reportName: 'Q4 2024 Impact Report',
    projectName: 'Clean Water Initiative',
    timeperiod: 'October - December 2024',
    totalCO2Offset: '250',
    reportNotes: 'This comprehensive report details the Clean Water Initiative\'s environmental impact during Q4 2024. The project successfully implemented multiple water conservation and treatment systems across Maharashtra, resulting in significant carbon footprint reduction through decreased energy consumption and improved water efficiency.',
    status: 'Submitted',
    submittedDate: '2024-12-30',
    submittedBy: 'Project Manager - Rahul Sharma',
    lastModified: '2024-12-29 14:30'
  };

  const fallbackMonitoringRecords = [
    {
      id: 'MR001',
      date: '2024-10-15',
      activity: 'Water filtration system installation',
      location: 'Site A - Mumbai',
      co2Reduction: '45',
      status: 'Verified',
      details: 'Installed 5 high-efficiency water filtration units serving 1,200 households. Reduced transportation emissions from bottled water delivery and energy consumption from conventional treatment methods.',
      verificationDate: '2024-10-16',
      verifiedBy: 'Environmental Auditor - Dr. Priya Mehta'
    },
    {
      id: 'MR002',
      date: '2024-11-05',
      activity: 'Solar-powered pumping stations',
      location: 'Site B - Pune',
      co2Reduction: '78',
      status: 'Verified',
      details: 'Commissioned 3 solar-powered water pumping stations with 75kW total capacity. Eliminated grid electricity dependency and reduced carbon emissions from fossil fuel-based power generation.',
      verificationDate: '2024-11-06',
      verifiedBy: 'Environmental Auditor - Dr. Amit Patel'
    },
    {
      id: 'MR003',
      date: '2024-11-20',
      activity: 'Rainwater harvesting network',
      location: 'Site C - Nashik',
      co2Reduction: '52',
      status: 'Verified',
      details: 'Established comprehensive rainwater harvesting network covering 15 residential complexes. Reduced groundwater extraction and associated pumping energy requirements.',
      verificationDate: '2024-11-21',
      verifiedBy: 'Environmental Auditor - Dr. Sunita Joshi'
    },
    {
      id: 'MR004',
      date: '2024-12-10',
      activity: 'Greywater treatment facility',
      location: 'Site D - Aurangabad',
      co2Reduction: '63',
      status: 'Verified',
      details: 'Constructed advanced greywater treatment facility processing 25,000 liters daily. Reduced fresh water demand and treatment energy consumption through water recycling.',
      verificationDate: '2024-12-11',
      verifiedBy: 'Environmental Auditor - Dr. Vikram Singh'
    },
    {
      id: 'MR005',
      date: '2024-12-20',
      activity: 'Community water conservation program',
      location: 'Multiple sites - Maharashtra',
      co2Reduction: '12',
      status: 'Verified',
      details: 'Conducted extensive community education and water conservation awareness programs reaching 5,000+ residents. Behavioral changes resulted in 20% reduction in water consumption and associated energy use.',
      verificationDate: '2024-12-21',
      verifiedBy: 'Environmental Auditor - Dr. Kavita Desai'
    }
  ];

  useEffect(() => {
    fetchReportData();
  }, [reportId]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports/${reportId}`);
      
      if (!response.ok) throw new Error('Failed to fetch report');
      
      const data = await response.json();
      setReportData(data);
      
      // Fetch monitoring records
      const recordsResponse = await fetch(`/api/reports/${reportId}/monitoring-records`);
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        setMonitoringRecords(recordsData);
      } else {
        setMonitoringRecords(fallbackMonitoringRecords);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      // Use fallback data
      setReportData(fallbackReportData);
      setMonitoringRecords(fallbackMonitoringRecords);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptReport = () => {
    setActionType('accept');
    setShowAcceptConfirmation(true);
  };

  const handleRejectReport = () => {
    setActionType('reject');
    setShowRejectConfirmation(true);
  };

  const confirmAcceptReport = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/reports/${reportId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to accept report');

      setShowAcceptConfirmation(false);
      
      // Navigate back or refresh parent component
      if (onReportUpdated) {
        onReportUpdated();
      }
      if (onNavigateBack) {
        onNavigateBack();
      }
    } catch (error) {
      console.error('Error accepting report:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmRejectReport = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/reports/${reportId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to reject report');

      setShowRejectConfirmation(false);
      
      // Navigate back or refresh parent component
      if (onReportUpdated) {
        onReportUpdated();
      }
      if (onNavigateBack) {
        onNavigateBack();
      }
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
        <div className={styles.sidebar}>
          <div className={styles.navItem}>Overview</div>
          <div className={styles.navItem}>Projects</div>
          <div className={`${styles.navItem} ${styles.active}`}>Reports</div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.reportContainer}>
            {/* Official Report Header */}
            <div className={styles.reportHeader}>
              <div className={styles.headerTop}>
                <h1 className={styles.reportTitle}>NCCR Environmental Impact Report</h1>
                <div className={styles.statusBadge}>
                  <span className={styles.statusSubmitted}>{reportData.status}</span>
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
                  <label>Report Name:</label>
                  <span>{reportData.reportName}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Project Name:</label>
                  <span>{reportData.projectName}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Time Period:</label>
                  <span>{reportData.timeperiod}</span>
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

            {/* CO2 Offset Section */}
            <div className={styles.reportSection}>
              <h2 className={styles.sectionTitle}>CO2 Offset Summary</h2>
              <div className={styles.co2Summary}>
                <div className={styles.co2Card}>
                  <div className={styles.co2Value}>
                    {reportData.totalCO2Offset}
                    <span className={styles.co2Unit}>tonnes</span>
                  </div>
                  <div className={styles.co2Label}>Total CO2 Offset Claimed</div>
                </div>
                <div className={styles.co2Card}>
                  <div className={styles.co2Value}>
                    {totalCO2Reduction}
                    <span className={styles.co2Unit}>tonnes</span>
                  </div>
                  <div className={styles.co2Label}>Verified from Activities</div>
                </div>
              </div>
            </div>

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

            {/* Report Footer */}
            <div className={styles.reportFooter}>
              <div className={styles.footerContent}>
                <p>This report has been automatically generated by the NCCR Environmental Monitoring System.</p>
                <p>All data presented has been verified by certified environmental auditors.</p>
                <div className={styles.footerMeta}>
                  <p>Report Generated on: {new Date().toLocaleString('en-IN')}</p>
                  <p>System Version: NCCR v2.1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button 
          className={styles.rejectBtn}
          onClick={handleRejectReport}
          disabled={isProcessing}
        >
          {isProcessing && actionType === 'reject' ? 'Processing...' : 'Reject Report'}
        </button>
        <button 
          className={styles.acceptBtn}
          onClick={handleAcceptReport}
          disabled={isProcessing}
        >
          {isProcessing && actionType === 'accept' ? 'Processing...' : 'Accept Report'}
        </button>
      </div>

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
