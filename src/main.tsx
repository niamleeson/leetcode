import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import RecoverableLazy from './components/RecoverableLazy'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <RecoverableLazy errorTitle="This page couldn't open.">
        <App />
      </RecoverableLazy>
    </HashRouter>
  </React.StrictMode>,
)
