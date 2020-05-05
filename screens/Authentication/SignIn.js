import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
  YellowBox
} from 'react-native';

import Colors from '../../constants/Colors'

import { Button, TextInput, ActivityIndicator, HelperText} from 'react-native-paper'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

//Firebase Imports
import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import firebaseConfig from '../../firebaseConfig';

import { inject, observer } from 'mobx-react';



// Initlialized FB Vars
if (!firebase.apps.length) {
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const firebaseAppAuth = firebaseApp.auth();
}

@inject("UserStore")
@observer
export default class SignIn extends React.Component {
  constructor(props){
      super(props);
      this.state = {
        email: 'cfrydryck@gmail.com',
        emailError: '',
        password: 'Fallon430',
        passwordError: '',

        authenticating: false,
      }
      YellowBox.ignoreWarnings(['Setting a timer']);

      this.onSignIn = this.onSignIn.bind(this)
        
  }

  onSignIn = async() => {
    
    
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(() => {

      this.setState({ authenticating: true})

      
      // define user id before calling the db from it
      this.props.UserStore.userID = firebase.auth().currentUser.uid;
      
      this.setState({
        emailError: '',
        passwordError: '',
      })

      const db = firebase.firestore();
      const doc = db.collection('users').doc(this.props.UserStore.userID);

      doc.get().then((doc) => {
        
        if (doc.exists){
            this.props.UserStore.email = doc.data().email
            this.props.UserStore.fullname = doc.data().fullname;
            this.props.UserStore.phone = doc.data().phone;
            this.props.UserStore.photo = doc.data().photo;
            this.props.UserStore.joinedDate = doc.data().joinedDate
            this.props.UserStore.searchHistory = doc.data().searchHistory;
            this.props.UserStore.favorites = doc.data().favorites;
            this.props.UserStore.viewed = doc.data().viewed;

            this.props.UserStore.signInProvider = firebase.auth().currentUser.providerData[0].providerId;

         
              setTimeout(() => { 
                this.setState({authenticating: false})
                this.props.navigation.navigate('Home')
              }, 1500);

              
            
         
        }else{
          alert("No user found")
        }

       
        

      }).catch((e) => {
        alert("Failed to grab user data. Please try again. " + e)
      })

     

      
    }).catch((error) => {
      
     
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      this.setState ({ authenticating: false})

      
      // alert(errorCode + ': ' + errorMessage)
      if(errorCode == 'auth/invalid-email'){
        this.setState({
          emailError: 'Email format must be name@domain.com',
          passwordError: '',

        })
      }else if(errorCode == 'auth/user-not-found'){
        this.setState({
          emailError: 'There is no account under this email',
          passwordError: '',

        })
      }else if(errorCode == 'auth/too-many-requests'){
        this.setState({
          emailError: 'Too many recent requests. Try again soon.',
          passwordError: '',

        })
      }else if(errorCode == 'auth/wrong-password'){
        this.setState({
          passwordError: 'Password is incorrect or empty',
          emailError: '',
        })
      }else{
        alert(errorCode + ': ' + errorMessage);
      }
    })


}


  render(){
    var loadingDialogue = ["Binkying around...", "Munching on greens...", "Wait... is that a banana?", "Boop my snoot!", "Flop!", "Waiting for scritches...", "Eating your charging cable...", "Rolling in hay...", "Doing a sploot...", "ZOOOOOOMIES!"]
    if(this.state.authenticating){
      return(
        <View style={styles.authContainer}>
              <Text style={{marginBottom: 16}}>{loadingDialogue[Math.floor(Math.random()*loadingDialogue.length)]}</Text>
              <ActivityIndicator color={Colors.tintColor} />
        </View>
      )
    }else{
      return (
        <View style={styles.container}>
            
            <StatusBar hidden={false} />
            <SafeAreaView />
          
            <KeyboardAwareScrollView
              contentContainerStyle={styles.contentContainer}
              extraScrollHeight={Platform.OS == 'ios' ? 85 : 35}  
              enableOnAndroid
              keyboardShouldPersistTaps="handled"
            >

          
                <TextInput 
                    mode="outlined"
                    style={styles.input}
                    selectionColor={Colors.tintColor}
                    placeholder="name@email.com"
                    label="Email"
                    value={this.state.email}
                    theme={{ colors: { primary: Colors.tintColor,underlineColor:'transparent',}}}
                    onChangeText={(text) => this.setState({email: text})}
                    error={this.state.emailError}
                />
                <HelperText
                  type="error"
                  visible={this.state.emailError.length > 0}
                  padding="none"
                >
                  {this.state.emailError}
                </HelperText>
                <TextInput 
                    mode="outlined"
                    secureTextEntry={true}
                    style={styles.input}
                    placeholder="..."
                    label="Password"
                    selectionColor={Colors.tintColor}
                    value={this.state.password}
                    theme={{ colors: { primary: Colors.tintColor,underlineColor:'transparent',}}}
                    onChangeText={(text) => this.setState({password: text})}
                    error={this.state.passwordError}
                />
                <HelperText
                  type="error"
                  visible={this.state.passwordError.length > 0}
                  padding="none"
                >
                  {this.state.passwordError}
                </HelperText>
                <Button style={styles.btn} mode="contained" onPress={() => this.onSignIn()}>Sign In</Button>
              
            </KeyboardAwareScrollView>
        </View>
      );
    }
  }
}





const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight,
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 16,
    flexGrow: 1,
    justifyContent : 'center',
  },
  authContainer: {
    paddingHorizontal: 16,
    flexGrow: 1,
    justifyContent : 'center',
    alignItems: 'center',
  },
  input: {
    marginVertical: -4,
  },    
  btn: {
      display: 'flex',
      justifyContent: 'center',
      marginVertical: 16,
      height: 48,
      backgroundColor: 'orange'
  }
});
