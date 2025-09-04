import {Redirect, router} from "expo-router"
import { useEffect } from "react"
import { onAuthStateChanged  } from "firebase/auth"

import { auth } from "../config"
//ユーザのログイン情報を確認

const Index = () => {
    useEffect(() => {
        //ユーザのログイン情報を確認
        onAuthStateChanged(auth, (user) => {
            if(user !== null){
                router.replace("./screens/MypageScreen")
            }
        })

    }, [])
    return <Redirect href='./screens/LoginScreen'/>
}

export default Index