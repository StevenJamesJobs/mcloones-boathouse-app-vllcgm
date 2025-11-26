
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
  height = 350,
}: OpenTableWidgetProps) {
  // Construct the OpenTable widget HTML
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
            background-color: transparent;
          }
          #ot-widget-container {
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div id="ot-widget-container"></div>
        <script type='text/javascript' src='//www.opentable.com/widget/reservation/loader?rid=${restaurantId}&type=${theme}&theme=wide&color=${color}&dark=${dark}&iframe=true&domain=com&lang=en-US&newtab=false&ot_source=McLoones%20Boathouse%20App&cfe=true'></script>
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
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        )}
        scrollEnabled={false}
        bounces={false}
        scalesPageToFit={Platform.OS === 'android'}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        // Allow the widget to open links in external browser
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
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
    backgroundColor: colors.background,
  },
});
