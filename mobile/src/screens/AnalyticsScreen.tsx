import React from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import { TrendingUp, Users, Activity } from 'lucide-react-native';

export default function AnalyticsScreen() {
  const screenWidth = Dimensions.get('window').width;

  const data = {
    labels: ["Logins", "Exports", "Charts", "Models"],
    datasets: [
      {
        data: [120, 45, 80, 20]
      }
    ]
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Usage <Text style={styles.primaryText}>Analytics</Text></Text>
        <Text style={styles.subtitle}>Your activity breakdown</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.marginRight8]}>
            <View style={styles.iconWrapper}><TrendingUp color="#00d68f" size={24} /></View>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Growth</Text>
          </View>
          <View style={[styles.statCard, styles.marginHorizontal4]}>
            <View style={styles.iconWrapper}><Users color="#6c63ff" size={24} /></View>
            <Text style={styles.statValue}>1.2k</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={[styles.statCard, styles.marginLeft8]}>
            <View style={styles.iconWrapper}><Activity color="#ffb830" size={24} /></View>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Features</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Most Used Features</Text>
        <View style={styles.chartContainer}>
            <BarChart
              data={data}
              width={screenWidth - 80}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#13131a',
                backgroundGradientFrom: '#13131a',
                backgroundGradientTo: '#13131a',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 107, 128, ${opacity})`,
                style: { borderRadius: 16 },
                formatYLabel: (yLabel) => parseInt(yLabel).toString()
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              withHorizontalLabels={false}
            />
        </View>

        <Text style={styles.sectionTitle}>Login History</Text>
        <View style={styles.historyContainer}>
            {[1, 2, 3, 4].map((item, i) => (
              <View key={i} style={[styles.historyRow, i !== 3 && styles.borderBottom]}>
                <View>
                  <Text style={styles.historyTitle}>MacBook Pro (Chrome)</Text>
                  <Text style={styles.historySubtitle}>San Francisco, CA</Text>
                </View>
                <Text style={styles.activeTag}>Active</Text>
              </View>
            ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  primaryText: {
    color: '#6c63ff',
  },
  subtitle: {
    color: '#6b6b80',
    marginTop: 4, // equivalent to mt-1 visually or close to it
  },
  scrollContent: {
    paddingBottom: 100,
  },
  scrollView: {
    padding: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  marginRight8: {
    marginRight: 8,
  },
  marginHorizontal4: {
    marginRight: 4,
    marginLeft: 4,
  },
  marginLeft8: {
    marginLeft: 8,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  statValue: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 20,
  },
  statLabel: {
    color: '#6b6b80',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 32,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  historyContainer: {
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  historyTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  historySubtitle: {
    color: '#6b6b80',
    fontSize: 12,
  },
  activeTag: {
    color: '#6c63ff',
    fontWeight: '700',
    fontSize: 12,
  }
});
