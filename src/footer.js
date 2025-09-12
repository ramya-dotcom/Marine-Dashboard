// src/Footer.js
const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      width: "100%",
      textAlign: "center",
      padding: "1rem 0",
      fontSize: "0.9rem",
      background: "#f2f2f2",
      position: "absolute",
      bottom: 0
    }}>
      <p>
        © {year} Neurakraft AI. Powered by Neurakraft AI™. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
