
// Main export file for service mesh configuration
import { coreMeshYaml } from './core';
import { nodesYaml } from './virtual-nodes';
import { servicesYaml } from './virtual-services';
import { routesYaml } from './routes';
import { observabilityYaml } from './observability';
import { kubernetesProxyYaml } from './kubernetes-proxy';

// Combine all service mesh configuration sections
export const serviceMeshYaml = `# --- AWS App Mesh Configuration ---

${coreMeshYaml}

${nodesYaml}

${servicesYaml}

${routesYaml}

${kubernetesProxyYaml}

${observabilityYaml}`;
