import './App.css'
import { TestBackend } from './components/TestBackend'

function App() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <p className='text-6xl p-2'>Welcome to Dashboard</p>
        <TestBackend />
      </div>
    </div>
  )
}

export default App
