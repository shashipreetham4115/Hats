// import React from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';

// export default function ChooseLanguage() {
//     return (
//         <View>
//             <TouchableOpacity>
//                 <Text>English</Text>
//             </TouchableOpacity>
//         </View>
//     );
// }
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Image, TouchableOpacity } from 'react-native';
import Header from "./Header"
import allLn from './MultiLanguage/all.json';

export default function ChooseLanguage(props) {

    function changeLanguage(ln) {
        props.setSL(ln);
        if (props.type === "profile") {
            props.setChangeLann(false);
        }
    }
    return (
        <>
            <Header headertitle="Choose Language" />
            <View style={{ width: "100%", height: "100%", backgroundColor: "#00a500" }}>
                <ScrollView>
                    <View style={styles.cardContainer}>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("en") }}>
                            <Text style={styles.cardtext1}>{allLn["en"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("te") }}>
                            <Text style={styles.cardtext1}>{allLn["te"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("ta") }}>
                            <Text style={styles.cardtext1}>{allLn["ta"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("hi") }}>
                            <Text style={styles.cardtext1}>{allLn["hi"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("kn") }}>
                            <Text style={styles.cardtext1}>{allLn["kn"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("ml") }}>
                            <Text style={styles.cardtext1}>{allLn["ml"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("mr") }}>
                            <Text style={styles.cardtext1}>{allLn["mr"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("bn") }}>
                            <Text style={styles.cardtext1}>{allLn["bn"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("gu") }}>
                            <Text style={styles.cardtext1}>{allLn["gu"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("ur") }}>
                            <Text style={styles.cardtext1}>{allLn["ur"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("ne") }}>
                            <Text style={styles.cardtext1}>{allLn["ne"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("pa") }}>
                            <Text style={styles.cardtext1}>{allLn["pa"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.card} onPress={() => { changeLanguage("sd") }}>
                            <Text style={styles.cardtext1}>{allLn["sd"]["FULL_FORM"]}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </>
    );
}


const styles = StyleSheet.create({

    cardContainer: {
        width: "100%",
        height: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        padding: 10,
        marginBottom:30
    },
    card: {
        borderRadius: 20,
        elevation: 3,
        backgroundColor: "white",
        shadowOffset: { width: 1, height: 1 },
        shadowColor: "#E0E0D7",
        shadowOpacity: 0.3,
        shadowRadius: 2,
        marginTop: 30,
        padding: 10,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: "center",
        height: 70,
        width: 105
    },
    cardtext1: {
        fontSize: 20
    }
})