import { Routes, Route } from 'react-router-dom'

// Simple test component
const TestPage = () => {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>StockSenseAI - Test Page</h1>
            <p>If you can see this, React is working!</p>
            <p>Router is functional.</p>
        </div>
    )
}

const App = () => {
    return (
        <Routes>
            <Route path="*" element={<TestPage />} />
        </Routes>
    )
}

export default App
