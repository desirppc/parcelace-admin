/**
 * Tracking Authentication Test Component
 * This component provides a UI to test the tracking authentication flow
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Shield, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TrackingAuthTester, { TrackingAuthTestResult } from '@/utils/testTrackingAuth';
import TrackingAuthService from '@/services/trackingAuthService';
import FeedbackService from '@/services/feedbackService';

const TrackingAuthTestComponent: React.FC = () => {
  const { toast } = useToast();
  const [awbNumber, setAwbNumber] = useState('18045110098943');
  const [testOTP, setTestOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TrackingAuthTestResult[]>([]);
  const [currentAuthStatus, setCurrentAuthStatus] = useState(false);
  
  // Feedback testing state
  const [testRating, setTestRating] = useState(4);
  const [testNpsScore, setTestNpsScore] = useState(8);
  const [testRemark, setTestRemark] = useState('Test feedback submission');

  const runFeedbackTest = async () => {
    setIsLoading(true);
    
    try {
      console.log('Testing feedback submission...');
      
      const result = await TrackingAuthTester.testFeedbackSubmission(
        awbNumber, 
        testRating, 
        testNpsScore, 
        testRemark
      );
      
      setTestResults(prev => [result, ...prev]);
      
      toast({
        title: result.success ? "Feedback Test Passed! ✅" : "Feedback Test Failed ❌",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
    } catch (error) {
      const errorResult: TrackingAuthTestResult = {
        success: false,
        message: `Feedback test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
      
      setTestResults(prev => [errorResult, ...prev]);
      
      toast({
        title: "Feedback Test Error",
        description: errorResult.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runTest = async (testType: 'otp' | 'complete' | 'token' | 'all' | 'feedback') => {
    setIsLoading(true);
    
    try {
      let result: TrackingAuthTestResult;
      
      switch (testType) {
        case 'otp':
          result = await TrackingAuthTester.testOTPSending(awbNumber);
          break;
        case 'complete':
          if (!testOTP) {
            toast({
              title: "Test OTP Required",
              description: "Please enter a test OTP to run the complete flow test",
              variant: "destructive"
            });
            return;
          }
          result = await TrackingAuthTester.testCompleteFlow(awbNumber, testOTP);
          break;
        case 'token':
          result = TrackingAuthTester.testTokenManagement();
          break;
        case 'all':
          result = await TrackingAuthTester.runAllTests(awbNumber, testOTP || undefined);
          break;
        case 'feedback':
          result = await TrackingAuthTester.testFeedbackSubmission(awbNumber, testRating, testNpsScore, testRemark);
          break;
        default:
          result = { success: false, message: 'Invalid test type' };
      }
      
      setTestResults(prev => [result, ...prev]);
      
      toast({
        title: result.success ? "Test Passed! ✅" : "Test Failed ❌",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
      // Update auth status
      setCurrentAuthStatus(TrackingAuthService.isAuthenticated());
      
    } catch (error) {
      const errorResult: TrackingAuthTestResult = {
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
      
      setTestResults(prev => [errorResult, ...prev]);
      
      toast({
        title: "Test Error",
        description: errorResult.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const clearAuth = () => {
    TrackingAuthService.clearToken();
    setCurrentAuthStatus(false);
    toast({
      title: "Authentication Cleared",
      description: "Tracking authentication token has been cleared",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-blue-600" />
            Tracking Authentication Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Configuration */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">AWB Number</label>
              <Input
                value={awbNumber}
                onChange={(e) => setAwbNumber(e.target.value)}
                placeholder="Enter AWB number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Test OTP (Optional)</label>
              <Input
                value={testOTP}
                onChange={(e) => setTestOTP(e.target.value)}
                placeholder="Enter test OTP"
              />
            </div>
          </div>

          {/* Feedback Test Configuration */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-3">Feedback Test Configuration</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Test Rating (1-5)</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={testRating}
                  onChange={(e) => setTestRating(parseInt(e.target.value) || 4)}
                  placeholder="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Test NPS Score (0-10)</label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={testNpsScore}
                  onChange={(e) => setTestNpsScore(parseInt(e.target.value) || 8)}
                  placeholder="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Test Remark</label>
                <Input
                  value={testRemark}
                  onChange={(e) => setTestRemark(e.target.value)}
                  placeholder="Test feedback submission"
                />
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Current Auth Status:</span>
            </div>
            <Badge variant={currentAuthStatus ? "default" : "secondary"}>
              {currentAuthStatus ? "Authenticated" : "Not Authenticated"}
            </Badge>
            {currentAuthStatus && (
              <Button variant="outline" size="sm" onClick={clearAuth}>
                Clear Auth
              </Button>
            )}
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Button
              onClick={() => runTest('otp')}
              disabled={isLoading || !awbNumber}
              variant="outline"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test OTP Send"}
            </Button>
            
            <Button
              onClick={() => runTest('complete')}
              disabled={isLoading || !awbNumber || !testOTP}
              variant="outline"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test Complete Flow"}
            </Button>
            
            <Button
              onClick={() => runTest('token')}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test Token Mgmt"}
            </Button>
            
            <Button
              onClick={() => runTest('feedback')}
              disabled={isLoading || !awbNumber || !currentAuthStatus}
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test Feedback"}
            </Button>
            
            <Button
              onClick={() => runTest('all')}
              disabled={isLoading || !awbNumber}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run All Tests"}
            </Button>
          </div>

          {/* Clear Results Button */}
          {testResults.length > 0 && (
            <div className="flex justify-end">
              <Button variant="ghost" onClick={clearResults}>
                Clear Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "PASS" : "FAIL"}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="font-medium mb-2">{result.message}</p>
                      {result.details && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrackingAuthTestComponent;
