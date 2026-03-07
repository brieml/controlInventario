
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Warehouses from './pages/Warehouses';
import Kardex from './pages/Kardex'; // ← Nuevo

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventory />} />
        <Route path="/bodegas" element={<Warehouses />} />
        <Route path="/kardex" element={<Kardex />} /> 
      </Routes>
    </Router>
  );
}

export default App;
