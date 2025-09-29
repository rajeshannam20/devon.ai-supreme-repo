
// Virtual router and routes configuration

export const routesYaml = `# Virtual router and routes
resource "aws_appmesh_virtual_router" "api_router" {
  name      = "api-router"
  mesh_name = aws_appmesh_mesh.devonn_mesh.name
  
  spec {
    listener {
      port_mapping {
        port     = 8000
        protocol = "http"
      }
    }
  }
}

# Canary deployment route
resource "aws_appmesh_route" "api_route" {
  name                = "api-route"
  mesh_name           = aws_appmesh_mesh.devonn_mesh.name
  virtual_router_name = aws_appmesh_virtual_router.api_router.name
  
  spec {
    http_route {
      match {
        prefix = "/"
      }
      
      # For canary deployments, split traffic between versions
      weighted_target {
        virtual_node = aws_appmesh_virtual_node.api_node.name
        weight       = 90
      }
      
      weighted_target {
        virtual_node = "api-canary-node"  # This would be created when deploying a new version
        weight       = 10
      }
      
      # Configure retries for resilience
      retry_policy {
        http_retry_events = ["server-error", "gateway-error"]
        max_retries       = 3
        
        per_retry_timeout {
          unit  = "ms"
          value = 1000
        }
      }
      
      # Circuit breaker to prevent cascading failures
      timeout {
        idle {
          unit  = "ms"
          value = 30000
        }
        
        per_request {
          unit  = "ms"
          value = 5000
        }
      }
    }
  }
}`;
