import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import QuoteScreen from './screens/QuoteScreen';
import AdminScreen from './screens/AdminScreen';
import { Settings } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative">
        {/* Floating Admin Button */}
        {/* Floating Admin Button */}
        <Link to="/admin" className="fixed top-4 right-4 px-4 py-2 bg-slate-900 text-white rounded-full shadow-lg z-50 hover:bg-slate-800 transition-all flex items-center gap-2 font-bold">
          <Settings size={18} /> Admin
        </Link>

        <Routes>
          <Route path="/" element={<QuoteScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
