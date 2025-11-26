
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
  theme = 'wide',
  color = '1',
  dark = false,
  height = 200,
}: OpenTableWidgetProps) {
  // Construct the OpenTable widget HTML with custom styling to match the image
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
          body {
            overflow: hidden;
            background-color: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          #ot-widget-container {
            width: 100%;
            height: 100%;
            padding: 16px;
          }
          /* Override OpenTable widget styles to match the image */
          .ot-dtp-picker,
          .ot-dtp-picker-selector {
            background-color: #f5f5f5 !important;
          }
          .ot-dtp-picker-selector {
            border: none !important;
            box-shadow: none !important;
          }
          .ot-dtp-picker-selector select,
          .ot-dtp-picker-selector input {
            background-color: white !important;
            border: 1px solid #d0d0d0 !important;
            border-radius: 4px !important;
            padding: 12px !important;
            font-size: 16px !important;
            color: #333 !important;
          }
          .ot-dtp-picker-button,
          .ot-button,
          button[type="submit"] {
            background-color: #da3743 !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 12px 24px !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: background-color 0.2s !important;
          }
          .ot-dtp-picker-button:hover,
          .ot-button:hover,
          button[type="submit"]:hover {
            background-color: #c02a35 !important;
          }
          /* Compact layout */
          .ot-dtp-picker {
            max-height: 180px !important;
          }
          /* Hide unnecessary elements for compact view */
          .ot-dtp-picker-logo {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div id="ot-widget-container"></div>
        <script type='text/javascript' src='//www.opentable.com/widget/reservation/loader?rid=${restaurantId}&type=standard&theme=wide&color=1&dark=false&iframe=true&domain=com&lang=en-US&newtab=false&ot_source=McLoones%20Boathouse%20App&cfe=true'></script>
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
          // Allow OpenTable domains
          if (
            request.url.includes('opentable.com') ||
            request.url.startsWith('about:blank') ||
            request.url.startsWith('data:')
          ) {
            return true;
          }
          return true;
        }}
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
