import { Construct } from "constructs";
import { StackProps } from 'aws-cdk-lib';



import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

export class TwitterDynamo extends Construct {

  wordsTable: Table
  locationTable: Table
  executionsTable: Table



  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);


    this.wordsTable = new Table(scope, 'Words', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: 'Words'
    });

    this.locationTable = new Table(scope, 'Locations', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: 'Locations'
    });

    this.executionsTable = new Table(scope, 'Executions', {
      partitionKey: {
        name: 'locationId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'wordId',
        type: AttributeType.STRING,
      }, 
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: 'Executions'
    });
    
    



  }
}