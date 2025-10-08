variable "gcp_credentials_json" {
  description = "The GCP credentials in JSON format"
  type        = string
}

variable "gcp_project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "The GCP region to deploy to"
  default     = "us-central1"
}

variable "gcp_zone" {
  description = "The GCP zone to deploy to"
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
  type        = string
  default     = "development"
}
