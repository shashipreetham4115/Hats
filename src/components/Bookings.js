import React, { useState, useEffect, useContext } from 'react';
import firestore from '@react-native-firebase/firestore';
import { UserContext } from './UserProvider';
import moment from 'moment';
import { ScrollView, Text, View, Linking, Modal } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay'
import { Pressable } from 'react-native';
import allLn from './MultiLanguage/all.json'
import Gallary from 'react-native-vector-icons/Entypo'
import Icons from 'react-native-vector-icons/Ionicons'

export default function Bookings(props) {
  const db = firestore();
  const userProfile = useContext(UserContext);
  const uid = userProfile.uid.uid;
  const ln = userProfile.SL;
  const [bookings, setBookings] = useState('');
  const [bookingskeys, setBookingsKeys] = useState('');
  const [Loader, setLoader] = useState(false);
  const [today, settoday] = useState(-1);
  const [recent, setrecent] = useState(-1);
  const [upcomming, setupcomming] = useState(-1);
  const [datenow, setdatenow] = useState(Date.now());
  const [rating, setrating] = useState(0);
  const [ratingState, setratingState] = useState("");

  useEffect(() => {
    if (uid !== '') {
      db.collection("UserBookings").doc(uid).onSnapshot((doc) => {
        if (doc.data() !== undefined) {
          setBookings(Object.values(doc.data()));
          setBookingsKeys(Object.keys(doc.data()));
        } else {
          setBookings([]);
          setBookingsKeys([]);
        }
      })
    }
  }, [uid]);

  useEffect(() => {
    setTimeout(() => { setdatenow(Date.now()) }, 60000)
  }, [datenow]);

  if (bookings === '' || Loader === true) {
    return <Spinner visible={true} />
  }

  function CancelBooking(userid, d, ownerid, date) {
    delete d.date;
    delete d.ownerId;
    delete d.pause;
    delete d.start;
    delete d.status;
    db.collection('Bookings').doc(ownerid).get().then((data) => {
      if (data.data()[date].length === 1) {
        db.collection('Bookings').doc(ownerid).update({ [date]: firestore.FieldValue.delete() })
      } else {
        db.collection('Bookings').doc(ownerid).update(date, firestore.FieldValue.arrayRemove({ ...d, fieldId: parseInt(userid), userId: uid }))
      }
    })
    db.collection('UserBookings').doc(uid).delete(userid).then(() => {
      setLoader(false)
    })
  }

  function updaterating(r, rs) {
    setLoader(true);
    db.collection("Vehicle").doc(rs.ownerId).get().then(data => {
      Object.values(data).map((i, k) => {
        if (i.vehicleNo === rs.vehicleNo) {
          db.collection("Vehicle").doc(rs.ownerId).update(`${Object.keys(data)[k]}.rating`, r).then(() => {
            setrating(0); setratingState(""); setLoader(false);
          })
        }
      })
    })
  }

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={ratingState !== ""}
        onRequestClose={() => {
          setratingState("");
        }}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <View style={{
            margin: 20, backgroundColor: "white", borderRadius: 20, padding: 15, alignItems: "center",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2
            }
          }}>
            <View style={{ width: "100%", alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
              <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", width: "100%" }}>
                <Text style={{ paddingBottom: 10, color: "black", fontSize: 25, fontWeight: "bold", paddingLeft: 20 }}>Rating</Text>
                <Icons name={"close"} color="black" size={35} style={{ marginTop: -10 }} onPress={() => { setratingState("") }} />
              </View>
            </View>
            <View style={{ flexDirection: "row", padding: 20 }}>
              <Gallary name={rating > 0 ? "star" : "star-outlined"} color={rating > 0 ? "#00a500" : "black"} size={40} onPress={() => { updaterating(1, ratingState) }} />
              <Gallary name={rating > 1 ? "star" : "star-outlined"} color={rating > 1 ? "#00a500" : "black"} size={40} onPress={() => { updaterating(2, ratingState) }} />
              <Gallary name={rating > 2 ? "star" : "star-outlined"} color={rating > 2 ? "#00a500" : "black"} size={40} onPress={() => { updaterating(3, ratingState) }} />
              <Gallary name={rating > 3 ? "star" : "star-outlined"} color={rating > 3 ? "#00a500" : "black"} size={40} onPress={() => { updaterating(4, ratingState) }} />
              <Gallary name={rating > 4 ? "star" : "star-outlined"} color={rating > 4 ? "#00a500" : "black"} size={40} onPress={() => { updaterating(5, ratingState) }} />
            </View>
          </View>
        </View>
      </Modal>
      <View>
        <ScrollView>
          {bookings.map((d, k) => {
            if ((d.date > moment().format('YYYY-MM-DD')) && props.page === "Upcomming") {
              () => { setupcomming(upcomming + 1) }
              return (
                <View style={
                  {
                    width: "90%",
                    alignSelf: "center",
                    borderRadius: 5,
                    shadowColor: '#2E66E7',
                    backgroundColor: '#ffffff',
                    margin: 10,
                    shadowOffset: {
                      width: 3,
                      height: 3,
                    },
                    shadowRadius: 5,
                    shadowOpacity: 0.2,
                    elevation: 3,
                    padding: 10
                  }
                }>
                  <Text style={{ fontSize: 18, color: "black" }}>{k + 1}. {d.vehicle !== undefined ? ln === "en" ? allLn[ln][(d.vehicle).toUpperCase()] + ' ' + allLn[ln]["FOR"] + ' ' + d.acers + ' ' + allLn[ln]["ACERS"] : d.acers + ' ' + allLn[ln]["ACERS"] + ' ' + allLn[ln]["FOR"] + ' ' + allLn[ln][(d.vehicle).toUpperCase()] : ""}</Text>
                  <Text style={{ padding: 15, marginLeft: 10, marginBottom: -10, fontSize: 16, color: "black" }}>{allLn[ln]["DATE"]} : {moment(d.date).format('DD-MM-YYYY')}</Text>
                  <Text style={{ padding: 10, marginLeft: 15, marginBottom: -5, fontSize: 16, color: "black" }}>{allLn[ln]["VEHICLE_NUMBER"]} : {d.vehicleNo}</Text>
                  <View style={{ flexDirection: "row", width: "85%" }}>
                    <Pressable style={{ backgroundColor: "white", borderRadius: 25, borderWidth: 1, borderColor: "lightgrey", width: "50%", padding: 5, marginLeft: 20, marginTop: 10, alignSelf: "center" }} onPress={() => { Linking.openURL("tel:" + d.number) }} >
                      <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 15 }}><Text style={{ color: "black" }}>📞 </Text> {allLn[ln]["CALL_OWNER"]}</Text>
                    </Pressable>
                    <Pressable style={{ backgroundColor: "red", borderRadius: 25, borderWidth: 1, borderColor: "lightgrey", width: "50%", padding: 5, marginLeft: 20, marginTop: 10, alignSelf: "center" }} onPress={() => { setLoader(true); CancelBooking(bookingskeys[k], d, d.ownerId, d.date) }}>
                      <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 15 }}>{allLn[ln]["CANCEL_BOOKING"]}</Text>
                    </Pressable>
                  </View>
                </View>
              )
            }
            else if ((d.date < moment().format('YYYY-MM-DD')) && props.page === "Recent") {
              () => { setrecent(recent + 1) }
              return (
                <View style={
                  {
                    width: "90%",
                    alignSelf: "center",
                    borderRadius: 10,
                    shadowColor: '#2E66E7',
                    backgroundColor: '#ffffff',
                    margin: 10,
                    shadowOffset: {
                      width: 3,
                      height: 3,
                    },
                    shadowRadius: 5,
                    shadowOpacity: 0.2,
                    elevation: 3,
                    padding: 10
                  }
                }>
                  <Text style={{ fontSize: 18, color: "black" }}>{k + 1}. {d.vehicle !== undefined ? ln === "en" ? allLn[ln][(d.vehicle).toUpperCase()] + ' ' + allLn[ln]["FOR"] + ' ' + d.acers + ' ' + allLn[ln]["ACERS"] : d.acers + ' ' + allLn[ln]["ACERS"] + ' ' + allLn[ln]["FOR"] + ' ' + allLn[ln][(d.vehicle).toUpperCase()] : ""}</Text>
                  <Text style={{ padding: 15, marginLeft: 10, marginBottom: -10, fontSize: 16, color: "black" }}>{allLn[ln]["DATE"]} : {moment(d.date).format('DD-MM-YYYY')}</Text>
                  <Text style={{ padding: 10, marginLeft: 15, marginBottom: -5, fontSize: 16, color: "black" }}>{allLn[ln]["VEHICLE_NUMBER"]} : {d.vehicleNo}</Text>
                  <View style={{ flexDirection: "row", width: "85%" }}>
                    <Pressable style={{ backgroundColor: "white", borderRadius: 25, borderWidth: 1, borderColor: "lightgrey", width: "50%", padding: 5, marginLeft: 20, marginTop: 10, alignItems: "center", justifyContent: "center" }} onPress={() => { Linking.openURL("tel:" + d.number) }} >
                      <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 15 }}><Text style={{ color: "black", textAlign: "center" }}>📞 </Text> {allLn[ln]["CALL_OWNER"]}</Text>
                    </Pressable>
                    <Pressable style={{ backgroundColor: "red", borderRadius: 25, borderWidth: 1, borderColor: "lightgrey", width: "50%", padding: 5, marginLeft: 20, marginTop: 10, alignItems: "center", justifyContent: "center" }} onPress={() => { setLoader(true); CancelBooking(bookingskeys[k], d, d.ownerId, d.date) }}>
                      <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 15 }}>{allLn[ln]["DELETE"]}</Text>
                    </Pressable>
                  </View>
                </View>

              )
            }
            else if ((d.date === moment().format('YYYY-MM-DD')) && props.page === "Today") {
              () => {
                settoday(today + 1);
                if ((d.status.split(" ")[0] === "Pay" || d.status.split(" ")[0] === "Paid") && d.pause === -1) {
                  setratingState({ ownerId: d.ownerId, vehicleNo: d.vehicleNo })
                }
              }
              return (
                <View style={
                  {
                    width: "90%",
                    alignSelf: "center",
                    borderRadius: 10,
                    shadowColor: '#2E66E7',
                    backgroundColor: '#ffffff',
                    margin: 10,
                    shadowOffset: {
                      width: 3,
                      height: 3,
                    },
                    shadowRadius: 5,
                    shadowOpacity: 0.2,
                    elevation: 3,
                    padding: 10
                  }
                }>
                  <Text style={{ fontSize: 18, color: "black" }}>{k + 1}. {d.vehicle !== undefined ? ln === "en" ? allLn[ln][(d.vehicle).toUpperCase()] + ' ' + allLn[ln]["FOR"] + ' ' + d.acers + ' ' + allLn[ln]["ACERS"] : d.acers + ' ' + allLn[ln]["ACERS"] + ' ' + allLn[ln]["FOR"] + ' ' + allLn[ln][(d.vehicle).toUpperCase()] : ""}</Text>
                  <Text style={{ padding: 10, marginLeft: 15, marginBottom: -5, fontSize: 16, color: "black" }}>{allLn[ln]["VEHICLE_NUMBER"]} : {d.vehicleNo}</Text>
                  <Text style={{ padding: 15, marginLeft: 15, marginBottom: -5, fontSize: 17, color: "black" }}>
                    Status : {
                      d.status === "Not Ready" ? `${allLn[ln][(d.vehicle).toUpperCase()]} ${allLn[ln]["NOT_CAME_YET"]}` :
                        d.status === "Ready" ? `${allLn[ln][(d.vehicle).toUpperCase()]} ${allLn[ln]["IS_READY"]}` :
                          d.status === "Started" ? `${allLn[ln]["TIMER"]} : ${Math.round((datenow - d.start) / 60000)} ${allLn[ln]["MINUTES"]}` :
                            d.status === "Paused" ? allLn[ln]["TIMER_STOPPED"] :
                              d.status.split(" ")[0] === "Pay" && ln !== "en" ? d.status.split(" ")[3] + " " + allLn[ln]["MINUTES"] + " " + allLn[ln]["FOR"] + " " + d.status.split(" ")[1] + " " + allLn[ln]["PAY"] :
                                d.status.split(" ")[0] === "Paid" && ln !== "en" ? d.status.split(" ")[1] + " " + allLn[ln]["PAID"] :
                                  d.status
                    }
                  </Text>

                  <Pressable style={{ backgroundColor: "white", borderRadius: 25, borderWidth: 1, borderColor: "lightgrey", width: "90%", padding: 5, marginLeft: 20, marginTop: 10, alignSelf: "center" }} onPress={() => { Linking.openURL("tel:" + d.number) }} >
                    <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 15 }}><Text style={{ color: "black" }}>📞 </Text> {allLn[ln]["CALL_OWNER"]}</Text>
                  </Pressable>

                </View>
              )
            }
            if (k === (bookings.length) - 1) {
              if (upcomming === -1 && props.page === "Upcomming") {
                return (
                  <View style={{ marginTop: "40%", alignSelf: "center" }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {allLn[ln]["NO_BOOKINGS"]}
                    </Text>
                  </View>
                )
              }
              else if (today === -1 && props.page === "Today") {
                return (
                  <View style={{ marginTop: "40%", alignSelf: "center" }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {allLn[ln]["NO_BOOKINGS"]}
                    </Text>
                  </View>
                )
              }
              else if (recent === -1 && props.page === "Recent") {
                return (
                  <View style={{ marginTop: "40%", alignSelf: "center" }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {allLn[ln]["NO_BOOKINGS"]}
                    </Text>
                  </View>
                )
              }
            }
            return null;
          })}
        </ScrollView>
        {
          bookings.length === 0 ?
            <View style={{ marginTop: "40%", alignSelf: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {allLn[ln]["NO_BOOKINGS"]}
              </Text>
            </View>
            : null
        }
      </View>
    </>
  )
}
