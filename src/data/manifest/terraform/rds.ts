
// RDS database configuration for Terraform

export const rdsConfigYaml = `# --- RDS PostgreSQL Configuration ---

# 3. RDS PostgreSQL Configuration
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "5.2.2"

  identifier = "devonn-postgres-\${var.environment}"
  engine     = "postgres"
  engine_version = "14.9"
  instance_class = var.db_instance_class

  allocated_storage = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_encrypted = true

  name     = "devonndb"
  username = "admin"
  password = var.db_password
  port     = 5432

  vpc_security_group_ids = [module.vpc.default_security_group_id]
  db_subnet_group_name   = module.vpc.database_subnet_group
  publicly_accessible    = false
  
  # Backup configuration - enhanced for production
  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window           = "03:00-06:00"
  maintenance_window      = "Mon:00:00-Mon:03:00"
  
  # Performance Insights for better monitoring in production
  performance_insights_enabled = var.environment == "production"
  performance_insights_retention_period = 7
  
  # Enhanced monitoring for production
  monitoring_interval = var.environment == "production" ? 30 : 60
  monitoring_role_name = "devonn-rds-monitoring-role-\${var.environment}"
  create_monitoring_role = true
  
  # Multi-AZ setup for production
  multi_az = var.environment == "production"
  
  # Deletion protection in production
  deletion_protection = var.environment == "production"
  
  # Snapshots for production
  skip_final_snapshot = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "devonn-postgres-final-\${var.environment}" : null
  
  # Automated backups
  copy_tags_to_snapshot = true
  
  # Parameter group for PostgreSQL optimizations
  parameter_group_name = var.environment == "production" ? aws_db_parameter_group.postgres_production[0].name : null

  # Enhanced disaster recovery for production
  enabled_cloudwatch_logs_exports = var.environment == "production" ? ["postgresql", "upgrade"] : []
  
  # Cross-region snapshot replication for disaster recovery
  snapshot_identifier = var.use_snapshot ? var.snapshot_identifier : null
  
  # Reserved instances configuration through tagging
  tags = {
    ReservedInstance = var.environment == "production" ? "eligible" : "not-eligible"
    BackupStrategy = var.environment == "production" ? "cross-region" : "standard"
    Environment = var.environment
    CostCenter = "database-\${var.environment}"
    Project = "devonn"
  }
}

# Production-optimized parameter group (only created for production environment)
resource "aws_db_parameter_group" "postgres_production" {
  count = var.environment == "production" ? 1 : 0
  
  name   = "devonn-postgres-params-\${var.environment}"
  family = "postgres14"
  
  parameter {
    name  = "max_connections"
    value = "200"
  }
  
  parameter {
    name  = "shared_buffers"
    value = "{DBInstanceClassMemory/32768}MB"
  }
  
  parameter {
    name  = "effective_cache_size"
    value = "{DBInstanceClassMemory/16384}MB"
  }
  
  parameter {
    name  = "work_mem"
    value = "8MB"
  }
  
  parameter {
    name  = "maintenance_work_mem"
    value = "64MB"
  }
  
  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Log queries taking more than 1 second
  }
  
  parameter {
    name  = "wal_buffers"
    value = "16MB"
  }
  
  parameter {
    name  = "checkpoint_timeout"
    value = "15"
  }
}

# Read replica for production environment to improve read performance and act as failover standby
resource "aws_db_instance" "postgres_read_replica" {
  count = var.environment == "production" ? 1 : 0
  
  identifier           = "devonn-postgres-replica-\${var.environment}"
  replicate_source_db  = module.rds.db_instance_id
  instance_class       = var.db_replica_instance_class
  
  publicly_accessible  = false
  skip_final_snapshot  = true
  apply_immediately    = false
  
  # Performance settings
  monitoring_interval = 30
  monitoring_role_arn = module.rds.enhanced_monitoring_iam_role_arn
  
  tags = {
    Name = "Devonn RDS Read Replica"
    Type = "ReadReplica"
    Environment = var.environment
    CostCenter = "database-\${var.environment}"
    Project = "devonn"
  }
}

# Cross-region replica for disaster recovery
resource "aws_db_instance" "postgres_cross_region_replica" {
  count = var.environment == "production" && var.enable_cross_region_replica ? 1 : 0
  
  provider             = aws.dr_region
  identifier           = "devonn-postgres-dr-\${var.environment}"
  replicate_source_db  = module.rds.db_instance_arn
  instance_class       = var.db_dr_instance_class
  
  publicly_accessible  = false
  skip_final_snapshot  = false
  final_snapshot_identifier = "devonn-postgres-dr-final-\${var.environment}"
  
  # Performance settings
  monitoring_interval = 60
  
  # Automatic backup retention
  backup_retention_period = 7
  
  tags = {
    Name = "Devonn RDS Cross-Region DR Replica"
    Type = "DisasterRecovery"
    Environment = var.environment
    CostCenter = "disaster-recovery"
    Project = "devonn"
  }
}

# DB Event Subscription to get notified about important RDS events
resource "aws_db_event_subscription" "default" {
  count     = var.environment == "production" ? 1 : 0
  name      = "devonn-rds-event-subscription"
  sns_topic = aws_sns_topic.db_events[0].arn
  
  source_type = "db-instance"
  source_ids  = [module.rds.db_instance_id]
  
  event_categories = [
    "availability",
    "deletion",
    "failover",
    "failure",
    "low storage",
    "maintenance",
    "notification",
    "recovery"
  ]
  
  tags = {
    Name = "Devonn RDS Event Subscription"
    Environment = var.environment
  }
}

# SNS Topic for RDS Events
resource "aws_sns_topic" "db_events" {
  count = var.environment == "production" ? 1 : 0
  name  = "devonn-rds-events-\${var.environment}"
}

# CloudWatch Dashboard for RDS Monitoring
resource "aws_cloudwatch_dashboard" "rds_dashboard" {
  count          = var.environment == "production" ? 1 : 0
  dashboard_name = "devonn-rds-dashboard-\${var.environment}"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "devonn-postgres-\${var.environment}"]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "CPU Utilization"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "FreeableMemory", "DBInstanceIdentifier", "devonn-postgres-\${var.environment}"]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Freeable Memory"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "ReadIOPS", "DBInstanceIdentifier", "devonn-postgres-\${var.environment}"],
            ["AWS/RDS", "WriteIOPS", "DBInstanceIdentifier", "devonn-postgres-\${var.environment}"]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "IOPS"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", "devonn-postgres-\${var.environment}"]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "DB Connections"
        }
      }
    ]
  })
}

# RDS CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "rds_cpu_alarm" {
  count               = var.environment == "production" ? 1 : 0
  alarm_name          = "devonn-rds-high-cpu-\${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = [aws_sns_topic.db_events[0].arn]
  ok_actions          = [aws_sns_topic.db_events[0].arn]
  
  dimensions = {
    DBInstanceIdentifier = "devonn-postgres-\${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_memory_alarm" {
  count               = var.environment == "production" ? 1 : 0
  alarm_name          = "devonn-rds-low-memory-\${var.environment}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 3
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 1073741824  # 1 GB in bytes
  alarm_description   = "This metric monitors RDS freeable memory"
  alarm_actions       = [aws_sns_topic.db_events[0].arn]
  ok_actions          = [aws_sns_topic.db_events[0].arn]
  
  dimensions = {
    DBInstanceIdentifier = "devonn-postgres-\${var.environment}"
  }
}

# AWS Backup Plan for RDS instances
resource "aws_backup_plan" "rds_backup_plan" {
  count = var.environment == "production" ? 1 : 0
  name  = "devonn-rds-backup-plan-\${var.environment}"

  rule {
    rule_name           = "daily-backups"
    target_vault_name   = aws_backup_vault.rds_backup_vault[0].name
    schedule            = "cron(0 3 * * ? *)"
    
    lifecycle {
      delete_after = 30
    }
  }
  
  rule {
    rule_name           = "weekly-backups"
    target_vault_name   = aws_backup_vault.rds_backup_vault[0].name
    schedule            = "cron(0 5 ? * SAT *)"
    
    lifecycle {
      delete_after = 90
    }
  }
}

resource "aws_backup_vault" "rds_backup_vault" {
  count = var.environment == "production" ? 1 : 0
  name  = "devonn-rds-backup-vault-\${var.environment}"
}

resource "aws_backup_selection" "rds_backup_selection" {
  count        = var.environment == "production" ? 1 : 0
  name         = "devonn-rds-backup-selection"
  plan_id      = aws_backup_plan.rds_backup_plan[0].id
  iam_role_arn = aws_iam_role.backup_role[0].arn

  resources = [
    module.rds.db_instance_arn
  ]
}

resource "aws_iam_role" "backup_role" {
  count = var.environment == "production" ? 1 : 0
  name  = "devonn-backup-role-\${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "backup_role_policy" {
  count      = var.environment == "production" ? 1 : 0
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.backup_role[0].name
}`;

