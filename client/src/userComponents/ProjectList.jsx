import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Project.module.css';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
// Local fallback that mirrors the backend schema/shape
const HARDCODED_PROJECTS = [
    {
        _id: 'local-1',
        name: 'Forest Restoration Project A',
        organization: 'Panchayat Green Roots',
        location: 'Dehradun, Uttarakhand',
        projectArea: 120,
        status: 'ACTIVE',
        createdAt: '2024-05-10T10:00:00.000Z',
        updatedAt: '2024-05-15T09:30:00.000Z'
    },
    {
        _id: 'local-2',
        name: 'Urban Green Initiative',
        organization: 'NGO City Greens',
        location: 'Pune, Maharashtra',
        projectArea: 45,
        status: 'DRAFT',
        createdAt: '2024-06-20T12:00:00.000Z',
        updatedAt: '2024-06-21T08:20:00.000Z'
    }
];

const Project = () => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    const openMonitoring = (project) => {
        const id = project._id || project.id;
        if (!id) return;
        navigate(`/projects/${id}`);
    };

    useEffect(() => {
        let cancelled = false;
        const fetchProjects = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/project`);
                if (!res.ok) throw new Error('Network error');
                const data = await res.json();
                if (!cancelled) setProjects(data);
            } catch (err) {
                if (!cancelled) setProjects(HARDCODED_PROJECTS);
            }
        };
        fetchProjects();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <div className={styles.projectSection}>
                    <h3 className={styles.sectionTitle}>Existing Projects:</h3>
                    <div className={styles.projectGrid}>
                        {projects.map((project) => {
                            const key = project._id || project.id || `${project.name}-${project.location}`;
                            const created = project.createdAt || project.updatedAt || Date.now();
                            return (
                                <div
                                    key={key}
                                    className={styles.projectCard}
                                    onClick={() => openMonitoring(project)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openMonitoring(project)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={styles.projectCardContent}>
                                        <div className={styles.projectInfo}>
                                            <div className={styles.projectHeader}>
                                                <h4 className={styles.projectName}>{project.name}</h4>
                                            </div>
                                            <div className={styles.projectDetails}>
                                                <p className={styles.projectDetail}>
                                                    Organization: <span className={styles.detailValue}>{project.organization || '—'}</span>
                                                </p>
                                                <p className={styles.projectDetail}>
                                                    Location: <span className={styles.detailValue}>{project.location}</span>
                                                </p>
                                                <p className={styles.projectDetail}>
                                                    Area (ha): <span className={styles.detailValue}>{project.projectArea}</span>
                                                </p>
                                                <p className={styles.projectDetail}>
                                                    Status: <span className={styles.detailValue}>{project.status}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className={styles.projectTimestamp}>
                                            {new Date(created).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {projects.length === 0 && (
                            <div className={styles.emptyState}>No projects found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Project;
