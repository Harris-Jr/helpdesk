import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import useSystemTheme from '@/hooks/useSystemTheme'

function Root() {
  useSystemTheme();
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Root />
)