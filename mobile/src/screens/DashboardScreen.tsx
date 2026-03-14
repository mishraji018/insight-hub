import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { LogIn, Calendar, Activity, Clock, ChevronRight } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';

export default function DashboardScreen() {
  const user = useAuthStore(s => s.user);
  const screenWidth = Dimensions.get('window').width;
  const [showChart, setShowChart] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowChart(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Total Logins', value: '142', icon: LogIn, color: '#6c63ff' },
    { label: 'Days Active', value: '45', icon: Calendar, color: '#00d68f' },
    { label: 'Features Used', value: '12', icon: Activity, color: '#ffb830' },
    { label: 'Last Seen', value: 'Today', icon: Clock, color: '#ff4d6d' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back,</Text>
        <Text style={styles.primaryTitle}>{user?.first_name || 'User'}!</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView showsVerticalScrollIndicator={false} 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
        >
          {stats.map((stat, i) => (
            <View key={i} style={[styles.statCard, styles.marginRight16]}>
              <View style={[styles.iconBox, { backgroundColor: `${stat.color}20` }]}>
                <stat.icon color={stat.color} size={20} />
              </View>
              <View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
          <View style={styles.spacer} />
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Overview</Text>
          <View style={styles.chartContainer}>
            {showChart ? (
              <LineChart
                data={{
                  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                  datasets: [{ data: [20, 45, 28, 80, 99, 43, 50] }]
                }}
                width={screenWidth - 64}
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
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#13131a"
                  }
                }}
                bezier
                style={styles.chart}
              />
            ) : (
              <Text style={styles.loadingText}>Loading Chart...</Text>
            )}
          </View>
        </View>

        <View style={styles.px4}>
          <Text style={styles.sectionTitle}>Recent Actions</Text>
          <View style={styles.actionsContainer}>
            {[1, 2, 3].map((item, i) => (
              <TouchableOpacity activeOpacity={0.7} key={i} style={[styles.actionRow, i !== 2 && styles.borderBottom]}>
                <View style={styles.actionIcon}>
                  <Activity color="#6c63ff" size={18} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.actionTitle}>Generated Report</Text>
                  <Text style={styles.actionSubtitle}>2 hours ago</Text>
                </View>
                <ChevronRight color="#6b6b80" size={20} />
              </TouchableOpacity>
            ))}
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  primaryTitle: {
    color: '#6c63ff',
    fontSize: 30,
    fontWeight: '900',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statsScroll: {
    paddingLeft: 16,
    marginBottom: 32,
    height: 128,
  },
  statCard: {
    backgroundColor: '#13131a',
    width: 144,
    padding: 16,
    borderRadius: 24,
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  marginRight16: {
    marginRight: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#6b6b80',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  spacer: {
    width: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
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
    minHeight: 220,
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 12,
  },
  px4: {
    paddingHorizontal: 16,
  },
  actionsContainer: {
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(108,99,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  flex1: {
    flex: 1,
  },
  actionTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  actionSubtitle: {
    color: '#6b6b80',
    fontSize: 12,
  }
});
