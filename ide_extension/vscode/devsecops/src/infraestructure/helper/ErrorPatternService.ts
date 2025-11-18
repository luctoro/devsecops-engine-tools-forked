/**
 * Error pattern definitions for log analysis and error classification.
 * Follows clean architecture principles by keeping patterns centralized and configurable.
 */
export interface ErrorPatterns {
    [category: string]: string[];
}

export class ErrorPatternService {
    private static readonly ERROR_PATTERNS: ErrorPatterns = {
        "Docker Daemon": [
            "Cannot connect to the Docker daemon",
            "Docker is not running",
            "docker daemon not running",
            "Is the docker daemon running",
            "Docker daemon socket",
            "Docker endpoint for",
            "connection refused",
            "manifest unknown",
            "manifest is not known to the registry",
            "manifest for",
            "not found: manifest unknown",
            "The named manifest is not known to the registry",
            "Error response from daemon"
        ],
        "Image Not Found": [
            "No such image",
            "image not found locally",
            "Error response from daemon: No such image",
            "Failed to ensure scanner image is available"
        ],
        "Network Connectivity": [
            "Failed to download image",
            "context deadline exceeded",
            "network timeout",
            "connection refused",
            "Error response from daemon: No such image: devsecops/engine-core",
            "pull access denied",
            "repository does not exist"
        ],
        "Scanner Engine": [
            "SCAN Error",
            "engine_core Error",
            "Error engine_core",
            "Error engine_iac",
            "Error engine_container",
            "Error engine_dependencies",
            "Error executing container command",
            "Failed to ensure scanner image",
            "✘Failed",
            "Scanner execution failed",
            "Engine execution error"
        ],
        "Container Runtime": [
            "Container not found",
            "container failed to start",
            "container exited with code"
        ],
        "Timeout": [
            "Scan timed out",
            "operation timed out",
            "timeout exceeded",
            "timeout"
        ],
        "Authentication": [
            "No Dependencies Token provided",
            "authentication failed",
            "unauthorized access"
        ],
        "JSON Parsing": [
            "Error parsing context JSON",
            "invalid JSON response",
            "malformed JSON"
        ],
        "Operation Cancelled": [
            "request cancelled",
            "operation cancelled",
            "scan cancelled"
        ],
        "General Errors": [
            "Error",
            "Failed"
        ],
        "Success Indicators": [
            "Successfully extracted context data",
            "✔Succeeded",
            "PHASE: COMPLETED",
            "Found",
            "issues in scan"
        ],
        "Unknown": [
            "Unknown error",
            "unexpected error"
        ]
    };

    /**
     * Get all error patterns
     * @returns Error patterns dictionary
     */
    public static getPatterns(): ErrorPatterns {
        return this.ERROR_PATTERNS;
    }

    /**
     * Get patterns for a specific category
     * @param category The error category
     * @returns Array of patterns for the category
     */
    public static getPatternsForCategory(category: string): string[] {
        return this.ERROR_PATTERNS[category] || [];
    }

    /**
     * Get all available error categories
     * @returns Array of category names
     */
    public static getCategories(): string[] {
        return Object.keys(this.ERROR_PATTERNS);
    }

    /**
     * Check if a category exists
     * @param category The category to check
     * @returns True if category exists
     */
    public static hasCategory(category: string): boolean {
        return category in this.ERROR_PATTERNS;
    }

    /**
     * Get error categories (excluding success indicators and general errors)
     * @returns Array of error category names
     */
    public static getErrorCategories(): string[] {
        return Object.keys(this.ERROR_PATTERNS).filter(category =>
            category !== 'Success Indicators' && category !== 'General Errors'
        );
    }

    /**
     * Get success indicator patterns
     * @returns Array of success patterns
     */
    public static getSuccessPatterns(): string[] {
        return this.ERROR_PATTERNS['Success Indicators'] || [];
    }
}