
# Variables for Azure Container Apps deployment

variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
}

variable "location" {
  description = "Azure region to deploy resources"
  type        = string
  default     = "eastus"
}

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  default     = "development"
}

variable "container_app_environment_name" {
  description = "Name of the Container App Environment"
  type        = string
  default     = "devonn-development-env"
}

variable "container_app_name" {
  description = "Name of the Container App"
  type        = string
  default     = "devonn-api"
}

variable "image_name" {
  description = "Container image name with tag"
  type        = string
}
