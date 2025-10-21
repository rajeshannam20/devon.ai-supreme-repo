
// Common configuration elements for Terraform AWS deployment

export const commonConfigYaml = `# --- Common Terraform Configuration ---

# Terraform configuration for setting up AWS infrastructure
# To use this file:
# 1. Install Terraform CLI (https://learn.hashicorp.com/tutorials/terraform/install-cli)
# 2. Configure AWS credentials using AWS CLI:
#    $ aws configure
# 3. Run the following commands in the directory containing these Terraform files:
#    $ terraform init
#    $ terraform plan -out=tfplan -var-file="environments/\${ENV:-prod}.tfvars"
#    $ terraform apply tfplan

# --------------------------------------------
# IMPORTANT DEPLOYMENT CONSIDERATIONS
# --------------------------------------------
#
# REGIONS AND MULTI-REGION STRATEGY:
# - Primary deployment region: us-west-2 (Oregon)
# - For production, consider additional regions for high availability:
#   - us-east-1 (N. Virginia) - for US East coverage
#   - eu-west-1 (Ireland) - for European coverage
#   - ap-southeast-1 (Singapore) - for APAC coverage
# - Use Route53 for global DNS routing and failover between regions
# - Enable cross-region replication for S3 buckets containing static assets
#
# DATABASE BACKUP STRATEGY:
# - RDS automated backups: Enabled with 7-day retention (configurable)
# - Additional recommendations:
#   - Set up AWS Backup to create cross-region backups
#   - Configure point-in-time recovery (PITR)
#   - For critical data, consider read replicas in secondary regions
#   - Export regular snapshots to S3 with lifecycle policies for long-term retention
#
# MONITORING AND ALERTING:
# - Leverage CloudWatch for basic metrics and alerting
# - Consider enhanced monitoring with:
#   - CloudWatch Container Insights for Kubernetes metrics
#   - AWS X-Ray for distributed tracing
#   - Third-party options: Datadog, New Relic, or Prometheus/Grafana stack
# - Set up alerts for:
#   - CPU/Memory thresholds (>80%)
#   - Error rate increases
#   - Latency spikes
#   - Database connection issues
#
# CERTIFICATE MANAGEMENT:
# - For production environments:
#   - Provision certificates through AWS Certificate Manager (ACM)
#   - Set up automatic renewal
#   - For multi-region, create certificates in each region
#   - Use cert-manager in Kubernetes for service mesh certificates
#
# COST OPTIMIZATION:
# - Review and adjust instance sizes based on actual usage patterns
# - Implement auto-scaling for variable workloads
# - Consider Spot Instances for non-critical workloads
# - Enable AWS Cost Explorer and set up budget alerts
# - Regular review of unused/underutilized resources
#
# --------------------------------------------

# Recommended: Use S3 backend for team collaboration
terraform {
  backend "s3" {
    bucket = "devonn-terraform-state"
    key    = "terraform.tfstate"
    region = "us-west-2"
    dynamodb_table = "terraform-locks"
    encrypt = true
  }
}

# Define the AWS provider and region
provider "aws" {
  region = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  default_tags {
    tags = {
      Project     = "DevonnAI"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "DevOps"
    }
  }
}
  
provider "aws" {
  alias  = "dr_region"
  region = var.dr_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  default_tags {
    tags = {
      Project     = "DevonnAI"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "DevOps"
    }
  }
}

# Add this after your AWS providers
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.cluster.token

  # Wait for EKS cluster to be ready
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args = [
      "eks",
      "get-token",
      "--cluster-name",
      module.eks.cluster_name
    ]
  }
}
data "aws_eks_cluster_auth" "cluster" {
  name = module.eks.cluster_name
}

`;
