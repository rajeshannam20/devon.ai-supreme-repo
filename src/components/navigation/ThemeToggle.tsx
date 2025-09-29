
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Force a reload to ensure theme changes are applied
  React.useEffect(() => {
    if (isMounted) {
      console.log("Current theme:", theme);
    }
  }, [theme, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 bg-black/30 p-2 rounded-full border border-[#00FF41]/30">
      <Sun className="h-4 w-4 text-yellow-500" />
      <Switch 
        checked={theme === 'dark'} 
        onCheckedChange={toggleTheme}
        aria-label="Toggle dark mode"
        className="data-[state=checked]:bg-[#00FF41]"
      />
      <Moon className="h-4 w-4 text-blue-500" />
    </div>
  );
};

export default ThemeToggle;
