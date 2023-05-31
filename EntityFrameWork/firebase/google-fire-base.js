/*
 * Copyright (c) 2023. Haodong JU
 */

import firebase from 'firebase/compat'
import {getStripePayments} from '@stripe/firestore-stripe-payments'
import {login} from './user'

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    OAuthProvider,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithRedirect
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: 'AIzaSyCtvQ3d-HAtHTUg_-505c-qXRnlz8RlZeg',
    authDomain: 'aaden-saas.firebaseapp.com',
    projectId: 'aaden-saas',
    storageBucket: 'aaden-saas.appspot.com',
    messagingSenderId: '169167876904',
    appId: '1:169167876904:web:b83934e5a34d1cbfcc161d',
    measurementId: 'G-QRPH7NLDZS'
}

export const FireBaseApp = firebase.initializeApp(firebaseConfig)

export const FireBaseAuth = firebase.auth()

export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    return await signInWithRedirect(FireBaseAuth, provider)
}

export async function loginWithApple() {
    const provider = new OAuthProvider('apple.com')
    return await signInWithRedirect(FireBaseAuth, provider)
}

export async function loginWithEmailAndPassword(email, password) {
    return await signInWithEmailAndPassword(FireBaseAuth, email, password)
}

export async function createUserWithEmail(email, password) {
    return await createUserWithEmailAndPassword(FireBaseAuth, email, password)
}

export async function resetPasswordEmail(email) {
    return await sendPasswordResetEmail(FireBaseAuth, email)
}

export const FireBaseStore = firebase.firestore()

export const StripePayment = getStripePayments(FireBaseApp, {
    customersCollection: 'customers',
    productsCollection: 'products'
})


// export let errorPageCallback=()=>{}
// export let homePageCallback=()=>{}
// export let storePageCallback=()=>{}
export function initialLogin(onLoginSuccess, onLoginFailed, onLoginEnd,code) {
    FireBaseAuth.onAuthStateChanged(user => {
        if (user?.uid) {
            login(user.uid, user.displayName, onLoginSuccess, onLoginFailed, onLoginEnd,code)
        }
    })
    FireBaseAuth.useDeviceLanguage()
}
