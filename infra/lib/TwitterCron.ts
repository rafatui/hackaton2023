import { Construct } from "constructs";
import { StackProps } from 'aws-cdk-lib';


import { TwitterLambdas } from "./TwitterLambdas";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";


export class TwitterCron extends Construct {





  constructor(scope: Construct, id: string,twitterLambdas: TwitterLambdas, props?: StackProps) {
    super(scope, id);


    const eventRule = new Rule(scope, 'scheduleRule', {
      schedule: Schedule.cron({ minute: '0', hour: '1' }),
    });
    eventRule.addTarget(new LambdaFunction(twitterLambdas.twitterReader))


    
    



  }
}