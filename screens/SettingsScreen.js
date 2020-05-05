import React from 'react';
import {View, ActivityIndicator,Text, Image, StyleSheet, Dimensions, TouchableOpacity, Switch, Modal} from 'react-native'
import {Button} from 'react-native-paper'
import ProfilePicture from '../components/ProfilePicture'
import StatBox from '../components/StatBox'
import Colors from '../constants/Colors'
import { Ionicons } from '@expo/vector-icons';

import { inject, observer } from 'mobx-react';
import Lightbox from 'react-native-lightbox'

//Firebase Imports
import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import firebaseConfig from '../firebaseConfig';

import * as Permissions from 'expo-permissions';
import { green } from 'ansi-colors';

@inject("UserStore", "PostStore")
@observer
export default class SettingsScreen extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      notificationPermissions: false,
      numFavoritesMonth: 0,
    }
  }



  componentDidMount(){
    console.disableYellowBox = true;
    this.checkPermissions();
    
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.getUserFavoritesDates();
      
    });

  } 


  componentWillUnmount() {
    this.focusListener.remove();
  }

  checkPermissions = async() => {
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if (status == 'granted') {
      this.setState({notificationPermissions: true})
      console.log("Notifications!!")
    }else{
      this.setState({notificationPermissions: false})
      console.log("Notifications not permitted...")
    }
  }


  getUserFavoritesDates = () => {
    var now = new Date().getTime();
    var numFavs = 0;
    // console.log(Math.ceil(now/86400000) - Math.ceil(this.props.UserStore.favorites[].time/86400000))
    for(let i = 0; i < this.props.UserStore.favorites.length; i++){
      if(Math.ceil(now/86400000) - Math.ceil(this.props.UserStore.favorites[i].time/86400000) < 30){
        numFavs ++;
        
      }
    }
    this.setState({numFavoritesMonth: numFavs})
  }


  signOut = () => {
    firebase.auth().signOut().then(() => {
      this.props.navigation.navigate("Authentication")

      this.props.UserStore.email = ""
      this.props.UserStore.fullname = ""
      this.props.UserStore.phone = ""
      this.props.UserStore.userID = ""
      this.props.UserStore.photo = ""
      this.props.UserStore.joinedDate = ""
      this.props.UserStore.searchHistory.clear()
      this.props.UserStore.favorites.clear()
      this.props.UserStore.viewed.clear()

      this.props.PostStore.rabbitArray.clear();


      this.props.UserStore.signInProvider = ""
    })
  }




  render(){
    const {UserStore, PostStore} = this.props;
    var fullDateArray = this.props.UserStore.joinedDate.split(" ");
    var defaultImage = require("../assets/images/ProfilePic-DailyBuns.jpg")
    const [dayOfWeek, dayJoined, monthJoined, yearJoined] =  fullDateArray;
    return(
      <View style={{paddingHorizontal: 16, marginTop: 8, flex: 1}}>
        <View style={{display: 'flex', flexGrow: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        
        <View style={{display: "flex", flexDirection: 'row', alignItems: 'center', flex: 4}}>
            {UserStore.photo ? 
              <ProfilePicture style={{marginRight: 16}} source={{uri: UserStore.photo}} width={60} height={60}/>
            : 
            <ProfilePicture style={{marginRight: 16}} width={60} height={60}/>
            }
          <View>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.fullName}>{UserStore.fullname}</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.email}>Joined {monthJoined} {dayJoined} {yearJoined}</Text>
          </View>
          </View>

          <TouchableOpacity onPress={() => console.log("Pressed!")} style={{backgroundColor: Colors.tintColor, height: 40, display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: Dimensions.get("window").width/2}}>
       
            
              <Ionicons name="md-create"  size={26} color="white" />
           
 
          </TouchableOpacity>
        </View>
        <View style={{marginTop: 24, flexGrow: 10}}>
            <Text style={styles.pageHead}>My Stats</Text>
              {/* <View style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
                <StatBox 
                  size={Dimensions.get("window").width/2 - 48}
                  top="Joined"
                  main={monthJoined}
                  foot={yearJoined}
                  color="#efefef"
                  gutter={16}
                />
                <StatBox 
                  size={Dimensions.get("window").width/2 - 48}
                  top="Hello"
                  main="World"
                  foot="Wut?"
                  color="#efefef"
                  gutter={16}
                />
                <StatBox 
                  size={Dimensions.get("window").width/2 - 48}
                  top="Hello"
                  main="World"
                  foot="Wut?"
                  color="#efefef"
                  gutter={16}
                />
              </View> */}
          
            <Text style={styles.stat}>Favorites this month: {this.state.numFavoritesMonth}</Text>
            <Text style={styles.stat}>Total Bun Views: {this.props.UserStore.viewed.length}</Text>
            <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <Button style={{marginBottom: 12}} onPress={() => this.signOut()}>Sign Out</Button>
            </View>
            
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  fullName:{
    fontSize: 20,
    width: (Dimensions.get("window").width * (4/5)) - 110,
  },
  email:{
    fontSize: 14,
    color: '#aaa',
    width: (Dimensions.get("window").width * (4/5)) - 110,
  },
  pageHead:{
    fontSize: 24,
    fontWeight: "200"
  },
  stat:{
    fontSize: 16,
  }
})

SettingsScreen.navigationOptions = {
  title: 'Settings',
};
