import 'react-native-gesture-handler';
import React, { useState, useEffect, useContext } from 'react';
import Vehicles from './src/Screens/owner/Vehicles';
import OBookings from './src/Screens/owner/Bookings'
import OPayments from './src/Screens/owner/Payments'
import Profile from './src/Screens/owner/Profile';
import CompleteProfiles from './src/components/Profiles';
import Home from './src/Screens/User/Home';
import Today from './src/Screens/User/Today';
import Upcomming from './src/Screens/User/Upcomming';
import Recent from './src/Screens/User/Recent';
import Header from './src/components/Header'
import UPayments from './src/Screens/User/Payments';
import UProfile from './src/Screens/User/Profile';
import VehicleDetails from './src/Screens/User/VehicleDetails';
import SchedulingDetails from './src/Screens/User/SchedulingDetails';
import Icons from 'react-native-vector-icons/Ionicons'
import Tractor from 'react-native-vector-icons/FontAwesome5'
import RequestIcon from 'react-native-vector-icons/MaterialIcons'
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ImageBackground, ActivityIndicator, LogBox } from 'react-native';
import Login from './src/Screens/Main/Login'
import auth from '@react-native-firebase/auth'
import { UserContext, UserProvider } from './src/components/UserProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import RNBootSplash from "react-native-bootsplash";
import ChooseLanguage from './src/components/ChooseLanguage';

LogBox.ignoreAllLogs();

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();
const TopTab = createMaterialTopTabNavigator();
const BNavigation = () => {
  const userProfile = useContext(UserContext);
  const langchk = userProfile.langcheck;
  const [isLoggedIn, setisLoggedIn] = useState('');
  function stateChanged(user) {
    if (user) {
      userProfile.setuid(user);
      setisLoggedIn(true);
      setTimeout(() => { RNBootSplash.hide(); }, 2000);
    }
    else {
      setisLoggedIn(false);
      setTimeout(() => { RNBootSplash.hide(); }, 2000);
    }
  }

  useEffect(() => {
    auth().onAuthStateChanged(stateChanged)
  }, []);


  const HomeStack = () => {
    return (
      <Stack.Navigator
        screenOptions={{
          headerTintColor: 'white',
          headerStyle: {
            backgroundColor: "#00a500"
          },
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: "white",
            fontWeight: "bold",
            fontSize: 22
          }
        }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Vehicle Details" component={VehicleDetails} />
        <Stack.Screen name="Scheduling Details" component={SchedulingDetails} />
      </Stack.Navigator>
    );
  }

  function UserBookings() {
    return (
      <>
        <Header headertitle="Bookings" />
        <TopTab.Navigator
          initialRouteName="Today"
        >
          <TopTab.Screen name="Recent" component={Recent} />
          <TopTab.Screen name="Today" component={Today} />
          <TopTab.Screen name="Upcomming" component={Upcomming} />
        </TopTab.Navigator>
      </>
    );
  }

  return (
    <SafeAreaProvider>
      {langchk === false ?
        <ChooseLanguage type={"app"} setSL={(val) => { userProfile.setSL(val) }} />
        :
        isLoggedIn === '' ?
          <ImageBackground source={require('./assets/splash.png')} style={{ width: "100%", height: "100%" }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          </ImageBackground>
          :
          isLoggedIn === false ?
            <ImageBackground source={require('./assets/bg.jpg')} style={{ width: "100%", height: "100%" }}>
              <Login />
            </ImageBackground>
            :
            userProfile.profile.name === "Name" ?
              <CompleteProfiles edit="completeprofile" />
              :
              userProfile.loggedAs === "Owner" ?
                <NavigationContainer>
                  <Tab.Navigator
                    initialRouteName="Bookings"
                    activeColor="white"
                    inactiveColor="white"
                    barStyle={{ backgroundColor: '#00A500' }}
                  >
                    <Tab.Screen name="Bookings" component={OBookings}
                      options={{
                        tabBarIcon: () => (
                          <View>
                            <Icons name={"calendar"} color={"white"} size={26} />
                          </View>
                        ),
                      }}
                    />
                    <Tab.Screen
                      name="Vehicles"
                      component={Vehicles}
                      options={{
                        tabBarIcon: () => (
                          <View style={{ marginTop: 3 }}>
                            <Tractor name={"tractor"} color={"white"} size={20} />
                          </View>
                        ),
                      }}
                    />
                    <Tab.Screen name="Payments" component={OPayments}
                      options={{
                        tabBarIcon: () => (
                          <View>
                            <RequestIcon name={"payments"} color={"white"} size={26} />
                          </View>
                        ),
                      }}
                    />
                    <Tab.Screen name="Profile" component={Profile}
                      options={{
                        tabBarIcon: () => (
                          <View>
                            <Icons name={"person"} color={"white"} size={26} />
                          </View>
                        ),
                      }}
                    />
                  </Tab.Navigator>
                </NavigationContainer>
                :
                userProfile.loggedAs === "Farmer" ?
                  <NavigationContainer>
                    <Tab.Navigator
                      initialRouteName="Home"
                      activeColor="white"
                      inactiveColor="white"
                      barStyle={{ backgroundColor: '#00A500' }}
                    >
                      <Tab.Screen name="Home" component={HomeStack}
                        options={{
                          tabBarIcon: () => (
                            <View>
                              <Icons name={"home"} color={"white"} size={24} />
                            </View>
                          ),
                        }}
                      />
                      <Tab.Screen
                        name="Bookings"
                        component={UserBookings}
                        options={{
                          tabBarIcon: () => (
                            <View>
                              <Icons name={"calendar"} color={"white"} size={24} />
                            </View>
                          ),
                        }}
                      />
                      <Tab.Screen name="Payments" component={UPayments}
                        options={{
                          tabBarIcon: () => (
                            <View>
                              <RequestIcon name={"payments"} color={"white"} size={26} />
                            </View>
                          ),
                        }}
                      />
                      <Tab.Screen name="Profile" component={UProfile}
                        options={{
                          tabBarIcon: () => (
                            <View>
                              <Icons name={"person"} color={"white"} size={24} />
                            </View>
                          ),
                        }}
                      />
                    </Tab.Navigator>
                  </NavigationContainer>
                  :
                  <ImageBackground source={require('./assets/splash.png')} style={{ width: "100%", height: "100%" }}>
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
                      <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                  </ImageBackground>
      }
    </SafeAreaProvider>
  );
};

const App = () => {
  return (
    <UserProvider>
      <BNavigation />
    </UserProvider>
  )
}

export default () => {
  return (
    <App />
  )
}
