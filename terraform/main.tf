terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

resource "kubernetes_namespace" "movie_db" {
  metadata {
    name = "movie-db"
  }
}

resource "kubernetes_service" "postgres" {
  metadata {
    name = "postgres"
  }

  spec {
    selector = {
      app = "postgres"
    }

    port {
      port        = 5432
      target_port = 5432
    }
  }
}

resource "kubernetes_persistent_volume_claim" "postgres" {
  metadata {
    name = "postgres-pvc"
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "1Gi"
      }
    }
  }
}

resource "kubernetes_secret" "backend" {
  metadata {
    name = "backend-secret"
  }

  data = {
    JWT_SECRET   = var.jwt_secret
    TMDB_API_KEY = var.tmdb_api_key
    TMDB_TOKEN   = var.tmdb_token
  }

  type = "Opaque"
}


resource "kubernetes_service" "backend" {
  metadata {
    name = "backend"
  }

  spec {
    selector = {
      app = "backend"
    }

    port {
      port        = 4000
      target_port = 4000
      node_port   = 30040
    }

    type = "NodePort"
  }
}

resource "kubernetes_service" "frontend" {
  metadata {
    name = "frontend"
  }

  spec {
    selector = {
      app = "frontend"
    }

    port {
      port        = 5173
      target_port = 5173
      node_port   = 30173
    }

    type = "NodePort"
  }
}

resource "kubernetes_deployment" "backend" {
  metadata {
    name = "backend"
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "backend"
        }
      }

      spec {
        container {
          name              = "backend"
          image             = "movie-db-backend:latest"
          image_pull_policy = "Never"

          port {
            container_port = 4000
          }

          env {
            name  = "DATABASE_URL"
            value = "postgres://postgres:postgres@postgres:5432/moviedb"
          }

          env {
            name  = "PORT"
            value = "4000"
          }

          env {
            name = "JWT_SECRET"

            value_from {
              secret_key_ref {
                name = "backend-secret"
                key  = "JWT_SECRET"
              }
            }
          }

          env {
            name = "TMDB_API_KEY"

            value_from {
              secret_key_ref {
                name = "backend-secret"
                key  = "TMDB_API_KEY"
              }
            }
          }

          env {
            name = "TMDB_TOKEN"

            value_from {
              secret_key_ref {
                name = "backend-secret"
                key  = "TMDB_TOKEN"
              }
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_deployment" "postgres" {
  metadata {
    name = "postgres"
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }

      spec {
        container {
          name  = "postgres"
          image = "postgres:16"

          port {
            container_port = 5432
          }

          env {
            name  = "POSTGRES_USER"
            value = "postgres"
          }

          env {
            name  = "POSTGRES_PASSWORD"
            value = "postgres"
          }

          env {
            name  = "POSTGRES_DB"
            value = "moviedb"
          }

          volume_mount {
            name       = "postgres-storage"
            mount_path = "/var/lib/postgresql/data"
          }
        }

        volume {
          name = "postgres-storage"

          persistent_volume_claim {
            claim_name = "postgres-pvc"
          }
        }
      }
    }
  }
}

resource "kubernetes_deployment" "frontend" {
  metadata {
    name = "frontend"
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "frontend"
        }
      }

      spec {
        container {
          name              = "frontend"
          image             = "movie-db-frontend:latest"
          image_pull_policy = "Never"

          port {
            container_port = 5173
          }
        }
      }
    }
  }
}