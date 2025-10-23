export const eksConfigYaml = `# --- EKS Cluster Configuration ---

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.50"
    }
  }
}

locals {
  kubernetes_version = var.kubernetes_version != null ? var.kubernetes_version : "1.33"
}

module "eks_addons" {
  source          = "terraform-aws-modules/eks/aws//modules/addons"
  cluster_name    = module.eks.cluster_name
  cluster_version = module.eks.cluster_version
  addons = {
    vpc_cni = {
      addon_name   = "vpc-cni"
      addon_version = "v1.11.0"
      resolve_conflicts = "OVERWRITE"
    }
  }
}

# 2. EKS Cluster Configuration
module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "21.4.0"

  name    = "devonn-eks-prod"
  kubernetes_version = local.kubernetes_version

  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets

  endpoint_public_access       = true
  endpoint_public_access_cidrs = [var.admin_cidr]  
  endpoint_private_access      = true

  eks_managed_node_groups = {
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
  enabled_log_types  = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  # Security groups
  security_group_additional_rules = {
  egress_all = {
    description  = "Cluster all egress"
    protocol     = "-1"
    from_port    = 0
    to_port      = 0
    type        = "egress"
    cidr_blocks  = ["0.0.0.0/0"]
  }
}

  # Encryption for EKS secrets
  encryption_config = {
      provider_key_arn = aws_kms_key.eks.arn
      resources       = ["secrets"]
}
}

resource "aws_eks_cluster_addon" "vpc_cni" {
  cluster_name  = module.eks.cluster_name
  addon_name    = "vpc-cni"
  addon_version = "v1.11.0"
  resolve_conflicts = "OVERWRITE"
}



# KMS key for EKS secrets encryption
resource "aws_kms_key" "eks" {
  description             = "EKS Secret Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

# 4. IAM OIDC Provider for EKS

data "aws_iam_openid_connect_provider" "existing" {
  url = "https://oidc.eks.us-west-2.amazonaws.com/id/9511538CAE2D0B7802D49BB5AFC1C3DE"
}

resource "aws_iam_openid_connect_provider" "eks" {
  count = (
    try(data.aws_iam_openid_connect_provider.existing.arn, "") == "" ? 1 : 0
  )  
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["9e99a48a9960b14926bb7f3b02e22da0afd10df6"]
  url             = module.eks.cluster_oidc_issuer_url
  
  lifecycle {
    ignore_changes = [url]  
  }  

 depends_on = [module.eks]  
}

# 5. Connect to your EKS cluster after provisioning
# Run: aws eks update-kubeconfig --name devonn-eks-\${var.environment} --region \${var.aws_region}
# This will update your kubeconfig file with the new cluster information
`;
