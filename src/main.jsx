import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/app.css'
// import "./styles/website/website.css"

// import './styles/global.css'
// import './styles/buttons.css'
// import './styles/table.css'
// import './styles/forms.css'
// import './styles/dashboard.css'
// import './styles/billing.css'
// import './styles/products.css'
// import './styles/login.css'
// import './styles/reports.css'


import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />

    <ToastContainer
      position="top-right"
      autoClose={1500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="colored"
    />
  </React.StrictMode>
)