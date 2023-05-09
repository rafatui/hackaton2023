import { Construct } from "constructs";
import { StackProps } from 'aws-cdk-lib';

import { Duration } from "aws-cdk-lib";

import { TwitterFunction } from "./CommonDefinitions";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { TwitterS3 } from "./TwitterS3";
import { TwitterDynamo } from "./TwitterDynamo";
import { TwitterSM } from "./TwitterSM";

export class TwitterLambdas extends Construct {

  twitterReader: TwitterFunction 


  constructor(scope: Construct, id: string, twitterS3: TwitterS3,twitterDynamo: TwitterDynamo, twitterSM: TwitterSM, props?: StackProps) {
    super(scope, id);
    this.twitterReader = new TwitterFunction(scope, 'twitterReader', {
      index: 'main.py',
      handler: 'handler',

      entry: './../src/twitter_reader/',
      runtime: Runtime.PYTHON_3_10,
      environment: {

        BUCKET: twitterS3.tweetsBucket.bucketName

            
      },
      timeout: Duration.seconds(30)
      
     
    });
    twitterDynamo.executionsTable.grantReadWriteData(this.twitterReader);
    twitterDynamo.locationTable.grantReadData(this.twitterReader);
    twitterDynamo.wordsTable.grantReadData(this.twitterReader);


    twitterS3.tweetsBucket.grantPut(this.twitterReader);
    
    twitterSM.secret.grantRead(this.twitterReader);


  }
}