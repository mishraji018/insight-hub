import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, FileText, History, User } from 'lucide-react-native';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Pages');

  const tabs = ['Pages', 'History', 'Users'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.inputContainer}>
          <Search size={20} color="#6b6b80" />
          <TextInput returnKeyType="done"
            placeholder="Search Insights Hub..."
            placeholderTextColor="#6b6b80"
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity activeOpacity={0.7} 
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab ? styles.tabActive : styles.tabInactive]}
          >
            <Text style={[styles.tabText, activeTab === tab ? styles.textWhite : styles.textMuted]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.px6} keyboardShouldPersistTaps="handled">
        {query === '' ? (
          <View style={styles.emptyContainer}>
             <Search size={48} color="#6b6b80" style={styles.mb16} />
             <Text style={styles.emptyText}>Start typing to search across{'\n'}pages, history, and users.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {[1, 2, 3].map((item, i) => (
              <TouchableOpacity activeOpacity={0.7} key={i} style={[styles.listItem, i !== 2 && styles.borderBottom]}>
                <View style={styles.iconBox}>
                  {activeTab === 'Pages' ? <FileText color="#6c63ff" size={18} /> : 
                   activeTab === 'History' ? <History color="#00d68f" size={18} /> : 
                   <User color="#ffb830" size={18} />}
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.itemTitle}>
                    {activeTab === 'Pages' ? 'Analytics Dashboard' : 
                     activeTab === 'History' ? 'Generated Sales PDF' : 
                     'John Doe'}
                  </Text>
                  <Text style={styles.itemSubtitle}>
                     {activeTab === 'Pages' ? 'View your data' : 
                     activeTab === 'History' ? '2 days ago' : 
                     'john.doe@example.com'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  inputContainer: {
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tab: {
    marginRight: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
  },
  tabActive: {
    borderColor: '#6c63ff',
  },
  tabInactive: {
    borderColor: 'transparent',
  },
  tabText: {
    fontWeight: '700',
  },
  textWhite: {
    color: '#ffffff',
  },
  textMuted: {
    color: '#6b6b80',
  },
  px6: {
    paddingHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    opacity: 0.5,
  },
  mb16: {
    marginBottom: 16,
  },
  emptyText: {
    color: '#6b6b80',
    fontWeight: '700',
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  flex1: {
    flex: 1,
  },
  itemTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  itemSubtitle: {
    color: '#6b6b80',
    fontSize: 12,
  }
});
