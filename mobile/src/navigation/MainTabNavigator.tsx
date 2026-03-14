import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, BarChart3, Search, User } from 'lucide-react-native';
import DashboardScreen from '../screens/DashboardScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Analytics: undefined;
  Search: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => (
  <Tab.Navigator 
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let IconComponent;
        if (route.name === 'Dashboard') IconComponent = LayoutDashboard;
        else if (route.name === 'Analytics') IconComponent = BarChart3;
        else if (route.name === 'Search') IconComponent = Search;
        else IconComponent = User;

        return <IconComponent color={color} size={size} />;
      },
      tabBarActiveTintColor: '#6c63ff',
      tabBarInactiveTintColor: '#6b6b80',
      tabBarStyle: {
        backgroundColor: '#13131a',
        borderTopWidth: 0,
        height: 60,
        paddingBottom: 10,
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);
