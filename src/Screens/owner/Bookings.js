import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Linking } from 'react-native';
import Header from "../../components/Header"
import Icons from 'react-native-vector-icons/Ionicons'
import Maps from 'react-native-vector-icons/FontAwesome5'
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore'
import { UserContext } from '../../components/UserProvider';
import { Pressable } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import allLn from '../../components/MultiLanguage/all.json';

export default function Bookings() {
  const db = firestore();
  const [datesWhitelist, setdatesWhitelist] = useState([
    {
      start: moment(),
      end: moment().add(365, 'days'),
    }
  ])
  const [ModalVisible, setModalVisible] = useState(false);
  const [modelid, setModelid] = useState(null);
  const [selectedDate, setSelectedDate] = useState(`${moment().format('YYYY')}-${moment().format('MM')}-${moment().format('DD')}`);
  const [items, setItems] = useState([{ name: "No Bookings Today" }]);
  const [bookings, setBookings] = useState([]);
  const [Status, setStatus] = useState([]);
  const [datenow, setdatenow] = useState(Date.now());
  const userProfile = useContext(UserContext);
  const ln = userProfile.SL
  const uid = userProfile.uid.uid;
  const [loader, setloader] = useState(false);

  useEffect(() => {
    setloader(true);
    db.collection('Bookings').doc(uid).onSnapshot((doc) => {
      if (doc.data() !== undefined) {
        setBookings(doc.data());
        setloader(false);
      }
    })
    db.collection('OnProgress').doc(uid).onSnapshot((doc) => {
      if (doc.data() !== undefined) {
        setStatus(doc.data());
      }
      setloader(false);
    })
  }, [])

  useEffect(() => {
    setTimeout(() => { setdatenow(Date.now()) }, 60000)
  }, [datenow]);

  useEffect(() => {
    if (bookings.length !== 0)
      if (bookings[selectedDate] !== undefined)
        setItems(bookings[selectedDate].sort(function (a, b) {
          if (a.vehicleNo < b.vehicleNo) return -1
          else if (a.vehicleNo > b.vehicleNo) return 1
          else return 0
        }))
      else setItems([{ name: "No Bookings Today" }])
  }, [selectedDate, bookings])

  function DeleteFun(data, status, amount, userId, fieldId, DateNow) {
    setloader(true);
    db.collection('Payments').doc(uid).set({
      total: userProfile.total + amount, received: status === "Received" ? userProfile.received + amount : userProfile.received, pending: status === "Pending" ? userProfile.pending + amount : userProfile.pending,
      [DateNow]: {
        number: data.number, name: data.name, amount: amount, status: status, userId: userId, vehicle: data.vehicle
      }
    }, { merge: true })
    db.collection('UPayments').doc(userId).get().then((doc) => {
      const Total = doc.data() === undefined ? 0 : doc.data().total === undefined ? 0 : doc.data().total
      const Received = doc.data() === undefined ? 0 : doc.data().received === undefined ? 0 : doc.data().received
      const Pending = doc.data() === undefined ? 0 : doc.data().pending === undefined ? 0 : doc.data().pending
      db.collection('UPayments').doc(userId).set({
        total: Total + amount, received: status === "Received" ? Received + amount : Received, pending: status === "Pending" ? Pending + amount : Pending,
        [DateNow]: {
          number: userProfile.uid.phoneNumber, name: userProfile.profile.name, amount: amount, status: status, ownerId: uid, vehicle: data.vehicle
        }
      }, { merge: true })
    })
    if (status === 'Received') {
      db.collection('UserBookings').doc(userId).update(`${fieldId}.status`, `Paid ₹${amount}`);
    }
    if (items.length === 1) {
      db.collection('Bookings').doc(uid).update({ [selectedDate]: firestore.FieldValue.delete() })
    } else {
      db.collection('Bookings').doc(uid).update(selectedDate, firestore.FieldValue.arrayRemove(data))
    }
  }
  function readyFun(vno, id, userId, fieldId) {
    setloader(true);
    db.collection('OnProgress').doc(uid).set({
      [vno]: {
        start: -1,
        pause: -1,
        status: 'Ready',
        id: id,
        date: selectedDate
      }
    }, { merge: true })
    db.collection('UserBookings').doc(userId).update(`${fieldId}.status`, "Ready")
  }
  function startFun(vno, userId, fieldId, DateNow) {
    setloader(true);
    db.collection('OnProgress').doc(uid).update({ [`${vno}.start`]: DateNow, [`${vno}.status`]: 'Started' });
    db.collection('UserBookings').doc(userId).update({ [`${fieldId}.status`]: "Started", [`${fieldId}.start`]: DateNow })
  }
  function pauseFun(vno, start, pause, userId, fieldId, DateNow) {
    setloader(true);
    if (Status[vno].status === "Paused") {
      db.collection('OnProgress').doc(uid).update({ [`${vno}.start`]: DateNow - (pause - start), [`${vno}.pause`]: -1, [`${vno}.status`]: 'Started' });
      db.collection('UserBookings').doc(userId).update({ [`${fieldId}.start`]: DateNow - (pause - start), [`${fieldId}.pause`]: -1, [`${fieldId}.status`]: 'Started' });
    }
    else {
      db.collection('OnProgress').doc(uid).update({ [`${vno}.pause`]: DateNow, [`${vno}.status`]: 'Paused' });
      db.collection('UserBookings').doc(userId).update({ [`${fieldId}.pause`]: DateNow, [`${fieldId}.status`]: 'Paused' });
    }
  }
  function stopFun(vno, start, userId, fieldId, DateNow, amount,acers,itemper) {
    setloader(true);
    db.collection('OnProgress').doc(uid).update({ [`${vno}.start`]: DateNow - start, [`${vno}.status`]: 'Done' });
    db.collection('UserBookings').doc(userId).update({ [`${fieldId}.start`]: DateNow - start, [`${fieldId}.status`]: itemper === "hour"?`Pay ₹${Math.round(((DateNow - start) / (60000 * 60)) * amount)} for ${Math.round((DateNow - start) / 60000)} minutes`:`Pay ₹${Math.round(acers*amount)} for ${acers} acers` });
  }

  const styles = StyleSheet.create({
    taskListContent: {
      width: '100%',
      alignSelf: 'center',
      borderRadius: 10,
      shadowColor: '#2E66E7',
      opacity: ModalVisible ? 0.3 : 1,
      backgroundColor: ModalVisible ? "white" : "white",
      marginTop: 10,
      marginBottom: 10,
      shadowOffset: {
        width: 3,
        height: 3,
      },
      shadowRadius: 5,
      shadowOpacity: 0.2,
      elevation: 3,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRightColor: items[0].name !== "No Bookings Today" ? '#84E951' : '#7BC9E5',
      borderRightWidth: 6
    },
    card: {
      margin: 10,
      width: '80%',

    },
    cardHead: {
      textAlign: 'center',
      padding: 2,
      fontSize: 20,
      fontWeight: 'bold'
      , color: "black"
    },
    cardOption: {
      flexDirection: "row",
      padding: 10,
      justifyContent: "space-evenly"
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22
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
      elevation: 5
    }
  })

  if (loader) {

    return (<>
      <Header headertitle="Bookings" />
      <CalendarStrip
        calendarAnimation={{ type: 'sequence', duration: 30 }}
        daySelectionAnimation={{
          type: 'background',
          duration: 200,
          highlightColor: '#ffffff',
        }}
        style={{
          height: 150,
          paddingTop: 20,
          paddingBottom: 20,
          opacity: ModalVisible ? 0.3 : 1,
          backgroundColor: ModalVisible ? "black" : null,
        }}
        calendarHeaderStyle={{ color: '#000000' }}
        dateNumberStyle={{ color: '#000000', paddingTop: 10 }}
        dateNameStyle={{ color: '#BBBBBB' }}
        highlightDateNumberStyle={{
          color: '#fff',
          backgroundColor: '#2E66E7',
          marginTop: 10,
          height: 35,
          width: 35,
          textAlign: 'center',
          borderRadius: 17.5,
          overflow: 'hidden',
          paddingTop: 6,
          fontWeight: '400',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        highlightDateNameStyle={{ color: '#2E66E7' }}
        disabledDateNameStyle={{ color: 'grey' }}
        disabledDateNumberStyle={{ color: 'grey', paddingTop: 10 }}
        datesWhitelist={datesWhitelist}
        iconLeft={require('../../../assets/left-arrow.png')}
        iconRight={require('../../../assets/right-arrow.png')}
        iconContainer={{ flex: 0.1 }}
        selectedDate={selectedDate}
        onDateSelected={date => {
          const selectedDate = `${moment(date).format('YYYY')}-${moment(
            date
          ).format('MM')}-${moment(date).format('DD')}`;
          setSelectedDate(selectedDate);
        }}
      />
      <Spinner visible={true} />
    </>
    )

  }

  return (
    <>
      <Header headertitle="Bookings" />
      <CalendarStrip
        calendarAnimation={{ type: 'sequence', duration: 30 }}
        daySelectionAnimation={{
          type: 'background',
          duration: 200,
          highlightColor: '#ffffff',
        }}
        style={{
          height: 150,
          paddingTop: 20,
          paddingBottom: 20,
          opacity: ModalVisible ? 0.3 : 1,
          backgroundColor: ModalVisible ? "black" : null,
        }}
        calendarHeaderStyle={{ color: '#000000' }}
        dateNumberStyle={{ color: '#000000', paddingTop: 10 }}
        dateNameStyle={{ color: '#BBBBBB' }}
        highlightDateNumberStyle={{
          color: '#fff',
          backgroundColor: '#2E66E7',
          marginTop: 10,
          height: 35,
          width: 35,
          textAlign: 'center',
          borderRadius: 17.5,
          overflow: 'hidden',
          paddingTop: 6,
          fontWeight: '400',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        highlightDateNameStyle={{ color: '#2E66E7' }}
        disabledDateNameStyle={{ color: 'grey' }}
        disabledDateNumberStyle={{ color: 'grey', paddingTop: 10 }}
        datesWhitelist={datesWhitelist}
        iconLeft={require('../../../assets/left-arrow.png')}
        iconRight={require('../../../assets/right-arrow.png')}
        iconContainer={{ flex: 0.1 }}
        selectedDate={selectedDate}
        onDateSelected={date => {
          const selectedDate = `${moment(date).format('YYYY')}-${moment(
            date
          ).format('MM')}-${moment(date).format('DD')}`;
          setSelectedDate(selectedDate);
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={ModalVisible}
        onRequestClose={() => {
          setModelid(null)
          setModalVisible(!ModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ width: "100%", alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
              <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", width: "100%" }}>
                <Text style={{ paddingBottom: 10, color: "black", fontSize: 25, fontWeight: "bold", paddingLeft: 20 }}>{allLn[ln]["DETAILS"]}</Text>
                <Icons name={'close'} color="black" size={35} style={{ marginTop: -10 }} onPress={() => { setModelid(null); setModalVisible(false) }} />
              </View>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10, marginTop: 10 }}>
              <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                <Icons name={"person"} color={"black"} size={24} />
              </View>
              <View style={{ width: "75%" }}>
                <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 10 }}>{modelid !== null ? (items[modelid].name).charAt(0).toUpperCase() + (items[modelid].name).slice(1) : "Name"}</Text>
              </View>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10, marginTop: 10 }}>
              <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                <Icons name={"call"} color={"black"} size={24} />
              </View>
              <View style={{ width: "75%" }}>
                <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 10 }}>{modelid !== null ? items[modelid].number : "Number"}</Text>
              </View>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10, marginTop: 10 }}>
              <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                <Maps name={"tractor"} color={"black"} size={24} />
              </View>
              <View style={{ width: "75%" }}>
                <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 10 }}>{modelid !== null ? allLn[ln][(items[modelid].vehicle).toUpperCase()] : allLn[ln]["VEHICLE"]}</Text>
              </View>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10, marginTop: 10 }}>
              <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                <Maps name={"map-marked-alt"} color={"black"} size={24} />
              </View>
              <View style={{ width: "75%" }}>
                <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 10 }}>{modelid !== null ? items[modelid].location.city + "," + items[modelid].location.subregion + "," + items[modelid].location.region + "," + items[modelid].location.country + "," + items[modelid].location.postalCode : "Address"}</Text>
              </View>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10, marginTop: 10 }}>
              <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                <Maps name={"chart-area"} color={"black"} size={24} />
              </View>
              <View style={{ width: "75%" }}>
                <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 10 }}>{modelid !== null ? items[modelid].acers + " "+allLn[ln]["ACERS"] : allLn[ln]["VEHICLE"]}</Text>
              </View>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10, marginTop: 10 }}>
              <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                <Maps name={"rupee-sign"} color={"black"} size={24} />
              </View>
              <View style={{ width: "75%" }}>
                <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 10 }}>{modelid !== null ? items[modelid].amount + "/" + allLn[ln][(items[modelid].per).toUpperCase()] : allLn[ln]["VEHICLE"]}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          opacity: ModalVisible ? 0.3 : 1,
          backgroundColor: ModalVisible ? "black" : null,
        }}
      >
        {loader ? <Spinner visible={true} /> :
          <ScrollView showsHorizontalScrollIndicator={false}>
            {items.map((item, i) => (<>
              {(i === 0 || items[i - 1].vehicleNo !== item.vehicleNo) && item.name !== "No Bookings Today" ? <View style={{ width: "90%" }}><Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center" }}>{ln === "en"?"Bookings of "+item.vehicleNo:item.vehicleNo+" "+allLn[ln]["OF"]+" "+allLn[ln]["BOOKINGS"]}</Text></View> : null}
              <View
                key={i}
                style={styles.taskListContent}
              >

                <View
                  style={{
                    marginLeft: 13,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',

                    }}
                  >
                    <View
                      style={{
                        height: 12,
                        width: 12,
                        borderRadius: 6,
                        backgroundColor: item.name !== "No Bookings Today" ? '#84E951' : '#7BC9E5',
                        marginRight: 8
                      }}
                    />
                    <View style={styles.card}>
                      <Text style={styles.cardHead}>{item.vehicle !== undefined ? allLn[ln][(item.vehicle).toUpperCase()] + ' '+allLn[ln]["FOR"]+' ' + item.acers + ' '+allLn[ln]["ACERS"] : allLn[ln]["NO_BOOKINGS"]}</Text>
                      {item.name !== "No Bookings Today" ? <>
                        <View style={styles.cardOption}>
                          <Icons name={"eye"} color={"black"} size={26} onPress={() => { setModelid(i); setModalVisible(true) }} />
                          <Icons name={"navigate-circle-outline"} color={"black"} size={26} onPress={() => { Linking.openURL("geo:?q=" + item.location.latitude + ',' + item.location.longitude) }} />
                          <Icons name={"call"} color={"black"} size={26} onPress={() => { Linking.openURL("tel:" + item.number) }} />
                        </View>
                        {/* selectedDate === moment().format('YYYY-MM-DD') && */}
                        {selectedDate ===  moment().format('YYYY-MM-DD') && (i === 0 || items[i - 1].vehicleNo !== item.vehicleNo) ?
                          Status[item.vehicleNo] === undefined || Status[item.vehicleNo].date !== selectedDate || Status[item.vehicleNo].id !== item.id ?
                            <View style={{ width: "90%", alignSelf: "center" }}>
                              <Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center" }}>{allLn[ln]["ARE_YOU_READY?"]}</Text>
                              <Pressable onPress={() => { readyFun(item.vehicleNo, item.id, item.userId, item.fieldId) }} style={{ backgroundColor: "#66B3FF", width: "50%", alignSelf: "center", margin: 5, borderRadius: 25 }}><Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center", color: "white", fontWeight: "bold" }}>{allLn[ln]["READY"]}</Text></Pressable>
                            </View>
                            :
                            Status[item.vehicleNo].start === -1 && Status[item.vehicleNo].status === 'Ready' ?
                              <View style={{ width: "90%", alignSelf: "center" }}>
                                <Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center" }}>{allLn[ln]["TIME"] +":"+ 0 +allLn[ln]["MINUTES"]}</Text>
                                <Pressable onPress={() => { startFun(item.vehicleNo, item.userId, item.fieldId, Date.now()) }} style={{ backgroundColor: "#00a500", width: "50%", alignSelf: "center", margin: 5, borderRadius: 25 }}><Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center", color: "white", fontWeight: "bold" }}>{allLn[ln]["START"]}</Text></Pressable>
                              </View>
                              :
                              Status[item.vehicleNo].status === "Paused" || Status[item.vehicleNo].status === 'Started' ?
                                <View style={{ width: "90%", alignSelf: "center" }}>
                                  <Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center" }}>{Status[item.vehicleNo].status !== 'Paused' ? allLn[ln]["TIME"] + " : " + Math.ceil((datenow - Status[item.vehicleNo].start) / 60000) + " "+allLn[ln]["MINUTES"] : allLn[ln][(Status[item.vehicleNo].status).toUpperCase()]}</Text>
                                  <View style={{ flexDirection: "row" }}>
                                    <Pressable onPress={() => { pauseFun(item.vehicleNo, Status[item.vehicleNo].start, Status[item.vehicleNo].pause, item.userId, item.fieldId, Date.now()) }} style={{ backgroundColor: "red", width: "50%", alignSelf: "center", margin: 5, borderRadius: 25 }}><Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center", color: "white", fontWeight: "bold" }}>{Status[item.vehicleNo].status === "Paused" ? allLn[ln]["RESUME"] : allLn[ln]["PAUSE"]}</Text></Pressable>
                                    <Pressable onPress={() => { stopFun(item.vehicleNo, Status[item.vehicleNo].start, item.userId, item.fieldId, Date.now(), item.amount,item.acers,item.per) }} style={{ backgroundColor: "red", width: "50%", alignSelf: "center", margin: 5, borderRadius: 25 }}><Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center", color: "white", fontWeight: "bold" }}>{allLn[ln]["STOP"]}</Text></Pressable>
                                  </View>
                                </View>
                                :
                                Status[item.vehicleNo].status === 'Done' ?
                                  <View style={{ width: "90%", alignSelf: "center" }}>
                                    {item.per === "hour" ?
                                      <Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center" }}>{allLn[ln]["COLLECT"] +" ₹"+Math.round((Status[item.vehicleNo].start / (60000 * 60)) * item.amount)+ "for" +Math.round(Status[item.vehicleNo].start / 60000)+ allLn[ln]["MINUTES"]}</Text>
                                      :
                                      <Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center" }}>{allLn[ln]["COLLECT"]+ " ₹"+Math.round((item.acers)*(item.amount)) +"for"+ item.acers+ allLn[ln]["ACERS"]}</Text>
                                    }
                                    <View style={{ flexDirection: "row" }}>
                                      <Pressable onPress={() => { DeleteFun(item, "Pending", Math.round((Status[item.vehicleNo].start / (60000 * 60)) * item.amount), item.userId, item.fieldId, Date.now()) }} style={{ backgroundColor: "gold", width: "50%", alignSelf: "center", margin: 5, borderRadius: 25 }}><Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center", color: "white", fontWeight: "bold" }}>{allLn[ln]["PENDING"]}</Text></Pressable>
                                      <Pressable onPress={() => { DeleteFun(item, "Received", item.per === "hour"?Math.round((Status[item.vehicleNo].start / (60000 * 60)) * item.amount) : Math.round((item.acers)*(item.amount)), item.userId, item.fieldId, Date.now()) }} style={{ backgroundColor: "#00a500", width: "50%", alignSelf: "center", margin: 5, borderRadius: 25 }}><Text style={{ fontFamily: "serif", fontSize: 18, textAlign: "center", color: "white", fontWeight: "bold" }}>{allLn[ln]["COLLECTED"]}</Text></Pressable>
                                    </View>
                                  </View>
                                  :
                                  null
                          : null
                        }
                      </>
                        :
                        null
                      }
                    </View>
                  </View>
                </View>

              </View>
            </>))}
          </ScrollView>
        }
      </View>
    </>
  );
}