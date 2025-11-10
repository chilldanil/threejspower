import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollHouseViewer } from './components/scenes/ScrollHouseViewer';
import { TestPage } from './components/scenes/TestPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScrollHouseViewer useRealTimeWeather={true} />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
