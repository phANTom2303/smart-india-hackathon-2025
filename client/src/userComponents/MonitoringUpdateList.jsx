import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
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
                const response = await fetch(`${BACKEND_URL}/api/project/${id}/monitoring`);
                if (!response.ok) throw new Error('Network error');
                const data = await response.json();
                setProjectName(data.projectName);
                setProjectData(data.projectInfo);
                setRecords(data.monitoringRecords || []);
            } catch (error) {
                console.warn("Using fallback data:", error.message);
                setProjectName(fallbackData.projectName);
                setProjectData(fallbackData.projectInfo);
                setRecords(fallbackData.monitoringRecords);
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

    // ✅ Save record
    const handleSave = async () => {
        const formData = new FormData();
        formData.append("timestamp", newRecord.timestamp || new Date().toISOString());
        formData.append("evidence", newRecord.evidence || "");
        formData.append("evidenceType", newRecord.evidenceType);
        formData.append("dataPayload", JSON.stringify(newRecord.dataPayload));

    try {
            console.log("📌 New record being saved:", newRecord);

            // Update UI
            addRecord({
                ...newRecord,
                evidence: newRecord.evidence ? newRecord.evidence.name : "Uploaded File"
            });
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
        <div className={styles.monitoringContainer}>
            <div className={styles.projectHeader}>
                <h2 className={styles.projectName}>
                    Project Name: {projectName || "Loading..."}
                </h2>
            </div>

            <div className={styles.projectInfoSection}>
                <h3>Project Information:</h3>
                <div className={styles.infoRow}>
                    <span className={styles.label}>ID:</span>
                    <span className={styles.value}>{projectData?.id || ""}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Project ID:</span>
                    <span className={styles.value}>{projectData?.projectId || ""}</span>
                </div>
            </div>

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
                            Evidence (Image/Video):
                            <input
                                type="file"
                                name="evidence"
                                accept="image/*,video/*"
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Evidence Type:
                            <input
                                type="text"
                                name="evidenceType"
                                value={newRecord.evidenceType}
                                onChange={handleChange}
                            />
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
    );
}

export default MonitoringUpdate;
