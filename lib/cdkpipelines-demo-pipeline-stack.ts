import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { Construct, StackProps, Stack, SecretValue } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import * as ssm from '@aws-cdk/aws-ssm';
import { CdkpipelinesDemoStage } from './codepipelines-demo-stage';
``
/**
 * The stack that defines the application pipeline
 */
export class CdkpipelinesDemoPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const sourceArtifact = new codepipeline.Artifact();
        const cloudAssemblyArtifact = new codepipeline.Artifact();

        const pipeline = new CdkPipeline(this,'Pipeline',{

            // The pipeline name
            pipelineName: 'MyServicePipeline',
            cloudAssemblyArtifact,

             // Where the source can be found
            sourceAction: new codepipeline_actions.GitHubSourceAction({
                actionName: 'GitHub',
                output: sourceArtifact,
                oauthToken: SecretValue.secretsManager('github-token'),
                owner: 'jingood2',
                repo: 'cdkpipeline-demo',
                trigger: codepipeline_actions.GitHubTrigger.POLL,

            }),
           
            synthAction: SimpleSynthAction.standardNpmSynth({
                sourceArtifact,
                cloudAssemblyArtifact,
                // We need a build step to compile the TypeScript Lambda
                buildCommand: 'npm run build'
            })

        });

        pipeline.addApplicationStage(new CdkpipelinesDemoStage(this,'PreProd',{
            env: { account: '533616270150', region: 'ap-northeast-2' },
        }));

        pipeline.addApplicationStage(new CdkpipelinesDemoStage(this,'Prod',{
            env: { account: '037729278610', region: 'ap-northeast-2' },
        }));


    }
}