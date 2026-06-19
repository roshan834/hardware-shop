import { Link } from "react-router-dom"

import WebsiteHeader from "../../components/website/WebsiteHeader"
import WebsiteFooter from "../../components/website/WebsiteFooter"
import { useState, useEffect } from "react"

import "../../styles/website/Home.css"

const Home = () => {

    const [showWhatsappPopup, setShowWhatsappPopup] =
  useState(false)

    useEffect(() => {
    const timer = setTimeout(() => {
        setShowWhatsappPopup(true)
    }, 30000)

    return () => clearTimeout(timer)
    }, [])


  return (
    <>
      <WebsiteHeader />

      <div className="home-page">

        {/* Hero Section */}
        <section className="hero-section">

          <div className="hero-overlay">

            <div className="hero-content">

              <span className="tag">
                Trusted Hardware Partner Since 2020
              </span>

              <h1 className="headtitle">
                Hardware, Plumbing &
                Electrical Solutions
              </h1>

              <p>
                Your one-stop destination for premium
                hardware tools, plumbing accessories,
                electrical products, construction
                materials, and industrial supplies.
              </p>

              <div className="hero-buttons">

                    <Link
                        to="/shop"
                        className="btn-primary"
                    >
                        🛒 Shop Now
                    </Link>

                    <a
                        href="https://wa.me/918286357442?text=Hi%20I%20want%20service%20support"
                        target="_blank"
                        rel="noreferrer"
                        className="btn-whatsapp"
                    >
                        💬 WhatsApp Now
                    </a>

                </div>

            </div>

          </div>

        </section>

        {/* Stats */}
        <section className="stats-section">

          <div className="stat-card">
            <h2>500+</h2>
            <p>Products Available</p>
          </div>

          <div className="stat-card">
            <h2>1000+</h2>
            <p>Happy Customers</p>
          </div>

          <div className="stat-card">
            <h2>5+</h2>
            <p>Years Experience</p>
          </div>

          <div className="stat-card">
            <h2>24/7</h2>
            <p>Customer Support</p>
          </div>

        </section>

        {/* Categories */}
        <section className="categories-section">

          <div className="section-title">
            <h2>Our Product Categories</h2>
            <p>
              Everything you need under one roof
            </p>
          </div>

          <div className="category-grid">

            <div className="category-card">
              <span>🔩</span>
              <h3>Hardware</h3>
              <p>
                Fasteners, tools, fittings,
                locks and accessories.
              </p>
            </div>

            <div className="category-card">
              <span>🚿</span>
              <h3>Plumbing</h3>
              <p>
                Pipes, valves, taps,
                fittings and sanitary items.
              </p>
            </div>

            <div className="category-card">
              <span>⚡</span>
              <h3>Electrical</h3>
              <p>
                Switches, wires, lighting
                and electrical accessories.
              </p>
            </div>

            <div className="category-card">
              <span>🏗️</span>
              <h3>Construction</h3>
              <p>
                Essential materials for
                construction projects.
              </p>
            </div>

          </div>

        </section>

        {/* Why Choose Us */}
        <section className="why-us">

          <div className="section-title">
            <h2>Why Choose Neelkanth Enterprises?</h2>
          </div>

          <div className="feature-grid">

            <div className="feature-card">
              <h3>Premium Quality</h3>
              <p>
                We supply genuine and trusted
                products from reputed brands.
              </p>
            </div>

            <div className="feature-card">
              <h3>Best Pricing</h3>
              <p>
                Competitive rates with maximum
                value for your investment.
              </p>
            </div>

            <div className="feature-card">
              <h3>Fast Delivery</h3>
              <p>
                Reliable and timely delivery
                for all your orders.
              </p>
            </div>

            <div className="feature-card">
              <h3>Expert Support</h3>
              <p>
                Professional guidance to help
                you choose the right products.
              </p>
            </div>

          </div>

        </section>

        

      </div>

      {/* WhatsApp Popup */}

        {showWhatsappPopup && (
        <div className="whatsapp-popup">

            <button
            className="close-popup"
            onClick={() =>
                setShowWhatsappPopup(false)
            }
            >
            ✕
            </button>

            <div className="popup-content">

            <h3>
                Need Help?
            </h3>

            <p>
                Chat with us on WhatsApp for
                product inquiries and support.
            </p>

            <a
                href="https://wa.me/918286357442?text=Hi%20I%20need%20assistance"
                target="_blank"
                rel="noreferrer"
                className="whatsapp-chat-btn"
            >
                💬 Chat on WhatsApp
            </a>

            </div>

        </div>
        )}

      <WebsiteFooter />
    </>
  )
}

export default Home