import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Reporting could go here
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong!</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <TouchableOpacity 
            style={styles.retryBtn}
            activeOpacity={0.7}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24, // p-6
    backgroundColor: '#0a0a0f',
  },
  title: {
    fontSize: 24, // text-2xl
    fontWeight: '900', // font-black
    color: '#ffffff',
    marginBottom: 16, // mb-4
  },
  message: {
    color: 'rgba(255,255,255,0.6)', // text-white/60
    textAlign: 'center',
    marginBottom: 32, // mb-8
  },
  retryBtn: {
    backgroundColor: '#6c63ff',
    paddingHorizontal: 32, // px-8
    paddingVertical: 16, // py-4
    borderRadius: 12, // rounded-xl
    elevation: 8,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  retryText: {
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});

export default ErrorBoundary;
