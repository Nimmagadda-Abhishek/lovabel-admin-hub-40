import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const { isAuthenticated, createSession, adminEmail } = useAuth();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setError('');
    
    try {
      await ApiClient.sendOtp();
      setIsOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to ${adminEmail}`,
      });
    } catch (error) {
      console.error('Failed to send OTP:', error);
      setError('Failed to send OTP. Please try again.');
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await ApiClient.verifyOtp(adminEmail, otp.trim());
      
      if (response.status === 'success' || response.message.toLowerCase().includes('success')) {
        createSession();
        toast({
          title: "Login Successful",
          description: "Welcome to the admin panel!",
        });
      } else {
        setError('Invalid OTP. Please try again.');
        toast({
          title: "Invalid OTP",
          description: "Please check your OTP and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      setError('Verification failed. Please try again.');
      toast({
        title: "Verification Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isOtpSent) {
        handleSendOtp();
      } else {
        handleVerifyOtp();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-bg p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            {!isOtpSent 
              ? `Enter your admin credentials to continue` 
              : `Enter the OTP sent to ${adminEmail}`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              value={adminEmail}
              disabled
              className="bg-muted"
            />
          </div>

          {isOtpSent && (
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
            </div>
          )}

          <div className="space-y-2">
            {!isOtpSent ? (
              <Button 
                onClick={handleSendOtp} 
                disabled={isSendingOtp}
                className="w-full"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send OTP
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleVerifyOtp} 
                  disabled={isVerifying || !otp.trim()}
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify OTP
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtp('');
                    setError('');
                  }}
                  className="w-full"
                >
                  Request New OTP
                </Button>
              </>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {isOtpSent && (
              <p>Didn't receive the OTP? Check your spam folder or request a new one.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;