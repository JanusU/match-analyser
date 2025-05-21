import { useEffect,useState } from 'react'
import './App.css'
import MatchUploader from './components/MatchUploader'
import MatchInspector from "./components/MatchInspector.jsx";

function App() {
  const [matches, setMatches] = useState([]);

  const fetchMatches = () => {
    fetch('http://localhost:5000/api/matches')
      .then(res => res.json())
      .then(data => setMatches(data));
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <>
      <div className='min-h-screen bg-[#1f0c19] w-screen'>
        <img className="w-40 p-5" src="data:image/svg+xml,%3csvg%20width%3d%2289%22%20height%3d%2212%22%20viewBox%3d%220%200%2089%2012%22%20fill%3d%22none%22%20xmlns%3d%22http%3a//www.w3.org/2000/svg%22%3e%3ctext%20x%3d%220%22%20y%3d%2210%22%20fill%3d%22%23FFFE3E%22%20font-family%3d%22Arial%2c%20sans-serif%22%20font-size%3d%2212%22%20font-weight%3d%22bold%22%3eBl%C3%A6st%20tv%3c/text%3e%3c/svg%3e" alt="Blæst tv logo" />
        <div className="flex">
          <MatchInspector matches={matches}/>
          <MatchUploader onUploadComplete={fetchMatches} />
        </div>
      </div>
    </>
  )
}

export default App
