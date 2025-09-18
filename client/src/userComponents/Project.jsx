import React, { useState, useEffect } from 'react';
import { Plus, Camera, MapPin, User, Hash } from 'lucide-react';
import styles from './Project.module.css';

const HARDCODED_PROJECTS = [
  {
    id: 'DC001',
    projectId: 'PRJ001',
    name: 'Forest Restoration Project A',
    submittedBy: 'Field Agent John Doe',
    timestamp: '2024-09-15T10:30:00',
    evidenceType: 'geotagged_photo',
    species: [
      { name: 'Oak Tree', count: 25, additionalInfo: 'Native species, good for soil stability' }
    ]
  },
  {
    id: 'DC002',
    projectId: 'PRJ002',
    name: 'Urban Green Initiative',
    submittedBy: 'Field Agent Jane Smith',
    timestamp: '2024-09-10T14:20:00',
    evidenceType: 'drone_footage',
    species: [
      { name: 'Maple Tree', count: 15, additionalInfo: 'Fast growing, suitable for urban areas' },
      { name: 'Pine Tree', count: 10, additionalInfo: 'Evergreen, low maintenance' }
    ]
  }
];

const Project = () => {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState(HARDCODED_PROJECTS);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('');
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setProjects(HARDCODED_PROJECTS);
      }
    };
    fetchProjects();
  }, []);

  const [formData, setFormData] = useState({
    id: '',
    projectName: '',
    projectId: '',
    submittedBy: '',
    timestamp: new Date().toISOString().slice(0, 16),
    evidenceFile: null,
    evidenceType: 'geotagged_photo',
    species: [{ name: '', count: '', additionalInfo: '' }]
  });

  const evidenceTypeOptions = [
    { value: 'geotagged_photo', label: 'Geotagged Photo', icon: MapPin },
    { value: 'drone_footage', label: 'Drone Footage', icon: Camera },
    { value: 'satellite_image', label: 'Satellite Image', icon: Hash },
    { value: 'ground_survey', label: 'Ground Survey', icon: User }
  ];

  const handleAddProject = () => {
    setFormData({
      id: '',
      projectName: '',
      projectId: '',
      submittedBy: '',
      timestamp: new Date().toISOString().slice(0, 16),
      evidenceFile: null,
      evidenceType: 'geotagged_photo',
      species: [{ name: '', count: '', additionalInfo: '' }]
    });
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpeciesChange = (index, field, value) => {
    const updatedSpecies = [...formData.species];
    updatedSpecies[index][field] = value;
    setFormData(prev => ({ ...prev, species: updatedSpecies }));
  };

  const addSpecies = () => {
    setFormData(prev => ({
      ...prev,
      species: [...prev.species, { name: '', count: '', additionalInfo: '' }]
    }));
  };

  const removeSpecies = (index) => {
    if (formData.species.length > 1) {
      const updatedSpecies = formData.species.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, species: updatedSpecies }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; 
    if (file) {
      setFormData(prev => ({
        ...prev,
        evidenceFile: file
      }));
    }
  };

  const handleSubmit = () => {
    const newProject = {
      id: formData.id || `DC${String(projects.length + 1).padStart(3, '0')}`,
      projectId: formData.projectId,
      name: formData.projectName,
      submittedBy: formData.submittedBy,
      timestamp: formData.timestamp,
      evidenceType: formData.evidenceType,
      species: formData.species.filter(s => s.name.trim() !== '')
    };
    setProjects(prev => [...prev, newProject]);
    setShowModal(false);
  };

  const closeModal = () => setShowModal(false);

  const getEvidenceIcon = (type) => {
    const option = evidenceTypeOptions.find(opt => opt.value === type);
    return option ? option.icon : Camera;
  };

  return (
    <div className={styles.container}>
      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.buttonContainer}>
          <button onClick={handleAddProject} className={`${styles.button} ${styles.addButton}`}>
            <Plus className={styles.buttonIcon} />
            Add Project
          </button>
        </div>

        {/* Project Cards Section */}
        <div className={styles.projectSection}>
          <h3 className={styles.sectionTitle}>Existing Projects:</h3>
          <div className={styles.projectGrid}>
            {projects.map((project) => {
              const EvidenceIcon = getEvidenceIcon(project.evidenceType);
              return (
                <div key={project.id} className={styles.projectCard}>
                  <div className={styles.projectCardContent}>
                    <div className={styles.projectInfo}>
                      <div className={styles.projectHeader}>
                        <h4 className={styles.projectName}>{project.name}</h4>
                      </div>
                      <div className={styles.projectDetails}>
                        <p className={styles.projectDetail}>
                          ID: <span className={styles.detailValue}>{project.id}</span>
                        </p>
                        <p className={styles.projectDetail}>
                          Project ID: <span className={styles.detailValue}>{project.projectId}</span>
                        </p>
                        <p className={styles.projectDetail}>
                          Submitted by: <span className={styles.detailValue}>{project.submittedBy}</span>
                        </p>
                      </div>
                    </div>
                    <div className={styles.projectTimestamp}>
                      {new Date(project.timestamp).toLocaleDateString('en-US', {
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
          </div>
        </div>
      </div>

      {/* Modal only for Add Project */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.slideUp}`}>
            <h2 className={styles.modalTitle}>Add New Project</h2>

            {/* Add Project Form */}
            <div className={styles.formContainer}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.label}>ID *</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => handleInputChange('id', e.target.value)}
                    placeholder="Enter unique ID (e.g., DC001)"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Project Name *</label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    placeholder="Enter project name"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Project ID *</label>
                  <input
                    type="text"
                    value={formData.projectId}
                    onChange={(e) => handleInputChange('projectId', e.target.value)}
                    placeholder="Enter project ID (e.g., PRJ001)"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Submitted By *</label>
                  <input
                    type="text"
                    value={formData.submittedBy}
                    onChange={(e) => handleInputChange('submittedBy', e.target.value)}
                    placeholder="Enter field agent name"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Timestamp *</label>
                  <input
                    type="datetime-local"
                    value={formData.timestamp}
                    onChange={(e) => handleInputChange('timestamp', e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Evidence Type *</label>
                  <select
                    value={formData.evidenceType}
                    onChange={(e) => handleInputChange('evidenceType', e.target.value)}
                    className={styles.select}
                  >
                    {evidenceTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div className={styles.formField}>
                <label className={styles.label}>Upload Evidence</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className={styles.input}
                />
              </div>

              {/* Species Section */}
              <div>
                <h3>Species Information</h3>
                {formData.species.map((species, index) => (
                  <div key={index} className={styles.speciesCard}>
                    <input
                      type="text"
                      value={species.name}
                      onChange={(e) => handleSpeciesChange(index, 'name', e.target.value)}
                      placeholder="Species name"
                      className={styles.speciesInput}
                    />
                    <input
                      type="number"
                      value={species.count}
                      onChange={(e) => handleSpeciesChange(index, 'count', e.target.value)}
                      placeholder="Count"
                      className={styles.speciesInput}
                    />
                    <input
                      type="text"
                      value={species.additionalInfo}
                      onChange={(e) => handleSpeciesChange(index, 'additionalInfo', e.target.value)}
                      placeholder="Additional info"
                      className={styles.speciesInput}
                    />
                    {formData.species.length > 1 && (
                      <button type="button" onClick={() => removeSpecies(index)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addSpecies}>Add Species</button>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={handleSubmit} className={styles.submitButton}>
                  Create Project
                </button>
                <button type="button" onClick={closeModal} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
