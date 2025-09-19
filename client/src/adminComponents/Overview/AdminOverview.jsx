import React, { useState, useCallback, useEffect } from 'react';
import styles from './AdminOverview.module.css';

const NCCRDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fallback sample project data
  const fallbackData = [
    {
      id: 1,
      projectId: 'NCCR-2024-001',
      projectName: 'Clean Water Initiative',
      ngoName: 'Water for All Foundation'
    },
    {
      id: 2,
      projectId: 'NCCR-2024-002',
      projectName: 'Education Support Program',
      ngoName: 'Learning Together NGO'
    },
    {
      id: 3,
      projectId: 'NCCR-2024-003',
      projectName: 'Healthcare Outreach',
      ngoName: 'Medical Aid Society'
    },
    {
      id: 4,
      projectId: 'NCCR-2024-004',
      projectName: 'Rural Development Project',
      ngoName: 'Village Progress Organization'
    },
    {
      id: 5,
      projectId: 'NCCR-2024-005',
      projectName: 'Women Empowerment Initiative',
      ngoName: 'Empowered Women Foundation'
    }
  ];

  // ✅ Fetch projects data from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(''); //api  
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        setProjectsData(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // ✅ Fallback to local data if backend fails
        setProjectsData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleNavClick = useCallback((section) => {
    setActiveSection(section);
    console.log(`Navigation to section: ${section}`);
  }, []);

  // ✅ Projects Content Component
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
              <div key={project.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{project.id}</div>
                <div className={styles.tableCell}>
                  <span className={styles.projectId}>{project.projectId}</span>
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.projectName}>{project.projectName}</span>
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.ngoName}>{project.ngoName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ✅ Overview Content Component
  const OverviewContent = () => (
    <div className={`${styles.overviewContent} ${styles.fadeIn}`}>
      <div className={styles.overviewGrid}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>24</span>
          <div className={styles.statLabel}>Active Projects</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardPink}`}>
          <span className={styles.statNumber}>156</span>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <span className={styles.statNumber}>8</span>
          <div className={styles.statLabel}>Reports Generated</div>
        </div>
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

  const NavItem = ({ section, isActive, isDisabled, children, onClick }) => {
    const classes = [
      styles.navItem,
      isActive && styles.active,
      isDisabled && styles.disabled
    ].filter(Boolean).join(' ');

    return (
      <button 
        className={classes}
        onClick={() => !isDisabled && onClick(section)}
        disabled={isDisabled}
        aria-current={isActive ? 'page' : undefined}
      >
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
            <NavItem 
              section="overview"
              isActive={activeSection === 'overview'}
              isDisabled={false}
              onClick={handleNavClick}
            >
              Overview
            </NavItem>
            <NavItem 
              section="projects"
              isActive={activeSection === 'projects'}
              isDisabled={false}
              onClick={handleNavClick}
            >
              Projects
            </NavItem>
            <NavItem 
              section="reports"
              isActive={false}
              isDisabled={true}
              onClick={handleNavClick}
            >
              Reports
            </NavItem>
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
                  <span className={styles.breadcrumbActive}>
                    {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                  </span>
                </>
              )}
            </div>
            <h2 className={styles.contentTitle}>
              {activeSection === 'overview' ? 'Overview' : 
               activeSection === 'projects' ? 'Projects' : 'Reports'}
            </h2>
            <p className={styles.contentSubtitle}>
              {activeSection === 'overview' 
                ? 'Dashboard overview and key metrics'
                : activeSection === 'projects' 
                ? 'Manage and monitor all research projects'
                : 'Generate and view administrative reports'
              }
            </p>
          </header>

          <div className={styles.contentBody}>
            {activeSection === 'overview' && <OverviewContent />}
            {activeSection === 'projects' && <ProjectsContent />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NCCRDashboard;
