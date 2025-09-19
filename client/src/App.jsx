import NCCRDashboard from './adminComponents/Overview/AdminOverview';
import ProjectDetailDashboard from './adminComponents/ProjectOverview/ProjectOverview';
import ReportViewer from './adminComponents/ReportAction/ReportAction';
import ReportEdit from './adminComponents/ReportEdit/ReportEdit';
import './App.css'
import MonitoringUpdate from "./userComponents/MonitoringUpdateList"
import Project from "./userComponents/ProjectList";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
function App() {

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path='/' element={<Project />} />
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
