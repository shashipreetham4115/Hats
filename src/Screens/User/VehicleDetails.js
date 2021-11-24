import React, { useState,useContext } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,Linking } from 'react-native';
import Icons from 'react-native-vector-icons/Ionicons'
import { BottomSheet } from 'react-native-elements';
import { UserContext } from '../../components/UserProvider';
import allLn from '../../components/MultiLanguage/all.json'

export default function VehicleDetails({ route, navigation }) {
  var Vehicleimage = route.params.vehicleName === "Harvester" ? require('../../../assets/harvester.jpg') :
    require('../../../assets/tractor.jpg')
  const [acersModal, setacersModal] = useState(false);
  let cropsOwnerSelected = [];
  const userProfile = useContext(UserContext);
  const ln = userProfile.SL;
  function Verify(data) {
    if (JSON.stringify(route.params.crops).includes(data)) {
      navigation.navigate('Scheduling Details', { ...route.params, cropSelected: data })
    } else {
      alert(ln === "en"?"Note : Harvester is only for " + cropsOwnerSelected:allLn[ln]["HARVESTER"]+" "+cropsOwnerSelected+" "+allLn[ln]["IS_ONLY_FOR"])
    }
  }

  const SearchContainer = () => {
    return (
      <>
        <View style={{ alignItems: "center", justifyContent: "center", backgroundColor: "whitesmoke", borderRadius: 25, width: "95%", alignSelf: "center" }}>
          <Text style={{ ...styles.card, padding: 20, textAlign: "center", borderRadius: 50, width: "95%", alignSelf: "center", fontSize: 20 }}>{allLn[ln]["HARVESTER_FOR_WHICH_CROPS"]}</Text>
          <TouchableOpacity style={{ ...styles.card, padding: 20, borderRadius: 50, width: "95%", alignSelf: "center" }} onPress={() => { setacersModal(false); Verify("Paddy") }}><Text style={{ fontWeight: "bold", fontSize: 17, textAlign: "center" }}>{allLn[ln]["PADDY"]}</Text></TouchableOpacity>
          <TouchableOpacity style={{ ...styles.card, padding: 20, borderRadius: 50, width: "95%", alignSelf: "center" }} onPress={() => { setacersModal(false); Verify("Maize") }}><Text style={{ fontWeight: "bold", fontSize: 17, textAlign: "center" }}>{allLn[ln]["MAIZE"]}</Text></TouchableOpacity>
          <TouchableOpacity style={{ ...styles.card, padding: 20, borderRadius: 50, width: "95%", alignSelf: "center" }} onPress={() => { setacersModal(false); Verify("Bean") }}><Text style={{ fontWeight: "bold", fontSize: 17, textAlign: "center" }}>{allLn[ln]["BEANS"]}</Text></TouchableOpacity>
          <TouchableOpacity style={{ ...styles.card, padding: 20, borderRadius: 50, width: "95%", alignSelf: "center" }} onPress={() => { setacersModal(false); Verify("Sugarcane") }}><Text style={{ fontWeight: "bold", fontSize: 17, textAlign: "center" }}>{allLn[ln]["SUGARCANE"]}</Text></TouchableOpacity>
          <TouchableOpacity style={{ ...styles.card, padding: 20, borderRadius: 50, width: "95%", alignSelf: "center" }} onPress={() => { setacersModal(false); Verify("Wheat") }}><Text style={{ fontWeight: "bold", fontSize: 17, textAlign: "center" }}>{allLn[ln]["WHEAT"]}</Text></TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setacersModal(false)} style={{ ...styles.card, padding: 15, marginTop: 20, backgroundColor: "red", borderRadius: 50, marginBottom: 5, width: "95%", alignSelf: "center" }}><Text style={{ color: "white", fontWeight: "bold", fontSize: 17, textAlign: "center" }}
        >{allLn[ln]["CANCEL"]}</Text></TouchableOpacity>
      </>
    )
  }


  return (
    <>
      <BottomSheet
        isVisible={acersModal}
      >
        <SearchContainer />
      </BottomSheet>
      <View style={{ flex: 1 }}>
        <ScrollView>
          <Image source={Vehicleimage} style={{ width: 200, height: 200, margin: 15, alignSelf: "center" }} />
          <Text style={{ alignSelf: "center", fontSize: 25, fontFamily: "serif", fontWeight: "bold", padding: 5 }}>{allLn[ln][route.params.vehicleName === "Harvester"?"HARVESTER":"TRACTOR"]}</Text>
          <Text style={{ alignSelf: "center", fontSize: 20, fontFamily: "serif", fontWeight: "400", padding: 5 }}>₹{route.params.amount} / {allLn[ln][(route.params.per).split(" ")[2] === "Hour"?"HOUR":"ACER"]}</Text>
          <View style={{ alignSelf: "center", flexDirection: "row", padding: 5 }}>
            <Text style={{ alignSelf: "center", fontSize: 20, fontFamily: "serif", fontWeight: "bold", color: "white", backgroundColor: route.params.rating > 4 ? "#00a500" : route.params.rating > 2 ? "#EEBC1D" : "red" }}> {(route.params.rating)}★ </Text>
            <Text style={{ alignSelf: "center", fontSize: 18, fontFamily: "serif", fontWeight: "100" }}> {allLn[ln]["RATING"]}</Text>
          </View>
          <Text style={{ alignSelf: "center", fontSize: 20, fontFamily: "serif", fontWeight: "400", padding: 5 }}>{(route.params.distance)} Km {allLn[ln]["FROM_YOU"]}</Text>
          {route.params.crops.length > 0 ?
            <View style={{ flexDirection: "row", alignSelf: "center", margin: 5 }}>
              <Text style={{ alignSelf: "center", fontSize: 15, fontFamily: "serif", fontWeight: "bold", padding: 5, color: "red" }}> {ln === "en"?"Note : Harvester is only for"+" "+
                route.params.crops.map((i, k) => {
                  let data = i.item === "Paddy"?"PADDY":i.item === "Sugarcane"?"SUGARCANE":i.item === "Wheat"?"WHEAT":i.item === "Bean"?"BEANS":"MAIZE"
                  cropsOwnerSelected.push(allLn[ln][data])
                  return (
                    allLn[ln][data] + " "
                  )
                }):
                allLn[ln]["HARVESTER"]+" "+
                route.params.crops.map((i, k) => {
                  let data = i.item === "Paddy"?"PADDY":i.item === "Sugarcane"?"SUGARCANE":i.item === "Wheat"?"WHEAT":i.item === "Bean"?"BEANS":"MAIZE"
                  cropsOwnerSelected.push(allLn[ln][data])
                  return (
                    allLn[ln][data] + " "
                  )
                })+allLn[ln]["IS_ONLY_FOR"]}
              </Text>
            </View>
            :
            null
          }
          <Text style={{ alignSelf: "center", fontSize: 25, fontFamily: "serif", fontWeight: "bold", padding: 10 }}>{allLn[ln]["OWNER_DETAILS"]}</Text>
          <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%" }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", position: "absolute" }}>
              <ActivityIndicator size="large" color="#000000" />
            </View>
            <Image source={{ uri: route.params.ownerData.imageURL }} style={{ width: 150, height: 150, margin: 15, alignSelf: "center", borderRadius: 100 }} />
          </View>
          <View style={{ alignSelf: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontFamily: "serif", fontWeight: "500", padding: 5 }}><Text style={{ fontSize: 20, fontFamily: "serif", fontWeight: "bold", padding: 5 }}>{allLn[ln]["NAME"]}</Text> : {(route.params.ownerData.name)}</Text>
            <Text style={{ fontSize: 20, fontFamily: "serif", fontWeight: "500", padding: 5 }}><Text style={{ fontSize: 20, fontFamily: "serif", fontWeight: "bold", padding: 5 }}>{allLn[ln]["PHONE_NUMBER"]}</Text> : {(route.params.ownerData.number)}</Text>
            <Text style={{ fontSize: 20, fontFamily: "serif", fontWeight: "bold", padding: 5 }}>{allLn[ln]["ADDRESS"]}</Text>
            <View style={{ width: 300, flexWrap: "wrap", alignSelf: "center", flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 100 }}>
              <Text style={{ fontSize: 20, fontFamily: "serif", fontWeight: "500", padding: 5 }}>{(route.params.ownerData.address.city) + ","}</Text>
              <Text style={{ fontSize: 20, fontFamily: "serif", fontWeight: "500", padding: 5 }}>{(route.params.ownerData.address.subregion) + ","}</Text>
              <Text style={{ fontSize: 20, fontFamily: "serif", fontWeight: "500", padding: 5 }}>{(route.params.ownerData.address.region) + ","}</Text>
              <Text style={{ fontSize: 20, fontFamily: "serif", fontWeight: "500", padding: 5 }}>{(route.params.ownerData.address.country) + ","}</Text>
              <Text style={{ fontSize: 20, fontFamily: "serif", fontWeight: "500", padding: 5 }}>{(route.params.ownerData.address.postalCode)}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderTopColor: "lightgrey", borderTopWidth: 3 }}>
        <TouchableOpacity style={{ width: "50%", backgroundColor: "white", padding: 14, alignItems: "center", flexDirection: "row", justifyContent: "center" }} onPress={() => { Linking.openURL("tel:" + route.params.ownerData.number) }}>
          <Icons name="call" collor="black" size={24} />
          <Text style={{ fontSize: 17, fontWeight: "bold", color: "black" }}>  {allLn[ln]["CALL_OWNER"]}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ width: "50%", backgroundColor: "darkorange", padding: 15, alignItems: "center" }} onPress={() => { if (route.params.vehicleName === "Harvester") { setacersModal(true) }else{navigation.navigate('Scheduling Details', route.params)} }}>
          <Text style={{ fontSize: 17, fontWeight: "bold", color: "white" }}>{allLn[ln]["SCHEDULE"]} {allLn[ln][route.params.vehicleName === "Harvester"?"HARVESTER":"TRACTOR"]}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}


const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%"
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 350,
    height: 230
  },
})