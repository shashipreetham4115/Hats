import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, ActivityIndicator, Modal, TextInput, TouchableOpacity, Keyboard, StatusBar } from 'react-native';
import Header from "./Header"
import Donut from './Donut'
import Icons from 'react-native-vector-icons/Ionicons'
import firestore from '@react-native-firebase/firestore'
import { UserContext } from './UserProvider';
import { Pressable } from 'react-native';
const tr = require("googletrans").default;
import axios from 'axios';
import allLn from './MultiLanguage/all.json'

export default function Payments(props) {

  const db = firestore();
  const [loader, setLoader] = useState(false);
  const userProfile = useContext(UserContext);
  const uid = userProfile.uid.uid;
  const total = userProfile.total;
  const pending = userProfile.pending;
  const received = userProfile.received;
  const plist = Object.values(userProfile.plist);
  const keys = Object.keys(userProfile.plist);
  const ln = userProfile.SL;
  let staticData = { "Farmer": "Farmer", "Owner": "Owner", "Submit": "Submit", "Enter_Your_Number": "Enter Your Number", "Enter_OTP": "Enter OTP", "Verify_OTP": "Verify OTP", "Please_Enter_Valid_Phone_Number": "Please Enter Valid Phone Number", "Enter_Valid_OTP": "Enter Valid OTP", "Vehicles_Not_Available": "Vehicles Not Available", "Clear_Filters": "Clear Filters", "SORT_BY": "SORT BY", "Rating_--_High_to_Low": "Rating -- High to Low", "Rating_--_Low_to_High": "Rating -- Low to High", "Amount_--_Low_to_High": "Amount -- Low to High", "Amount_--_High_to_Low": "Amount -- High to Low", "Distance_--_Low_to_High": "Distance -- Low to High", "Distance_--_High_to_Low": "Distance -- High to Low", "Cancel": "Cancel", "Filters": "Filters", "Vehicles": "Vehicles", "Amount": "Amount", "Ratings": "Ratings", "Crops": "Crops", "Harvester": "Harvester", "Tractor": "Tractor", "2000_and_below": "2000 and below", "3000_and_below": "3000 and below", "4000_and_below": "4000 and below", "5000_and_below": "5000 and below", "5000_and_above": "5000 and above", "4★_and_above": "4★ and above", "3★_and_above": "3★ and above", "2★_and_above": "2★ and above", "1★_and_above": "1★ and above", "Paddy": "Paddy", "Wheat": "Wheat", "Sugarcane": "Sugarcane", "Beans": "Beans", "Maize": "Maize", "Apply": "Apply", "Sort": "Sort", "Filter": "Filter", "hour": "hour", "acer": "acre", "from_you": "from you", "Crop": "Crop", "Select_Date_of_Booking": "Select Date of Booking", "Choose_Date": "Choose Date", "Change_Date": "Change Date", "Please_Enter_Acers_Less_than_or_Equal_to_Available_Acers_=_": "Please Enter Acres Less than or Equal to Available Acres = ", "Call_Owner": "Call Owner", "Confirm_Harvester": "Confirm Harvester", "Confirm_Tractor": "Confirm Tractor", "rating": "rating", "Owner_Details": "Owner Details", "Name": "Name", "Phone_Number": "Phone Number", "Address": "Address", "schedule": "schedule", "Details": "Details", "Vehicle": "Vehicle", "acers": "acres", "Are_you_ready?": "Are you ready?", "Time": "Time", "minutes": "minutes", "Paused": "Paused", "Ready": "Ready", "Start": "Start", "Pause": "Pause", "Resume": "Resume", "Stop": "Stop", "Collected": "Collected", "for": "for", "Pending": "Pending", "No_Bookings": "No Bookings", "Enter_Vehicle_Number": "Enter Vehicle Number", "Enter_Amount": "Enter Amount", "Enter_Max_Booking_Acers_Per_Day": "Enter Max Booking Acres Per Day", "Amount_per_Hour": "Amount per Hour", "Amount_per_Acer": "Amount per Acre", "City": "City", "District": "District", "State": "State", "Country": "Country", "Working": "Working", "Repair": "Repair", "Harvester_for_Which_Crops": "Harvester for Which Crops", "Update": "Update", "Add_Vehicle": "Add Vehicle", "Choose_Vehicle_Name": "Choose Vehicle Name", "Amount_Per_Hour_or_Acer": "Amount Per Hour or Acre", "Booking_Areas": "Booking Areas", "Vehicles_Not_Registered_Yet": "Vehicles Not Registered Yet", "Date": "Date", "Vehicle_Number": "Vehicle Number", "Cancel_Booking": "Cancel Booking", "Delete": "Delete", "Not_Came_Yet": "Not Came Yet", "is_Ready": "is Ready", "Timer": "Timer", "Timer_Stoped": "Timer Stoped", "Pay": "Pay", "Collect": "Collect", "Paid": "Paid", "Total": "Total", "Received": "Received", "Change_Status": "Change Status", "Choose": "Choose", "Camera": "Camera", "Gallery": "Gallery", "Image_Uploading...": "Image Uploading...", "Fetch_Your_Location_By_Clicking_On_Right_Side_Button": "Fetch Your Location By Clicking On Right Side Button", "Update_Profile": "Update Profile", "Please_Click_On_Address_Detect_Button": "Please Click On Address Detect Button", "Please_Enter_Your_Name": "Please Enter Your Name", "Logout": "Logout", "Change": "Change", "Registered": "Registered", "Edit_Profile": "Edit Profile" }
  useEffect(() => {
    // tr(["shashipreetham", "hello world"], {from:"en",to:"te"})
    // .then(function (result) {
    //   console.log(result.textArray); 
    //   console.log(result.src);
    // })
    // .catch(function (error) {
    //   console.log(error);
    // });
    axios.post('http://10.0.2.2:8000', { tdata: ["only for"], to: "ur" }).then(res => console.log(res.text)).catch(err => console.log(err));
  }, [])






  function ChangeStatus(data, DateNow) {
    setLoader(true);
    db.collection('Payments').doc(uid).update({
      received: data.status === "Received" ? received - data.amount : received + data.amount,
      pending: data.status === "Pending" ? pending - data.amount : pending + data.amount,
      [`${DateNow}.status`]: data.status === "Received" ? "Pending" : "Received"
    })
    db.collection('UPayments').doc(data.userId).get().then((doc) => {
      const Received = doc.data() === undefined ? 0 : doc.data().received === undefined ? 0 : doc.data().received
      const Pending = doc.data() === undefined ? 0 : doc.data().pending === undefined ? 0 : doc.data().pending
      db.collection('UPayments').doc(data.userId).update({
        received: data.status === "Received" ? Received - data.amount : Received + data.amount,
        pending: data.status === "Pending" ? Pending - data.amount : Pending + data.amount,
        [`${DateNow}.status`]: data.status === "Received" ? "Pending" : "Received"
      })
      setTimeout(() => { setLoader(false) }, 2000);
    })
  }
  if (plist.length === 0 || loader === true) {
    return (
      <>
        <Header headertitle="Payments" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </>
    )
  }
  return (
    <>
      <Header headertitle="Payments" />
      <View style={styles.pcardback}></View>
      <View style={{ marginTop: "-20%", marginBottom: 15 }}>
        <View style={styles.Card}>
          <View style={styles.outerCard}>
            <View style={styles.innerCard}>
              <Donut percentage={total} color={'#00BBFE'} delay={1000} max={total} />
              <Text style={{ color: "#00BBFE", marginTop: 10, fontSize: 16 }}>{allLn[ln]["TOTAL"]}</Text>
            </View>
            <View style={styles.innerCard}>
              <Donut percentage={received} color={'#11C103'} delay={1000} max={total} />
              <Text style={{ color: "#11C103", marginTop: 10, fontSize: 16 }}>{props.usertype === "owner" ? allLn[ln]["RECEIVED"] : allLn[ln]["PAID"]}</Text>
            </View>
            <View style={styles.innerCard}>
              <Donut percentage={pending} color={'#FFC300'} delay={1000} max={total} />
              <Text style={{ color: "#FFC300", marginTop: 10, fontSize: 16 }}>{allLn[ln]["PENDING"]}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsHorizontalScrollIndicator={false}>
        <View>
          {plist.map((list, i) => {

            if (list.number !== "No Payments Yet") {
              return (
                <View key={i} style={styles.Card}>
                  <View style={
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 5,
                      borderRightColor: list.status === "Pending" ? "gold" : "#11C103",
                      borderRightWidth: 5,
                      borderRadius: 10,
                      borderLeftColor: list.status === "Pending" ? "gold" : "#11C103",
                      borderLeftWidth: 5
                    }
                  }>
                    <View>
                      <Icons name={"call"} color={"#00A500"} size={30} onPress={() => { Linking.openURL(`tel:${list.number}`) }} />
                    </View>
                    <View style={{ width: "55%" }}>
                      <Text style={styles.pdname}>{list.name}</Text>
                      {props.usertype === "owner" ? <View style={{ width: 150, height: 35, alignSelf: "center", marginTop: 5 }}>
                        <Pressable style={{ backgroundColor: "#00a500", borderRadius: 25 }} onPress={() => { ChangeStatus(list, keys[i]) }}>
                          <Text style={{ ...styles.pdname, color: "white", padding: 0, margin: 1, fontSize: 15 }}>{allLn[ln]["CHANGE_STATUS"]}</Text></Pressable>
                      </View> : null}
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.pdname}>₹{list.amount}</Text>
                      <Text style={styles.pdname}>{props.usertype === "owner" ? list.status === "Received" ? allLn[ln]["RECEIVED"] : allLn[ln]["PENDING"] : list.status === "Received" ? `      ${allLn[ln]["PAID"]}    ` : allLn[ln]["PENDING"]}</Text>
                    </View>
                  </View>
                </View>
              )
            } else {
              return (

                <View key={i} style={styles.Card}>
                  <View style={
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 5,
                      borderRightColor: "red",
                      borderRightWidth: 5,
                      borderRadius: 10,
                      borderLeftColor: "red",
                      borderLeftWidth: 5
                    }
                  }>
                    <View>
                      <Text style={styles.pdname}>{allLn[ln]["NO_PAYMENTS_YET"]}</Text>
                    </View>
                  </View>
                </View>
              )
            }
          })
          }
        </View>
      </ScrollView>
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
  pcardback: {
    width: "100%",
    height: "15%",
    backgroundColor: "#00A500",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  Card: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
    shadowColor: '#2E66E7',
    backgroundColor: '#ffffff',
    marginBottom: 10,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowRadius: 5,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  outerCard: {
    flexDirection: "row",
    padding: 15,
    justifyContent: "space-around"
  },
  innerCard: {
    alignItems: "center",
    padding: 15
  },
  paymentdetails: {
    alignItems: "center",
    padding: 5,
  },
  pdtext: {
    backgroundColor: "#F6F2F2",
    paddingHorizontal: 10,
    borderRadius: 20,
    color: "#11C103",
    fontWeight: "bold"
  },
  pdname: {
    textAlign: "center",
    padding: 5,
    fontSize: 17,
    color: "black",
    fontWeight: "bold"
  }
})


