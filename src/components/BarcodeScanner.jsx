import { useEffect, useRef } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"

const BarcodeScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null)
  const codeReader = useRef(null)
  const controlsRef = useRef(null)
  const lastScanRef = useRef("")

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader()

    const startScanner = async () => {
      try {
        controlsRef.current =
          await codeReader.current.decodeFromConstraints(
            {
              video: {
                facingMode: {
                  ideal: "environment"
                }
              }
            },
            videoRef.current,
            (result) => {
              if (!result) return

              const code = result.getText()

              if (lastScanRef.current === code) return

              lastScanRef.current = code

              // Success sound
              const audio = new Audio(
                "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
              )
              audio.play()

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

    startScanner()

    return () => {
      stopScanner()
    }
  }, [])

  const stopScanner = () => {
    try {
      controlsRef.current?.stop()
    } catch {}

    try {
      codeReader.current?.reset()
    } catch {}

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop())

      videoRef.current.srcObject = null
    }
  }

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%" }}
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