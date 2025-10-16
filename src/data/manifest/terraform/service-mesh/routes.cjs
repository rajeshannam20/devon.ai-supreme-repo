
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

resource "aws_appmesh_virtual_node" "api_canary_node" {
  name      = "api-canary-node"
  mesh_name = aws_appmesh_mesh.devonn_mesh.name

  spec {
    listener {
      port_mapping {
        port     = 8000
        protocol = "http"
      }
    }
    service_discovery {
      dns {
        hostname = "api-canary-node.local"
      }
    }
  }
}

resource "aws_appmesh_route" "api_route" {
  name                = "api-route"
  mesh_name           = aws_appmesh_mesh.devonn_mesh.name
  virtual_router_name = aws_appmesh_virtual_router.api_router.name

  spec {
    http_route {
      match {
        prefix = "/"
      }

      action {
        weighted_target {
          virtual_node = aws_appmesh_virtual_node.api_node.name
          weight       = 90
        }
        weighted_target {
          virtual_node = "api-canary-node"
          weight       = 10
        }
      }

      retry_policy {
        http_retry_events = ["server-error", "gateway-error"]
        max_retries       = 3

        per_retry_timeout {
          unit  = "ms"
          value = 1000
        }
      }

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
}


`

