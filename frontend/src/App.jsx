import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import Landing from './components/Landing';
import CoverPage from './pages/CoverPage';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<CoverPage />} />
        <Route path='/join' element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
