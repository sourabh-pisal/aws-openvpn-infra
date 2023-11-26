import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  CfnEIP,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  IpAddresses,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, "vpc", {
      ipAddresses: IpAddresses.cidr("10.0.0.0/24"),
      natGateways: 0,
      maxAzs: 1,
      subnetConfiguration: [
        {
          name: "public-subnet",
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });

    const sg = new SecurityGroup(this, "sg", {
      vpc: vpc,
      securityGroupName: "OpenVpnEc2",
      allowAllOutbound: true,
    });

    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(22), "SSH Port");
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(443), "HTTPS Web Interface");
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(943), "OpenVPN Webserver");
    sg.addIngressRule(Peer.anyIpv4(), Port.udp(1194), "OpenVPN Reserved Port");

    const ec2 = new Instance(this, "ec2", {
      vpc: vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.SMALL),
      machineImage: MachineImage.genericLinux({
        "eu-west-1": "ami-0b541b356beff91e0",
      }),
      securityGroup: sg,
      keyName: "openvpn",
    });

    new CfnEIP(this, "eip", { instanceId: ec2.instanceId });
  }
}
