import { useEffect, useRef, useState } from "react"
import "../../styles/website/footer.css"

const WebsiteFooter = () => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(node)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <footer className={`website-footer ${visible ? "is-visible" : ""}`} ref={ref}>

      <div className="footer-glow" aria-hidden="true" />

      <div className="footer-content">

        <h2>
          Neelkanth Enterprises
        </h2>

        <p className="footer-tagline">
          Hardware • Plumbing • Electrical • Construction Materials
        </p>

        <div className="footer-contact">

          <p>
            <span className="footer-icon">📍</span>
            Gala No 9, Kalpavruksh Height, New Link Road,
            Kandivali West, Mumbai 400067
          </p>

          <p>
            <span className="footer-icon">📞</span>
            <a href="tel:+918286357442">8286357442</a>
          </p>

          <p>
            <span className="footer-icon">✉</span>
            <a href="mailto:neelkhantenterprises.contact@gmail.com">
              neelkhantenterprises.contact@gmail.com
            </a>
          </p>

        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()}
        {" "}
        Neelkanth Enterprises.
        All Rights Reserved.
      </div>

    </footer>
  )
}

export default WebsiteFooter