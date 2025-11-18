
import { IMetricsData } from '../../domain/model/metrics/IMetricsData';
import { ErrorPatternService } from './ErrorPatternService';

type ErrorStatus = 'Docker Error' | 'Network Error' | 'Image Error' | 'Scanner Error' | 'Authentication Error' | 'Timeout Error' | 'Error';

export class LogAnalysisService {

    /**
     * Map error category to scan status
     */
    private static mapCategoryToStatus(category: string): ErrorStatus {
        const statusMap: { [key: string]: ErrorStatus } = {
            'Docker Daemon': 'Docker Error',
            'Image Not Found': 'Image Error',
            'Network Connectivity': 'Network Error',
            'Scanner Engine': 'Scanner Error',
            'Container Runtime': 'Docker Error',
            'Timeout': 'Timeout Error',
            'Authentication': 'Authentication Error',
            'JSON Parsing': 'Error',
            'Operation Cancelled': 'Error',
            'Unknown': 'Error'
        };
        return statusMap[category] || 'Error';
    }

    /**
     * Classify an error message based on predefined patterns
     */
    public static classifyError(errorMessage: string): ErrorStatus {
        if (!errorMessage || typeof errorMessage !== 'string') {
            return 'Error';
        }

        const patterns = ErrorPatternService.getPatterns();
        const normalizedMessage = errorMessage.toLowerCase().trim();

        for (const [category, categoryPatterns] of Object.entries(patterns)) {
            if (category === 'Success Indicators' || category === 'General Errors') continue;
            
            for (const pattern of categoryPatterns) {
                if (normalizedMessage.includes(pattern.toLowerCase())) {
                    return this.mapCategoryToStatus(category);
                }
            }
        }

        return 'Error';
    }

    /**
     * Classify multiple error messages and return the most specific status
     */
    public static classifyErrors(errorMessages: string[]): ErrorStatus {
        if (!errorMessages || errorMessages.length === 0) {
            return 'Error';
        }

        const statuses = errorMessages.map(msg => this.classifyError(msg));
        const specificStatuses = statuses.filter((status): status is Exclude<ErrorStatus, 'Error'> => status !== 'Error');

        if (specificStatuses.length === 0) {
            return 'Error';
        }

        // Priority order for error statuses (most specific first)
        const priorityOrder: Array<Exclude<ErrorStatus, 'Error'>> = [
            'Docker Error',
            'Network Error',
            'Authentication Error',
            'Image Error',
            'Scanner Error',
            'Timeout Error'
        ];

        // Return the highest priority status found
        for (const priority of priorityOrder) {
            if (specificStatuses.includes(priority)) {
                return priority;
            }
        }

        return specificStatuses[0];
    }

    public static hasErrors(logs: string[]): boolean {
        if (!logs || logs.length === 0) {
            return false;
        }

        const errorCategories = ErrorPatternService.getErrorCategories();
        const patterns = ErrorPatternService.getPatterns();

        return logs.some(log => {
            const normalizedLog = log.toLowerCase().trim();
            return errorCategories.some(category => {
                return patterns[category].some((pattern: string) => 
                    normalizedLog.includes(pattern.toLowerCase())
                );
            });
        });
    }

    public static extractExceptionMessage(
        logs: string[],
        findingsCount: number,
        providedMessage?: string
    ): string {
        if (providedMessage) {
            return providedMessage;
        }

        if (logs && logs.length > 0) {
            const successPatterns = ErrorPatternService.getSuccessPatterns();

            // Look for success messages first
            const foundMessage = logs.find(log => {
                const normalizedLog = log.toLowerCase().trim();
                return successPatterns.some((pattern: string) => 
                    normalizedLog.includes(pattern.toLowerCase()) && 
                    normalizedLog.includes('found')
                );
            });
            if (foundMessage) {
                return foundMessage;
            }

            // Look for error messages
            const errorMessages = this.getErrorMessages(logs);
            if (errorMessages.length > 0) {
                return errorMessages[0];
            }
        }

        return `Found ${findingsCount} issues in scan`;
    }

    public static getErrorMessages(logs: string[]): string[] {
        if (!logs || logs.length === 0) {
            return [];
        }

        const errorCategories = ErrorPatternService.getErrorCategories();
        const patterns = ErrorPatternService.getPatterns();

        return logs.filter(log => {
            const normalizedLog = log.toLowerCase().trim();
            return errorCategories.some(category => {
                return patterns[category].some((pattern: string) => 
                    normalizedLog.includes(pattern.toLowerCase())
                );
            });
        });
    }

    public static indicatesSuccess(logs: string[]): boolean {
        if (!logs || logs.length === 0) {
            return false;
        }

        const successPatterns = ErrorPatternService.getSuccessPatterns();

        return logs.some(log => {
            const normalizedLog = log.toLowerCase().trim();
            return successPatterns.some((pattern: string) => 
                normalizedLog.includes(pattern.toLowerCase())
            );
        });
    }
}