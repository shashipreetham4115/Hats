import React from 'react';
import Payments from '../../components/Payments'
export default function OPayments() {
  return (
    <Payments usertype={"owner"} />
  );
}








// import React, { useState,useContext } from 'react';
// import { View, Text, StyleSheet, ScrollView, Linking, ActivityIndicator, Modal, TextInput, TouchableOpacity,Keyboard,StatusBar } from 'react-native';
// import Header from "../../components/Header"
// import Donut from '../../components/Donut'
// import Icons from 'react-native-vector-icons/Ionicons'
// import firestore from '@react-native-firebase/firestore'
// import Spinner from 'react-native-loading-spinner-overlay';
// import {UserContext} from '../../components/UserProvider';

// export default function Payments() {

//   const db = firestore();
//   const [loader, setLoader] = useState(false);
//   const [ModalVisible, setModalVisible] = useState(false);
//   const [upiChange,setUpiChange] = useState('');
//   const userProfile = useContext(UserContext);
//   const uid = userProfile.uid; 
//   const upi = userProfile.profile.upi;
//   const total = userProfile.total;
//   const pending = userProfile.pending;
//   const received = userProfile.received;
//   const plist = Object.values(userProfile.plist);
//   const keys = Object.keys(userProfile.plist);

//   if (plist.length === 0) {
//     return (
//       <>
//         <Header headertitle="Payments" />
//         <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
//           <ActivityIndicator size="large" color="#ffffff" />
//         </View>
//       </>
//     )
//   }

//   function changeUpi() {
//     db.collection('Profiles').doc(uid).update("upi",upiChange)
//     db.collection('Payments').doc(uid).update("upi", upiChange).then(() => {
//       setModalVisible(false); setLoader(false);
//     })
//   }
//   // useEffect(()=>{
//   //   db.collection('Payments').doc(uid).set({
//   //     total:10000,received:5500,pending:4500,
//   //     [Date.now()]: {
//   //       number: 9919329249, name: "Naveen", amount: 1500, status: "Pending"
//   //     }
//   // }, { merge: true })
//   // },[])

//   return (
//     <>
//       <Header headertitle="Payments" />
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={ModalVisible}
//         onRequestClose={() => {
//           setModalVisible(!ModalVisible);
//         }}
//       > 
//         <View style={styles.centeredView}>
//         <StatusBar backgroundColor="rgba(3, 115, 3, 1)" />
//           <Spinner visible={loader} />
//           <View style={styles.modalView}>
//             <View style={{ width: "100%", alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
//               <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", width: "100%" }}>
//                 <Text style={{ paddingBottom: 10, color: "black", fontSize: 25, fontWeight: "bold", paddingLeft: 20 }}>Change Upi</Text>
//                 <Icons name={'close'} color="black" size={35} style={{ marginTop: -10 }} onPress={() => { setModalVisible(false) }} />
//               </View>
//             </View>
//             <TextInput
//               style={{ borderRadius: 25, borderWidth: 1, borderColor: "black", height: 40, paddingLeft: 13, fontSize: 17, marginTop: 20, width: "90%" }}
//               placeholder={upi}
//               placeholderTextColor={'black'}
//               underlineColorAndroid="transparent"
//               onSubmitEditing={Keyboard.dismiss}
//               autoFocus={true}
//               Keyboard={true}
//               onChangeText={(text) => { setUpiChange(text) }}
//             />
//             <TouchableOpacity style={{
//               backgroundColor: "#00A500", margin: 10, borderRadius: 50, flexDirection: "row",
//               alignItems: "center", justifyContent: "center", padding: 5, paddingHorizontal: 50, marginTop: 40
//             }} onPress={() => { setLoader(true); changeUpi() }}>
//               <Text style={{ color: "white", fontSize: 17, fontWeight: "bold" }}>Change Upi</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//       <View style={styles.pcardback}></View>
//       <View style={{ marginTop: !ModalVisible?"-22%":"-15%", marginBottom: 15 }}>
//         <View style={styles.Card}>
//           <View style={styles.paymentdetails}>
//             <Text style={styles.pdtext}>Current UPI - {upi}</Text>
//           </View>
//           <View style={styles.outerCard}>
//             <View style={styles.innerCard}>
//               <Donut percentage={total} color={'#00BBFE'} delay={1000} max={total} />
//               <Text style={{ color: "#00BBFE", marginTop: 10, fontSize: 16 }}>Total</Text>
//             </View>
//             <View style={styles.innerCard}>
//               <Donut percentage={received} color={'#11C103'} delay={1000} max={total} />
//               <Text style={{ color: "#11C103", marginTop: 10, fontSize: 16 }}>Received</Text>
//             </View>
//             <View style={styles.innerCard}>
//               <Donut percentage={pending} color={'#FFC300'} delay={1000} max={total} />
//               <Text style={{ color: "#FFC300", marginTop: 10, fontSize: 16 }}>Pending</Text>
//             </View>
//           </View>
//           <TouchableOpacity style={styles.paymentdetails} >
//             <Text style={styles.pdtext} onPress={() => { setModalVisible(true) }}>Change UPI</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView showsHorizontalScrollIndicator={false}>
//         <View>
//           {plist.map((list, i) => {

//             if (list.number !== "No Payments Yet") {
//               return (
//                 <View key={i} style={styles.Card}>
//                   <View style={
//                     {
//                       flexDirection: "row",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                       padding: 5,
//                       borderRightColor: list.status === "Pending" ? "gold" : "#11C103",
//                       borderRightWidth: 5,
//                       borderRadius: 10,
//                       borderLeftColor: list.status === "Pending" ? "gold" : "#11C103",
//                       borderLeftWidth: 5
//                     }
//                   }>
//                     <View>
//                       <Icons name={"call"} color={"#00A500"} size={30} onPress={() => { Linking.openURL(`tel:${list.number}`) }} />
//                     </View>
//                     <View style={{ width: "55%" }}>
//                       <Text style={styles.pdname}>{list.name}</Text>
//                     </View>
//                     <View style={{ alignItems: "center" }}>
//                       <Text style={styles.pdname}>₹{list.amount}</Text>
//                       <Text style={styles.pdname}>{list.status}</Text>
//                     </View>
//                   </View>
//                 </View>
//               )
//             } else {
//               return (

//                 <View key={i} style={styles.Card}>
//                   <View style={
//                     {
//                       flexDirection: "row",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                       padding: 5,
//                       borderRightColor: "red",
//                       borderRightWidth: 5,
//                       borderRadius: 10,
//                       borderLeftColor: "red",
//                       borderLeftWidth: 5
//                     }
//                   }>
//                     <View>
//                       <Text style={styles.pdname}>{list.number}</Text>
//                     </View>
//                   </View>
//                 </View>
//               )
//             }
//           })
//           }
//         </View>
//       </ScrollView>
//     </>
//   );
// }


// const styles = StyleSheet.create({
//   centeredView: {
//     backgroundColor:"rgba(0,0,0,0.3)",
//     justifyContent: "center",
//     alignItems: "center",
//     width:"100%",
//     height:"100%"
//   },
//   modalView: {
//     margin: 20,
//     backgroundColor: "white",
//     borderRadius: 20,
//     padding: 15,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//     width: 350,
//     height: 230
//   },
//   pcardback: {
//     width: "100%",
//     height: "15%",
//     backgroundColor: "#00A500",
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   Card: {
//     width: "90%",
//     alignSelf: "center",
//     borderRadius: 10,
//     shadowColor: '#2E66E7',
//     backgroundColor: '#ffffff',
//     marginBottom: 10,
//     shadowOffset: {
//       width: 3,
//       height: 3,
//     },
//     shadowRadius: 5,
//     shadowOpacity: 0.2,
//     elevation: 3,
//   },
//   outerCard: {
//     flexDirection: "row",
//     padding: 5,
//     justifyContent: "space-around"
//   },
//   innerCard: {
//     alignItems: "center",
//     padding: 5
//   },
//   paymentdetails: {
//     alignItems: "center",
//     padding: 5,
//   },
//   pdtext: {
//     backgroundColor: "#F6F2F2",
//     paddingHorizontal: 10,
//     borderRadius: 20,
//     color: "#11C103",
//     fontWeight: "bold"
//   },
//   pdname: {
//     textAlign: "center",
//     padding: 5,
//     fontSize: 17,
//     color: "black",
//     fontWeight: "bold"
//   }
// })