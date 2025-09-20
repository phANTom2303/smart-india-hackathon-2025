import NCCRDashboard from './adminComponents/Overview/AdminOverview';
import ProjectDetailDashboard from './adminComponents/ProjectOverview/ProjectOverview';
import ReportViewer from './adminComponents/ReportAction/ReportAction';
import ReportEdit from './adminComponents/ReportEdit/ReportEdit';
import './App.css'
import MonitoringUpdate from "./userComponents/MonitoringUpdateList"
import Project from "./userComponents/ProjectList";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
function App() {

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path='/' element={<NCCRDashboard />} />
                    {/* Admin Draft Report edit route with variable :reportID */}
                    <Route path='/admin/draft-report/:reportID' element={<ReportEdit />} />
                    {/* Admin Verify Report route renders ReportViewer with reportId from params */}
                    <Route
                        path='/admin/verify-report/:reportID'
                        element={<VerifyReportRoute />}
                    />
                    {/* Admin project detail route with variable :projectID */}
                    <Route path='/admin/project/:projectID' element={<ProjectDetailDashboard />} />
                    <Route path='/projects' element={<Project />} />
                    <Route path='/projects/:id' element={<MonitoringUpdate />} />

                    {/* Admin routes: explicit routes per tab for robust matching */}
                    <Route path='/admin-0' element={<NCCRDashboard />} />
                    <Route path='/admin-1' element={<NCCRDashboard />} />
                    <Route path='/admin-2' element={<NCCRDashboard />} />
                    {/* Back-compat and default redirect to first tab */}
                    <Route path='/admin' element={<Navigate replace to='/admin-0' />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App

// Wrapper component to pass route param to ReportViewer
function VerifyReportRoute() {
    const { reportID } = useParams();
    return <ReportViewer reportId={reportID} />;
}
