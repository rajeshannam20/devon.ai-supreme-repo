
import React from 'react';
import DeploymentPage from '@/components/deployment/DeploymentPage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { DeploymentProvider } from '@/contexts/DeploymentContext';

const DeploymentDashboard: React.FC = () => {
  return (
    <DeploymentProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        <Navbar />
        <DeploymentPage />
        <Footer />
      </motion.div>
    </DeploymentProvider>
  );
};

export default DeploymentDashboard;
