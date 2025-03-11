
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add Material Symbols stylesheet directly to the head
const materialSymbolsLink = document.createElement('link');
materialSymbolsLink.rel = 'stylesheet';
materialSymbolsLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
document.head.appendChild(materialSymbolsLink);

createRoot(document.getElementById("root")!).render(<App />);
