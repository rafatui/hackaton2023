import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TwitterDynamo } from './TwitterDynamo';
import { TwitterS3 } from './TwitterS3';
import { TwitterLambdas } from './TwitterLambdas';
import { TwitterCron } from './TwitterCron';
 
// import * as sqs from 'aws-cdk-lib/aws-sqs';


export class HakatonStack extends cdk.Stack {
  twitterDynamo: TwitterDynamo
  twitterS3: TwitterS3
  twitterLambdas: TwitterLambdas
  twitterCron: TwitterCron 
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.twitterDynamo = new TwitterDynamo(this, "TwitterDynamo")
    this.twitterS3 = new TwitterS3(this,"TwitterS3")
    this.twitterLambdas = new TwitterLambdas(this,"TwitterLambdas", this.twitterS3, this.twitterDynamo) 
    this.twitterCron = new TwitterCron (this,"TwitterCron",this.twitterLambdas)
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'HakatonQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
