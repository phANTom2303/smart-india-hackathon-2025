import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import Header from "./Header";
import styles from "./MonitoringUpdate.module.css"; // CSS Module
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ✅ Fallback data
const fallbackData = {
    projectName: "Sample Green Project",
    projectInfo: { id: "SGP-2024-001", projectId: "PRJ-SGP-12345" },
    monitoringRecords: [
        {
            timestamp: "2024-03-15 14:30:00",
            evidence: "tree_planting_site1.jpg",
            evidenceType: "Before Planting",
            dataPayload: {
                speciesPlanted: "Oak, Maple, Pine",
                numberOfTrees: 25,
                notes: "Initial planting phase completed successfully. Soil preparation done."
            }
        }
    ]
};

function MonitoringUpdate({ onEvidenceView }) {
    const { id } = useParams();
    const [projectName, setProjectName] = useState("");
    const [projectData, setProjectData] = useState({});
    const [projectMeta, setProjectMeta] = useState({ organization: "", projectArea: "", location: "" });
    const [records, setRecords] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newRecord, setNewRecord] = useState({
        timestamp: "",
        evidence: null,
        evidenceType: "",
        dataPayload: {
            speciesPlanted: "",
            numberOfTrees: "",
            notes: ""
        }
    });

    // ✅ Load data
    useEffect(() => {
        async function loadData() {
            try {
                if (!id) throw new Error('Missing project id');

                // Fetch monitoring data for this project
                const response = await fetch(`${BACKEND_URL}/api/project/${id}/monitoring`);
                if (!response.ok) throw new Error('Network error');
                const data = await response.json();
                setProjectName(data.projectName);
                setProjectData(data.projectInfo);
                setRecords(data.monitoringRecords || []);

                // Fetch all projects once to derive meta info
                try {
                    const projRes = await fetch(`${BACKEND_URL}/api/project`);
                    if (projRes.ok) {
                        const allProjects = await projRes.json();
                        const current = allProjects.find(p => String(p._id) === String(id));
                        if (current) {
                            setProjectMeta({
                                organization: current.organization || "",
                                projectArea: current.projectArea ?? "",
                                location: current.location || ""
                            });
                        }
                    }
                } catch (metaErr) {
                    console.warn('Meta fetch failed:', metaErr?.message || metaErr);
                }
            } catch (error) {
                console.warn("Using fallback data:", error.message);
                setProjectName(fallbackData.projectName);
                setProjectData(fallbackData.projectInfo);
                setRecords(fallbackData.monitoringRecords);
                setProjectMeta({ organization: "", projectArea: "", location: "" });
            }
        }
        loadData();
    }, [id]);

    // ✅ Lock background scroll when modal is open
    useEffect(() => {
        if (showForm) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [showForm]);

    // ✅ Add record
    const addRecord = (record) => {
        setRecords((prev) => [record, ...prev]);
    };

    // ✅ Handle form input
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "evidence") {
            setNewRecord({ ...newRecord, evidence: files[0] });
        } else if (["speciesPlanted", "numberOfTrees", "notes"].includes(name)) {
            setNewRecord({
                ...newRecord,
                dataPayload: { ...newRecord.dataPayload, [name]: value }
            });
        } else {
            setNewRecord({ ...newRecord, [name]: value });
        }
    };

    // ✅ Save record (POST to backend)
    const handleSave = async () => {
        try {
            // Basic validations
            if (!newRecord.evidence) {
                alert("Please choose an image to upload.");
                return;
            }
            if (!newRecord.evidence.type?.startsWith("image/")) {
                alert("Only image uploads are allowed.");
                return;
            }

            // Normalize evidenceType to server enum
            const allowedTypes = new Set(["GEOTAGGED_PHOTO", "DRONE_FOOTAGE", "SATELLITE", "OTHER"]);
            const normalizedType = (() => {
                const raw = (newRecord.evidenceType || "OTHER").toString().trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
                return allowedTypes.has(raw) ? raw : "OTHER";
            })();

            // Try to find a user id; fall back to a placeholder for dev
            const submittedBy =
                localStorage.getItem("userId") ||
                localStorage.getItem("USER_ID") ||
                localStorage.getItem("currentUserId") ||
                "000000000000000000000000"; // NOTE: replace with real user id when auth is wired

            const formData = new FormData();
            formData.append("image", newRecord.evidence); // server field name
            formData.append("project", id);
            formData.append("submittedBy", submittedBy);
            formData.append("evidenceType", normalizedType);
            formData.append("dataPayload", JSON.stringify(newRecord.dataPayload || {}));

            const res = await fetch(`${BACKEND_URL}/api/monitoring-updates`, {
                method: "POST",
                body: formData
                // headers: { Authorization: `Bearer ${token}` }, // if using Bearer auth
                // credentials: "include", // uncomment if using cookie-based auth
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to save record");
            }

            const saved = await res.json();

            // Map API response to UI shape
            addRecord({
                timestamp: saved.timestamp || new Date().toISOString(),
                evidence: saved.filePath ? `${BACKEND_URL}/${saved.filePath}` : (newRecord.evidence?.name || "Uploaded File"),
                evidenceType: saved.evidenceType || normalizedType,
                dataPayload: saved.dataPayload || newRecord.dataPayload || {}
            });

            // Reset form/modal
            setShowForm(false);
            setNewRecord({
                timestamp: "",
                evidence: null,
                evidenceType: "",
                dataPayload: {
                    speciesPlanted: "",
                    numberOfTrees: "",
                    notes: ""
                }
            });
        } catch (err) {
            console.error("Error saving record:", err);
            alert(typeof err?.message === "string" ? err.message : "Failed to save update. Please try again.");
        }
    };

    // ✅ Render records
    const renderRecords = () => {
        if (!records.length) {
            return <div className={styles.noRecords}>No monitoring records available.</div>;
        }
        return [...records]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((record, idx) => (
                <div className={styles.recordItem} key={idx}>
                    <div className={styles.recordField}>
                        <span className={styles.fieldLabel}>Timestamp:</span>
                        <span className={styles.fieldValue}>{record.timestamp}</span>
                    </div>
                    <div className={styles.recordField}>
                        <span className={styles.fieldLabel}>Evidence:</span>
                        <span
                            className={`${styles.fieldValue} ${styles.evidenceLink}`}
                            onClick={() =>
                                onEvidenceView && onEvidenceView(record.evidence)
                            }
                        >
                            {record.evidence}
                        </span>
                    </div>
                    <div className={styles.recordField}>
                        <span className={styles.fieldLabel}>Evidence Type:</span>
                        <span className={styles.fieldValue}>{record.evidenceType}</span>
                    </div>
                    <div className={styles.recordField}>
                        <span className={styles.fieldLabel}>Species Planted:</span>
                        <span className={styles.fieldValue}>{record.dataPayload?.speciesPlanted}</span>
                    </div>
                    <div className={styles.recordField}>
                        <span className={styles.fieldLabel}>Number of Trees:</span>
                        <span className={styles.fieldValue}>{record.dataPayload?.numberOfTrees}</span>
                    </div>
                    <div className={`${styles.recordField} ${styles.notesField}`}>
                        <span className={styles.fieldLabel}>Notes:</span>
                        <span className={`${styles.fieldValue} ${styles.notes}`}>
                            {record.dataPayload?.notes}
                        </span>
                    </div>
                </div>
            ));
    };

    return (
        <div className={styles.pageWrapper}>
            <Header />

            {/* Simple page intro with title and meta */}
            <div className={styles.introContainer}>
                <h2 className={styles.projectTitle}>{projectName || "Loading..."}</h2>
                <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                        <div className={styles.metaLabel}>Organization</div>
                        <div className={styles.metaValue}>{projectMeta.organization || '—'}</div>
                    </div>
                    <div className={styles.metaItem}>
                        <div className={styles.metaLabel}>Area</div>
                        <div className={styles.metaValue}>{projectMeta.projectArea ? `${projectMeta.projectArea} ha` : '—'}</div>
                    </div>
                    <div className={styles.metaItem}>
                        <div className={styles.metaLabel}>Project ID</div>
                        <div className={styles.metaValue}>{projectData?.projectId || projectData?.id || '—'}</div>
                    </div>
                    <div className={styles.metaItem}>
                        <div className={styles.metaLabel}>Location</div>
                        <div className={styles.metaValue}>{projectMeta.location || '—'}</div>
                    </div>
                </div>
            </div>

            <div className={styles.monitoringContainer}>

                <div className={styles.actionSection}>
                    <button className={styles.addUpdateBtn} onClick={() => setShowForm(true)}>
                        Add Monitoring Update
                    </button>
                </div>

                {/* ✅ Popup Form */}
                {showForm && (
                    <div className={styles.popupOverlay}>
                        <div className={styles.popupForm}>
                            <h3>Add Monitoring Update</h3>

                            <label>
                                Timestamp:
                                <input
                                    type="datetime-local"
                                    name="timestamp"
                                    value={newRecord.timestamp}
                                    onChange={handleChange}
                                />
                            </label>

                            <label>
                                Evidence (Image):
                                <input
                                    type="file"
                                    name="evidence"
                                    accept="image/*"
                                    onChange={handleChange}
                                />
                            </label>

                            <label>
                                Evidence Type:
                                <select
                                    name="evidenceType"
                                    value={newRecord.evidenceType}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select evidence type</option>
                                    <option value="GEOTAGGED_PHOTO">Geotagged photo</option>
                                    <option value="DRONE_FOOTAGE">Drone footage</option>
                                    <option value="SATELLITE">Satellite</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </label>

                            <label>
                                Species Planted:
                                <input
                                    type="text"
                                    name="speciesPlanted"
                                    value={newRecord.dataPayload.speciesPlanted}
                                    onChange={handleChange}
                                />
                            </label>

                            <label>
                                Number of Trees:
                                <input
                                    type="number"
                                    name="numberOfTrees"
                                    value={newRecord.dataPayload.numberOfTrees}
                                    onChange={handleChange}
                                />
                            </label>

                            <label>
                                Notes:
                                <textarea
                                    name="notes"
                                    value={newRecord.dataPayload.notes}
                                    onChange={handleChange}
                                />
                            </label>

                            {/* ✅ Sticky actions */}
                            <div className={styles.popupActions}>
                                <button className={styles.saveBtn} onClick={handleSave}>Save Update</button>
                                <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.recordsSection}>
                    <div className={styles.recordsHeader}>
                        <h3>Prior Record List</h3>
                    </div>
                    <div className={styles.recordsList}>{renderRecords()}</div>
                </div>
            </div>
        </div>
    );
}

export default MonitoringUpdate;
