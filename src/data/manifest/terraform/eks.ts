export const eksConfigYaml = `# --- EKS Cluster Configuration ---


# 2. EKS Cluster Configuration
module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "21.3.2"  

  cluster_name    = "devonn-eks-\${var.environment}"

  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets

  node_groups = {
    dev_nodes = {
      desired_capacity = var.node_desired_capacity
      max_capacity     = var.node_max_capacity
      min_capacity     = var.node_min_capacity
      instance_types   = var.node_instance_types
      disk_size        = var.node_disk_size
    }
  }

  # Enable IAM Roles for Service Accounts (IRSA)
  enable_irsa = true

  # CloudWatch Logs for the EKS control plane
  cluster_enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  # Security groups
  cluster_security_group_additional_rules = [
    {
      description  = "Cluster all egress"
      protocol     = "-1"
      from_port    = 0
      to_port      = 0
      type        = "egress"
      cidr_blocks  = ["0.0.0.0/0"]
    }
  ]

  # Encryption for EKS secrets
  cluster_encryption_config = [
    {
      provider_key_arn = aws_kms_key.eks.arn
      resources       = ["secrets"]
    }
  ]
}

# KMS key for EKS secrets encryption
resource "aws_kms_key" "eks" {
  description             = "EKS Secret Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

# 4. IAM OIDC Provider for EKS
resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["9e99a48a9960b14926bb7f3b02e22da0afd10df6"]
  url             = module.eks.cluster_oidc_issuer_url
}

# 5. Connect to your EKS cluster after provisioning
# Run: aws eks update-kubeconfig --name devonn-eks-\${var.environment} --region \${var.aws_region}
# This will update your kubeconfig file with the new cluster information
`;
