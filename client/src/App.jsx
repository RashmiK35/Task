import { useState } from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'
import User from './User'
import Dashboard from './Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {

  return (
    <div>
    <BrowserRouter>
     <Routes>
      <Route path="/" element={<User/>}></Route>
      <Route path="/user" element={<User/>}></Route>
      <Route path="/dashboard" element={<Dashboard />}></Route>
     </Routes>
    </BrowserRouter>
    </div>
  )
}

export default App
