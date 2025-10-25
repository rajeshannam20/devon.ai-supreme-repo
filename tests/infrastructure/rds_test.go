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
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/aws/external"
	"github.com/aws/aws-sdk-go-v2/service/rds"
	"github.com/aws/aws-sdk-go-v2/service/rds/types"
)

// Initialize AWS session
func createAWSSession(region string) *rds.Client {
	cfg, err := external.LoadDefaultAWSConfig(
		external.WithRegion(region),
	)
	if err != nil {
		panic(fmt.Sprintf("unable to load AWS SDK config, %v", err))
	}
	return rds.New(cfg)
}

// Get RDS instance details
func getRdsInstanceDetails(client *rds.Client, dbInstanceId string) (*types.DBInstance, error) {
	input := &rds.DescribeDBInstancesInput{
		DBInstanceIdentifier: aws.String(dbInstanceId),
	}

	resp, err := client.DescribeDBInstances(context.Background(), input)
	if err != nil {
		return nil, fmt.Errorf("unable to describe DB instance, %v", err)
	}

	if len(resp.DBInstances) == 0 {
		return nil, fmt.Errorf("no RDS instance found with ID %s", dbInstanceId)
	}

	return &resp.DBInstances[0], nil
}

// Get RDS instance status
func getRdsInstanceStatus(client *rds.Client, dbInstanceId string) (string, error) {
	instance, err := getRdsInstanceDetails(client, dbInstanceId)
	if err != nil {
		return "", err
	}
	return string(instance.DBInstanceStatus), nil
}

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
		
		// Create AWS session
		region := terraformOptions.EnvVars["AWS_DEFAULT_REGION"]
		client := createAWSSession(region)
		
		// Verify RDS instance exists
		rdsInstance, err := getRdsInstanceDetails(client, rdsId)
		if err != nil {
			t.Fatalf("Error retrieving RDS instance details: %v", err)
		}

		// Assert instance properties
		assert.Equal(t, "postgres", *rdsInstance.Engine)
		assert.Equal(t, "db.t3.micro", *rdsInstance.DBInstanceClass)
		assert.Equal(t, false, *rdsInstance.MultiAZ) // Non-production should be single AZ
		
		// Wait for instance to be available
		maxRetries := 30
		for i := 0; i < maxRetries; i++ {
			instanceStatus, err := getRdsInstanceStatus(client, rdsId)
			if err != nil {
				t.Fatalf("Error getting RDS instance status: %v", err)
			}
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
