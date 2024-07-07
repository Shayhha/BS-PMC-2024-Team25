import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from "axios"

import NavBar from './NavBar.jsx'
import ArticleLayout from './ArticleLayout.jsx'
import LandingPage from './LandingPage.jsx'

function App() {
  const [count, setCount] = useState(0);
  const [array, setArray] = useState([]);

  // fetching the data from the backend server
  const fetchAPI = async () => {
    const response = await axios.get("http://localhost:8090/api/users");
    setArray(response.data.users);
  }

  // when the page is refreshed, load the data from the backend database
  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <>
      <LandingPage />
      
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        { // going over all the test data in the backend and showing them on the screen
          array.map((user, index) => (
            <div key={index}>
              <span >{user}</span>
              <br></br>
            </div>
          ))
        }
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  )
}

export default App
