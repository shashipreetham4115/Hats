'use strict';
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import Spinner from 'react-native-loading-spinner-overlay';
import { UserContext } from '../../components/UserProvider';
import allLn from '../../components/MultiLanguage/all.json'

export default function Login() {
    const Store = useContext(UserContext);
    const ln = Store.SL;
    const [number, setNumber] = useState('');
    const [farmerActive, setFarmeractive] = useState(Store.loggedAs === "Farmer" ? true : false);
    const [confirm, setConfirm] = useState(null)
    const [code, setCode] = useState('');
    const [loader, setLoader] = useState(false);

    const getotp = async () => {
        setLoader(true);
        if (number.length !== 10) {
            alert(allLn[ln]["PLEASE_ENTER_VALID_PHONE_NUMBER"])
        } else {
            const confirmation = await auth().signInWithPhoneNumber('+91' + number);
            setConfirm(confirmation);
        }
        setLoader(false);
    }
    const verifyotp = async () => {
        try {
            setLoader(true);
            await confirm.confirm(code);
            setLoader(false);
        } catch (err) {
            setLoader(false);
            alert(allLn[ln]["ENTER_VALID_OTP"])
        }
    }
    const s = StyleSheet.create({
        farmer: {
            textAlign: "center",
            paddingTop: 3,
            color: "white",
            borderWidth: 2.5,
            borderColor: farmerActive ? "rgba(0,230,64,0)" : "rgba(0,230,64,0.8)",
            paddingHorizontal: 10,
            backgroundColor: farmerActive ? "rgba(0,230,64,0.8)" : null,
            fontSize: 20,
            fontWeight: "bold"
        },
        owner: {
            textAlign: "center",
            paddingTop: 3,
            color: "white",
            borderWidth: 2.5,
            borderColor: !farmerActive ? "rgba(0,230,64,0)" : "rgba(0,230,64,0.8)",
            paddingHorizontal: 10,
            backgroundColor: !farmerActive ? "rgba(0,230,64,0.8)" : null,
            fontSize: 20,
            fontWeight: "bold"
        }
    })
    return (

        <View style={styles.backgroundContainer}>
            {confirm === null ?
                <View style={styles.Card}>
                    <View><Text style={styles.pageTitle}>{allLn[ln]["LOGIN"]}</Text></View>
                    <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                        <TouchableOpacity onPress={() => { Store.setLoggedAs("Farmer"); setFarmeractive(true) }}>
                            <Text style={s.farmer}>{allLn[ln]["FARMER"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { Store.setLoggedAs("Owner"); setFarmeractive(false); }}>
                            <Text style={s.owner}>{allLn[ln]["OWNER"]}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ marginVertical: 25 }}>
                        <TextInput
                            style={styles.input}
                            placeholder={allLn[ln]["ENTER_YOUR_NUMBER"]}
                            underlineColorAndroid="transparent"
                            keyboardType="phone-pad"
                            autoCompleteType="tel"
                            onChangeText={(text) => { setNumber(text) }}
                        />
                        <Spinner visible={loader} />
                        <TouchableOpacity style={styles.button} onPress={() => { getotp() }}>
                            <Text style={styles.buttonTitle}>
                                {allLn[ln]["SUBMIT"]}
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>
                :
                <View style={styles.Card}>
                    <View><Text style={styles.pageTitle}>OTP</Text></View>
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder={allLn[ln]["ENTER_OTP"]}
                            underlineColorAndroid="transparent"
                            keyboardType="phone-pad"
                            autoCompleteType="tel"
                            onChangeText={(text) => { setCode(text) }}
                        />
                    </View>
                    <Spinner visible={loader} />
                    <View>
                        <TouchableOpacity style={styles.button} onPress={() => { verifyotp() }}>
                            <Text style={styles.buttonTitle}>
                                {allLn[ln]["VERIFY_OTP"]}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
        </View>

    );
}

const styles = StyleSheet.create({
    backgroundContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    titleContainer: {
        alignItems: "center"
    },
    title: {
        color: "red",
        fontSize: 35,
        fontWeight: "900",
        opacity: 0.5
    },
    pageTitle: {
        fontSize: 30,
        fontWeight: "bold",
        color: "white",
        alignSelf: "center",
        margin: 10,
        paddingBottom: 15
    },
    input: {
        width: "95%",
        height: 45,
        borderRadius: 25,
        fontSize: 16,
        paddingLeft: 20,
        backgroundColor: "rgba(255,255,255,0.8)",
        color: "#000",
        alignSelf: "center",
        margin: 10
    },
    Card: {
        width: 330,
        alignSelf: "center",
        borderRadius: 20,
        shadowColor: '#2E66E7',
        backgroundColor: "rgba(51,51,0,0.4)",
        marginBottom: 20,
        padding: 10,
        marginTop: 50
    },
    button: {
        width: "95%",
        height: 36,
        borderRadius: 25,
        fontSize: 16,
        backgroundColor: "rgba(0,230,64,0.8)",
        color: "rgba(255,255,255,0.7)",
        alignSelf: "center",
        marginTop: 25
        , justifyContent: "center",
        alignItems: "center"
    },
    buttonTitle: {
        fontSize: 17,
        fontWeight: "bold",
        color: "white",
    }
})