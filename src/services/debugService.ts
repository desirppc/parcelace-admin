export interface DebugStep {
  id: string;
  timestamp: Date;
  step: string;
  details: any;
  type: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
}

export interface DebugSession {
  id: string;
  query: string;
  steps: DebugStep[];
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
}

class DebugService {
  private sessions: Map<string, DebugSession> = new Map();
  private currentSession: DebugSession | null = null;

  /**
   * Start a new debug session
   */
  startSession(query: string): string {
    const sessionId = `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      id: sessionId,
      query,
      steps: [],
      startTime: new Date()
    };
    
    this.sessions.set(sessionId, this.currentSession);
    this.addStep('Session Started', { query }, 'info');
    
    return sessionId;
  }

  /**
   * End the current debug session
   */
  endSession(): DebugSession | null {
    if (!this.currentSession) return null;
    
    this.currentSession.endTime = new Date();
    this.currentSession.totalDuration = 
      this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();
    
    this.addStep('Session Ended', { 
      totalSteps: this.currentSession.steps.length,
      duration: this.currentSession.totalDuration 
    }, 'success');
    
    const session = this.currentSession;
    this.currentSession = null;
    return session;
  }

  /**
   * Add a debug step to the current session
   */
  addStep(step: string, details: any, type: 'info' | 'success' | 'error' | 'warning' = 'info', duration?: number): void {
    if (!this.currentSession) return;
    
    const debugStep: DebugStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date(),
      step,
      details,
      type,
      duration
    };
    
    this.currentSession.steps.push(debugStep);
  }

  /**
   * Get the current session
   */
  getCurrentSession(): DebugSession | null {
    return this.currentSession;
  }

  /**
   * Get all sessions
   */
  getAllSessions(): DebugSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Clear all sessions
   */
  clearSessions(): void {
    this.sessions.clear();
    this.currentSession = null;
  }

  /**
   * Format debug session for display
   */
  formatSessionForDisplay(session: DebugSession): string {
    let output = `🔍 **Debug Session: ${session.query}**\n\n`;
    output += `⏱️ **Duration:** ${session.totalDuration ? `${session.totalDuration}ms` : 'N/A'}\n`;
    output += `📊 **Total Steps:** ${session.steps.length}\n\n`;
    output += `**Process Flow:**\n\n`;

    session.steps.forEach((step, index) => {
      const timeStr = step.timestamp.toLocaleTimeString();
      const durationStr = step.duration ? ` (${step.duration}ms)` : '';
      
      // Add step number and icon based on type
      const stepIcon = {
        'info': 'ℹ️',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️'
      }[step.type];
      
      output += `${stepIcon} **Step ${index + 1}:** ${step.step} - ${timeStr}${durationStr}\n`;
      
      // Format details based on type
      if (step.details) {
        if (typeof step.details === 'object') {
          output += `   📋 **Details:**\n`;
          Object.entries(step.details).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              output += `   • ${key}: ${JSON.stringify(value, null, 2)}\n`;
            }
          });
        } else {
          output += `   📋 **Details:** ${step.details}\n`;
        }
      }
      
      output += '\n';
    });

    return output;
  }

  /**
   * Log API call details
   */
  logApiCall(endpoint: string, method: string, params: any, response: any, duration: number): void {
    this.addStep('API Call', {
      endpoint,
      method,
      params,
      response: response ? 'Success' : 'Failed',
      responseData: response
    }, response ? 'success' : 'error', duration);
  }

  /**
   * Log metric parsing
   */
  logMetricParsing(query: string, foundMetric: any, aliases: string[]): void {
    this.addStep('Metric Parsing', {
      query,
      foundMetric: foundMetric ? foundMetric.name : null,
      checkedAliases: aliases,
      result: foundMetric ? 'Found' : 'Not Found'
    }, foundMetric ? 'success' : 'warning');
  }

  /**
   * Log data point extraction
   */
  logDataPointExtraction(metric: string, dataPoints: string[]): void {
    this.addStep('Data Point Extraction', {
      metric,
      extractedDataPoints: dataPoints,
      count: dataPoints.length
    }, 'info');
  }

  /**
   * Log data fetching
   */
  logDataFetching(dataPoint: string, filters: any, result: any, duration: number): void {
    this.addStep('Data Fetching', {
      dataPoint,
      filters,
      result,
      success: result !== null && result !== undefined
    }, result !== null && result !== undefined ? 'success' : 'error', duration);
  }

  /**
   * Log calculation
   */
  logCalculation(formula: string, dataPoints: any, result: any): void {
    this.addStep('Calculation', {
      formula,
      dataPoints,
      result,
      success: result !== null && result !== undefined
    }, result !== null && result !== undefined ? 'success' : 'error');
  }

  /**
   * Log filter processing
   */
  logFilterProcessing(query: string, originalFilters: any, processedFilters: any): void {
    this.addStep('Filter Processing', {
      query,
      originalFilters,
      processedFilters,
      changes: JSON.stringify(originalFilters) !== JSON.stringify(processedFilters)
    }, 'info');
  }
}

export const debugService = new DebugService(); 