import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_BUFFER_SIZE = 50 * 1024 * 1024;

export interface ReviewConfig {
  prNumber: string;
  repo: string;
  eventName: string;
  commentBody: string;
  runnerTemp: string;
}

export function parseReviewMode(eventName: string, commentBody: string): boolean {
  if (eventName === "issue_comment") {
    return commentBody.includes("-c") || commentBody.includes("--continue");
  }
  return eventName === "workflow_dispatch";
}

export class GitHubClient {
  constructor(
    private repo: string,
    private prNumber: string,
  ) {}

  private run(args: string[]): string {
    const proc = spawnSync("gh", args, {
      env: process.env,
      encoding: "utf-8",
      maxBuffer: MAX_BUFFER_SIZE,
    });
    if (proc.status !== 0) {
      throw new Error(`gh ${args.join(" ")} failed: ${proc.stderr?.trim() || ""}`);
    }
    return proc.stdout?.trim() || "";
  }

  createPlaceholderComment(): string {
    return this.run([
      "api",
      `repos/${this.repo}/issues/${this.prNumber}/comments`,
      "-X",
      "POST",
      "-f",
      "body=Timi AI 审查中...",
      "--jq",
      ".id",
    ]);
  }

  updateComment(commentId: string, filePath: string): void {
    this.run([
      "api",
      "-X",
      "PATCH",
      `repos/${this.repo}/issues/comments/${commentId}`,
      "-F",
      `body=@${filePath}`,
    ]);
  }

  updateCommentText(commentId: string, text: string): void {
    this.run([
      "api",
      "-X",
      "PATCH",
      `repos/${this.repo}/issues/comments/${commentId}`,
      "-f",
      `body=${text}`,
    ]);
  }

  restoreSessionArtifact(sessionDir: string, artifactName: string, tempDir: string): boolean {
    const artifactId = this.run([
      "api",
      `repos/${this.repo}/actions/artifacts?name=${artifactName}`,
      "--jq",
      ".artifacts | map(select(.expired == false)) | .[0].id // empty",
    ]);
    if (!artifactId) {
      return false;
    }

    const zipPath = join(tempDir, "session.zip");
    const proc = spawnSync(
      "gh",
      ["api", `repos/${this.repo}/actions/artifacts/${artifactId}/zip`],
      {
        env: process.env,
        maxBuffer: MAX_BUFFER_SIZE,
      },
    );
    if (proc.status !== 0) {
      return false;
    }

    writeFileSync(zipPath, proc.stdout);
    const unzipProc = spawnSync("unzip", ["-q", "-o", zipPath, "-d", sessionDir], {
      maxBuffer: MAX_BUFFER_SIZE,
    });
    return unzipProc.status === 0;
  }
}

export function runReview(config: ReviewConfig): void {
  const { prNumber, repo, eventName, commentBody, runnerTemp } = config;
  const client = new GitHubClient(repo, prNumber);

  const commentId = client.createPlaceholderComment();
  const sessionDir = join(runnerTemp, "pi-session");
  const outputFile = join(runnerTemp, "review-output.md");
  const artifactName = `pi-session-pr-${prNumber}`;

  try {
    const wantsContinue = parseReviewMode(eventName, commentBody);
    let hasSession = false;

    mkdirSync(sessionDir, { recursive: true });

    if (wantsContinue) {
      hasSession = client.restoreSessionArtifact(sessionDir, artifactName, runnerTemp);
    } else {
      rmSync(sessionDir, { recursive: true, force: true });
      mkdirSync(sessionDir, { recursive: true });
    }

    if (!existsSync(".pi")) {
      mkdirSync(".pi", { recursive: true });
    }

    const piArgs = ["-p", "--approve"];
    if (wantsContinue && hasSession) {
      piArgs.push("-c");
    }
    piArgs.push("--session-dir", sessionDir, "/review branch main");

    const proc = spawnSync("pi", piArgs, {
      env: {
        ...process.env,
        PI_CODING_AGENT_DIR: join(runnerTemp, "pi-agent"),
      },
      encoding: "utf-8",
      maxBuffer: MAX_BUFFER_SIZE,
    });

    if (proc.status !== 0) {
      throw new Error(`pi review failed with exit code ${proc.status}: ${proc.stderr || ""}`);
    }

    const output = proc.stdout?.trim() || "未检测到审查意见。";
    writeFileSync(outputFile, output, "utf-8");
    client.updateComment(commentId, outputFile);
  } catch (error) {
    try {
      client.updateCommentText(commentId, "Timi AI 审查执行失败，详情请查看 Actions 运行日志。");
    } catch {
      // 忽略兜底更新失败
    }
    throw error;
  }
}

if (import.meta.main) {
  const config: ReviewConfig = {
    prNumber: process.env.PR_NUMBER || "",
    repo: process.env.GH_REPO || process.env.GITHUB_REPOSITORY || "",
    eventName: process.env.EVENT_NAME || process.env.GITHUB_EVENT_NAME || "",
    commentBody: process.env.COMMENT_BODY || "",
    runnerTemp: process.env.RUNNER_TEMP || "/tmp",
  };

  if (!config.prNumber || !config.repo) {
    process.stderr.write("Missing PR_NUMBER or GH_REPO configuration.\n");
    process.exit(1);
  }

  try {
    runReview(config);
  } catch (error) {
    process.stderr.write(
      `AI Review execution failed: ${error instanceof Error ? error.stack || error.message : String(error)}\n`,
    );
    process.exit(1);
  }
}
