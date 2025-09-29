
import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Bot, Database, Network, BrainCircuit, Code } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn("border-t border-[#00FF41]/20 py-12 bg-black/90", className)}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center text-xl font-display font-semibold text-white">
              <Bot className="w-6 h-6 mr-2 text-[#00FF41]" />
              DEVONN<span className="text-[#00FF41]">.AI</span>
            </Link>
            <p className="mt-4 text-sm text-white/70 max-w-md">
              Here at an opportune time. A minimalist, intuitive framework for deploying AI applications, 
              focusing on simplicity, performance, and elegant implementation.
            </p>
            
            <div className="mt-6 flex space-x-4">
              <a 
                href="#" 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#00FF41]/10 text-white/70 hover:text-[#00FF41] transition-colors border border-white/10 hover:border-[#00FF41]/30"
              >
                <Database className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#00FF41]/10 text-white/70 hover:text-[#00FF41] transition-colors border border-white/10 hover:border-[#00FF41]/30"
              >
                <Network className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#00FF41]/10 text-white/70 hover:text-[#00FF41] transition-colors border border-white/10 hover:border-[#00FF41]/30"
              >
                <BrainCircuit className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#00FF41]/10 text-white/70 hover:text-[#00FF41] transition-colors border border-white/10 hover:border-[#00FF41]/30"
              >
                <Code className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 relative inline-block">
              Resources
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-[#00FF41]/50"></span>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/documentation" className="text-sm text-white/70 hover:text-[#00FF41] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/deployment" className="text-sm text-white/70 hover:text-[#00FF41] transition-colors">
                  Deployment
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-sm text-white/70 hover:text-[#00FF41] transition-colors">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 relative inline-block">
              Company
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-[#00FF41]/50"></span>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-white/70 hover:text-[#00FF41] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-white/70 hover:text-[#00FF41] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/devonn-ai/framework" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 hover:text-[#00FF41] transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[#00FF41]/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} DEVONN.AI. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/privacy" className="text-sm text-white/50 hover:text-[#00FF41] transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-white/50 hover:text-[#00FF41] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
