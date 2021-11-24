import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, PermissionsAndroid, TouchableOpacity, ScrollView, StatusBar, Modal, TextInput, Keyboard, ActivityIndicator, Platform } from 'react-native';
import Header from "./Header"
import Icons from 'react-native-vector-icons/Ionicons'
import Logout from 'react-native-vector-icons/AntDesign'
import Map from 'react-native-vector-icons/FontAwesome5'
import Gallary from 'react-native-vector-icons/Entypo'
import Language from 'react-native-vector-icons/FontAwesome'
import Edit from 'react-native-vector-icons/MaterialCommunityIcons'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import storage from '@react-native-firebase/storage'
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialIcons'
import Donut from './Donut'
import { UserContext } from './UserProvider'
import allLn from './MultiLanguage/all.json'
import ChooseLanguage from './ChooseLanguage';
import axios from 'axios';

export default function Profiles(props) {
    const db = firestore();
    const [image, setImage] = useState("");
    const [imageUrl, setImageUrl] = useState('');
    const [edit, setEdit] = useState(false);
    const [completeprofile, setcompleteprofile] = useState(false);
    const [imagePopup, setImagePopup] = useState(false);
    const [progressbar, setprogressbar] = useState(false);
    const [imageLoader, setImageLoader] = useState(true);
    const [ChangeLan, setChangeLan] = useState(false);
    const [location, setLocation] = useState({});
    const [progress, setprogress] = useState(0);
    const [name, setName] = useState('Name');
    const profile = useContext(UserContext)
    const user = profile.uid;
    const userProfile = profile.profile;
    const ln = profile.SL;

    if (userProfile.vr === "" || completeprofile === true) {
        return (
            <>
                <Header headertitle={props.edit === "profile" ? "Profile" : "Complete Profile"} />
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            </>
        )
    }

    if (ChangeLan === true) {
        return <ChooseLanguage type={"profile"} setSL={ln => { profile.setSL(ln) }} setChangeLann={() => { setChangeLan(false) }} />
    }

    const getLocation = async () => {
        setLocation({})
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
                'title': 'Location Access Required',
                'message': 'This App needs to Access your location'
            }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                Geolocation.getCurrentPosition(
                    (position) => {
                        axios.get(`https://api.tomtom.com/search/2/reverseGeocode/${position.coords.latitude},${position.coords.longitude}?JSON&key=PPyxXVRoeWfpeQAIAoR02RIHK2ASyuHr`).then(res => {
                            let data = res.data.addresses[0].address
                            setLocation(
                                {
                                    city: data.localName,
                                    country: data.country,
                                    district: "",
                                    isoCountryCode: data.countryCode,
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude,
                                    name: data.freeformmAddress,
                                    postalCode: data.postalCode,
                                    region: data.countrySubdivision,
                                    street: "",
                                    subregion: data.countrySecondarySubdivision,
                                }
                            );
                        }
                        )
                    },
                    (error) => {
                        console.log(error.code, error.message);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            } else {
                alert("Permission Denied");
            }
        } catch (err) {
            console.log("err", err);
        }

        // let { status } = await Location.requestPermissionsAsync();
        // if (status !== 'granted') {
        //     alert('Permission to access location was denied');
        //     return;
        // }

        // let location1 = await Location.getCurrentPositionAsync({});
        // const address = await Location.reverseGeocodeAsync(location1.coords);
        // setLocation({ ...address[0], latitude: location1.coords.latitude, longitude: location1.coords.longitude });
    }

    const onChooseCam = async () => {
        //     let result = await ImagePicker.launchCameraAsync(
        //         {
        //             mediaTypes: ImagePicker.MediaTypeOptions.All,
        //             allowsEditing: true,
        //             aspect: [4, 4],
        //             quality: 1,
        //         }
        //     );

        //     if (!result.cancelled) {
        //         setImage(result.uri);
        //         setImagePopup(false)
        //     }

        ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: true,
        }).then(image => {
            setImage(image.path);
            setImagePopup(false)
        });
    }

    const onChooseFormGallary = async () => {
        //     let result = await ImagePicker.launchImageLibraryAsync(
        //         {
        //             mediaTypes: ImagePicker.MediaTypeOptions.All,
        //             allowsEditing: true,
        //             aspect: [4, 4],
        //             quality: 1,
        //         }
        //     );

        //     if (!result.cancelled) {
        //         
        //     }

        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true
        }).then(image => {
            setImage(image.path);
            setImagePopup(false)
        });
    }

    function editProfile(url) {
        db.collection("Vehicle").doc(user.uid).set({
            ownerData: {
                imageURL: url,
                name: name === "" ? userProfile.name : name,
                address: location.latitude === undefined ? userProfile.address : location,
                upi: userProfile.upi,
                vr: userProfile.vr,
                income: userProfile.income,
                number: user.phoneNumber
            }
        }, { merge: true });
        db.collection("Profiles").doc(user.uid).set({
            imageURL: url,
            name: name === "" ? userProfile.name : name,
            address: location.latitude === undefined ? userProfile.address : location,
            upi: userProfile.upi,
            vr: userProfile.vr,
            income: userProfile.income,
            number: user.phoneNumber
        }).then(() => {
            if (props.edit !== "profile") {
                completeprofile(true)
            }
            setImagePopup(false);
            setprogressbar(false)
            setEdit(false);
        })
    }

    const uploadImage = async () => {
        const response = await fetch(image);
        const blob = await response.blob();
        var ref = storage().ref("images/" + user.uid);
        return ref.put(blob).on('state_changed', async function (snapshot) {
            var progress1 = await (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setprogress(Math.round(progress1))
            if (progress1 > 0) {
                setprogressbar(true);
            } if (progress1 === 100) { setprogress(0), setImage('') }
        }, function (error) {
            alert(error)
        }, async function () {
            const urL = await storage().ref('images/' + user.uid).getDownloadURL()
            await setImageUrl(urL);
            if (urL) {
                editProfile(urL)
            }
        })
    }

    function logout() {
        auth().signOut()
    }

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={props.edit === "profile" ? edit : true}
                onRequestClose={() => {
                    props.edit === "profile" ? setEdit(!edit) : null;
                }}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={imagePopup}
                    onRequestClose={() => {
                        setEdit(!imagePopup);
                    }}>
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
                        <View style={styles.modalView}>
                            <View style={{ width: "100%", alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                                <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", width: "100%" }}>
                                    <Text style={{ paddingBottom: 10, color: "black", fontSize: 25, fontWeight: "bold", paddingLeft: 20 }}>{allLn[ln]["CHOOSE"]}</Text>
                                    <Icons name={"close"} color="black" size={35} style={{ marginTop: -10 }} onPress={() => { setImagePopup(false) }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", padding: 20 }}>
                                <View style={{ flex: 0.5, alignItems: "center", justifyContent: "center", padding: 10 }}>
                                    <Gallary name={"camera"} color="black" size={40} onPress={() => { onChooseCam() }} /><Text style={{ fontWeight: "bold", fontSize: 17 }}>{allLn[ln]["CAMERA"]}</Text>
                                </View>
                                <View style={{ flex: 0.5, alignItems: "center", justifyContent: "center", padding: 10 }}>
                                    <Gallary name={"images"} color="black" size={40} onPress={() => { onChooseFormGallary() }} /><Text style={{ fontWeight: "bold", fontSize: 17 }}>{allLn[ln]["GALLERY"]}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={progressbar}
                    onRequestClose={() => {
                        setEdit(progressbar);
                    }}>
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
                        <View style={styles.modalView}>
                            <View style={{ width: "100%", alignItems: "center", justifyContent: "center", flexDirection: "row", marginBottom: 20 }}>
                                <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%" }}>
                                    <Text style={{ paddingBottom: 10, color: "black", fontSize: 25, fontWeight: "bold", paddingLeft: 20 }}>{allLn[ln]["IMAGE_UPLOADING..."]}</Text>
                                </View>
                            </View>

                            <Donut percentage={progress} color={'#00a500'} delay={0} max={100} />
                        </View>
                    </View>
                </Modal>
                <Header headertitle={props.edit === "profile" ? "Edit Profile" : "Complete Profile"} />
                <View style={{ flex: 10 }}>
                    <View style={{ flex: 1, backgroundColor: "#00A500" }}>
                        {props.edit === "profile" ? <View style={{ width: "100%", alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                            <View style={{ alignItems: "center", justifyContent: "flex-end", flexDirection: "row", width: "100%" }}>
                                <Icons name={'close'} color="white" size={35} style={{ marginTop: -10 }} onPress={() => { setEdit(false) }} />
                            </View>
                        </View> : null}
                        <View style={{ flex: 0.3 }}>
                            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%" }}>
                                <View style={{ alignItems: "center", justifyContent: "center", width: "30%" }}>
                                    <Image source={{ uri: imageUrl === "" ? image === "" ? userProfile.imageURL : image : imageUrl }} style={styles.profilepic}></Image>
                                    <View style={{ width: "80%", alignItems: "flex-end", justifyContent: 'flex-end', marginTop: -50 }}>
                                        <Edit name={"image-edit"} color={"white"} size={40} onPress={() => { setImagePopup(true) }} />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.Card}>
                            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10 }}>
                                <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                                    <Icons name={"person"} color={"black"} size={24} />
                                </View>
                                <View style={{ width: "75%" }}>
                                    <TextInput
                                        style={{ height: 40, paddingLeft: 13, fontSize: 17 }}
                                        placeholder={userProfile.name}
                                        placeholderTextColor={'black'}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(text) => { setName(text) }}
                                        onSubmitEditing={Keyboard.dismiss}
                                    />
                                </View>
                            </View>
                            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10 }}>
                                <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                                    <Map name={"map-marked-alt"} color={"black"} size={24} />
                                </View>
                                <View style={{ width: "75%", flexDirection: "row", flexWrap: "wrap" }}>
                                    <View style={styles.location}>
                                        <TextInput
                                            style={{ marginRight: 30, fontSize: 17 }}
                                            placeholderTextColor={'black'}
                                            underlineColorAndroid="transparent"
                                            numberOfLines={3}
                                            multiline={true}
                                            editable={false}
                                            placeholder={
                                                location.city === undefined ?
                                                    userProfile.address.city !== undefined ? (userProfile.address.city + ' ' + userProfile.address.subregion + ' ' + userProfile.address.region + ' ' + userProfile.address.country + ' ' + userProfile.address.postalCode)
                                                        : allLn[ln]["FETCH_YOUR_LOCATION_BY_CLICKING_ON_RIGHT_SIDE_BUTTON"]
                                                    : location.city + ' ' + location.subregion + " " + location.region + ' ' + location.country + ' ' + location.postalCode
                                            }
                                        />
                                        <Icon name={"my-location"} color={"black"} style={{ paddingRight: 5, position: "absolute", right: 0 }} size={22} onPress={() => { getLocation() }} />
                                    </View>
                                </View>
                            </View>
                            {props.edit === "profile" ?
                                <TouchableOpacity style={{ backgroundColor: "#00A500", margin: 10, borderRadius: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 5, paddingHorizontal: 50, position: "absolute", bottom: 10 }} onPress={() => { image !== "" ? uploadImage() : editProfile(userProfile.imageURL) }}>
                                    <Edit name={'account-edit'} color="white" size={26} />
                                    <Text style={{ color: "white", fontSize: 17, fontWeight: "bold" }}>   {allLn[ln]["UPDATE_PROFILE"]}</Text>
                                </TouchableOpacity> :
                                <TouchableOpacity style={{ backgroundColor: "#00A500", margin: 10, borderRadius: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 5, paddingHorizontal: 50, position: "absolute", bottom: 10 }}
                                    onPress={() => { if (name !== "Name") { if (location.longitude !== undefined && location.city !== "Address" && location.city !== undefined) { if (image !== "") { uploadImage() } else { setcompleteprofile(true); editProfile(userProfile.imageURL) } } else { alert("Please Click On Address Detect Button") } } else { "Please Enter Your Name" } }}>
                                    <Edit name={'account-edit'} color="white" size={26} />
                                    <Text style={{ color: "white", fontSize: 17, fontWeight: "bold" }}>   {allLn[ln]["UPDATE_PROFILE"]}</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </View>
            </Modal>
            <Header headertitle="Profile" />
            {imagePopup || progressbar ? <StatusBar backgroundColor="rgba(3, 115, 3, 1)" /> : null}
            <View style={{ flex: 10 }}>
                <View style={{ flex: 1, backgroundColor: "#00A500" }}>
                    <View style={{ flex: 0.3 }}>
                        <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%" }}>
                            <View style={{ alignItems: "center", justifyContent: "center", width: "25%", position: "relative" }}>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", position: "absolute" }}>
                                    <ActivityIndicator size="large" color="#ffffff" />
                                </View>
                                <Image source={{ uri: userProfile.imageURL }} style={{ ...styles.profilepic, opacity: imageLoader ? 0.1 : 1 }} onLoad={() => { setImageLoader(false) }}></Image>
                            </View>
                            <View style={{ alignItems: "center", justifyContent: "center", marginTop: 15, width: "60%" }}>
                                <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", textAlign: "center", height: 30 }}>{userProfile.name}</Text>
                                <Text style={{ color: "white", fontSize: 17, opacity: 0.8, }}>{allLn[ln][(profile.loggedAs) === "Owner" ? "OWNER" : "FARMER"]}</Text>
                                <TouchableOpacity style={styles.button} onPress={() => { logout() }}>
                                    <Logout name={"logout"} color={"#00A500"} size={24} />
                                    <Text style={styles.buttonTitle}>  {allLn[ln]["LOGOUT"]}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={styles.Card}>
                        <ScrollView showsHorizontalScrollIndicator={false}>
                            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10 }}>
                                <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                                    <Map name={"map-marked-alt"} color={"black"} size={24} />
                                </View>
                                <View style={{ width: "75%", flexDirection: "row", flexWrap: "wrap", paddingLeft: 10 }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 17 }}>{userProfile.address.city !== undefined ? (userProfile.address.city + ' ' + userProfile.address.subregion + ' ' + userProfile.address.region + ' ' + userProfile.address.country + ' ' + userProfile.address.postalCode) : allLn[ln]["ADDRESS"]}</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10 }}>
                                <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                                    <Icons name={"call"} color={"black"} size={24} />
                                </View>
                                <View style={{ width: "75%" }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 10 }}>{user.phoneNumber}</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10 }}>
                                <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                                    <Language name={"language"} color={"black"} size={24} />
                                </View>
                                <View style={{ width: "75%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 10 }}> {allLn[ln]["FULL_FORM"]} </Text>
                                    <TouchableOpacity style={{ backgroundColor: "#00A500", marginRight: 10, margin: -10, borderRadius: 50 }} onPress={() => { setChangeLan(true) }}>
                                        <Text style={{ color: "white", fontSize: 17, fontWeight: "bold", padding: 5, paddingHorizontal: 20 }}>{allLn[ln]["CHANGE"]}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {profile.loggedAs === "Owner" ?
                                <>
                                    <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10 }}>
                                        <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                                            <Image source={require('../../assets/profits.png')} style={{ width: 24, height: 24 }} />
                                        </View>
                                        <View style={{ width: "75%" }}>
                                            <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 10 }}>₹{Math.round(profile.total)}</Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.2)", padding: 10 }}>
                                        <View style={{ width: "25%", alignItems: "center", justifyContent: "center" }}>
                                            <Map name={"tractor"} color={"black"} size={20} />
                                        </View>
                                        <View style={{ width: "75%" }}>
                                            <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 10 }}>{userProfile.vr} {allLn[ln]["REGISTERED"]}</Text>
                                        </View>
                                    </View>
                                </>
                                : null
                            }
                            <View style={{ marginBottom: 100 }}></View>
                        </ScrollView>
                        <TouchableOpacity style={{ backgroundColor: "#00A500", margin: 10, borderRadius: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 5, paddingHorizontal: 50, position: "absolute", bottom: 10 }} onPress={() => { setName(userProfile.name); setEdit(true) }}>
                            <Edit name={'account-edit'} color="white" size={26} />
                            <Text style={{ color: "white", fontSize: 17, fontWeight: "bold" }}>   {allLn[ln]["EDIT_PROFILE"]}</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
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
        }
    },
    buttonTitle: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#00A500",
    },
    button: {
        height: 36,
        borderRadius: 25,
        backgroundColor: "rgb(255,255,255)",
        alignSelf: "center",
        margin: 15,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        paddingHorizontal: 40
    },
    profilepic: {
        margin: 10,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: "white",
        width: 110,
        height: 110,
    },
    name: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "300",
        opacity: 0.5,
        padding: 5,
        marginBottom: 20
    },
    edit: {
        borderWidth: 2,
        borderColor: "#00BBFE",
        alignSelf: "center",
        marginHorizontal: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
        opacity: 0.7,
        margin: 15
    }, Card: {
        width: "100%", height: "90%",
        borderTopEndRadius: 25,
        borderTopStartRadius: 25,
        elevation: 3,
        backgroundColor: "white",
        shadowOffset: { width: 1, height: 1 },
        shadowColor: "#E0E0D7",
        shadowOpacity: 0.3,
        shadowRadius: 2,
        alignItems: 'center',
        flex: 0.7
    },
    location: {
        width: "95%",
        borderRadius: 25,
        fontSize: 16,
        paddingLeft: 13,
        backgroundColor: "rgba(255,255,255,0.8)",
        color: "#000",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row"
    }
})