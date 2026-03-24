import logo from "../assets/elec-logo.png"

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <img src={logo} alt="Voltify Logo" style={styles.logo} />

        <div>
          <h1 className="voltify-text" style={styles.title}>Voltify</h1>

          <p className="subtitle-fade" style={styles.subtitle}>
            AI-Powered Electricity Load Forecasting using Transformer
          </p>
        </div>
      </div>
    </header>
  )
}

const styles = {
header: {
  position: "fixed",
  top: 0,
  width: "100%",
  height: "80px",
  display: "flex",
  alignItems: "center",
  padding: "0 40px",
  background: "rgba(255,255,255,0.85)",   // semi transparent
  backdropFilter: "blur(10px)",
  zIndex: 1000,
  transition: "0.4s"
},

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },

  logo: {
    height: "95px",
    width: "auto",
    objectFit: "contain"
  },

  title: {
    margin: 0,
    lineHeight: "1.1"
  },

  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#1e3c72",
    fontWeight: "500",
    letterSpacing: "0.5px"
  }
}

export default Header