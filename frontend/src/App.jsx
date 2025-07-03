import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import Landing from './components/Landing';
import Room from './components/Room';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
