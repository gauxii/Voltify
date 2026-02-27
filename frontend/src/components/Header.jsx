function Header() {
  return (
    <header style={styles.header}>
      <h1 style={styles.logo}>Voltify</h1>
    </header>
  )
}

const styles = {
  header: {
    position: "fixed",
    top: 0,
    width: "100%",
    padding: "20px 40px",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    zIndex: 10
  },
  logo: {
    color: "white",
    fontSize: "28px",
    fontWeight: "bold",
    fontFamily: "Poppins, sans-serif",
    letterSpacing: "2px"
  }
}

export default Header