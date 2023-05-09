import { Construct } from "constructs";
import { StackProps } from 'aws-cdk-lib';


import { TwitterLambdas } from "./TwitterLambdas";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';


export class TwitterSM extends Construct {
  secret: secretsmanager.Secret;





  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);


    this.secret = new secretsmanager.Secret(this, "/twitter/authorizationHeader",{
      secretName: "/twitter/authorizationHeader"
    });


    
    



  }
}