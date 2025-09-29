
import React from 'react';
import { Download as DownloadIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DownloadSection: React.FC = () => {
  return (
    <section className="py-6 rounded-lg border bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 my-8">
      <div className="px-6">
        <h3 className="text-xl font-bold mb-2">Download Everything</h3>
        <p className="text-muted-foreground mb-4">Get all the components you need to build your AI agent factory</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6">
        <Card className="bg-background/80 backdrop-blur hover:bg-background transition-colors">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">Backend (FastAPI)</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download ZIP
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-background/80 backdrop-blur hover:bg-background transition-colors">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">Frontend (React)</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download ZIP
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-background/80 backdrop-blur hover:bg-background transition-colors">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">Environment + Docker</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Files
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
};

export default DownloadSection;
