'use client';

import { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    receiveFromApp?: (message: BridgeMessage) => void;
  }
}

export type SuperAppMessageType =
  | 'NOTIFICATION'
  | 'LOGOUT'
  | 'NAVIGATE'
  | 'CLOSE'
  | 'REFRESH'
  | 'BRIDGE_READY';

export interface BridgeMessage {
  type: string;
  payload?: any;
}

interface UseSuperAppBridgeOptions {
  onMessage?: (message: BridgeMessage) => void;
}

export function useSuperAppBridge(options?: UseSuperAppBridgeOptions) {
  const [isInWebView, setIsInWebView] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const sendToSuperApp = useCallback(
    (message: { type: SuperAppMessageType; payload?: any }) => {
      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    },
    []
  );

  const sendNotification = useCallback(
    (title: string, message: string) => {
      sendToSuperApp({
        type: 'NOTIFICATION',
        payload: { title, message, miniAppId: 'starvoices' },
      });
    },
    [sendToSuperApp]
  );

  const requestClose = useCallback(() => {
    sendToSuperApp({ type: 'CLOSE' });
  }, [sendToSuperApp]);

  const notifyLogout = useCallback(() => {
    sendToSuperApp({ type: 'LOGOUT' });
  }, [sendToSuperApp]);

  const navigateInSuperApp = useCallback(
    (path: string) => {
      sendToSuperApp({ type: 'NAVIGATE', payload: { path } });
    },
    [sendToSuperApp]
  );

  const requestRefresh = useCallback(() => {
    sendToSuperApp({ type: 'REFRESH' });
  }, [sendToSuperApp]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const inWebView = !!window.ReactNativeWebView;
    setIsInWebView(inWebView);

    window.receiveFromApp = (message: BridgeMessage) => {
      options?.onMessage?.(message);
    };

    if (inWebView) {
      sendToSuperApp({ type: 'BRIDGE_READY' });
      setIsReady(true);
    }

    return () => {
      window.receiveFromApp = undefined;
    };
  }, [sendToSuperApp, options]);

  return {
    isInWebView,
    isReady,
    sendToSuperApp,
    sendNotification,
    requestClose,
    notifyLogout,
    navigateInSuperApp,
    requestRefresh,
  };
}
