import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class Vpc extends ec2.Vpc {
  constructor(scope: Construct, id: string, props: ec2.VpcProps) {
    super(scope, id, props);
  }
}
