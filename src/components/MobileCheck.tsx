import { VideoBook } from "../VideoBook";

const MobileCheck = () => {
  // A simple regex to check for mobile devices.
  const isMobile = /Mobi/i.test(window.navigator.userAgent);

  if (isMobile) {
    return <VideoBook />;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "2em",
        textAlign: "center",
        fontFamily: "sans-serif",
        padding: "20px",
        color: "#333",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <img src="/facepalm.gif" alt="Facepalm" style={{ maxWidth: "300px" }} />
      This website is only designed for mobile.
    </div>
  );
};

export default MobileCheck;
