import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ECSTaskExecutionRole } from './components/ecsTaskExecutionRole';
import { ECSTaskDefinitionRole } from './components/ecsTaskDefinitionRole';
import { Vpc } from './components/vpc';
import { ECSCluster } from './components/ecsCluster';

export class AwsBootstrapCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const generatedVpc = new Vpc(this, 'jh-e1-vpc', {
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      defaultInstanceTenancy: ec2.DefaultInstanceTenancy.DEFAULT,
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        // {
        //   cidrMask: 24,
        //   name: 'Private',
        //   subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        // },
      ],
    });

    new ECSTaskExecutionRole(this, 'jh-ecs-task-execution-role', {
      roleName: 'jh-ecs-task-execution-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    new ECSTaskDefinitionRole(this, 'jh-ecs-task-definition-role', {
      roleName: 'jh-ecs-task-definition-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    new ECSCluster(this, 'jh-ecs-cluster', {
      clusterName: 'jh-e1-ecs-cluster',
      vpc: generatedVpc,
    });
  }
}
