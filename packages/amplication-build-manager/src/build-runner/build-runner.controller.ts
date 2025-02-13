import { EnvironmentVariables } from "@amplication/util/kafka";
import { AmplicationLogger } from "@amplication/util/nestjs/logging";
import { Controller, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventPattern, Payload } from "@nestjs/microservices";
import axios from "axios";
import { plainToInstance } from "class-transformer";
import { Env } from "../env";
import { QueueService } from "../queue/queue.service";
import { BuildRunnerService } from "./build-runner.service";
import { CodeGenerationFailure } from "./dto/CodeGenerationFailure";
import { CodeGenerationRequest } from "./dto/CodeGenerationRequest";
import { CodeGenerationSuccess } from "./dto/CodeGenerationSuccess";

@Controller("build-runner")
export class BuildRunnerController {
  constructor(
    private readonly buildRunnerService: BuildRunnerService,
    private readonly configService: ConfigService<Env, true>,
    private readonly queueService: QueueService,
    private readonly logger: AmplicationLogger
  ) {}

  @Post("code-generation-success")
  async onCodeGenerationSuccess(
    @Payload() dto: CodeGenerationSuccess
  ): Promise<void> {
    try {
      await this.buildRunnerService.copyFromJobToArtifact(
        dto.resourceId,
        dto.buildId
      );
      await this.queueService.emitMessage(
        this.configService.get(Env.CODE_GENERATION_SUCCESS_TOPIC),
        JSON.stringify({ buildId: dto.buildId })
      );
    } catch (error) {
      this.logger.error(error);
      await this.queueService.emitMessage(
        this.configService.get(Env.CODE_GENERATION_FAILURE_TOPIC),
        JSON.stringify({ buildId: dto.buildId, error })
      );
    }
  }

  @Post("code-generation-failure")
  async onCodeGenerationFailure(
    @Payload() dto: CodeGenerationFailure
  ): Promise<void> {
    try {
      await this.queueService.emitMessage(
        this.configService.get(Env.CODE_GENERATION_FAILURE_TOPIC),
        JSON.stringify({ buildId: dto.buildId, error: dto.error })
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  @EventPattern(
    EnvironmentVariables.instance.get(Env.CODE_GENERATION_REQUEST_TOPIC, true)
  )
  async onCodeGenerationRequest(
    @Payload() message: CodeGenerationRequest
  ): Promise<void> {
    this.logger.info("Code generation request received");
    let args: CodeGenerationRequest;
    try {
      args = plainToInstance(CodeGenerationRequest, message);
      this.logger.info("Code Generation Request", args);
      await this.buildRunnerService.saveDsgResourceData(
        args.buildId,
        args.dsgResourceData
      );
      const url = this.configService.get(Env.DSG_RUNNER_URL);
      await axios.post(url, {
        resourceId: args.resourceId,
        buildId: args.buildId,
      });
    } catch (error) {
      this.logger.error(error);
      await this.queueService.emitMessage(
        this.configService.get(Env.CODE_GENERATION_FAILURE_TOPIC),
        JSON.stringify({ buildId: args?.buildId, error })
      );
    }
  }
}
