import './App.css'
import MonitoringUpdate from "./userComponents/MonitoringUpdateList"
import Project from "./userComponents/ProjectList";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path='/' element={<Project />} />
                    <Route path='/projects' element={<Project />} />
                    <Route path='/projects/:id' element={<MonitoringUpdate />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
