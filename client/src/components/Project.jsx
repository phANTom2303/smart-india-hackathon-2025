import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Calendar, User, Hash, FileText, TreePine, MapPin, Camera } from 'lucide-react';
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

const DataCaptureProject = () => {
  const [showDropup, setShowDropup] = useState(false);
  const [dropupMode, setDropupMode] = useState('add'); // 'add' or 'select'
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState(HARDCODED_PROJECTS);

  useEffect(() =>{
    const fetchProjects =  async() =>{
        try{
            const res = await fetch ('');
            if(!res.ok)
                throw new Error('Network error');
            const data = await res.json();
            setProjects(data);
        }
        catch(err){
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
    setDropupMode('add');
    setSelectedProject(null);
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
    setShowDropup(true);
  };

  const handleSelectProject = () => {
    setDropupMode('select');
    setSelectedProject(null);
    setShowDropup(true);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setFormData({
      id: project.id,
      projectName: project.name,
      projectId: project.projectId,
      submittedBy: project.submittedBy,
      timestamp: project.timestamp,
      evidenceFile: null,
      evidenceType: project.evidenceType,
      species: [...project.species]
    });
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
    if (dropupMode === 'add') {
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
    }
    setShowDropup(false);
    setSelectedProject(null);
  };

  const closeModal = () => {
    setShowDropup(false);
    setSelectedProject(null);
  };

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
          <button onClick={handleSelectProject} className={`${styles.button} ${styles.selectButton}`}>
            <FileText className={styles.buttonIcon} />
            Select Project
          </button>
        </div>
      </div>

      {/* Dropup Modal */}
      {showDropup && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.slideUp}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {dropupMode === 'add' ? 'Add New Project' : 'Select Existing Project'}
              </h2>
              <button onClick={closeModal} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>

            {dropupMode === 'select' && !selectedProject && (
              <div className={styles.projectSelection}>
                <h3 className={styles.sectionTitle}>Choose a Project:</h3>
                <div className={styles.projectGrid}>
                  {projects.map((project) => {
                    const EvidenceIcon = getEvidenceIcon(project.evidenceType);
                    return (
                      <div
                        key={project.id}
                        onClick={() => handleProjectSelect(project)}
                        className={styles.projectCard}
                      >
                        <div className={styles.projectCardContent}>
                          <div className={styles.projectInfo}>
                            <div className={styles.projectHeader}>
                              <h4 className={styles.projectName}>{project.name}</h4>
                              <div className={styles.evidenceBadge}>
                                <EvidenceIcon className={styles.evidenceIcon} />
                                {evidenceTypeOptions.find(opt => opt.value === project.evidenceType)?.label}
                              </div>
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
                              <p className={styles.projectDetail}>
                                Species: <span className={styles.detailValue}>{project.species.length}</span>
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
            )}

            {(dropupMode === 'add' || selectedProject) && (
              <div className={styles.formContainer}>
                {dropupMode === 'add' && (
                  <div className={styles.addProjectBanner}>
                    <h3 className={styles.bannerTitle}>
                      <Plus className={styles.bannerIcon} />
                      Adding New Project
                    </h3>
                    <p className={styles.bannerDescription}>Fill in all the required fields to create a new data capture project.</p>
                  </div>
                )}
                
                {/* Basic Project Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>
                    <FileText className={styles.sectionIcon} />
                    Project Information
                  </h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label className={styles.label}>
                        <Hash className={styles.labelIcon} />
                        ID {dropupMode === 'add' && <span className={styles.required}>*</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.id}
                        onChange={(e) => handleInputChange('id', e.target.value)}
                        placeholder={dropupMode === 'add' ? "Enter unique ID (e.g., DC001)" : "Auto-generated if left empty"}
                        className={styles.input}
                        required={dropupMode === 'add'}
                      />
                      {dropupMode === 'add' && (
                        <p className={styles.helpText}>Unique identifier for this data capture entry</p>
                      )}
                    </div>

                    <div className={styles.formField}>
                      <label className={styles.label}>
                        <FileText className={styles.labelIcon} />
                        Project Name {dropupMode === 'add' && <span className={styles.required}>*</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.projectName}
                        onChange={(e) => handleInputChange('projectName', e.target.value)}
                        placeholder={dropupMode === 'add' ? "Enter project name (e.g., Forest Restoration Project)" : formData.projectName}
                        className={styles.input}
                        required
                      />
                      {dropupMode === 'add' && (
                        <p className={styles.helpText}>Descriptive name for the project</p>
                      )}
                    </div>

                    <div className={styles.formField}>
                      <label className={styles.label}>
                        <Hash className={styles.labelIcon} />
                        Project ID {dropupMode === 'add' && <span className={styles.required}>*</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.projectId}
                        onChange={(e) => handleInputChange('projectId', e.target.value)}
                        placeholder={dropupMode === 'add' ? "Enter project ID (e.g., PRJ001)" : formData.projectId}
                        className={styles.input}
                        required
                      />
                      {dropupMode === 'add' && (
                        <p className={styles.helpText}>Official project identifier or code</p>
                      )}
                    </div>

                    <div className={styles.formField}>
                      <label className={styles.label}>
                        <User className={styles.labelIcon} />
                        Submitted By (Field Agent) {dropupMode === 'add' && <span className={styles.required}>*</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.submittedBy}
                        onChange={(e) => handleInputChange('submittedBy', e.target.value)}
                        placeholder={dropupMode === 'add' ? "Enter field agent name (e.g., Field Agent John Doe)" : formData.submittedBy}
                        className={styles.input}
                        required
                      />
                      {dropupMode === 'add' && (
                        <p className={styles.helpText}>Name of the field agent uploading this data</p>
                      )}
                    </div>

                    <div className={styles.formField}>
                      <label className={styles.label}>
                        <Calendar className={styles.labelIcon} />
                        Timestamp {dropupMode === 'add' && <span className={styles.required}>*</span>}
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.timestamp}
                        onChange={(e) => handleInputChange('timestamp', e.target.value)}
                        className={styles.input}
                        required
                      />
                      {dropupMode === 'add' && (
                        <p className={styles.helpText}>Date and time when the data was captured</p>
                      )}
                    </div>

                    <div className={styles.formField}>
                      <label className={styles.label}>
                        <Camera className={styles.labelIcon} />
                        Evidence Type {dropupMode === 'add' && <span className={styles.required}>*</span>}
                      </label>
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
                      {dropupMode === 'add' && (
                        <p className={styles.helpText}>Select the type of evidence/proof being submitted</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence Upload Section */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>
                    <Upload className={styles.sectionIcon} />
                    Evidence Upload
                  </h3>
                  <div className={styles.uploadArea}>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className={styles.hiddenInput}
                      id="evidence-upload"
                    />
                    <label htmlFor="evidence-upload" className={styles.uploadLabel}>
                      <Upload className={styles.uploadIcon} />
                      <p className={styles.uploadText}>
                        {formData.evidenceFile ? formData.evidenceFile.name : 'Click to upload evidence file'}
                      </p>
                      <p className={styles.uploadSubtext}>
                        Evidence Type: {evidenceTypeOptions.find(opt => opt.value === formData.evidenceType)?.label}
                      </p>
                    </label>
                  </div>
                </div>

                {/* Species Information Section */}
                <div className={styles.formSection}>
                  <div className={styles.speciesHeader}>
                    <h3 className={styles.formSectionTitle}>
                      <TreePine className={styles.sectionIcon} />
                      Species Information
                    </h3>
                    <button
                      type="button"
                      onClick={addSpecies}
                      className={styles.addSpeciesButton}
                      title="Add another species"
                    >
                      <Plus className={styles.buttonIcon} />
                      Add Species
                    </button>
                  </div>

                  <div className={styles.speciesContainer}>
                    {formData.species.map((species, index) => (
                      <div key={index} className={styles.speciesCard}>
                        <div className={styles.speciesCardHeader}>
                          <h4 className={styles.speciesTitle}>Species {index + 1}</h4>
                          {formData.species.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSpecies(index)}
                              className={styles.removeButton}
                            >
                              <X className={styles.removeIcon} />
                            </button>
                          )}
                        </div>
                        <div className={styles.speciesGrid}>
                          <div className={styles.formField}>
                            <label className={styles.speciesLabel}>Species Name</label>
                            <input
                              type="text"
                              value={species.name}
                              onChange={(e) => handleSpeciesChange(index, 'name', e.target.value)}
                              placeholder="e.g., Oak Tree"
                              className={styles.speciesInput}
                            />
                          </div>
                          <div className={styles.formField}>
                            <label className={styles.speciesLabel}>Number of Trees</label>
                            <input
                              type="number"
                              value={species.count}
                              onChange={(e) => handleSpeciesChange(index, 'count', e.target.value)}
                              placeholder="e.g., 25"
                              className={styles.speciesInput}
                            />
                          </div>
                          <div className={styles.formField}>
                            <label className={styles.speciesLabel}>Additional Info</label>
                            <input
                              type="text"
                              value={species.additionalInfo}
                              onChange={(e) => handleSpeciesChange(index, 'additionalInfo', e.target.value)}
                              placeholder="Notes about this species"
                              className={styles.speciesInput}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" onClick={handleSubmit} className={styles.submitButton}>
                    {dropupMode === 'add' ? 'Create Project' : 'Update Project'}
                  </button>
                  <button type="button" onClick={closeModal} className={styles.cancelButton}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataCaptureProject;
