
import React from 'react';
import PocketFlow from '@/components/flow/PocketFlow';
import { ReactFlowProvider } from '@xyflow/react';

const FlowEditor: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <PocketFlow />
      </ReactFlowProvider>
    </div>
  );
};

export default FlowEditor;
