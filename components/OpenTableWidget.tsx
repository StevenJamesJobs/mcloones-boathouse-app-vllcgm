
import React from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '@/styles/commonStyles';

interface OpenTableWidgetProps {
  restaurantId?: string;
  theme?: 'standard' | 'wide' | 'tall';
  color?: string;
  dark?: boolean;
  height?: number;
}

export function OpenTableWidget({
  restaurantId = '69187',
  theme = 'standard',
  color = '5',
  dark = false,
  height = 180,
}: OpenTableWidgetProps) {
  // Construct the OpenTable widget HTML with proper script loading
  const widgetHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: transparent;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          #ot-widget-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          /* OpenTable widget styling overrides */
          .ot-dtp-picker,
          .ot-dtp-picker-selector {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          .ot-dtp-picker-selector select,
          .ot-dtp-picker-selector input,
          .ot-dtp-picker-selector button {
            background-color: white !important;
            border: 1px solid #d0d0d0 !important;
            border-radius: 4px !important;
            padding: 10px 12px !important;
            font-size: 14px !important;
            color: #333 !important;
            margin: 4px !important;
          }
          .ot-dtp-picker-button,
          .ot-button,
          button[type="submit"],
          .ot-button--primary {
            background-color: #da3743 !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 12px 20px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: background-color 0.2s !important;
            margin: 4px !important;
          }
          .ot-dtp-picker-button:hover,
          .ot-button:hover,
          button[type="submit"]:hover,
          .ot-button--primary:hover {
            background-color: #c02a35 !important;
          }
          /* Compact layout */
          .ot-dtp-picker {
            max-height: 160px !important;
            padding: 8px !important;
          }
          /* Hide logo for compact view */
          .ot-dtp-picker-logo,
          .ot-logo {
            display: none !important;
          }
          /* Ensure proper sizing */
          iframe {
            border: none !important;
            width: 100% !important;
            height: 100% !important;
          }
        </style>
      </head>
      <body>
        <div id="ot-widget-container">
          <!-- OpenTable widget will load here -->
        </div>
        <script type='text/javascript' src='//www.opentable.com/widget/reservation/loader?rid=${restaurantId}&type=${theme}&theme=${theme}&color=${color}&dark=${dark}&iframe=true&domain=com&lang=en-US&newtab=false&ot_source=Restaurant%20App&cfe=true'></script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: widgetHTML }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#da3743" />
          </View>
        )}
        scrollEnabled={false}
        bounces={false}
        scalesPageToFit={Platform.OS === 'android'}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onShouldStartLoadWithRequest={(request) => {
          // Allow OpenTable domains and data URIs
          if (
            request.url.includes('opentable.com') ||
            request.url.startsWith('about:blank') ||
            request.url.startsWith('data:') ||
            request.url.startsWith('http')
          ) {
            return true;
          }
          return true;
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent.statusCode);
        }}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  webview: {
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
