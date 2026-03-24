import { Routes, Route, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Prediction from "./pages/Prediction"
import Header from "./components/Header"
import hero from "./assets/hero.jpg"

function App() {
  const navigate = useNavigate()
  const [showHeader, setShowHeader] = useState(true)

  useEffect(() => {
    let lastScroll = window.scrollY
    const handleScroll = () => {
      if (window.scrollY > lastScroll) setShowHeader(false)
      else setShowHeader(true)
      lastScroll = window.scrollY
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

try {
  const res = await fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    body: formData,
  })

  const data = await res.json()

  navigate("/prediction", { state: { result: data, file } })

} catch {
  alert("Backend connection failed")
}
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div style={styles.page}>
            {showHeader && <Header />}

            {/* HERO IMAGE */}
            <div style={styles.hero}>
              <img src={hero} alt="hero" style={styles.heroImage} />
              <div style={styles.heroGlow}></div>
            </div>

            {/* CONTENT PANEL */}
            <div style={styles.content}>
              <h1 style={styles.title}>
                Intelligent Electricity Load Forecasting
              </h1>

              <p style={styles.subtitle}>
                Transformer powered forecasting with explainable AI for smarter
                energy decisions.
              </p>

              <label style={styles.button}>
                Upload CSV File
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={handleUpload}
                />
              </label>
            </div>
          </div>
        }
      />

      <Route path="/prediction" element={<Prediction />} />
    </Routes>
  )
}

export default App

// 🎨 STYLES
const styles = {
  page: {
    background: "#f5f7fa",
    minHeight: "100vh",
    overflowX: "hidden",
  },

  hero: {
    height: "75vh",
    position: "relative",
    overflow: "hidden",
  },

  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "scale(1.08)",
    animation: "zoom 20s ease infinite alternate",
  },

  heroGlow: {
    position: "absolute",
    bottom: "-120px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "600px",
    height: "300px",
    background: "radial-gradient(circle, rgba(30,60,114,0.4), transparent)",
    filter: "blur(80px)",
  },

  content: {
    marginTop: "-100px",
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(18px)",
    padding: "70px 20px",
    textAlign: "center",
    borderRadius: "30px",
    width: "85%",
    maxWidth: "900px",
    marginInline: "auto",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    animation: "fadeUp 1s ease",
  },

  title: {
    fontSize: "44px",
    fontWeight: "bold",
    background: "linear-gradient(90deg,#1e3c72,#ff9f1c,#1e3c72)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundSize: "200% auto",
    animation: "shine 4s linear infinite",
    marginBottom: "20px",
  },

  subtitle: {
    fontSize: "20px",
    color: "#444",
    maxWidth: "650px",
    margin: "auto",
    marginBottom: "40px",
    lineHeight: "1.6",
  },

  button: {
    display: "inline-block",
    padding: "16px 45px",
    borderRadius: "12px",
    background: "linear-gradient(90deg,#1e3c72,#2a5298)",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
  },
}