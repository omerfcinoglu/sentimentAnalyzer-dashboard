import './App.css'
import { Dashboard } from './components/dashboard'
import { AnalysisTable } from './components/AnalysisHistory/analysisTable'

function App() {

  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <p className='text-6xl p-2'>Welcome to Dashboard</p>
        <Dashboard />
      </div>
      <div className='flex flex-col'>
        {/* <p className='text-2xl p-2 text-left'>Previous Analysis</p> */}
        {/* <AnalysisTable /> */}
      </div>
    </div>
  )
}

export default App
