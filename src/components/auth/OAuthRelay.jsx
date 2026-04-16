// components/OAuthRelay.js
import React, { useEffect } from 'react';

const OAuthRelay = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const userStr = params.get('user');
    const error = params.get('error');

    console.log('OAuth Relay - Params received:', { accessToken, userStr, error });

    if (window.opener) {
      if (error) {
        window.opener.postMessage({
          type: 'social-auth-failure',
          error: error
        }, window.location.origin);
      } else if (accessToken && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          window.opener.postMessage({
            type: 'social-auth-success',
            accessToken,
            user
          }, window.location.origin);
          console.log('OAuth Relay - Message sent to parent');
        } catch (err) {
          console.error('Failed to parse user data:', err);
          window.opener.postMessage({
            type: 'social-auth-failure',
            error: 'Failed to parse user data'
          }, window.location.origin);
        }
      } else {
        window.opener.postMessage({
          type: 'social-auth-failure',
          error: 'Missing authentication data'
        }, window.location.origin);
      }
      
      // Close popup after sending message
      setTimeout(() => {
        window.close();
      }, 100);
    } else {
      console.error('OAuth Relay - No opener window found');
    }
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif' 
    }}>
      <div>
        <div style={{ marginBottom: '10px' }}>Processing authentication...</div>
        <div style={{ fontSize: '12px', color: '#666' }}>Please wait while we complete your sign-in.</div>
      </div>
    </div>
  );
};

export default OAuthRelay;
