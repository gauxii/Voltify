import { useLocation } from "react-router-dom"

function Prediction() {
  const location = useLocation()
  const result = location.state?.result
  const file = location.state?.file

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>⚡ Prediction Results</h1>

      {file && (
        <p style={styles.fileText}>
          Uploaded File: <strong>{file.name}</strong>
        </p>
      )}

      <div style={styles.grid}>
        {/* Predicted Electricity Load */}
        <div style={styles.card}>
          <h2>Predicted Electricity Load (Next 24 Hours)</h2>
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
          <h2>Load Forecast Graph</h2>
          {result?.graph ? (
            <img
              src={`data:image/png;base64,${result.graph}`}
              alt="Prediction Graph"
              style={{ width: "100%", borderRadius: "10px" }}
            />
          ) : (
            <p>Graph will appear here</p>
          )}
        </div>

        {/* SHAP Explainable AI */}
        <div style={styles.card}>
          <h2>Explainable AI Insights</h2>
          {result?.shap_top_feature ? (
            <>
              <p>
                <strong>Top Feature:</strong> {result.shap_top_feature} <br />
                <strong>SHAP Value:</strong> {result.shap_top_value.toFixed(4)}
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
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "100px 40px",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    color: "white"
  },
  heading: {
    textAlign: "center",
    fontSize: "40px",
    marginBottom: "20px"
  },
  fileText: {
    textAlign: "center",
    marginBottom: "40px",
    fontSize: "18px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px"
  },
  card: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
  },
  predictionList: {
    listStyleType: "none",
    padding: 0
  },
  shapList: {
    listStyleType: "none",
    padding: 0,
    maxHeight: "200px",
    overflowY: "auto"
  }
}

export default Prediction