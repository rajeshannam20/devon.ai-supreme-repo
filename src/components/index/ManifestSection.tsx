
import React from 'react';
import Container from '@/components/Container';
import SectionHeading from '@/components/SectionHeading';
import ManifestCode from './manifest/ManifestCode';
import { yamlCode, deploymentFiles } from '@/data/manifest'; // Updated import path

const ManifestSection: React.FC = () => {
  return (
    <section id="manifest" className="py-20">
      <Container maxWidth="2xl">
        <SectionHeading 
          animate 
          tag="Documentation"
          subheading="Complete Kubernetes deployment manifest for the DEVONN.AI Framework."
        >
          Deployment Manifest
        </SectionHeading>
        
        <ManifestCode 
          code={yamlCode}
          title="Deployment Manifest"
          downloadFileName="devonn-ai-manifest.yaml"
        />
        
        <ManifestCode 
          code={deploymentFiles}
          title="Deployment File Manifest"
          downloadFileName="devonn-ai-deployment-files.txt"
        />
      </Container>
    </section>
  );
};

export default ManifestSection;
