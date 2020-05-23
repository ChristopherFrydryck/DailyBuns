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
  SafeAreaView,
  StatusBar,
  YellowBox,
  KeyboardAvoidingView
} from 'react-native';

import { Button, TextInput, ActivityIndicator, HelperText} from 'react-native-paper'
import { TextInputMask } from 'react-native-masked-text'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


//Firebase Imports
import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import firebaseConfig from '../../firebaseConfig';



import Colors from '../../constants/Colors'

import { inject, observer } from 'mobx-react';
import { throwStatement, thisTypeAnnotation } from '@babel/types';


// Initlialized FB Vars
if (!firebase.apps.length) {
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const firebaseAppAuth = firebaseApp.auth();
}



// var {UserStore} = this.props;

// Regex to check name and phone are valid at sign in
const regexFullname = /[^0-9]([a-zA-Z]{2,})+[ ]+([a-zA-Z-']{2,})*$/i;
const regexPhone = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

let nameValid = false;
let phoneValid = false;


@inject("UserStore")
@observer
export default class SignUp extends React.Component {
    constructor(props){
        super(props);
        this.state = {
          phone: '',
          phoneError: '',
          name: '',
          nameError: '',
          email: '',
          emailError: '',
          password: '',
          passwordError: '',

          authenticating: false,
        }

        YellowBox.ignoreWarnings(['Setting a timer']);
        this.onSignUp = this.onSignUp.bind(this);
    }

    // Firebase function to sign user up
    onSignUp = () => {
      if(this.state.name.match(regexFullname)){
        this.setState({nameError: ''})
        nameValid = true;
      }else{
        this.setState({
          nameError: 'Please provide first and last name with a space.',
          authenticating: false
        });
        nameValid = false;
      }

      // Checks phone for valid format (accepts many formats)
      if(this.state.phone.match(regexPhone)){
        // alert('name valid')
        this.setState({phoneError: ''})
        phoneValid = true;
      }else{
        // alert('name invalid')
        this.setState({
          phoneError: 'Please provide a proper 10 digit phone number.',
          authenticating: false
        });
        phoneValid = false;
      }  


      if(nameValid && phoneValid){
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then((userCredentials) => {
            if(userCredentials.user){
              

              this.setState({authenticating: true})

              this.props.UserStore.userID = firebase.auth().currentUser.uid;
              this.props.UserStore.email = this.state.email;
              this.props.UserStore.password = this.state.password;
              this.props.UserStore.fullname = this.state.name;
              this.props.UserStore.phone = this.state.phone;
              this.props.UserStore.joinedDate = firebase.auth().currentUser.metadata.creationTime

              firebase.auth().currentUser.sendEmailVerification()
              userCredentials.user.updateProfile({
                displayName: this.props.UserStore.fullname
              })

              const db = firebase.firestore();
              const doc = db.collection('users').doc(this.props.UserStore.userID);

              doc.get().then((docData) => {
                db.collection("users").doc(this.props.UserStore.userID).set({
                  id: firebase.auth().currentUser.uid,
                  fullname: this.props.UserStore.fullname,
                  firstName: this.props.UserStore.firstname,
                  lastName: this.props.UserStore.lastname,
                  email: this.props.UserStore.email,
                  phone: this.props.UserStore.phone,
                  searchHistory: [],
                  favorites: [],
                  photo: '',
                  joinedDate: this.props.UserStore.joinedDate,
                  viewed: [],
                })
              })

              setTimeout(() => { 
                this.setState({authenticating: false})
                this.props.navigation.navigate('Home')
              }, 1500);
              
              
              
              
            }
        }).catch(e => {
          this.setState({authenticating: false})
          // Handle Errors here.
          var errorCode = e.code;
          var errorMessage = e.message;
          this.setState ({ authenticating: false})
        
          // alert(errorCode + ': ' + errorMessage)
          if(errorCode == 'auth/invalid-email'){
            this.setState({
              emailError: 'Email format must be name@domain.com',
              passwordError: '',

            })
          }else if (errorCode == 'auth/email-already-in-use'){
            this.setState({
              emailError: 'Email is already in use with another account.',
              passwordError: '',

            })
          }else if (errorCode == 'auth/weak-password'){
            this.setState({
              emailError: '',
              passwordError: 'Password must be longer than 5 characters.',

            })
          }else{
            alert(errorCode + ': ' + errorMessage);
          }
        })
      }
    }


    render(){
      var loadingDialogue = ["Binkying around...", "Munching on greens...", "Wait... is that a banana?", "Boop my snoot!", "Flop!", "Waiting for scritches...", "Eating your charging cable...", "Rolling in hay...", "Doing a sploot...", "ZOOOOOOMIES!"]
      if(this.state.authenticating){
        return(
          <View style={styles.authContainer}>
            <Text style={{marginBottom: 16}}>{loadingDialogue[Math.floor(Math.random()*loadingDialogue.length)]}</Text>
             <ActivityIndicator color={Colors.tintColor} />
          </View>
        );
      }else{
      return (
        <View style={styles.container}>
           
        <StatusBar hidden={false} />
        <SafeAreaView />
      <ScrollView style={{flex: 1}}  contentContainerStyle={{justifyContent: 'center'}}>
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "padding" : "height"} style={{flex: 1, }}>
      
      <KeyboardAwareScrollView
        contentContainerStyle={styles.contentContainer}
        extraHeight={140}
        extraScrollHeight={140}  
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        
      >
              <View style={{paddingTop: 32}}/>
              <TextInput 
                  mode="outlined"
                  maxLength={40}
                  style={styles.input}
                  selectionColor={Colors.tintColor}
                  placeholder="First Name & Last Name"
                  label="Full Name"
                  value={this.state.name}
                  theme={{ colors: { primary: Colors.tintColor,underlineColor:'transparent',}}}
                  onChangeText={(text) => this.setState({name: text})}
                  error={this.state.nameError.length > 0 ? true : false}
              />
              <HelperText
                type="error"
                visible={this.state.nameError.length > 0}
                padding="none"
              >
                {this.state.nameError}
              </HelperText>
              <TextInput 
                  mode="outlined"
               
                  style={styles.input}
                  selectionColor={Colors.tintColor}
                  placeholder="(000) 000-0000"
                  label="Phone"
                  value={this.state.phone}
                  theme={{ colors: { primary: Colors.tintColor,underlineColor:'transparent',}}}
                  render={props =>
                    <TextInputMask
                      {...props}
                      type={'custom'}
                      options={{
                          mask: '(999) 999-9999'
                      }}
                    />
                  }
                  onChangeText={(text) => this.setState({phone: text})}
                  error={this.state.phoneError.length > 0 ? true : false}
              />
              <HelperText
                type="error"
                visible={this.state.phoneError.length > 0}
                padding="none"
              >
                {this.state.phoneError}
              </HelperText>
              <TextInput 
                  mode="outlined"
                  maxLength={55}
                  style={styles.input}
                  selectionColor={Colors.tintColor}
                  placeholder="name@email.com"
                  label="Email"
                  value={this.state.email}
                  theme={{ colors: { primary: Colors.tintColor,underlineColor:'transparent',}}}
                  onChangeText={(text) => this.setState({email: text})}
                  error={this.state.emailError.length > 0 ? true : false}
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
                  maxLength={55}
                  secureTextEntry={true}
                  style={styles.input}
                  placeholder="..."
                  label="Password"
                  selectionColor={Colors.tintColor}
                  value={this.state.password}
                  theme={{ colors: { primary: Colors.tintColor,underlineColor:'transparent',}}}
                  onChangeText={(text) => this.setState({password: text})}
                  error={this.state.passwordError.length > 0 ? true : false}
              />
              <HelperText
                type="error"
                visible={this.state.passwordError.length > 0}
                padding="none"
              >
                {this.state.passwordError}
              </HelperText>
              <Button style={styles.btn} mode="contained" onPress={() => this.onSignUp()}>Sign Up</Button>
              
            </KeyboardAwareScrollView>
           
            </KeyboardAvoidingView>
            </ScrollView>
         </View>
      );
    }
    }
  }
  
  
  
  
  
  const styles = StyleSheet.create({
    container: {
      // marginTop: StatusBar.currentHeight,
      flex: 1,
      backgroundColor: '#fff',
    },
    contentContainer: {
      paddingHorizontal: 16,
      flex: 1,
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
        backgroundColor: Colors.tintColor
    }
  });