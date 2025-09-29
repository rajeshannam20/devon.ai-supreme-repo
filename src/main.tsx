
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Clear any cached styles that might be preventing theme changes
if (typeof window !== 'undefined') {
  const head = document.head;
  const stylesheets = head.querySelectorAll('style');
  stylesheets.forEach(sheet => {
    if (sheet.innerHTML.includes('--primary') || sheet.innerHTML.includes('--background')) {
      sheet.remove();
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
