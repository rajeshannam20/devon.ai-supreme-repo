
package terraform.aws.rds

import input.plan as tfplan

# Deny RDS instances that don't have encryption enabled
deny[reason] {
    resource := tfplan.resource_changes[_]
    resource.type == "aws_db_instance"
    resource.change.after.storage_encrypted == false
    
    reason := sprintf(
        "RDS instance '%s' is not encrypted. Storage encryption must be enabled for all database instances.",
        [resource.address]
    )
}

# Deny RDS instances that are publicly accessible in production
deny[reason] {
    resource := tfplan.resource_changes[_]
    resource.type == "aws_db_instance"
    resource.change.after.publicly_accessible == true
    resource.change.after.tags.Environment == "production"
    
    reason := sprintf(
        "RDS instance '%s' in production environment is publicly accessible. Public access must be disabled.",
        [resource.address]
    )
}

# Warn when RDS instances don't have automated backups enabled
warn[reason] {
    resource := tfplan.resource_changes[_]
    resource.type == "aws_db_instance"
    resource.change.after.backup_retention_period < 7
    
    reason := sprintf(
        "RDS instance '%s' has backup retention period less than 7 days. Consider increasing backup retention.",
        [resource.address]
    )
}

# Warn when RDS instances don't have monitoring enabled
warn[reason] {
    resource := tfplan.resource_changes[_]
    resource.type == "aws_db_instance"
    resource.change.after.monitoring_interval == 0
    
    reason := sprintf(
        "RDS instance '%s' does not have enhanced monitoring enabled. Consider enabling monitoring.",
        [resource.address]
    )
}

# Required tags for all RDS instances
required_tags = ["Environment", "CostCenter", "Project"]

# Deny RDS instances without required tags
deny[reason] {
    resource := tfplan.resource_changes[_]
    resource.type == "aws_db_instance"
    
    tag := required_tags[_]
    not resource.change.after.tags[tag]
    
    reason := sprintf(
        "RDS instance '%s' does not have required tag '%s'. All required tags must be present.",
        [resource.address, tag]
    )
}
