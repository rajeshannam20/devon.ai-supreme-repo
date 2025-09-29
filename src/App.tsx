
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import WorkflowManagement from "./pages/WorkflowManagement";
import DeploymentDashboard from "./pages/DeploymentDashboard";
import APIManagement from "./pages/APIManagement";
import Documentation from "./pages/Documentation";
import DevonnDashboard from "./pages/DevonnDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AgentDashboard from "./pages/AgentDashboard";
import FlowEditor from "./pages/FlowEditor";
import AgentDemo from "./pages/AgentDemo"; // Import the new AgentDemo page
import EnhancedAgentDemo from "./pages/EnhancedAgentDemo"; // Enhanced multi-provider platform
import { Toaster } from "./components/ui/sonner";
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider } from 'next-themes';
import { DeploymentProvider } from "./contexts/DeploymentContext";
import { APIProvider } from "./contexts/APIContext";
import { AGUIProvider } from "./contexts/agui/AGUIContext";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DeploymentProvider>
        <APIProvider>
          <ChatProvider>
            <AGUIProvider>
              <Router>
                <Navbar />
                <main className="min-h-screen">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/deployment" element={<DeploymentDashboard />} />
                    <Route path="/api" element={<APIManagement />} />
                    <Route path="/documentation" element={<Documentation />} />
                    <Route path="/agents" element={<AgentDashboard />} />
                    <Route path="/devonn" element={<DevonnDashboard />} />
                    <Route path="/flow" element={<FlowEditor />} />
                    <Route path="/workflows" element={<WorkflowManagement />} />
                    <Route path="/agent-demo" element={<AgentDemo />} /> {/* Add the new route */}
                    <Route path="/enhanced-agents" element={<EnhancedAgentDemo />} /> {/* Enhanced multi-LLM platform */}
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </Router>
              <Toaster />
            </AGUIProvider>
          </ChatProvider>
        </APIProvider>
      </DeploymentProvider>
    </ThemeProvider>
  );
}

export default App;
