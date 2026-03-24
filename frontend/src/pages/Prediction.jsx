import { useLocation } from "react-router-dom"

function Prediction() {
  const location = useLocation()
  const result = location.state?.result
  const file = location.state?.file

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <h1 style={styles.heading}>⚡ Prediction Results</h1>

        {file && (
          <p style={styles.fileText}>
            Uploaded File: <strong>{file.name}</strong>
          </p>
        )}

        <div style={styles.grid}>
          {/* Predicted Electricity Load */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              Predicted Electricity Load (Next 24 Hours)
            </h2>
            {result?.predictions ? (
              <ul style={styles.predictionList}>
                {result.predictions.map((value, index) => (
                  <li key={index}>
                    Hour {index + 1}: {value} mW
                  </li>
                ))}
              </ul>
            ) : (
              <p>Predictions will appear here</p>
            )}
          </div>

          {/* Load Forecast Graph */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Load Forecast Graph</h2>
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

          {/* SHAP Explainable AI */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Explainable AI Insights</h2>
            {result?.shap_top_feature ? (
              <>
                <p>
                  <strong>Top Feature:</strong> {result.shap_top_feature} <br />
                  <strong>SHAP Value:</strong>{" "}
                  {result.shap_top_value.toFixed(4)}
                </p>

                <h4>All Feature SHAP Values:</h4>
                <ul style={styles.shapList}>
                  {result.shap_all_features.map((f, i) => (
                    <li key={i}>
                      {f.feature}: {f.shap_value.toFixed(4)}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>SHAP output will appear here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 🎨 MATCHED STYLES (same as homepage theme)
const styles = {
  container: {
    minHeight: "100vh",
    padding: "100px 20px",
    background: "#f5f7fa", // same as home
  },

  wrapper: {
    width: "85%",
    maxWidth: "1100px",
    margin: "auto",
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(18px)",
    borderRadius: "30px",
    padding: "50px 30px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    animation: "fadeUp 1s ease",
  },

  heading: {
    textAlign: "center",
    fontSize: "40px",
    fontWeight: "bold",
    background: "linear-gradient(90deg,#1e3c72,#ff9f1c,#1e3c72)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "20px",
  },

  fileText: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "18px",
    color: "#444",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },

  cardTitle: {
    color: "#1e3c72",
    marginBottom: "12px",
  },

  predictionList: {
    listStyleType: "none",
    padding: 0,
    color: "#333",
  },

  shapList: {
    listStyleType: "none",
    padding: 0,
    maxHeight: "200px",
    overflowY: "auto",
    color: "#333",
  },

  graph: {
    width: "100%",
    borderRadius: "10px",
  },
}

export default Prediction