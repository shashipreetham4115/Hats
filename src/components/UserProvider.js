import React, { useState, createContext, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

const UserProvider = (props) => {
    const db = firestore();
    const [uid, setuid] = useState('');
    const [profile, setprofile] = useState({ imageURL: "https://tse1.mm.bing.net/th?id=OIP.EaGjA9Y28qsYnVxbj1tiZAHaHa&pid=Api&P=0&w=300&h=300", name: "", upi: "", vr: "", address: {}, income: "" });
    const [total, settotal] = useState(0.1);
    const [received, setreceived] = useState(0.1);
    const [pending, setpending] = useState(0.1);
    const [plist, setplist] = useState({});
    const [loggedAs, setLoggedAs] = useState("Farmer");
    const [SL, setSLan] = useState('en');
    const [lnchange, setlnchange] = useState(false);
    const [langcheck, setlangcheck] = useState(false);

    const setSL = async (value) => {
        try {
            await AsyncStorage.setItem('lan', value)
            setlnchange(!lnchange);
        } catch (e) {
            console.log(e);
        }
    }
    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('lan')
            if (value !== null) {
                setSLan(value);
                setlangcheck(true);
            } else {
                setlangcheck(false);
            }
        } catch (e) {
            console.log(e);
        }
    }
    useEffect(() => {
        getData()
    }, [lnchange]);

    useEffect(() => {

        if (uid !== '') {
            db.collection("Profiles").doc(uid.uid).onSnapshot((doc) => {
                if (doc.data() === undefined) {
                    setprofile({
                        imageURL: "https://tse1.mm.bing.net/th?id=OIP.EaGjA9Y28qsYnVxbj1tiZAHaHa&pid=Api&P=0&w=300&h=300",
                        name: "Name", upi: "**********@upi", vr: "0", address: { city: "Address", subregion: "", region: "", country: "", postalCode: "" }, income: "0"
                    })
                } else {
                    a = Object.values(doc.data())
                    setprofile(doc.data())
                }
            })
        }
    }, [uid]);

    useEffect(() => {
        if (uid !== '') {
            db.collection(loggedAs === "Farmer" ? "UPayments" : 'Payments').doc(uid.uid).onSnapshot((doc) => {
                let a = []
                if (doc.data() === undefined || doc.data().total === 0) {
                    a.push({ number: "No Payments Yet" })
                    settotal(0.1);
                    setreceived(0.1);
                    setpending(0.1);
                } else {
                    let data = doc.data();
                    settotal(data.total);
                    delete data.total;
                    setpending(data.pending);
                    delete data.pending;
                    setreceived(data.received);
                    delete data.received;
                    a = data
                }
                setplist(a);
            })
        }
    }, [uid, loggedAs])



    return (
        <UserContext.Provider
            value={{
                uid,
                SL,
                langcheck,
                setSL,
                profile,
                total,
                received,
                pending,
                loggedAs,
                setLoggedAs,
                plist,
                setuid,
            }}>
            {props.children}
        </UserContext.Provider>
    )
}

export { UserProvider, UserContext }