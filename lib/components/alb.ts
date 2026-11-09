import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

interface JHALBProps extends elbv2.ApplicationLoadBalancerProps {}

// Hosted zones created outside CDK. fullstackhrivnak.com is intentionally
// absent: its records point at CloudFront, not this ALB.
const hostedZones = {
  'fshjobcoach.com': 'Z057843923JIFZBRP6PDY',
  'lmkn.net': 'Z0699608FXEIKOJZY78U',
  'cassanova.net': 'Z0757811ZQ6W7LU0XASX',
  'stravareportgenerator.com': 'Z0294193K7S7CPEAF5OY',
};

type ZoneName = keyof typeof hostedZones;

// A-record aliases to this ALB. recordName is relative to the zone ('' = apex).
const aliasRecords: { zone: ZoneName; recordName: string }[] = [
  { zone: 'fshjobcoach.com', recordName: '' },
  { zone: 'fshjobcoach.com', recordName: 'www' },
  { zone: 'lmkn.net', recordName: '' },
  { zone: 'cassanova.net', recordName: 'data' },
  { zone: 'stravareportgenerator.com', recordName: '' },
  { zone: 'stravareportgenerator.com', recordName: 'www' },
  { zone: 'stravareportgenerator.com', recordName: 'data' },
];

export class ALB extends elbv2.ApplicationLoadBalancer {
  public readonly httpsListener: elbv2.ApplicationListener;

  constructor(scope: Construct, id: string, props: JHALBProps) {
    super(scope, id, props);

    this.addRedirect({
      sourcePort: 80,
      targetPort: 443,
      sourceProtocol: elbv2.ApplicationProtocol.HTTP,
      targetProtocol: elbv2.ApplicationProtocol.HTTPS,
    });

    const zones = Object.fromEntries(
      Object.entries(hostedZones).map(([zoneName, hostedZoneId]) => [
        zoneName,
        route53.HostedZone.fromHostedZoneAttributes(this, `Zone-${zoneName}`, {
          hostedZoneId,
          zoneName,
        }),
      ]),
    ) as Record<ZoneName, route53.IHostedZone>;

    const cassanovaCert = new acm.Certificate(this, 'Certificate', {
      domainName: 'cassanova.net',
      subjectAlternativeNames: ['*.cassanova.net'],
      validation: acm.CertificateValidation.fromDns(zones['cassanova.net']),
    });

    const srgCert = new acm.Certificate(this, 'Certificate-SRG', {
      domainName: 'stravareportgenerator.com',
      subjectAlternativeNames: ['*.stravareportgenerator.com'],
      validation: acm.CertificateValidation.fromDns(
        zones['stravareportgenerator.com'],
      ),
    });

    const jobCoachCert = new acm.Certificate(this, 'Certificate-JobCoach', {
      domainName: 'fshjobcoach.com',
      subjectAlternativeNames: ['*.fshjobcoach.com'],
      validation: acm.CertificateValidation.fromDns(zones['fshjobcoach.com']),
    });

    this.httpsListener = this.addListener('jh-https-listener', {
      certificates: [
        // Cassanova
        cassanovaCert,
        // Strava Report Generator
        srgCert,
        // Job Coach
        jobCoachCert,
      ],
      port: 443,
      defaultAction: elbv2.ListenerAction.fixedResponse(200, {
        contentType: 'text/plain',
        messageBody: 'ok',
      }),
    });

    for (const { zone, recordName } of aliasRecords) {
      new route53.ARecord(this, `Alias-${recordName || 'apex'}.${zone}`, {
        zone: zones[zone],
        recordName: recordName || undefined,
        target: route53.RecordTarget.fromAlias(
          new targets.LoadBalancerTarget(this),
        ),
        // Records were originally created by hand; replace them on first deploy.
        deleteExisting: true,
      });
    }
  }
}
