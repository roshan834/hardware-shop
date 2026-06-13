import { useEffect, useRef } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"

const BarcodeScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null)
  const codeReader = useRef(null)
  const controlsRef = useRef(null)
  const lastScanRef = useRef("")

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader()

    startScanner()

    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    try {
      controlsRef.current =
        await codeReader.current.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (!result) return

            const code = result.getText()

            if (lastScanRef.current === code) return

            lastScanRef.current = code

            navigator.vibrate?.(200)

            const audio = new Audio(
              "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
            )

            audio.play().catch(() => {})

            onScan(code)

            setTimeout(() => {
              lastScanRef.current = ""
            }, 1500)
          }
        )
    } catch (err) {
      console.error(err)
      alert("Camera permission denied")
    }
  }

  const stopScanner = () => {
    try {
      controlsRef.current?.stop()
    } catch (e) {}

    try {
      codeReader.current?.reset()
    } catch (e) {}

    const video = videoRef.current

    if (video?.srcObject) {
      const tracks = video.srcObject.getTracks()

      tracks.forEach((track) => {
        track.stop()
      })

      video.srcObject = null
    }
  }

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <h2 style={titleStyle}>
          Scan Product Barcode
        </h2>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={videoStyle}
        />

        <button
          style={btnStyle}
          onClick={handleClose}
        >
          Close Scanner
        </button>
      </div>
    </div>
  )
}

export default BarcodeScanner

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999
}

const boxStyle = {
  width: "95%",
  maxWidth: "500px",
  background: "#fff",
  borderRadius: "15px",
  padding: "15px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
}

const titleStyle = {
  textAlign: "center",
  marginBottom: "15px"
}

const videoStyle = {
  width: "100%",
  borderRadius: "10px",
  overflow: "hidden"
}

const btnStyle = {
  marginTop: "15px",
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  background: "#ef4444",
  color: "#fff",
  fontSize: "16px",
  cursor: "pointer"
}