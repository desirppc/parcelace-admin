/**
 * Test utility for tracking authentication flow
 * This file helps test the OTP-based authentication system for public tracking
 */

import TrackingAuthService from '@/services/trackingAuthService';
import FeedbackService from '@/services/feedbackService';

export interface TrackingAuthTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export class TrackingAuthTester {
  /**
   * Test the complete authentication flow
   * @param awbNumber - The AWB number to test with
   * @param testOTP - The OTP to use for testing (optional)
   * @returns Promise<TrackingAuthTestResult>
   */
  static async testCompleteFlow(awbNumber: string, testOTP?: string): Promise<TrackingAuthTestResult> {
    try {
      console.log('🧪 Starting tracking authentication test for AWB:', awbNumber);
      
      // Step 1: Test OTP sending
      console.log('📤 Step 1: Testing OTP sending...');
      const sendResult = await TrackingAuthService.sendOTP(awbNumber);
      
      if (!sendResult.status) {
        return {
          success: false,
          message: `Failed to send OTP: ${sendResult.message}`,
          details: sendResult
        };
      }
      
      console.log('✅ OTP sent successfully:', sendResult.data.message);
      
      // Step 2: Test OTP verification (if test OTP provided)
      if (testOTP) {
        console.log('🔐 Step 2: Testing OTP verification...');
        const verifyResult = await TrackingAuthService.verifyOTP(awbNumber, testOTP);
        
        if (!verifyResult.status) {
          return {
            success: false,
            message: `Failed to verify OTP: ${verifyResult.message}`,
            details: { sendResult, verifyResult }
          };
        }
        
        console.log('✅ OTP verified successfully:', verifyResult.data.message);
        console.log('🔑 Token received:', verifyResult.data.token);
        
        // Step 3: Test token storage and retrieval
        console.log('💾 Step 3: Testing token storage...');
        const isAuthenticated = TrackingAuthService.isAuthenticated();
        const storedToken = TrackingAuthService.getToken();
        
        if (!isAuthenticated || !storedToken) {
          return {
            success: false,
            message: 'Token storage failed - authentication status incorrect',
            details: { 
              sendResult, 
              verifyResult, 
              isAuthenticated, 
              storedToken 
            }
          };
        }
        
        console.log('✅ Token stored and retrieved successfully');
        
        // Step 4: Test auth headers
        console.log('📋 Step 4: Testing auth headers...');
        const authHeaders = TrackingAuthService.getAuthHeaders();
        
        if (!authHeaders.Authorization || !authHeaders.Authorization.includes('Bearer')) {
          return {
            success: false,
            message: 'Auth headers generation failed',
            details: { 
              sendResult, 
              verifyResult, 
              isAuthenticated, 
              storedToken,
              authHeaders 
            }
          };
        }
        
        console.log('✅ Auth headers generated successfully');
        
        // Step 5: Test token clearing
        console.log('🗑️ Step 5: Testing token clearing...');
        TrackingAuthService.clearToken();
        const isAuthenticatedAfterClear = TrackingAuthService.isAuthenticated();
        
        if (isAuthenticatedAfterClear) {
          return {
            success: false,
            message: 'Token clearing failed - still authenticated after clear',
            details: { 
              sendResult, 
              verifyResult, 
              isAuthenticated, 
              storedToken,
              authHeaders,
              isAuthenticatedAfterClear 
            }
          };
        }
        
        console.log('✅ Token cleared successfully');
        
        return {
          success: true,
          message: 'Complete authentication flow test passed!',
          details: {
            sendResult,
            verifyResult,
            tokenReceived: verifyResult.data.token,
            authHeaders,
            testSteps: [
              'OTP sending',
              'OTP verification', 
              'Token storage',
              'Auth headers generation',
              'Token clearing'
            ]
          }
        };
      } else {
        return {
          success: true,
          message: 'OTP sending test passed! (Skipping verification - no test OTP provided)',
          details: {
            sendResult,
            note: 'Provide testOTP parameter to test complete flow'
          }
        };
      }
      
    } catch (error) {
      console.error('❌ Tracking authentication test failed:', error);
      return {
        success: false,
        message: `Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }
  
  /**
   * Test OTP sending only
   * @param awbNumber - The AWB number to test with
   * @returns Promise<TrackingAuthTestResult>
   */
  static async testOTPSending(awbNumber: string): Promise<TrackingAuthTestResult> {
    try {
      console.log('📤 Testing OTP sending for AWB:', awbNumber);
      
      const result = await TrackingAuthService.sendOTP(awbNumber);
      
      if (result.status) {
        return {
          success: true,
          message: 'OTP sending test passed!',
          details: result
        };
      } else {
        return {
          success: false,
          message: `OTP sending failed: ${result.message}`,
          details: result
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `OTP sending test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }
  
  /**
   * Test token management (storage, retrieval, clearing)
   * @param testToken - A test token to use
   * @returns TrackingAuthTestResult
   */
  static testTokenManagement(testToken: string = 'test_token_123'): TrackingAuthTestResult {
    try {
      console.log('💾 Testing token management...');
      
      // Test token storage
      TrackingAuthService.storeToken(testToken);
      const retrievedToken = TrackingAuthService.getToken();
      const isAuthenticated = TrackingAuthService.isAuthenticated();
      
      if (retrievedToken !== testToken || !isAuthenticated) {
        return {
          success: false,
          message: 'Token storage/retrieval failed',
          details: { testToken, retrievedToken, isAuthenticated }
        };
      }
      
      // Test auth headers
      const authHeaders = TrackingAuthService.getAuthHeaders();
      if (!authHeaders.Authorization || !authHeaders.Authorization.includes(testToken)) {
        return {
          success: false,
          message: 'Auth headers generation failed',
          details: { testToken, retrievedToken, isAuthenticated, authHeaders }
        };
      }
      
      // Test token clearing
      TrackingAuthService.clearToken();
      const tokenAfterClear = TrackingAuthService.getToken();
      const isAuthenticatedAfterClear = TrackingAuthService.isAuthenticated();
      
      if (tokenAfterClear || isAuthenticatedAfterClear) {
        return {
          success: false,
          message: 'Token clearing failed',
          details: { 
            testToken, 
            retrievedToken, 
            isAuthenticated, 
            authHeaders,
            tokenAfterClear,
            isAuthenticatedAfterClear 
          }
        };
      }
      
      return {
        success: true,
        message: 'Token management test passed!',
        details: {
          testToken,
          retrievedToken,
          isAuthenticated,
          authHeaders,
          tokenAfterClear,
          isAuthenticatedAfterClear
        }
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Token management test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }
  
  /**
   * Test feedback submission (requires authentication)
   * @param awbNumber - The AWB number to test with
   * @param testRating - The rating to test (1-5)
   * @param testNpsScore - The NPS score to test (0-10)
   * @param testRemark - The remark text to test
   * @returns Promise<TrackingAuthTestResult>
   */
  static async testFeedbackSubmission(
    awbNumber: string, 
    testRating: number = 4, 
    testNpsScore: number = 8, 
    testRemark: string = 'Test feedback submission'
  ): Promise<TrackingAuthTestResult> {
    try {
      console.log('🧪 Testing feedback submission...');
      
      if (!TrackingAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required for feedback testing',
          details: { note: 'Please authenticate first using testCompleteFlow' }
        };
      }
      
      // Test rating submission
      console.log('📊 Testing rating submission...');
      const apiRating = FeedbackService.convertNumericRatingToAPI(testRating);
      const ratingResult = await FeedbackService.submitRating(apiRating, awbNumber);
      
      if (!ratingResult.status) {
        return {
          success: false,
          message: `Rating submission failed: ${ratingResult.error?.message || ratingResult.message}`,
          details: { ratingResult }
        };
      }
      
      console.log('✅ Rating submitted successfully');
      
      // Test NPS submission
      console.log('⭐ Testing NPS submission...');
      const npsResult = await FeedbackService.submitNPS(testNpsScore, testRemark, awbNumber);
      
      if (!npsResult.status) {
        return {
          success: false,
          message: `NPS submission failed: ${npsResult.error?.message || npsResult.message}`,
          details: { ratingResult, npsResult }
        };
      }
      
      console.log('✅ NPS submitted successfully');
      
      return {
        success: true,
        message: 'Feedback submission test passed!',
        details: {
          ratingResult,
          npsResult,
          testData: {
            rating: testRating,
            npsScore: testNpsScore,
            remark: testRemark
          }
        }
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Feedback submission test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }

  /**
   * Run all tests
   * @param awbNumber - The AWB number to test with
   * @param testOTP - The OTP to use for testing (optional)
   * @param testFeedback - Whether to test feedback submission (requires authentication)
   * @returns Promise<TrackingAuthTestResult>
   */
  static async runAllTests(awbNumber: string, testOTP?: string, testFeedback: boolean = false): Promise<TrackingAuthTestResult> {
    console.log('🧪 Running all tracking authentication tests...');
    
    // Test 1: Token management
    console.log('Test 1: Token Management');
    const tokenTest = this.testTokenManagement();
    if (!tokenTest.success) {
      return tokenTest;
    }
    
    // Test 2: OTP sending
    console.log('Test 2: OTP Sending');
    const otpTest = await this.testOTPSending(awbNumber);
    if (!otpTest.success) {
      return otpTest;
    }
    
    // Test 3: Complete flow (if OTP provided)
    if (testOTP) {
      console.log('Test 3: Complete Authentication Flow');
      const completeTest = await this.testCompleteFlow(awbNumber, testOTP);
      if (!completeTest.success) {
        return completeTest;
      }
    }
    
    // Test 4: Feedback submission (if requested and authenticated)
    if (testFeedback && testOTP) {
      console.log('Test 4: Feedback Submission');
      const feedbackTest = await this.testFeedbackSubmission(awbNumber);
      if (!feedbackTest.success) {
        return feedbackTest;
      }
    }
    
    return {
      success: true,
      message: 'All tracking authentication tests passed!',
      details: {
        tokenTest,
        otpTest,
        completeTest: testOTP ? 'Complete flow tested' : 'Complete flow skipped (no OTP provided)',
        feedbackTest: testFeedback && testOTP ? 'Feedback submission tested' : 'Feedback submission skipped'
      }
    };
  }
}

// Export convenience functions
export const testTrackingAuth = TrackingAuthTester.testCompleteFlow;
export const testOTPSending = TrackingAuthTester.testOTPSending;
export const testTokenManagement = TrackingAuthTester.testTokenManagement;
export const testFeedbackSubmission = TrackingAuthTester.testFeedbackSubmission;
export const runAllTrackingAuthTests = TrackingAuthTester.runAllTests;

export default TrackingAuthTester;
