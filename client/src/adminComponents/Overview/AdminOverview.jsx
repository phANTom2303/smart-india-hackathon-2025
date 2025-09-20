import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './AdminOverview.module.css';
import { adminFallbackProjectsData, adminFallbackReportsData } from '../fallbackData';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const NCCRDashboard = () => {
  const navigate = useNavigate();
  const { tabIndex } = useParams();
  const location = useLocation();

  // Map URL index <-> section keys
  const tabSections = ['overview', 'projects', 'reports'];
  const [activeSection, setActiveSection] = useState('overview');
  const [projectsData, setProjectsData] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW state for form
  const [showForm, setShowForm] = useState(false);

  // Fallback data moved to shared module

  // ✅ Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch projects from backend and shape for UI
        const projectsResponse = await fetch(`${BACKEND_URL}/api/project`);
        if (!projectsResponse.ok) throw new Error(`Server error: ${projectsResponse.status}`);
        const apiProjects = await projectsResponse.json();
        const shapedProjects = Array.isArray(apiProjects)
          ? apiProjects.map((p, idx) => ({
              id: idx + 1, // local sequential id for table display
              projectId: String(p._id || ''),
              projectName: p.name || 'Untitled Project',
              ngoName: p.organization || '—'
            }))
          : [];
        setProjectsData(shapedProjects);

        // Fetch reports from backend and shape for UI
        const reportsResponse = await fetch(`${BACKEND_URL}/api/report`);
        if (!reportsResponse.ok) throw new Error(`Server error: ${reportsResponse.status}`);
        const apiReports = await reportsResponse.json();
        const shapedReports = Array.isArray(apiReports)
          ? apiReports.map((r, idx) => ({
              id: idx + 1,
              reportId: String(r._id || ''),
              reportName: r.name || `Report ${idx + 1}`,
              projectName: r.project?.name || 'Unknown Project',
              co2Offset: typeof r.verifiedCarbonAmount === 'number' ? `${r.verifiedCarbonAmount} tons` : '0 tons',
              status: (r.status || 'PENDING').toLowerCase()
            }))
          : [];
        setReportsData(shapedReports);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProjectsData(adminFallbackProjectsData);
        setReportsData(adminFallbackReportsData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync active tab with route param
  useEffect(() => {
    // Prefer param if present, else parse from pathname (/admin-1)
    let idx = Number.parseInt(tabIndex, 10);
    if (!Number.isFinite(idx)) {
      const match = location.pathname.match(/\/admin-(\d+)/);
      if (match) idx = Number.parseInt(match[1], 10);
    }
    const valid = Number.isFinite(idx) && idx >= 0 && idx < tabSections.length ? idx : 0;
    setActiveSection(tabSections[valid]);
  }, [tabIndex, location.pathname]);

  const handleNavClick = useCallback((section) => {
    setActiveSection(section);
    const index = tabSections.indexOf(section);
    if (index !== -1) navigate(`/admin-${index}`);
  }, [navigate]);

  // ✅ Add new report: POST to backend then update UI
  const handleAddReport = async (payload) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }
      const created = await res.json();

      setReportsData((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          reportName: created?.name || `Report ${prev.length + 1}`,
          projectName: created?.project?.name || 'Unknown Project',
          co2Offset: typeof created?.verifiedCarbonAmount === 'number' ? `${created.verifiedCarbonAmount} tons` : '0 tons',
          status: (created?.status || 'PENDING').toLowerCase()
        }
      ]);
      setShowForm(false);
    } catch (err) {
      console.error('Create report failed:', err);
      alert(`Failed to create report. ${err?.message || ''}`.trim());
    }
  };

  // ✅ Get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: styles.statusDraft,
      submitted: styles.statusSubmitted,
      verified: styles.statusVerified,
      rejected: styles.statusRejected,
      // Map backend enums to closest existing styles
      pending: styles.statusSubmitted,
      in_review: styles.statusSubmitted,
      approved: styles.statusVerified
    };
    return statusStyles[status] || styles.statusDraft;
  };

  // ✅ ReportForm Component
  const ReportForm = ({ projects, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      // Schema-aligned fields
      name: '', // required by schema
      project: '', // MongoDB ObjectId string
      monitoringStartPeriod: '', // YYYY-MM-DD
      monitoringEndPeriod: '', // YYYY-MM-DD
      verifiedCarbonAmount: '', // numeric string, will be parsed
      status: 'DRAFT' // default status on client
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.name || !formData.project || !formData.monitoringStartPeriod || !formData.monitoringEndPeriod) {
        alert('Please fill in Report Name, Project, Start Date, and End Date.');
        return;
      }

      // Use MongoDB ObjectId (stored in project.projectId) as the selected value
      const selectedProject = projects.find(p => p.projectId === formData.project);

      // Build schema-aligned payload
      const payload = {
        name: formData.name,
        project: formData.project,
        monitoringStartPeriod: new Date(formData.monitoringStartPeriod),
        monitoringEndPeriod: new Date(formData.monitoringEndPeriod),
        status: formData.status || 'DRAFT',
        verifiedCarbonAmount: formData.verifiedCarbonAmount === '' ? 0 : Number(formData.verifiedCarbonAmount)
      };

      // Debug: inspect data being submitted from the Create New Report form
      console.log('[Create Report] Submitting payload:', { formData, selectedProject, payload });

      onSubmit(payload);
      setFormData({ name: '', project: '', monitoringStartPeriod: '', monitoringEndPeriod: '', verifiedCarbonAmount: '', status: 'DRAFT' });
    };

    return (
      <div className={styles.formContainer}>
        <h3>Create New Report</h3>
        <form onSubmit={handleSubmit} className={styles.reportForm}>
          <div className={styles.formGroup}>
            <label>Report Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Start Date</label>
            <input type="date" name="monitoringStartPeriod" value={formData.monitoringStartPeriod} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>End Date</label>
            <input type="date" name="monitoringEndPeriod" value={formData.monitoringEndPeriod} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Select Project</label>
      <select name="project" value={formData.project} onChange={handleChange} required>
              <option value="">-- Select --</option>
              {projects.map((p) => (
        // Use MongoDB ObjectId for the option value
        <option key={p.id} value={p.projectId}>{p.projectName}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Expected CO2 Offset</label>
      <input type="number" min="0" step="any" name="verifiedCarbonAmount" value={formData.verifiedCarbonAmount} onChange={handleChange} />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>Submit</button>
            <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    );
  };

  // ✅ Reports Content
  const ReportsContent = () => (
    <div className={`${styles.reportsContent} ${styles.fadeIn}`}>
      <div className={styles.reportsHeader}>
        <div className={styles.headerLeft}>
          <h3 className={styles.sectionTitle}>Reports Management</h3>
          <p className={styles.sectionSubtitle}>
            View and manage all project reports and their verification status
          </p>
        </div>
        <button className={styles.createButton} onClick={() => setShowForm(true)}>
          Create New Report
        </button>
      </div>

      {showForm ? (
        <ReportForm projects={projectsData} onSubmit={handleAddReport} onCancel={() => setShowForm(false)} />
      ) : loading ? (
        <p>Loading reports...</p>
      ) : (
        <div className={styles.reportsTable}>
          <div className={styles.tableHeader}>
            <div className={styles.tableHeaderCell}>Report Name</div>
            <div className={styles.tableHeaderCell}>Project Name</div>
            <div className={styles.tableHeaderCell}>CO2 Offset</div>
            <div className={styles.tableHeaderCell}>Status</div>
          </div>
          <div className={styles.tableBody}>
            {reportsData.map((report) => (
              <div
                key={report.id}
                className={styles.tableRow}
                role="button"
                tabIndex={0}
                onClick={() => {
                  const status = report.status ? report.status.toUpperCase() : '';
                  if (status === 'PENDING' && report.reportId) {
                    navigate(`/admin/draft-report/${report.reportId}`);
                  } else if (report.reportId) {
                    // Any non-PENDING status goes to verify route
                    navigate(`/admin/verify-report/${report.reportId}`);
                  }
                }}
                onKeyDown={(e) => {
                  const status = report.status ? report.status.toUpperCase() : '';
                  if ((e.key === 'Enter' || e.key === ' ') && report.reportId) {
                    if (status === 'PENDING') {
                      navigate(`/admin/draft-report/${report.reportId}`);
                    } else {
                      navigate(`/admin/verify-report/${report.reportId}`);
                    }
                  }
                }}
                title={(() => {
                  const status = report.status ? report.status.toUpperCase() : '';
                  if (status === 'PENDING') return 'Click to continue drafting this report';
                  if (status) return 'Click to view and verify this report';
                  return undefined;
                })()}
              >
                <div className={styles.tableCell}><span className={styles.reportName}>{report.reportName}</span></div>
                <div className={styles.tableCell}><span className={styles.projectName}>{report.projectName}</span></div>
                <div className={styles.tableCell}><span className={styles.co2Offset}>{report.co2Offset}</span></div>
                <div className={styles.tableCell}>
                  <span className={`${styles.statusBadge} ${getStatusBadge(report.status)}`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ✅ Projects Content
  const ProjectsContent = () => (
    <div className={`${styles.projectsContent} ${styles.fadeIn}`}>
      <div className={styles.projectsHeader}>
        <h3 className={styles.sectionTitle}>Project Management</h3>
        <p className={styles.sectionSubtitle}>
          Manage and monitor all active projects across different NGOs
        </p>
      </div>
      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div className={styles.projectsTable}>
          <div className={styles.tableHeader}>
            <div className={styles.tableHeaderCell}>ID</div>
            <div className={styles.tableHeaderCell}>Project ID</div>
            <div className={styles.tableHeaderCell}>Project Name</div>
            <div className={styles.tableHeaderCell}>NGO Name</div>
          </div>
          <div className={styles.tableBody}>
            {projectsData.map((project) => (
              <div
                key={project.id}
                className={styles.tableRow}
                role="button"
                tabIndex={0}
                onClick={() => project.projectId && navigate(`/admin/project/${project.projectId}`)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && project.projectId) {
                    navigate(`/admin/project/${project.projectId}`);
                  }
                }}
                title="View project details"
              >
                <div className={styles.tableCell}>{project.id}</div>
                <div className={styles.tableCell}>
                  <span className={styles.projectId} title={project.projectId}>
                    {project.projectId
                      ? (String(project.projectId).length > 6
                          ? `...${String(project.projectId).slice(-6)}`
                          : String(project.projectId))
                      : ''}
                  </span>
                </div>
                <div className={styles.tableCell}><span className={styles.projectName}>{project.projectName}</span></div>
                <div className={styles.tableCell}><span className={styles.ngoName}>{project.ngoName}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ✅ Overview Content
  const OverviewContent = () => (
    <div className={`${styles.overviewContent} ${styles.fadeIn}`}>
      <div className={styles.overviewGrid}>
        <div className={styles.statCard}><span className={styles.statNumber}>24</span><div className={styles.statLabel}>Active Projects</div></div>
        <div className={`${styles.statCard} ${styles.statCardPink}`}><span className={styles.statNumber}>156</span><div className={styles.statLabel}>Total Users</div></div>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}><span className={styles.statNumber}>8</span><div className={styles.statLabel}>Reports Generated</div></div>
      </div>
      <div className={styles.reportSection}>
        <h3 className={styles.reportTitle}>Recent Activity</h3>
        <p>
          Welcome to the NCCR Admin Dashboard. Here you can monitor all 
          administrative functions, track project progress, and generate 
          comprehensive reports.
        </p>
      </div>
    </div>
  );

  // ✅ Sidebar Nav
  const NavItem = ({ section, isActive, isDisabled, children, onClick }) => {
    const classes = [styles.navItem, isActive && styles.active, isDisabled && styles.disabled].filter(Boolean).join(' ');
    return (
      <button className={classes} onClick={() => !isDisabled && onClick(section)} disabled={isDisabled} aria-current={isActive ? 'page' : undefined}>
        {children}
      </button>
    );
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardContainer}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h1 className={styles.sidebarTitle}>NCCR ADMIN</h1>
          </div>
          <nav className={styles.sidebarNav} role="navigation">
            <NavItem section="overview" isActive={activeSection === 'overview'} isDisabled={false} onClick={handleNavClick}>Overview</NavItem>
            <NavItem section="projects" isActive={activeSection === 'projects'} isDisabled={false} onClick={handleNavClick}>Projects</NavItem>
            <NavItem section="reports" isActive={activeSection === 'reports'} isDisabled={false} onClick={handleNavClick}>Reports</NavItem>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <header className={styles.contentHeader}>
            <div className={styles.breadcrumb}>
              <span>NCCR ADMIN</span>
              {activeSection !== 'overview' && (
                <>
                  <span className={styles.breadcrumbSeparator}>&gt;</span>
                  <span className={styles.breadcrumbActive}>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</span>
                </>
              )}
            </div>
            <h2 className={styles.contentTitle}>
              {activeSection === 'overview' ? 'Overview' : activeSection === 'projects' ? 'Projects' : 'Reports'}
            </h2>
            <p className={styles.contentSubtitle}>
              {activeSection === 'overview' ? 'Dashboard overview and key metrics'
                : activeSection === 'projects' ? 'Manage and monitor all research projects'
                : 'Generate and view administrative reports'}
            </p>
          </header>

          <div className={styles.contentBody}>
            {activeSection === 'overview' && <OverviewContent />}
            {activeSection === 'projects' && <ProjectsContent />}
            {activeSection === 'reports' && <ReportsContent />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NCCRDashboard;
