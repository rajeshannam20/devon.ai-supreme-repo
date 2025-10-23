
// Envoy proxy configuration for Kubernetes

export const kubernetesProxyYaml = `# Envoy proxy configuration for EKS

resource "kubernetes_namespace" "devonn" {
  metadata {
    name = "devonn"
  }
  depends_on = [module.eks]    
}

resource "kubernetes_secret" "envoy_certs" {
  metadata {
    name      = "envoy-certs"
    namespace = "devonn"
  }

  type = "Opaque"

  data = {
    cert.crt = base64decode(var.AWS_ENVOY_CRT)
    cert.key = base64decode(var.AWS_ENVOY_KEY)
  }
}

resource "kubernetes_deployment" "envoy_proxy" {
  count = var.environment == "prod" ? 1 : 0

  depends_on = [
    module.eks,
    kubernetes_namespace.devonn
  ]  
  
  metadata {
    name      = "envoy-proxy"
    namespace = kubernetes_namespace.devonn.metadata[0].name
    
    labels = {
      app = "envoy-proxy"
    }
  }
  
  spec {
    replicas = 3
    
    selector {
      match_labels = {
        app = "envoy-proxy"
      }
    }
    
    template {
      metadata {
        labels = {
          app = "envoy-proxy"
        }
      }
      
      spec {
        container {
          name  = "envoy"
          image = "envoyproxy/envoy:v1.22.0"
          
          port {
            container_port = 9901
            name           = "admin"
          }
          
          port {
            container_port = 15001
            name           = "proxy"
          }
          
          # Envoy sidecar config would typically be injected by App Mesh controller
          args = [
            "-c", "/etc/envoy/envoy.yaml",
            "--service-cluster", "devonn-cluster",
            "--service-node", "devonn-node"
          ]
          
          env {
            name  = "APPMESH_RESOURCE_ARN"
            value = aws_appmesh_mesh.devonn_mesh.arn
          }
          
          # mTLS certificate volume mount
          volume_mount {
            name       = "envoy-certs"
            mount_path = "/etc/envoy-certs"
            read_only  = true
          }
        }
        
        # AWS App Mesh Envoy sidecars inject themselves into pods
        # This is just an example deployment for the proxy itself
        
        # TLS certificates for mTLS
        volume {
          name = "envoy-certs"
          
          secret {
            secret_name = "envoy-certs"
          }
        }
      }
    }
  }
}`;
