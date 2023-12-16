import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class ECSTaskDefinitionRole extends iam.Role {
  constructor(scope: Construct, id: string, props: iam.RoleProps) {
    super(scope, id, props);

    this.addToPolicy(
      new iam.PolicyStatement({
        sid: 'dynamodbpermissions',
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:BatchWriteItem',
          'dynamodb:Query',
          'dynamodb:DeleteItem',
        ],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      })
    );

    this.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'logs:CreateLogStream',
          'logs:DescribeLogGroups',
          'logs:DescribeLogStreams',
          'logs:PutLogEvents',
          'ssmmessages:CreateControlChannel',
          'ssmmessages:CreateDataChannel',
          'ssmmessages:OpenControlChannel',
          'ssmmessages:OpenDataChannel',
        ],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      })
    );
  }
}
