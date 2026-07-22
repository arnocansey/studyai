import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { AiService } from "../ai/ai.service";
import { STUDY_PLAN_QUEUE, StudyPlanJobData } from "./queue.constants";

@Processor(STUDY_PLAN_QUEUE)
export class StudyPlanProcessor extends WorkerHost {
  private readonly logger = new Logger(StudyPlanProcessor.name);

  constructor(private readonly aiService: AiService) {
    super();
  }

  async process(job: Job<StudyPlanJobData>) {
    this.logger.debug(`Processing study-plan job ${job.id}`);
    return this.aiService.generateStudyPlanSync(
      {
        goal: job.data.goal,
        currentLevel: job.data.currentLevel,
        weeklyHours: job.data.weeklyHours,
        targetDate: job.data.targetDate,
        focusAreas: job.data.focusAreas,
      },
      job.data.userId,
    );
  }
}
