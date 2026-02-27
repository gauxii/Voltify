import { Routes, Route, useNavigate } from "react-router-dom"
import Prediction from "./pages/Prediction"
import Header from "./components/Header"
import hero from "./assets/hero.jpg"

// ------------------ App with Home page ------------------
function App() {
  const navigate = useNavigate()

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      console.log("Backend response:", data) // Debugging

      navigate("/prediction", { state: { result: data, file } })
    } catch (error) {
      console.error("Error:", error)
      alert("Backend connection failed")
    }
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <Header />
            <div style={homeStyles.hero}>
              <img src={hero} alt="Electricity" style={homeStyles.image} />
              <div style={homeStyles.overlay}>
                <h1 style={homeStyles.title}>
                  ⚡ Intelligent Electricity Load Forecasting
                </h1>
                <p style={homeStyles.subtitle}>
                  AI-powered Transformer model with Explainable AI insights
                </p>
                <label style={homeStyles.button}>
                  Upload CSV File
                  <input
                    type="file"
                    accept=".csv"
                    hidden
                    onChange={handleUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        }
      />
      <Route path="/prediction" element={<Prediction />} />
    </Routes>
  )
}

// ------------------ Styles for Home page ------------------
const homeStyles = {
  hero: {
    position: "relative",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  overlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "white",
    textAlign: "center",
  },
  title: {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "20px",
    marginBottom: "30px",
  },
  button: {
    padding: "12px 25px",
    backgroundColor: "#00ffcc",
    color: "#000",
    borderRadius: "8px",
    cursor: "pointer",
  },
}

export default App