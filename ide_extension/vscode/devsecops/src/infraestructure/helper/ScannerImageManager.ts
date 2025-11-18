import { OutputChannel } from "vscode";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class ScannerImageManager {
  static async ensureScannerImageExists(
    containerEnginePath: string,
    containerImageName: string,
    toolVersion: string,
    outputChannel: OutputChannel
  ): Promise<boolean> {
    const imageTag = `${containerImageName}:${toolVersion}`;
    const checkCommand = `${containerEnginePath.replace("docker", "podman")} image inspect ${imageTag}`;

    try {
      const { stdout, stderr } = await execAsync(checkCommand);
      outputChannel.appendLine(`Scanner image ${imageTag} found locally.`);
      return true;

    } catch (error: any) {
      let errorMessage = error.message;
      
      if (error.message.includes("Cannot connect to the Docker daemon")) {
        outputChannel.appendLine(" 🐋 Docker is not running or not accessible. Please start Docker and try again.");
      } else if (error.message.includes("No such image")) {
        outputChannel.appendLine(`Scanner image ${imageTag} not found locally. Attempting to download...`);
        outputChannel.appendLine('');
      } else {
        outputChannel.appendLine(`Error checking for scanner image ${imageTag}: ${error.message}`);
      }
      console.log("errorcito", error.message);

      try {
        const pullCommand = `${containerEnginePath.replace("docker", "podman") } pull ${imageTag}`;
        const pullProcess = exec(pullCommand);

        pullProcess.stdout?.on('data', (data) => {
          outputChannel.append(data.toString());
        });

        pullProcess.stderr?.on('data', (data) => {
          outputChannel.append(data.toString());
        });

        const { stdout: pullStdout, stderr: pullStderr } = await execAsync(pullCommand);
        console.log("Pull command output:", pullStdout, pullStderr);
        outputChannel.appendLine('');
        outputChannel.appendLine(`Successfully downloaded scanner image ${imageTag}`);
        return true;

      } catch (pullError: any) {
        console.log("ScannerImageManager: Pull failed, error:", pullError.message);
        if (pullError.message.includes("Failed to download image") || pullError.message.includes("context deadline exceeded")) {
          outputChannel.appendLine("🛜 Failed to download image. Please check your internet connection or Docker configuration.");
        }
        else if (pullError.message.includes("manifest unknown") || pullError.message.includes("manifest is not known to the registry")) {
          outputChannel.appendLine(`⚠️ Please verify that version ${toolVersion} exists for image ${containerImageName}. You may need to check available versions or update your configuration.`);
          outputChannel.appendLine('');
        }
        else if (pullError.message.includes("request cancelled")) {
          throw new Error("Scan operation cancelled.");
        } else {
          outputChannel.appendLine(`❌ Failed to ensure scanner image is available. Please verify that the specified image version exists.`);
        }
        return false;
      }
    }
  }


}
