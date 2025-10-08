variable "gcp_project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "devonn-chrome-extension-deploy"
}

variable "gcp_client_email" {
  description = "The GCP client email"
  type        = string
}

variable "gcp_private_key" {
  description = "The GCP private key"
  type        = string
}

variable "gcp_client_id" {
  description = "The GCP client ID"
  type        = string
}

variable "gcp_region" {
  description = "The GCP region"
  default     = "us-central1"
}

variable "gcp_zone" {
  description = "The GCP zone"
  default     = "us-central1-a"
}

variable "gcp_image" {
  description = "The image to use for the compute instances"
  default     = "projects/debian-cloud/global/images/family/debian-10"
}

variable "instance_type" {
  description = "The instance type for the compute instances"
  default     = "f1-micro"
}

variable "environment" {
  description = "The environment (e.g., production, staging)"
  default     = "development"
}
