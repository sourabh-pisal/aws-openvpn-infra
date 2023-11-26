#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Tags } from "aws-cdk-lib";
import "source-map-support/register";
import { CdkStack } from "../lib/cdk-stack";

const app = new cdk.App();
const cdkStack = new CdkStack(app, "OpenVPNInfra", {});
Tags.of(cdkStack).add("application", "openvpn");
