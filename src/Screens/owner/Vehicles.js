import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Image, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import Header from "../../components/Header";
import SelectBox from 'react-native-multi-selectbox'
import { xorBy } from 'lodash'
import Spinner from 'react-native-loading-spinner-overlay'
import Icons from 'react-native-vector-icons/Ionicons'
import Check from 'react-native-vector-icons/MaterialCommunityIcons'
import firestore from '@react-native-firebase/firestore'
import { UserContext } from '../../components/UserProvider';
import allLn from '../../components/MultiLanguage/all.json'

export default function Vehicles() {
    const db = firestore();
    const userProfile = useContext(UserContext);
    const uid = userProfile.uid.uid;
    const ln = userProfile.SL;
    const [ModalVisible, setModelVisible] = useState(false);
    const [vehicletype, setVehicletype] = useState({ item: allLn[ln]["CHOOSE_VEHICLE_NAME"], id: 0 });
    const [perHour, setPerhour] = useState({ item: allLn[ln]["AMOUNT_PER_HOUR_OR_ACER"], id: 0 });
    const [areas, setAreas] = useState({ item: allLn[ln]["BOOKING_AREAS"], id: 0, v: "" });
    const [crops, setCrops] = useState([]);
    const [MaxBookingAcers, setMaxBookingAcers] = useState(allLn[ln]["ENTER_MAX_BOOKING_ACERS_PER_DAY"])
    const [vehicleNo, setVehicleNo] = useState('');
    const [loader, setLoader] = useState(false)
    const [amount, setAmount] = useState('');
    const [vehicleList, setVehicleList] = useState([]);
    const [status, setStatus] = useState({ item: allLn[ln]["WORKING"], v: "Working", id: 0 });
    const [update, setUpdate] = useState(false);
    const [vid, setVID] = useState(0);
    const [keys, setKeys] = useState([]);


    useEffect(() => {
        db.collection('Vehicle').doc(uid).onSnapshot((doc) => {
            let a = []
            let data = doc.data();
            delete data.ownerData;
            if (data === undefined || Object.values(data).length === 0) {
                a.push({ vehicleName: "Vehicles Not Registered Yet" })
            } else {
                a = Object.values(data)
                setKeys(Object.keys(data))
            }
            setVehicleList(a);

        })

    }, [])
    if (vehicleList.length === 0) {
        return (
            <>
                <Header headertitle="Vehicle" add={(value) => {
                    resetAll();
                    setUpdate(false); setModelVisible(value)
                }} />
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            </>
        )
    }
    function resetAll() {
        setVehicletype({ item: allLn[ln]["CHOOSE_VEHICLE_NAME"], id: 0 });
        setPerhour({ item: allLn[ln]["AMOUNT_PER_HOUR_OR_ACER"], id: 0 });
        setAreas({ item: allLn[ln]["BOOKING_AREAS"], id: 0 });
        setCrops([]); setVehicleNo(''); setAmount(''); setMaxBookingAcers(allLn[ln]["ENTER_MAX_BOOKING_ACERS_PER_DAY"]);
        setStatus({ item: allLn[ln]["WORKING"], v: "Working", id: 0 })
    }
    function registerVehicle() {
        setLoader(true);
        if (update) {
            db.collection('Vehicle').doc(uid).update(keys[vehicletype.id], {
                vehicleName: vehicletype.v,
                per: perHour.v,
                areaCircle: areas.v,
                vehicleNo: vehicleNo,
                amount: amount,
                crops: crops,
                MaxBookingAcers: parseInt(MaxBookingAcers),
                status: status.v,
                rating: 0
            }).then(() => {
                resetAll();
                setModelVisible(false);
                setLoader(false)
            })
        } else {
            db.collection("Profiles").doc(uid).update("vr", vehicleList.length)
            db.collection('Vehicle').doc(uid).set({
                [Date.now()]: {
                    vehicleName: vehicletype.v,
                    per: perHour.v,
                    areaCircle: areas.v,
                    vehicleNo: vehicleNo,
                    amount: amount,
                    crops: crops,
                    status: status.v,
                    rating: 0,
                    MaxBookingAcers: parseInt(MaxBookingAcers),
                }
            }, { merge: true }).then(() => {
                resetAll();
                setModelVisible(false);
                setLoader(false)
            })
        }
    }

    return (
        <>
            <Spinner visible={loader}></Spinner>
            <Header headertitle="Vehicle" add={(value) => {
                resetAll();
                setUpdate(false); setModelVisible(value)
            }} />
            <ScrollView showsHorizontalScrollIndicator={false}>

                <View style={styles.cardContainer}>
                    {vehicleList.map((list, k) => {
                        if (list.vehicleName === "Vehicles Not Registered Yet") {
                            return (
                                <View key={k} style={{ ...styles.card, borderRightWidth: 5, borderRightColor: "red", borderRadius: 10, marginTop: 50, opacity: 0.7, flexDirection: "row" }}>
                                    <Check name={'close-thick'} color="red" size={30} />
                                    <View style={styles.cardview}>
                                        <Text style={styles.cardtext1}>{allLn[ln]["VEHICLES_NOT_REGISTERED_YET"]}</Text>
                                    </View>
                                </View>
                            )
                        } else {
                            var image = list.vehicleName === "Harvester" ? require('../../../assets/harvester.jpg') : require('../../../assets/tractor.jpg')
                            return (
                                <View key={k} >
                                    <TouchableOpacity style={{ ...styles.card, flexDirection: (k + 1) % 2 === 0 ? "row-reverse" : "row" }}
                                        onPress={() => {
                                            setVehicletype({ item: allLn[ln][list.vehicleName === "Harvester" ? "HARVESTER" : "TRACTOR"], id: k });
                                            setPerhour({ item: allLn[ln][list.per === "Amount per Hour" ? "AMOUNT_PER_HOUR" : "AMOUNT_PER_ACER"], id: k });
                                            setAreas({ item: allLn[ln][list.areaCircle === "city" ? "CITY" : list.areaCircle === "subregion" ? "DISTRICT" : list.areaCircle === "region" ? "STATE" : "COUNTRY"], id: k, v: list.areaCircle });
                                            setCrops(list.crops); setVehicleNo(list.vehicleNo); setAmount(list.amount);
                                            setStatus({ item: allLn[ln][list.status === "Working" ? "WORKING" : "REPAIR"], v: "Working", id: 0 });
                                            setMaxBookingAcers(list.MaxBookingAcers);
                                            setUpdate(true); setModelVisible(true)
                                            setVID(k)
                                        }}>
                                        <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                                            <Check name={list.status === "Working" ? 'check-bold' : 'close-thick'} color={list.status === "Working" ? "#00A500" : "red"} size={30} />
                                        </View>
                                        <View style={styles.cardview}>
                                            <Text style={styles.cardtext1}>{allLn[ln][(list.vehicleName === "Harvester" ? "HARVESTER" : "TRACTOR")]}</Text>
                                            <Text style={styles.cardtext1}>{list.vehicleNo}</Text>
                                        </View>
                                        <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                                            <Image source={image} style={styles.image}></Image>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    })}
                </View>
            </ScrollView>
            <Modal
                animationType="fade"
                transparent={true}
                visible={ModalVisible}
                onRequestClose={() => {
                    resetAll();
                    setUpdate(false)
                    setModalVisible(!ModalVisible);
                }}
            ><>
                    <Header headertitle="Add Vehicle" add={(value) => { setModelVisible(value) }} />
                    <View style={{ alignItems: "center", flex: 1, backgroundColor: "white" }}>
                        <View style={{ width: "80%", marginTop: 25 }}>

                            <View>

                                <SelectBox
                                    label=""
                                    containerStyle={{ borderRadius: 25, borderWidth: 1, borderColor: "black", height: 40, paddingLeft: 10 }}
                                    labelStyle={{ color: "black" }}
                                    options={[{ item: allLn[ln]["HARVESTER"], v: "Harvester", id: 0 }, { item: allLn[ln]["TRACTOR"], v: "Tractor", id: 1 }]}
                                    value={vehicletype}
                                    onChange={(val) => { setVehicletype(val) }}
                                    hideInputFilter={true}
                                />
                                <TextInput
                                    style={{ borderRadius: 25, borderWidth: 1, borderColor: "black", height: 40, paddingLeft: 13, fontSize: 17, marginTop: 20 }}
                                    placeholder={allLn[ln]["ENTER_VEHICLE_NUMBER"]}
                                    placeholderTextColor={'black'}
                                    underlineColorAndroid="transparent"
                                    defaultValue={vehicleNo}
                                    onChangeText={(text) => { setVehicleNo(text) }}
                                    onSubmitEditing={Keyboard.dismiss}
                                />
                                <TextInput
                                    style={{ borderRadius: 25, borderWidth: 1, borderColor: "black", height: 40, paddingLeft: 13, fontSize: 17, marginTop: 20 }}
                                    placeholder={allLn[ln]["ENTER_AMOUNT"]}
                                    defaultValue={amount}
                                    placeholderTextColor={'black'}
                                    underlineColorAndroid="transparent"
                                    keyboardType="phone-pad"
                                    autoCompleteType="tel"
                                    onChangeText={(text) => { setAmount(text) }}
                                    onSubmitEditing={Keyboard.dismiss}
                                />
                                <TextInput
                                    style={{ borderRadius: 25, borderWidth: 1, borderColor: "black", height: 40, paddingLeft: 13, fontSize: 17, marginTop: 20 }}
                                    placeholder={allLn[ln]["ENTER_MAX_BOOKINGS_ACERS_PER_DAY"]}
                                    placeholderTextColor={'black'}
                                    underlineColorAndroid="transparent"
                                    keyboardType="phone-pad"
                                    autoCompleteType="tel"
                                    defaultValue={`${MaxBookingAcers}`}
                                    onChangeText={(text) => { setMaxBookingAcers(text) }}
                                    onSubmitEditing={Keyboard.dismiss}
                                    onFocus={() => { setMaxBookingAcers('') }}
                                />
                                <SelectBox
                                    label=""
                                    containerStyle={{ borderRadius: 25, borderWidth: 1, borderColor: "black", height: 40, paddingLeft: 10 }}
                                    labelStyle={{ color: "black" }}
                                    options={[{ item: allLn[ln]["AMOUNT_PER_HOUR"], v: "Amount per Hour", id: 0 }, { item: allLn[ln]["AMOUNT_PER_ACER"], v: "Amount per Acer", id: 1 }]}
                                    value={perHour}
                                    onChange={(val) => { setPerhour(val) }}
                                    hideInputFilter={true}
                                />

                                <SelectBox
                                    label=""
                                    containerStyle={{ borderRadius: 25, borderWidth: 1, borderColor: "black", height: 40, paddingLeft: 10 }}
                                    labelStyle={{ color: "black" }}
                                    options={[{ item: allLn[ln]["CITY"], id: 0, v: "city" }, { item: allLn[ln]["DISTRICT"], id: 1, v: "subregion" }, { item: allLn[ln]["STATE"], id: 2, v: "region" }, { item: allLn[ln]["COUNTRY"], id: 3, v: "country" }]}
                                    value={areas}
                                    onChange={(val) => { setAreas(val) }}
                                    hideInputFilter={true}
                                />
                                {update ?
                                    <SelectBox
                                        label=""
                                        containerStyle={{ borderRadius: 25, borderWidth: 1, borderColor: "black", height: 40, paddingLeft: 10 }}
                                        labelStyle={{ color: "black" }}
                                        options={[{ item: allLn[ln]["WORKING"], v: "Working", id: 0 }, { item: allLn[ln]["REPAIR"], v: "Repair", id: 1 }]}
                                        value={status}
                                        onChange={(val) => { setStatus(val) }}
                                        hideInputFilter={true}
                                    /> : null
                                }
                                {vehicletype.v === "Harvester" ?
                                    <SelectBox
                                        label=""
                                        multiListEmptyLabelStyle={{ color: "black" }}
                                        inputPlaceholder={allLn[ln]["HARVESTER_FOR_WHICH_CROPS"]}
                                        containerStyle={{ borderRadius: 25, borderWidth: 1, borderColor: "black", height: 40, paddingLeft: 10 }}
                                        options={[{ item: allLn[ln]["PADDY"], v: "Paddy", id: 0 }, { item: allLn[ln]["WHEAT"], v: "Wheat", id: 1 }, { item: allLn[ln]["SUGARCANE"], v: "Sugarcane", id: 2 }, { item: allLn[ln]["BEANS"], v: "Bean", id: 3 }, { item: allLn[ln]["MAIZE"], v: "Maize", id: 4 }]}
                                        selectedValues={crops}
                                        onMultiSelect={(val) => { setCrops(xorBy(crops, [{ item: val.v, id: val.id }], 'id')) }}
                                        onTapClose={(val) => { setCrops(xorBy(crops, [{ item: val.v, id: val.id }], 'id')) }}
                                        isMulti={true}
                                        hideInputFilter={true}
                                    /> : null}

                                <View style={{ alignItems: "center", justifyContent: "center" }}>
                                    <TouchableOpacity style={{
                                        backgroundColor: "#00A500", margin: 10, borderRadius: 50, flexDirection: "row",
                                        alignItems: "center", justifyContent: "center", padding: 5, paddingHorizontal: 50, marginTop: 40
                                    }} onPress={() => { registerVehicle() }}>
                                        <Icons name={'add'} color="white" size={26} />
                                        <Text style={{ color: "white", fontSize: 17, fontWeight: "bold" }}>   {update ? allLn[ln]['UPDATE'] : allLn[ln]['ADD_VEHICLE']}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </>
            </Modal>
        </>
    );
}


const styles = StyleSheet.create({
    cardContainer: {
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
    },
    card: {
        borderRadius: 13,
        elevation: 3,
        backgroundColor: "white",
        shadowOffset: { width: 1, height: 1 },
        shadowColor: "#E0E0D7",
        shadowOpacity: 0.3,
        shadowRadius: 2,
        marginTop: 15,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: "space-around",
        width: "90%",
        padding: 7
    },
    cardview: {
        alignItems: "center",
        justifyContent: "center",
        width: "50%"
    },
    cardtext1: {
        fontSize: 20,
        color: "black"
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 50
    }
})