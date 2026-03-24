import { useLocation } from "react-router-dom"

function Prediction() {
  const location = useLocation()
  const result = location.state?.result
  const file = location.state?.file

  // Find max value for progress scaling
  const maxVal = result?.predictions
    ? Math.max(...result.predictions)
    : 1

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* 🔥 Gradient Top Bar */}
        <div style={styles.topBar}></div>

        <h1 style={styles.heading}>⚡ Prediction Results</h1>

        {file && (
          <p style={styles.fileText}>
            📄 Uploaded File: <strong>{file.name}</strong>
          </p>
        )}

        <div style={styles.grid}>
          
          {/* 📊 Prediction Card with Progress Bars */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📊 24-Hour Load Prediction</h2>

            {result?.predictions ? (
              <div style={styles.scrollBox}>
                {result.predictions.map((value, index) => {
                  const width = (value / maxVal) * 100

                  return (
                    <div key={index} style={styles.predictionBlock}>
                      <div style={styles.predictionRow}>
                        <span>Hour {index + 1}</span>
                        <span style={styles.value}>{value} mW</span>
                      </div>

                      <div style={styles.progressBarBg}>
                        <div
                          style={{
                            ...styles.progressBar,
                            width: `${width}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p>No predictions yet</p>
            )}
          </div>

          {/* 📈 Graph Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📈 Forecast Graph</h2>

            {result?.graph ? (
              <img
                src={`data:image/png;base64,${result.graph}`}
                alt="Prediction Graph"
                style={styles.graph}
              />
            ) : (
              <p>Graph will appear here</p>
            )}
          </div>

          {/* 🧠 AI Insight Card (DARK STYLE) */}
          <div style={styles.shapCard}>
            <h2 style={styles.cardTitleDark}>🧠 AI Insight</h2>

            {result?.shap_top_feature ? (
              <div style={styles.shapBox}>
                <p style={styles.shapLabel}>Most Influential Feature</p>

                <h2 style={styles.shapFeature}>
                  {result.shap_top_feature}
                </h2>

                <p style={styles.shapValue}>
                  Impact Score: {result.shap_top_value.toFixed(4)}
                </p>
              </div>
            ) : (
              <p>No SHAP data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "80px 20px",
    background: "linear-gradient(135deg, #eef2f7, #d9e4f5)",
    backgroundImage:
      "radial-gradient(circle at top right, rgba(255,159,28,0.2), transparent)",
  },

  wrapper: {
    maxWidth: "1100px",
    margin: "auto",
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(20px)",
    borderRadius: "25px",
    padding: "40px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
  },

  topBar: {
    height: "6px",
    borderRadius: "10px",
    background: "linear-gradient(90deg,#1e3c72,#ff9f1c)",
    marginBottom: "25px",
  },

  heading: {
    textAlign: "center",
    fontSize: "38px",
    fontWeight: "bold",
    background: "linear-gradient(90deg,#1e3c72,#ff9f1c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
  },

  fileText: {
    textAlign: "center",
    color: "#555",
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
  },

  card: {
    background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(30,60,114,0.15)",
  },

shapCard: {
  background: "linear-gradient(135deg, #f5f9ff, #e3ecff)",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 10px 25px rgba(30,60,114,0.15)",
},

  cardTitle: {
    color: "#1e3c72",
    marginBottom: "15px",
  },

cardTitleDark: {
  color: "#1e3c72",
  marginBottom: "15px",
},

  scrollBox: {
    maxHeight: "260px",
    overflowY: "auto",
  },

  predictionBlock: {
    marginBottom: "12px",
  },

  predictionRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
  },

  progressBarBg: {
    height: "6px",
    background: "#ddd",
    borderRadius: "10px",
    marginTop: "5px",
  },

  progressBar: {
    height: "6px",
    borderRadius: "10px",
    background: "linear-gradient(90deg,#1e3c72,#ff9f1c)",
  },

  value: {
    fontWeight: "bold",
    color: "#2a5298",
  },

  graph: {
    width: "100%",
    borderRadius: "12px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
  },

  shapBox: {
    textAlign: "center",
    padding: "20px",
  },
shapLabel: {
  color: "#666",
},


shapFeature: {
  fontSize: "30px",
  color: "#1e3c72",
  margin: "10px 0",
},

shapValue: {
  color: "#2a5298",
  fontWeight: "bold",
},
}

export default Prediction