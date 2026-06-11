import { useEffect, useRef } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"

const BarcodeScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()

    codeReader.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, err) => {
        if (result) {
          onScan(result.getText())
          onClose()
        }
      }
    )

    return () => codeReader.reset()
  }, [])

  return (
    <div className="scanner-overlay">
      <video ref={videoRef} className="scanner-video" />
      <button onClick={onClose} className="btn-danger">
        Close
      </button>
    </div>
  )
}

export default BarcodeScanner