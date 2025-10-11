
// Main export file for Terraform configuration
import { commonConfigYaml } from './common';
import { vpcConfigYaml } from './vpc';
import { eksConfigYaml } from './eks'; 
import { rdsConfigYaml } from './rds';
import { kubernetesConfigYaml } from './kubernetes';
import { variablesConfigYaml } from './variables';
import { outputsConfigYaml } from './outputs';
import { securityConfigYaml } from './security';
import { serviceMeshYaml } from './service-mesh';

// Combine all Terraform configuration sections
export const terraformManifestYaml = `${commonConfigYaml}

${vpcConfigYaml}

${eksConfigYaml}

${rdsConfigYaml}

${kubernetesConfigYaml}

${securityConfigYaml}

${serviceMeshYaml}

${variablesConfigYaml}

${outputsConfigYaml}`;

// Import Azure Terraform files as raw text
import mainTf from './azure/main.tf?raw';
import variablesTf from './azure/variables.tf?raw';
import outputsTf from './azure/outputs.tf?raw';


try {
  // your logic to synthesize Terraform configuration
  console.log("Running cdktf synth...");
} catch (err) {
  console.error("Error during execution:", err);
}

// Export Azure Container Apps Terraform configuration
export const azureContainerAppsTerraform = {
  mainTf,
  variablesTf,
  outputsTf
};
