import { PythonFunction, PythonFunctionProps } from "@aws-cdk/aws-lambda-python-alpha";
import { Duration  } from 'aws-cdk-lib';
import { Architecture } from "aws-cdk-lib/aws-lambda";

import { Construct } from "constructs";
import { getSystemErrorMap } from "util";
const merge = require('deepmerge')

export class TwitterFunction extends PythonFunction {
    
        
    constructor(scope: Construct, id: string, props: PythonFunctionProps) {
        const commonProps ={
                timeout: Duration.seconds(30),
                environment: {
                    ENVIRONMENT: "test",
                    LOG_LEVEL: "Debug",
                    POWERTOOLS_SERVICE_NAME: "hackaton"
                },
                architecture:  Architecture.X86_64
                

            };
        const mergedProps = merge(commonProps, props)
        if (props.timeout)
            mergedProps["timeout"] = props.timeout
        console.log(mergedProps)
        super(scope, id, mergedProps )
    };
}


