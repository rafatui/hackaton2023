import { Construct } from "constructs";
import { StackProps } from 'aws-cdk-lib';



import * as s3 from 'aws-cdk-lib/aws-s3'

import * as iam from 'aws-cdk-lib/aws-iam'


export class TwitterS3 extends Construct {

    tweetsBucket: s3.Bucket




    constructor(scope: Construct, id: string,  props?: StackProps) {
        super(scope, id);
        this.tweetsBucket = new s3.Bucket(scope, 'twitter-fullfilment-123', {


            blockPublicAccess:  s3.BlockPublicAccess.BLOCK_ALL
            
        });

      


    }
}