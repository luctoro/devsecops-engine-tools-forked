import { IMetricsData } from "../../domain/model/metrics/IMetricsData";
import { LogAnalysisService } from "./LogAnalysisService";

export class ScanStatusService {
    public static determineScanStatus(
        scanSuccess: boolean,
        findingsCount: number,
        hasLogErrors: boolean,
        outputLogs?: string[],
        exceptionMessage?: string
    ): IMetricsData['scan_status'] {
        if (hasLogErrors || !scanSuccess) {
            // Classify the specific error type
            const errorMessages: string[] = [];
            
            if (outputLogs) {
                errorMessages.push(...LogAnalysisService.getErrorMessages(outputLogs));
            }
            
            if (exceptionMessage) {
                errorMessages.push(exceptionMessage);
            }
            
            return LogAnalysisService.classifyErrors(errorMessages);
        }
        
        return findingsCount > 0
            ? 'Success with findings'
            : 'Success with no findings';
    }
}