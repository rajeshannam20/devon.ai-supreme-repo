
package test

import (
	"fmt"
	"testing"
	"time"

	"github.com/gruntwork-io/terratest/modules/aws"
	"github.com/gruntwork-io/terratest/modules/random"
	"github.com/gruntwork-io/terratest/modules/terraform"
	test_structure "github.com/gruntwork-io/terratest/modules/test-structure"
	"github.com/stretchr/testify/assert"
)

// Test the RDS module configuration
func TestRDSModule(t *testing.T) {
	t.Parallel()

	// Store the Terraform folder path
	workingDir := "../.."
	
	// Generate a unique name for resources to avoid conflicts
	uniqueID := random.UniqueId()
	dbName := fmt.Sprintf("testdb%s", uniqueID)
	
	// Clean up resources when test completes
	defer test_structure.RunTestStage(t, "cleanup", func() {
		terraformOptions := test_structure.LoadTerraformOptions(t, workingDir)
		terraform.Destroy(t, terraformOptions)
	})
	
	// Deploy using Terraform
	test_structure.RunTestStage(t, "setup", func() {
		terraformOptions := &terraform.Options{
			TerraformDir: workingDir,
			Vars: map[string]interface{}{
				"environment":          "test",
				"db_instance_class":    "db.t3.micro",
				"db_allocated_storage": 10,
				"db_password":          fmt.Sprintf("password%s", uniqueID),
			},
			EnvVars: map[string]string{
				"AWS_DEFAULT_REGION": "us-east-1",
			},
		}
		
		// Save options for later cleanup
		test_structure.SaveTerraformOptions(t, workingDir, terraformOptions)
		
		// Apply Terraform code
		terraform.InitAndApply(t, terraformOptions)
	})
	
	// Validate RDS instance
	test_structure.RunTestStage(t, "validate", func() {
		terraformOptions := test_structure.LoadTerraformOptions(t, workingDir)
		
		// Get output values
		rdsEndpoint := terraform.Output(t, terraformOptions, "rds_endpoint")
		rdsId := terraform.Output(t, terraformOptions, "rds_instance_id")
		
		// Verify RDS instance exists
		region := terraformOptions.EnvVars["AWS_DEFAULT_REGION"]
		rdsInstance := aws.GetRdsInstanceDetails(t, region, rdsId)
		
		// Assert instance properties
		assert.Equal(t, "postgres", rdsInstance.Engine)
		assert.Equal(t, "db.t3.micro", rdsInstance.DBInstanceClass)
		assert.Equal(t, false, rdsInstance.MultiAZ) // Non-production should be single AZ
		
		// Wait for instance to be available
		maxRetries := 30
		for i := 0; i < maxRetries; i++ {
			instanceStatus := aws.GetRdsInstanceStatus(t, region, rdsId)
			if instanceStatus == "available" {
				break
			}
			time.Sleep(30 * time.Second)
		}
		
		// Test database connection (simplified example)
		// In a real test, you would connect to the database
		assert.NotEmpty(t, rdsEndpoint)
	})
}
