import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';

export class ECSCluster extends ecs.Cluster {
  constructor(scope: Construct, id: string, props: ecs.ClusterProps) {
    super(scope, id, props);
  }
}
