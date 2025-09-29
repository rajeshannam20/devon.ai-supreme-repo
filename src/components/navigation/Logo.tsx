
import React from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <Bot className="w-8 h-8 mr-2 text-[#00FF41]" />
      <Link 
        to="/" 
        className="text-xl font-display font-semibold text-white"
      >
        DEVONN<span className="text-[#00FF41]">.AI</span>
      </Link>
    </div>
  );
};

export default Logo;
