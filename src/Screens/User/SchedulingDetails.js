import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Keyboard, Button, ScrollView, TouchableOpacity, Linking } from 'react-native';
import firestore from '@react-native-firebase/firestore'
import { UserContext } from '../../components/UserProvider';
import moment from 'moment'
import DateTimePicker from '@react-native-community/datetimepicker';
import Spinner from 'react-native-loading-spinner-overlay'
import Icons from 'react-native-vector-icons/Ionicons'
import allLn from '../../components/MultiLanguage/all.json'

export default function SchedulingDetails({ navigation, route }) {
    const TD = moment().add(1, "days").format('YYYY-MM-DD')
    const MD = moment().add(90, "days").format('YYYY-MM-DD')
    const db = firestore();
    const userProfile = useContext(UserContext);
    const ln = userProfile.SL
    const uid = userProfile.uid.uid
    const number = userProfile.uid.phoneNumber
    const userprofile = userProfile.profile;
    const [OwnerBookings, setOwnerBookings] = useState([]);
    const [AvailAcers, setAvailAcers] = useState(route.params.MaxBookingAcers);
    const [dateS, setDateS] = useState("")
    const [acers, setacers] = useState(0)
    const [Loader, setLoader] = useState(false)
    const [show, setShow] = useState(true);

    useEffect(() => {
        db.collection('Bookings').doc(route.params.ownerData.id).onSnapshot(doc => {
            if (doc.data() !== undefined) {
                setOwnerBookings(doc.data())
            } else {
                setOwnerBookings([])
            }
        })
    }, []);

    useEffect(() => {
        setLoader(true);
        const data = OwnerBookings[dateS]
        if (data !== undefined) {
            setAvailAcers(data.reduce((acc, b) => {
                if ((b.vehicleNo).toLowerCase() === (route.params.vehicleNo).toLowerCase()) {
                    return acc - parseFloat(b.acers)
                }
                return acc
            }, route.params.MaxBookingAcers))
            setLoader(false)
        } else {
            setAvailAcers(route.params.MaxBookingAcers)
            setLoader(false)
        }
    }, [dateS]);

    const onChange = (event, selectedDate) => {
        setShow(false)
        setDateS(moment(selectedDate).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD') ? moment(selectedDate).format('YYYY-MM-DD') : dateS);
    };

    const showDatepicker = () => {
        setShow(true);
    };

    const bookingconfirm = (datenow) => {
        setLoader(true);
        const data = OwnerBookings[dateS]
        db.collection('UserBookings').doc(uid).set({
            [datenow]: {
                acers: acers,
                amount: route.params.amount,
                name: userprofile.name,
                location: userprofile.address,
                number: number,
                per: (route.params.per).split(" ")[2].toLowerCase(),
                vehicle: (route.params.vehicleName).toLowerCase(),
                vehicleNo: route.params.vehicleNo,
                date: dateS,
                status:"Not Ready",
                start:-1,
                pause:-1,
                ownerId:route.params.ownerData.id,
                id:data !== undefined ? data.length : 0
            }
        }, { merge: true })
        if (data !== undefined) {
            db.collection('Bookings').doc(route.params.ownerData.id).set({
                [dateS]: [...data, {
                    acers: acers,
                    amount: route.params.amount,
                    name: userprofile.name,
                    location: userprofile.address,
                    number: number,
                    per: (route.params.per).split(" ")[2].toLowerCase(),
                    vehicle: (route.params.vehicleName).toLowerCase(),
                    vehicleNo: route.params.vehicleNo,
                    id:data.length,
                    userId:uid,
                    fieldId:datenow
                }]
            }, { merge: true }).then(() => {
                navigation.navigate('Home')
            })
            setLoader(false)
        } else {
            db.collection('Bookings').doc(route.params.ownerData.id).set({
                [dateS]: [{
                    acers: acers,
                    amount: route.params.amount,
                    name: userprofile.name,
                    location: userprofile.address,
                    number: number,
                    per: (route.params.per).split(" ")[2].toLowerCase(),
                    vehicle: (route.params.vehicleName).toLowerCase(),
                    vehicleNo: route.params.vehicleNo,
                    id:0,
                    userId:uid,
                    fieldId:datenow
                }]
            }, { merge: true }).then(() => {
                navigation.navigate('Home')
            })
            setLoader(false)
        }
    }

    if (Loader) {
        return (
            <Spinner visible={true} />
        )
    }

    return (
        <>
            <View style={{ alignSelf: "center", padding: 10, flex: 1 }}>
                <ScrollView>
                    <View style={{ width: Loader ? "100%" : "0%", height: Loader ? "100%" : "0%", alignItems: "center", justifyContent: "center" }}>
                        <Spinner visible={Loader} />
                    </View>
                    <Text style={{ alignSelf: "center", fontSize: 25, fontFamily: "serif", fontWeight: "bold", padding: 5 }}>{allLn[ln][(route.params.vehicleName).toUpperCase()]}</Text>
                    <Text style={{ alignSelf: "center", fontSize: 20, fontFamily: "serif", fontWeight: "400", padding: 5 }}>₹{route.params.amount} / {allLn[ln][(route.params.per).split(" ")[2].toUpperCase()]}</Text>
                    {route.params.cropSelected !== undefined ? <Text style={{ alignSelf: "center", fontSize: 20, fontFamily: "serif", fontWeight: "400", padding: 5 }}>{allLn[ln]['CROP']} : {allLn[ln][route.params.cropSelected.toUpperCase()]}</Text> : null}
                    <Text style={{ fontSize: 20, textAlign: "center", fontWeight: "bold", margin: 10 }}>{allLn[ln][("Select_Date_of_Booking").toUpperCase()]}</Text>
                    <View>
                        <Text style={{ textAlign: "center", borderWidth: 2, borderColor: "grey", paddingVertical: 10, fontSize: 18, margin: 10 }}>{dateS === "" ? allLn[ln]["CHOOSE_DATE"] : moment(dateS).format('DD-MM-YYYY')}</Text>
                        <Button onPress={showDatepicker} title={dateS === "" ? allLn[ln]["CHOOSE_DATE"] : allLn[ln]["CHANGE_DATE"]} />
                    </View>
                    {
                        show && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={new Date(dateS === "" ? TD : dateS)}
                                minimumDate={new Date(TD)}
                                maximumDate={new Date(MD)}
                                display="default"
                                onChange={onChange}
                                mode="date"
                            />
                        )
                    }
                    {(dateS !== "" && dateS !== undefined) ? <>
                        <Text style={{ fontSize: 20, textAlign: "center", fontWeight: "bold", margin: 10 }}>{allLn[ln]["ACERS"]} </Text>
                        <TextInput
                            style={{ borderRadius: 25, borderWidth: 1, borderColor: "black", height: 40, fontSize: 17, marginTop: 10, width: "100%", alignSelf: "center", textAlign: "center", width: 100 }}
                            value={(acers !== undefined && acers !== 0) ? acers : null}
                            placeholderTextColor={'black'}
                            underlineColorAndroid="transparent"
                            onSubmitEditing={Keyboard.dismiss}
                            keyboardType="phone-pad"
                            autoFocus={true}
                            Keyboard={true}
                            onChangeText={(text) => { if (text <= AvailAcers) { setacers(text) } else { alert(allLn[ln][("Please_Enter_Acers_Less_than_or_Equal_to_Available_Acers_=_").toUpperCase()] + AvailAcers) } }}
                        />
                    </> : null}
                </ScrollView>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderTopColor: "lightgrey", borderTopWidth: 3 }}>
                <TouchableOpacity style={{ width: (acers !== 0 && acers !== undefined && acers <= AvailAcers && acers !== "") ? "50%" : "100%", backgroundColor: "white", padding: 14, alignItems: "center", flexDirection: "row", justifyContent: "center" }} onPress={() => { Linking.openURL("tel:" + route.params.ownerData.number) }}>
                    <Icons name="call" collor="black" size={24} />
                    <Text style={{ fontSize: 17, fontWeight: "bold", color: "black" }}>  {allLn[ln]["CALL_OWNER"]}</Text>
                </TouchableOpacity>
                {(acers !== 0 && acers !== undefined && acers <= AvailAcers && acers !== "") ?
                    <TouchableOpacity style={{ width: "50%", backgroundColor: "darkorange", padding: 15, alignItems: "center" }} onPress={() => { bookingconfirm(Date.now()) }}>
                        <Text style={{ fontSize: 17, fontWeight: "bold", color: "white" }}>{allLn[ln][(`Confirm_${route.params.vehicleName}`).toUpperCase()]}</Text>
                    </TouchableOpacity>
                    : null}
            </View>

        </>
    );
}
