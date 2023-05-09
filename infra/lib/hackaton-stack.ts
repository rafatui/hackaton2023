import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TwitterDynamo } from './TwitterDynamo';
import { TwitterS3 } from './TwitterS3';
import { TwitterLambdas } from './TwitterLambdas';
import { TwitterCron } from './TwitterCron';
import { TwitterSM } from './TwitterSM';

 
// import * as sqs from 'aws-cdk-lib/aws-sqs';


export class HakatonStack extends cdk.Stack {
  twitterDynamo: TwitterDynamo
  twitterS3: TwitterS3
  twitterLambdas: TwitterLambdas
  twitterCron: TwitterCron 
  twitterSM: TwitterSM
  
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.twitterDynamo = new TwitterDynamo(this, "TwitterDynamo")
    this.twitterS3 = new TwitterS3(this,"TwitterS3")
    this.twitterSM = new TwitterSM(this,"TwitterSM")
    this.twitterLambdas = new TwitterLambdas(this,"TwitterLambdas", 
                                                  this.twitterS3, 
                                                  this.twitterDynamo,
                                                  this.twitterSM) 
    this.twitterCron = new TwitterCron (this,"TwitterCron",this.twitterLambdas)


  }
}
