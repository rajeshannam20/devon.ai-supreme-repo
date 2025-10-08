provider "google" {
  project     = var.gcp_project_id
  region      = var.gcp_region
  credentials = jsonencode({
    type        = "service_account"
    project_id  = var.gcp_project_id
    private_key = base64decode(var.gcp_private_key)
    client_email = var.gcp_client_email
    client_id   = var.gcp_client_id
  })
}

# ----------------------------------------------------
# Google Cloud Storage Bucket
# ----------------------------------------------------
resource "google_storage_bucket" "example" {
  name     = "devonn-ai-${var.environment}-bucket"
  location = var.gcp_region

  labels = {
    environment = var.environment
    terraform   = "true"
  }
}

# ----------------------------------------------------
# Google Compute Engine Instance (Backend)
# ----------------------------------------------------
resource "google_compute_instance" "backend" {
  name         = "devonn-ai-${var.environment}-backend"
  machine_type = var.instance_type
  zone         = var.gcp_zone

  # Boot disk configuration
  boot_disk {
    initialize_params {
      image = var.gcp_image
    }
  }

  # Tags
  tags = ["devonn-ai"]

  # Metadata
  metadata = {
    environment = var.environment
  }

  # Network interface block (Required)
  network_interface {
    network = "default"  # Default VPC
    access_config {     # Required for an external IP address
      // No external IP if you don't want it
    }
  }
}

# ----------------------------------------------------
# Google Compute Engine Instance (Frontend)
# ----------------------------------------------------
resource "google_compute_instance" "frontend" {
  name         = "devonn-ai-${var.environment}-frontend"
  machine_type = var.instance_type
  zone         = var.gcp_zone

  # Boot disk configuration
  boot_disk {
    initialize_params {
      image = var.gcp_image
    }
  }

  # Tags
  tags = ["devonn-ai"]

  # Metadata
  metadata = {
    environment = var.environment
  }

  # Network interface block (Required)
  network_interface {
    network = "default"  # Default VPC
    access_config {     # Required for an external IP address
      // No external IP if you don't want it
    }
  }
}
