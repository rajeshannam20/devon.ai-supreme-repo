variable "aws_region" {
  description = "The AWS region to deploy to"
  default     = "us-east-1"
}

variable "aws_ami_id" {
  description = "AMI ID to use for EC2 instances"
  default     = "ami-0c55b159cbfafe1f0" # Example, replace with the correct AMI
}

variable "instance_type" {
  description = "The instance type for EC2"
  default     = "t2.micro"
}

variable "environment" {
  description = "The environment (e.g., production, staging)"
  type        = string
  default     = "development"
}
