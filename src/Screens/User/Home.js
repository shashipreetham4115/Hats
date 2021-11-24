import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Image, Pressable, ActivityIndicator, Animated } from 'react-native';
import Header from '../../components/Header'
import firestore from '@react-native-firebase/firestore'
import { UserContext } from '../../components/UserProvider'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import { BottomSheet } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import allLn from '../../components/MultiLanguage/all.json';

export default function Home({ navigation }) {

    const db = firestore();
    const userProfile = useContext(UserContext);
    const ln = userProfile.SL;
    const [allVechicles, setallVechicles] = useState([]);
    const [Vechicles, setVechicles] = useState([]);
    const [Vstate, setVstate] = useState([]);
    const [loader, setLoader] = useState(true);
    const [search, setsearch] = useState(false);
    const [filter, setfilter] = useState(false);
    const [filterOptions, setfilterOptions] = useState({ 0: true, 1: false, 2: false, 3: false, 4: false });
    const [vehicleName, setVehicleName] = useState([null, null])
    const [amount, setamount] = useState([null, null, null, null, null])
    const [rating, setrating] = useState([null, null, null, null, null])
    const [crops, setcrops] = useState([null, null, null, null, null]);
    const [f1, setf1] = useState(false);
    const [nooffilters, setnooffilters] = useState(0);
    // const sheetRef = React.useRef(null);
    // const fadeAnim = React.useRef(new Animated.Value(0)).current;

    // const fadeIn = () => {
    //     Animated.timing(fadeAnim, {
    //         toValue: 1,
    //         duration: 1000,
    //         useNativeDriver:true
    //     }).start();
    // };

    // const fadeOut = () => {
    //     Animated.timing(fadeAnim, {
    //         toValue: 0,
    //         duration: 500,
    //         useNativeDriver:true
    //     }).start();
    // };
    const distance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round((R * c) / 1000)
    }
    useEffect(() => {
        setLoader(true)
        db.collection("Vehicle").onSnapshot((s) => {
            let a = [];
            s.forEach(doc => {
                a.push({ ...doc.data(), ownerid: doc.id })
            })
            setVechicles(a)
        })
    }, []);

    useEffect(() => {
        if (Vechicles.length > 0 && Vechicles[0] !== undefined) {
            let b = [];
            Vechicles.map((datas) => {
                let data = datas;
                const ownerData = { ...data.ownerData, id: data.ownerid }
                delete data.ownerData;
                delete data.ownerid;
                Object.values(data).map(d => {
                    if (ownerData !== undefined ? ownerData.address !== undefined ? ownerData.address[d.areaCircle] === userProfile.profile.address[d.areaCircle] : null : null) {
                        const dis = distance(userProfile.profile.address.latitude, userProfile.profile.address.longitude, ownerData.address.latitude, ownerData.address.longitude)
                        b.push({ ...d, ownerData: ownerData, distance: dis })
                    }
                })
            })
            setallVechicles(b.sort(function (a, b) {
                if (a.distance < b.distance) return -1;
                else if (a.distance < b.distance) return 1;
                return 0;
            }));
            setVstate(b.sort(function (a, b) {
                if (a.distance < b.distance) return -1;
                else if (a.distance < b.distance) return 1;
                return 0;
            }));
                setLoader(false);
        }
    }, [Vechicles]);


    if (loader) {
        return (
            <>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            </>
        )
    }
    else if (allVechicles[0] === undefined || allVechicles === null || allVechicles.length === 0) {
        return (
            <>
                <View style={{ ...styles.card, borderRightWidth: 5, borderRightColor: "red", borderLeftWidth: 5, borderLeftColor: "red", borderRadius: 10, marginTop: 50, opacity: 0.7, flexDirection: "column", width: "90%", alignSelf: "center", backgroundColor: "white" }}>
                    <View style={styles.cardview}>
                        <Text style={styles.cardtext1}>{allLn[ln]['VEHICLES_NOT_AVAILABLE']}</Text>
                    </View>
                    {nooffilters > 0 ?<Pressable onPress={() => {clearFilters()}} style={{ alignItems: "center", justifyContent: "center", flexDirection: "row" }}><Icon name="delete" color="black" size={24} /><Text style={{ padding: 20, backgroundColor: "white", fontSize: 18, fontFamily: "serif" }}>Clear Filters</Text></Pressable>:null}
                </View>
            </>
        )
    }

    async function clearFilters() {
        setLoader(true);
        await setVehicleName([null, null]);
        await setamount([null, null, null, null, null]);
        await setcrops([null, null, null, null, null]);
        await setrating([null, null, null, null]);
        await setnooffilters(0); 
        setallVechicles(Vstate);
        setLoader(false);
    }

    async function Apply() {

        if (Vstate.length > 0 && Vstate[0] !== undefined) {
            setLoader(true);
            await setallVechicles(Vstate.filter((data) => {
                return (
                    (vehicleName.includes(data.vehicleName) || [...new Set(vehicleName)].length === 1) &&
                    (((data.amount <= amount[0] && amount[0] !== null) || (data.amount <= amount[1] && amount[1] !== null) || (data.amount <= amount[2] && amount[2] !== null) || (data.amount <= amount[3] && amount[3] !== null) || (data.amount >= amount[4] && amount[4] !== null) || [...new Set(amount)].length === 1)) &&
                    (data.rating >= [...new Set(rating)].sort((a, b) => a - b)[1] || [...new Set(rating)].length === 1) &&
                    (JSON.stringify(data.crops).includes(crops[0] || crops[1] || crops[2] || crops[3] || crops[4]) || [...new Set(crops)].length === 1)
                )
            }))

            setLoader(false);

        }
    }

    function sortingByP(key, order) {
        if (order === "Low") {
            setallVechicles(allVechicles.sort(function (a, b) {
                if (a[key] < b[key]) return -1;
                else if (a[key] < b[key]) return 1;
                return 0;
            }))
        } else {
            setallVechicles(allVechicles.sort(function (a, b) {
                if (a[key] > b[key]) return -1;
                else if (a[key] > b[key]) return 1;
                return 0;
            }))
        }
    }


    const SearchContainer = () => {
        return (
            <>
                <View style={{ alignItems: "center", justifyContent: "center", backgroundColor: "whitesmoke", borderRadius: 25, width: "95%", alignSelf: "center" }}>
                    <Text style={{ ...styles.card, padding: 20, textAlign: "center", borderRadius: 50, width: "95%", alignSelf: "center", fontSize: 16 }}>{allLn[ln]['SORT']}</Text>
                    <TouchableOpacity style={{ ...styles.card, padding: 20, borderRadius: 50, width: "95%", alignSelf: "center" }} onPress={() => { sortingByP('rating', 'High'); setsearch(false) }}><Text style={{ fontWeight: "bold", fontSize: 17 }}>{allLn[ln]['RATING_--_HIGH_TO_LOW']}</Text></TouchableOpacity>
                    <TouchableOpacity style={{ ...styles.card, padding: 20, borderRadius: 50, width: "95%", alignSelf: "center" }} onPress={() => { sortingByP('rating', 'Low'); setsearch(false) }}><Text style={{ fontWeight: "bold", fontSize: 17 }}>{allLn[ln]['RATING_--_LOW_TO_HIGH']}</Text></TouchableOpacity>
                    <TouchableOpacity style={{ ...styles.card, padding: 20, borderRadius: 50, width: "95%", alignSelf: "center" }} onPress={() => { sortingByP('amount', 'Low'); setsearch(false) }}><Text style={{ fontWeight: "bold", fontSize: 17 }}>{allLn[ln]['AMOUNT_--_LOW_TO_HIGH']}</Text></TouchableOpacity>
                    <TouchableOpacity style={{ ...styles.card, padding: 20, borderRadius: 50, width: "95%", alignSelf: "center" }} onPress={() => { sortingByP('amount', 'High'); setsearch(false) }}><Text style={{ fontWeight: "bold", fontSize: 17 }}>{allLn[ln]['AMOUNT_--_HIGH_TO_LOW']}</Text></TouchableOpacity>
                    <TouchableOpacity style={{ ...styles.card, padding: 20, borderRadius: 50, width: "95%", alignSelf: "center" }} onPress={() => { sortingByP('distance', 'Low'); setsearch(false) }}><Text style={{ fontWeight: "bold", fontSize: 17 }}>{allLn[ln]['DISTANCE_--_LOW_TO_HIGH']}</Text></TouchableOpacity>
                    <TouchableOpacity style={{ ...styles.card, padding: 20, borderRadius: 50, width: "95%", alignSelf: "center" }} onPress={() => { sortingByP('distance', 'High'); setsearch(false) }}><Text style={{ fontWeight: "bold", fontSize: 17 }}>{allLn[ln]['DISTANCE_--_HIGH_TO_LOW']}</Text></TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setsearch(false)} style={{ ...styles.card, padding: 15, marginTop: 20, backgroundColor: "red", borderRadius: 50, marginBottom: 5, width: "95%", alignSelf: "center" }}><Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}
                >{allLn[ln]['CANCEL']}</Text></TouchableOpacity>
            </>
        )
    }

    const FilterContainer = () => {
        return (
            <>
                <View style={{ alignItems: "center", justifyContent: "center", borderRadius: 25, width: "100%", alignSelf: "center", padding: 20 }}>
                    <Text style={{ ...styles.card, padding: 20, textAlign: "center", backgroundColor: "white", borderRadius: 50, width: "95%", alignSelf: "center", fontSize: 25, fontFamily: "serif" }}>{allLn[ln][('Filters').toUpperCase()]}</Text>
                    <Pressable onPress={() => { clearFilters() }} style={{ alignItems: "center", justifyContent: "center", flexDirection: "row" }}><Icon name="delete" color="black" size={24} /><Text style={{ padding: 20, backgroundColor: "white", fontSize: 18, fontFamily: "serif" }}>{allLn[ln][('Clear_Filters').toUpperCase()]}</Text></Pressable>
                    <View style={{ flexDirection: 'row', alignItems: "center" }}>
                        <View style={{ width: "35%", borderTopWidth: 1, borderTopColor: 'lightgrey', borderBottomWidth: 1, borderBottomColor: 'lightgrey', borderLeftWidth: 1, borderLeftColor: 'lightgrey' }}>
                            <TouchableOpacity onPress={() => { setfilterOptions({ 0: true, 1: false, 2: false, 3: false, 4: false }) }} style={{ backgroundColor: filterOptions[0] ? "white" : "#e6f2ff", padding: 20 }}><Text style={{ fontSize: 17, textAlign: "center" }}>{allLn[ln][('Vehicles').toUpperCase()]}</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => { setfilterOptions({ 0: false, 1: true, 2: false, 3: false, 4: false }) }} style={{ backgroundColor: filterOptions[1] ? "white" : "#e6f2ff", padding: 20 }}><Text style={{ fontSize: 17, textAlign: "center" }}>{allLn[ln][('Amount').toUpperCase()]}</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => { setfilterOptions({ 0: false, 1: false, 2: false, 3: true, 4: false }) }} style={{ backgroundColor: filterOptions[3] ? "white" : "#e6f2ff", padding: 20 }}><Text style={{ fontSize: 17, textAlign: "center" }}>{allLn[ln][('Ratings').toUpperCase()]}</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => { setfilterOptions({ 0: false, 1: false, 2: false, 3: false, 4: true }) }} style={{ backgroundColor: filterOptions[4] ? "white" : "#e6f2ff", padding: 20 }}><Text style={{ fontSize: 17, textAlign: "center" }}>{allLn[ln][('Crops').toUpperCase()]}</Text></TouchableOpacity>
                        </View>
                        <View style={{ width: "65%", height: "100%", borderTopWidth: 1, borderTopColor: 'lightgrey', borderBottomWidth: 1, borderBottomColor: 'lightgrey', borderRightWidth: 1, borderRightColor: 'lightgrey' }}>
                            {
                                filterOptions[0] === true ?
                                    <View>
                                        <Pressable onPress={() => { vehicleName[0] = vehicleName[0] === "Harvester" ? null : "Harvester"; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                            {vehicleName[0] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('Harvester').toUpperCase()]}</Text></Pressable>
                                        <Pressable onPress={() => { vehicleName[1] = vehicleName[1] === "Tractor" ? null : "Tractor"; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                            {vehicleName[1] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('Tractor').toUpperCase()]}</Text></Pressable>
                                    </View>
                                    : filterOptions[1] === true ?
                                        <View>
                                            <Pressable onPress={() => { amount[0] = amount[0] === 2000 ? null : 2000; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                {amount[0] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('2000_and_below').toUpperCase()]}</Text></Pressable>
                                            <Pressable onPress={() => { amount[1] = amount[1] === 3000 ? null : 3000; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                {amount[1] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('3000_and_below').toUpperCase()]}</Text></Pressable>
                                            <Pressable onPress={() => { amount[2] = amount[2] === 4000 ? null : 4000; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                {amount[2] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('4000_and_below').toUpperCase()]}</Text></Pressable>
                                            <Pressable onPress={() => { amount[3] = amount[3] === 5000 ? null : 5000; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                {amount[3] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('5000_and_below').toUpperCase()]}</Text></Pressable>
                                            <Pressable onPress={() => { amount[4] = amount[4] === 6000 ? null : 6000; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                {amount[4] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('5000_and_above').toUpperCase()]}</Text></Pressable>
                                        </View>
                                            : filterOptions[3] === true ?
                                                <View>
                                                    <Pressable onPress={() => { rating[0] = rating[0] === 4 ? null : 4; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                        {rating[0] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('4★_and_above').toUpperCase()]}</Text></Pressable>
                                                    <Pressable onPress={() => { rating[1] = rating[1] === 3 ? null : 3; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                        {rating[1] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('3★_and_above').toUpperCase()]}</Text></Pressable>
                                                    <Pressable onPress={() => { rating[2] = rating[2] === 2 ? null : 2; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                        {rating[2] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('2★_and_above').toUpperCase()]}</Text></Pressable>
                                                    <Pressable onPress={() => { rating[3] = rating[3] === 1 ? null : 1; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                        {rating[3] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('1★_and_above').toUpperCase()]}</Text></Pressable>
                                                </View>
                                                : filterOptions[4] === true ?
                                                    <View>
                                                        <Pressable onPress={() => { crops[0] = crops[0] === "Paddy" ? null : "Paddy"; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                            {crops[0] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('Paddy').toUpperCase()]}</Text></Pressable>
                                                        <Pressable onPress={() => { crops[1] = crops[1] === "Wheat" ? null : "Wheat"; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                            {crops[1] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('Wheat').toUpperCase()]}</Text></Pressable>
                                                        <Pressable onPress={() => { crops[2] = crops[2] === "Sugarcane" ? null : "Sugarcane"; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                            {crops[2] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('Sugarcane').toUpperCase()]}</Text></Pressable>
                                                        <Pressable onPress={() => { crops[3] = crops[3] === "Bean" ? null : "Bean"; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                            {crops[3] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('Beans').toUpperCase()]}</Text></Pressable>
                                                        <Pressable onPress={() => { crops[4] = crops[4] === "Maize" ? null : "Maize"; setf1(!f1) }} style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", padding: 10 }}>
                                                            {crops[4] === null ? <Icon name={"check-box-outline-blank"} color={"black"} size={24} /> : <Icon name={"check-box"} color={"blue"} size={24} />}<Text style={{ fontSize: 16, marginLeft: 10 }}>{allLn[ln][('Maize').toUpperCase()]}</Text></Pressable>
                                                    </View>
                                                    : null
                            }
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-around" }}>
                    <TouchableOpacity onPress={() => { setfilter(false); }} style={{ ...styles.card, padding: 10, marginTop: 20, backgroundColor: "red", borderRadius: 50, marginBottom: 5, width: "35%", alignSelf: "center" }}><Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}
                    >{allLn[ln][('Cancel').toUpperCase()]}</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        setnooffilters(([... new Set(vehicleName)].length > 1 ? 1 : 0) + ([... new Set(amount)].length > 1 ? 1 : 0) + ([... new Set(rating)].length > 1 ? 1 : 0) + ([... new Set(crops)].length > 1 ? 1 : 0)); setfilter(false)
                        Apply()
                    }}
                        style={{ ...styles.card, padding: 10, marginTop: 20, backgroundColor: "#00a500", borderRadius: 50, marginBottom: 5, width: "35%", alignSelf: "center" }}><Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}
                        >{allLn[ln][('Apply').toUpperCase()]}</Text></TouchableOpacity>
                </View>
            </>
        )
    }

    return (
        <SafeAreaProvider>
            <>
                <BottomSheet
                    isVisible={search}
                >
                    <SearchContainer />
                </BottomSheet>
                <Modal
                    animationType="fade"
                    visible={filter}
                    onRequestClose={() => {
                        Apply();
                        setfilter(!filter);
                    }}
                >
                    <Header headertitle="Home" />
                    <FilterContainer />

                </Modal>
                <View style={{ flexDirection: "row" }}>

                    <TouchableOpacity style={{
                        ...styles.card, flexDirection: "row", alignItems: "center"
                        , justifyContent: "center", backgroundColor: "white", borderBottomColor: "lightgrey",
                        borderBottomWidth: 3, width: "50%", borderRightColor: "lightgrey", borderRightWidth: 2,
                        borderTopColor: "lightgrey", borderTopWidth: 2
                    }} onPress={() => {
                        setsearch(true);
                    }}>
                        <Icons name="sort" color="black" size={24} />
                        <Text style={{ fontSize: 16, fontFamily: "serif", marginLeft: 10 }}>{allLn[ln][('Sort').toUpperCase()]}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        ...styles.card, flexDirection: "row", alignItems: "center",
                        justifyContent: "center", backgroundColor: "white", borderBottomColor: "lightgrey", borderBottomWidth: 3,
                        width: "50%", borderTopColor: "lightgrey", borderTopWidth: 2
                    }}
                        onPress={() => { setfilter(true) }}>
                        <Icon name="filter-list" color="black" size={24} />
                        <Text style={{ fontSize: 16, fontFamily: "serif", marginLeft: 10 }}>{allLn[ln][('Filter').toUpperCase()]}  </Text>
                        {nooffilters > 0 ?
                            <Text style={{ backgroundColor: "red", color: "white", fontSize: 13, paddingHorizontal: 5, borderRadius: 100 }}>{nooffilters}</Text>
                            : null}
                    </TouchableOpacity>
                </View>
                <View>
                    <ScrollView showsHorizontalScrollIndicator={false}>

                        <View style={styles.cardContainer}>
                            {allVechicles.map((list, k) => {

                                if (list.per === undefined || list === null || allVechicles.length === 0) {
                                    return (
                                        null
                                    )
                                }
                                else {
                                    var image = list.vehicleName === "Harvester" ? require('../../../assets/harvester.jpg') :
                                       require('../../../assets/tractor.jpg')
                                    return (
                                        <View key={k} >
                                            <Pressable style={{ ...styles.card, flexDirection: "row-reverse" }}
                                                onPress={() => {
                                                    navigation.navigate('Vehicle Details',list)
                                                }}>
                                                <View style={{ width: "10%", alignItems: "center", justifyContent: "center" }}>
                                                    <Icon name={"star-rate"} color={list.rating > 4 ? "#00a500" : list.rating > 2 ? "#EEBC1D" : "red"} size={30} /><Text style={{ fontSize: 18, fontWeight: "bold", color: list.rating > 4 ? "#00a500" : list.rating > 2 ? "#EEBC1D" : "red" }}>{list.rating}</Text>
                                                </View>
                                                <View style={styles.cardview}>
                                                    <Text style={styles.cardtext1}>{allLn[ln][(list.vehicleName).toUpperCase()]}</Text>
                                                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "black" }}>₹{list.amount}/{allLn[ln][((list.per).split(" ")[2]).toUpperCase()]}</Text>
                                                    <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>{list.distance} Km {allLn[ln][('from_you').toUpperCase()]}</Text>
                                                </View>
                                                <View style={{ width: "30%", alignItems: "center", justifyContent: "center" }}>
                                                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", position: "absolute" }}>
                                                        <ActivityIndicator size="large" color="#ffffff" />
                                                    </View>
                                                    <Image source={image} style={styles.image} ></Image>
                                                </View>
                                            </Pressable>
                                        </View>
                                    )
                                }
                            })}
                        </View>
                    </ScrollView>
                </View>
            </>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    image: {
        borderWidth: 1,
        borderColor: "white",
        width: "100%",
        height: 100,
    },
    cardContainer: {
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 100
    },
    card: {
        elevation: 3,
        backgroundColor: "whitesmoke",
        shadowOffset: { width: 1, height: 1 },
        shadowColor: "#E0E0D7",
        shadowOpacity: 0.3,
        shadowRadius: 2,
        alignItems: 'center',
        justifyContent: "space-around",
        width: "100%",
        padding: 15,
        borderBottomColor: "lightgrey",
        borderBottomWidth: 1
    },
    cardview: {
        alignItems: "center",
        justifyContent: "center",
        width: "60%"
    },
    cardtext1: {
        fontSize: 22,
        color: "black"
        , fontWeight: "bold",
        paddingBottom: 10,
        textAlign:"center"
    }
})