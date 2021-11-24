import React, { useContext } from 'react';
import { View, Text, StatusBar } from 'react-native';
import Icons from 'react-native-vector-icons/Ionicons'
import Icon from 'react-native-vector-icons/MaterialIcons'
import {UserContext} from './UserProvider';
export default function Header(props) {
  const userProfile = useContext(UserContext);

  return (
    <>
      <StatusBar backgroundColor="#00A500" />
      <View style={{ width: "100%", height: "6%", backgroundColor: "#00A500",alignItems:"center", flexDirection: "row" }}>
        <View style={{alignItems:"center",justifyContent:"center",width:"100%"}}>
          <Text style={{ color: "white", textAlign: "center", fontSize: 23, fontWeight: "bold" }}>{props.headertitle}</Text>
        </View>
        {props.headertitle === "Vehicle" || props.headertitle === "Add Vehicle"?
          <View style={{right:10,position:"absolute"}}>
            <View >
              <Icons name={props.headertitle === "Add Vehicle"?'close':'add'} color="white" size={40} onPress={()=>{props.add(props.headertitle !== "Add Vehicle")}} />
            </View>
          </View> : null}
          {props.headertitle === "Profile"?
          <View style={{right:10,position:"absolute"}}>
            <View >
              <Icon name={"switch-account"} color="white" size={30} onPress={()=>{userProfile.setLoggedAs(userProfile.loggedAs === "Owner"?"Farmer":"Owner")}} />
            </View>
          </View> : null}
      </View>
    </>
  );
}
