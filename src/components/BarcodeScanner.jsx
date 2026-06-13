import { useEffect, useRef } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"

const BarcodeScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null)
  const codeReader = useRef(null)

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader()

    let controls

    const startScanner = async () => {
      try {
        controls = await codeReader.current.decodeFromConstraints(
              {
                video: {
                  facingMode: {
                    ideal: "environment"
                  }
                }
              },
          videoRef.current,
          (result, err) => {
            if (result) {
              onScan(result.getText())
              stopScanner()
            }
          }
        )
      } catch (err) {
        console.error(err)
        alert("Camera not available or permission denied")
      }
    }

    const stopScanner = () => {
      try {
        controls?.stop()
      } catch (e) {}
      codeReader.current?.reset()
    }

    startScanner()

    return () => {
      stopScanner()
    }
  }, [])

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <video ref={videoRef} style={{ width: "100%" }} />

        <button style={btnStyle} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default BarcodeScanner

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
}

const boxStyle = {
  width: "90%",
  maxWidth: "400px",
  background: "#fff",
  padding: "10px",
  borderRadius: "10px"
}

const btnStyle = {
  marginTop: "10px",
  width: "100%",
  padding: "10px",
  background: "red",
  color: "#fff",
  border: "none"
}