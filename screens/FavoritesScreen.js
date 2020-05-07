import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  View,
  StatusBar,
  Dimensions,
  Share,
  RefreshControl,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Button, TextInput, HelperText} from 'react-native-paper'
import { TextInputMask } from 'react-native-masked-text'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Lightbox from 'react-native-lightbox'
import { withNavigation } from 'react-navigation';
import RecommendedPostComponent from '../components/RecommendedPost'

import FavoritesModal from '../components/FavoritesModal'
import ProfilePicture from '../components/ProfilePicture'

import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'
import * as MediaLibrary from 'expo-media-library'

import Colors from '../constants/Colors'

import { Ionicons } from '@expo/vector-icons';

import { inject, observer } from 'mobx-react';

//Firebase Imports
import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';
import firebaseConfig from '../firebaseConfig';


import { MonoText } from '../components/StyledText';
import SafeAreaView from 'react-native-safe-area-view';
import { FlatList } from 'react-native-gesture-handler';
import ScalableImage from '../components/ScalableImage';




// Initlialized FB Vars
if (!firebase.apps.length) {
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const firebaseAppAuth = firebaseApp.auth();
}


@inject("UserStore", "PostStore")
@observer
class FavoritesScreen extends React.Component {


  constructor(props){
    super(props);

    this.state = {
      isRefresh: false,
      reRender: false,
      isEmptyFavorites: true,
      favoritesData: [],
      bunnyModalVisible: false,
      profileModalVisible: false,
      selectedFavorite: null,
      recommendedPost: null,
      notificationPermissions: false,
      numFavoritesMonth: 0,
      
      imageUploading: false,
      name: this.props.UserStore.fullname,
      nameError: '',
      phone: this.props.UserStore.phone,
      phoneError: '',
      email: this.props.UserStore.email,
      emailError: '',
      sentPWReset: false,
      passwordError: '',
    }

    
   
    
    


  

    this.toggleFavorite = this.toggleFavorite.bind(this)
    this.RefreshFunction = this.RefreshFunction.bind(this)
    this.signOut = this.signOut.bind(this)
    this.sendPasswordReset = this.sendPasswordReset.bind(this)
    this.pickImage = this.pickImage.bind(this)
  }

  static navigationOptions = ({navigation}) => {
    const { params = {} } = navigation.state
    return {
      title: 'My Profile',
      headerRight: (
        <TouchableOpacity onPress={() => params.signOut()} style={{display: 'flex', flexDirection: "row", alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 4, marginRight: 8, backgroundColor: '#d7fad2', borderRadius: Dimensions.get("window").width/2}}>
          <Text style={{marginRight: 8, color: Colors.tintColor, fontWeight: '600'}}>Log Out</Text>
          <Ionicons name={Platform.OS = 'ios' ? "ios-log-out" : "md-log-out"} size={24} color={Colors.tintColor} />
        </TouchableOpacity>
      ),
    }
    
    
  };


  componentDidMount() {
    console.disableYellowBox = true;
    this.checkPermissions();

    this.props.navigation.setParams({ signOut: this.signOut});
  
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      if(this.props.UserStore.favorites.length !== 0){
        this.RefreshFunction();
        this.getUserFavoritesDates();
      }
    
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






  getFavorites = () => {
    const db = firebase.firestore();
    const rabbits = db.collection('rabbits');


    if(this.props.UserStore.favorites.length != 0){
      this.setState({isEmptyFavorites: false})
      // let favoritesArray = [];
      let orderTimeArray = this.props.UserStore.favorites.slice().sort((a, b) => b.time > a.time)

      // let getNumPostsWithoutThumbnail = this.props.UserStore.favorites.slice().filter((x) => x.data.images.thumbnail.uri === null || x.data.images.thumbnail.uri.split('').length == 0)

      // console.log(getNumPostsWithoutThumbnail)
      
      this.setState({favoritesData: orderTimeArray})

    
      // rabbits.where(firebase.firestore.FieldPath.documentId(), 'in', this.props.UserStore.favorites.map(x => x.id)).get().then((querySnapshot) => {
        
     
      //   querySnapshot.docs.map((doc, i) => {
      //       favoritesArray.push({id: doc.id, data: doc.data(), time: orderTimeArray[i].time})  
            
      //   })
      
      // }).then(() => {
      //       favoritesArray.sort((a, b) => b.time > a.time)
      //       console.log("Len of favoritesArray is " + favoritesArray.length)
            
            
      // }).then(() => this.setState({favoritesData: favoritesArray}))
      // .catch((e) => {
      //   console.log(e)
      // })
    }else{
      this.setState({isEmptyFavorites: true})
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

  getRecommendedPosts = (post) => {
    let favoritedIDs = this.props.UserStore.favorites.map((x) => x.id)

    let recPost = this.props.PostStore.rabbitArray.filter((x) => x.data.author != post.data.id && !favoritedIDs.includes(x.data.id) )

    // console.log(recPost[Math.floor(Math.random() * recPost.length)].data)
    
    if(recPost.length >= 1){
      this.setState({recommendedPost: recPost[Math.floor(Math.random() * recPost.length)]})
    }else{
      this.setState({recommendedPost: null})
    }
    // console.log(`Recommended Post: ${this.state.recommendedPost.data.id}`)
  }




  onShare = async (post) => {
    var uri = "";

    if(post.data.isGif){
      if(post.data.gifs.fullSize.shortUri){
        uri = post.data.gifs.fullSize.shortUri;
      }else{
        uri = post.data.gifs.fullSize.uri;
      }
    }else{
      if(post.data.images.fullSize.shortUri){
        uri = post.data.images.fullSize.shortUri;
      }else{
        uri = post.data.images.fullSize.uri;
      }
    }

    try {
      const result = await Share.share({
        title: 'Check out this post from DailyBuns!',
        message: post.data.title + ": " + uri,
        url: post.data.permalink,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };


  // onDownload = async (post) => {
  //   const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    
  //   if (status === 'granted') {
  //     const fileURI = FileSystem.documentDirectory + 'DailyBuns/' + post.id
  //     const url = post.data.isGif ? post.data.gifs.fullSize.downloadUri : post.data.images.fullSize.downloadUri;


  //     FileSystem.downloadAsync(url, fileURI).then(({uri}) => {
  //       console.log("SUCCESS! Downloaded " + uri)
  //     }).catch((e) =>  console.log(e))
      
  //   } else {
  //     throw new Error('Location permission not granted');
  //   }
      
  // };




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

  convertDateMS = (duration) => {
    var now = new Date().getTime()
    var d = new Date(duration);
    var hours = (now/3600000) - (duration/3600000)

    if(hours < 24){
      return 'Today'
    }else if(hours < 48){
      return 'Yesterday'
    }else{
      return d.toString().slice(4, 10);
    }

  }

  updateProfileInfo = () => {
    const regexFullname = /[^0-9]([a-zA-Z]{2,})+[ ]+([a-zA-Z-']{2,})*$/i;
    const regexPhone = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

    const nameValid = true;
    const phoneValid = true;

  }

  sendPasswordReset = () => {
    firebase.auth().sendPasswordResetEmail(this.props.UserStore.email).then(() => {
      this.setState({sentPWReset: true, passwordError: ''})
    }).catch((error) => {
      this.setState({passwordError: error.toString(), sentPWReset: false})
      // console.log(this.state.passwordError)
    });
  }



  uploadImg = async (uri) => {
    const db = firebase.firestore();
    const doc = db.collection('users').doc(this.props.UserStore.userID);

    const response = await fetch(uri)
    const blob = await response.blob()

    const storageRef = firebase.storage().ref();
    const profilePicRef = storageRef.child("users/" + this.props.UserStore.userID + '/profile-pic')
    return profilePicRef.put(blob)
    .then(() => {
       profilePicRef.getDownloadURL().then((uri) => {
            db.collection("users").doc(this.props.UserStore.userID).update({
                photo: uri
             })
             this.props.UserStore.photo = uri;
            })
        })

    
}


  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 3],
        quality: 0.1,
        // base64: true,
      });



      this.setState({imageUploading: true})
  
  
      if (!result.cancelled) {
            this.uploadImg(result.uri)
                .then(() => {
                    console.log("SUCCESS!")
                    this.setState({imageUploading: false})
                }).catch((e) => {
                    console.log("ERROR!!!!: " + e)
                    this.setState({imageUploading: false})
                })
        
      }else{
          this.setState({imageUploading: false})
      }
    };


    





  RefreshFunction = () => {
    this.setState({isRefresh: true})
    try{
      this.getFavorites();
      this.setState({isRefresh: false})
    }catch(e){
      this.setState({isRefresh: false})
      console.log(e);
    }
  }

  toggleFavorite = (post) => {
    let ident = post.id
    var d = new Date().getTime();


    this.setState({reRender: !this.state.reRender})

    let {favorites} = this.props.UserStore
    let postsFavorited = [];
    let postsFavoritedID = [];

    const db = firebase.firestore();
    const users = db.collection('users');

    favorites.map(x => {
      postsFavorited.push(x)
    })

    postsFavorited.map(x => {
      postsFavoritedID.push(x.id)
    })


    if (postsFavoritedID.includes(ident)){
      // console.log('already favorited')
      var index = postsFavoritedID.indexOf(ident);
      if(index !== -1){
        postsFavorited.splice(index, 1)
        favorites.clear();
        for(let i = 0; i < postsFavorited.length; i++){
          favorites.push(postsFavorited[i])
        }
        users.doc(this.props.UserStore.userID).update({
          favorites: favorites
        })
      }
    }else{
      
   
      
      favorites.push({time: d, id: ident, data: post.data})
      
      users.doc(this.props.UserStore.userID).update({
        favorites: favorites
      })

      

    }


    // console.log(this.props.UserStore.favorites.includes(id))

    // console.log(this.props.UserStore.favorites[0].id)
    


  }

  openBunnyModal = (item) => {
    this.getRecommendedPosts(item);
    this.setState({
      selectedFavorite: item,
      bunnyModalVisible: true,
    })

  }

  

  renderFavorites = ({item}) => {
    
    let {width, height} = Dimensions.get('window');
    return(
      <View style={{flex: 1/3 - 6, flexDirection: 'row', margin: 3}}>
        {/* <Text>Hello {item.data.author}</Text> */}
        <TouchableOpacity onPress={() => this.openBunnyModal(item)} activeOpacity={0.8}>
       
          <Image style={{width: width/3 - 12, height: width/3 - 12, aspectRatio: 1/1, resizeMode: 'cover' }}
          source={ item.data.images.thumbnail.uri && item.data.images.thumbnail.uri.split("").length > 0 ? {uri: item.data.images.thumbnail.uri}
          : require("../assets/images/Error-Thumbnail.jpg")}
          // defaultSource={require("../assets/images/Error-Thumbnail.jpg")}
          />

         
         {item.data.isGif ?
         <Ionicons style={{position: 'absolute', top: 6, left: 8,}}name={Platform.OS = 'ios' ? "ios-play-circle" : "md-play-circle"} size={24} color="white" />
         : null }
        </TouchableOpacity>
      </View>
    )
  }


 


  
  render(){
   const {UserStore, PostStore} = this.props;
   var fullDateArray = UserStore.joinedDate.split(" ");
   const [dayOfWeek, dayJoined, monthJoined, yearJoined] =  fullDateArray;
   let {favorites} = UserStore;
   let item = this.state.selectedFavorite;



  




   let favoriteIDs = [];

    for(let i = 0; i < favorites.length; i++){
      favoriteIDs.push(favorites[i].id)

    }

    return(
      <View style={{display: "flex", flex: 1, paddingHorizontal: 9 }}>
          <Modal
            animationType="slide"
            title="Edit Account"
            visible={this.state.profileModalVisible}
            transparent={false}
            onRequestClose={() =>  this.setState({profileModalVisible: false})}
            closeAction = {() => this.setState({profileModalVisible: false})}
          > 
            <SafeAreaView style={{paddingHorizontal: 9 }}>
              <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', zIndex: 99, height: 48, alignItems: 'center', paddingHorizontal: 8}}>
                   <Text>Edit Account</Text>
                   <TouchableOpacity onPress={() => this.setState({profileModalVisible: false})}>
                    <Ionicons size={48} style={{color: 'black'}} name={Platform.OS = 'ios' ? 'ios-close' : 'md-close'} />
                   </TouchableOpacity>
                </View>
                <View style={{display: "flex", flexDirection: 'row'}}>
                {this.state.imageUploading ?
                  <View style={{width: 60, height: 60, marginRight: 16, elevation: 2}}>
                  <ActivityIndicator />
                </View>
                :UserStore.photo && this.state.imageUploading == false?  
                  <ProfilePicture 
                    editable={true} 
                    onPress={() => this.pickImage()} 
                    style={{marginRight: 16}} 
                    source={{uri: UserStore.photo}} 
                    width={60} 
                    height={60}
                  />
                :
                  <ProfilePicture 
                    editable={true} 
                    onPress={() => this.pickImage()} 
                    style={{marginRight: 16}} 
                    width={60} 
                    height={60}
                  />
                }
            </View>
            <TextInput 
                  mode="outlined"
                  disabled={true}
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
              >xs
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
              <Button mode="outlined" color={Colors.tintColor} style={{backgroundColor: "white", borderWidth: 2, borderColor: Colors.tintColor}} onPress={() => {this.sendPasswordReset()}}>{this.state.sentPWReset ? "Email Sent!" : "Send Password Reset"}</Button>
               
              <HelperText
                type="error"
                visible={this.state.passwordError.length > 0}
                padding="none"
                >{this.state.passwordError}
              </HelperText>
              
            </SafeAreaView>
          </Modal>
          <FavoritesModal
            item={item}
            onRequestClose={() =>  this.setState({bunnyModalVisible: false})}
            transparent={false}
            visible={this.state.bunnyModalVisible}
            closeAction = {() =>  this.setState({bunnyModalVisible: false})}
            title={item ? item.data.title : 'Loading...'}
            
          >
            {item ? 
            <View style={{flex: 1, justifyContent: 'center'}}>
              
            <View style={{flex: 6, }}>
              {item.data.isGif && item.data.gifs.fullSize.uri.length > 0 || item.data.images.fullSize.uri.length > 0 ?
              <Lightbox 
                  
              activeProps = {{ style:{ width: Dimensions.get('window').width, height: (Dimensions.get('window').width/item.data.images.fullSize.width) * item.data.images.fullSize.height, resizeMode: 'contain'}}}
              underlayColor="white"
            
            >
              <ScalableImage 
                style={{height: Dimensions.get('window').height*.60 ,marginTop: -48}}
                post = {item}
              />
            {/* <Image  style={{height: Dimensions.get('window').height*.60 ,marginTop: -48, resizeMode: 'cover'}} source={item.data.isGif && item.data.gifs.fullSize.uri.length > 0 ?{uri: item.data.gifs.fullSize.uri} : item.data.images.fullSize.uri.length > 0 ? {uri: item.data.images.fullSize.uri} : require("../assets/images/ProfilePic-DailyBuns.jpg")}/> */}
          </Lightbox>
          :
            <Image  style={{flex: 1,width: '100%' , marginTop: -48, resizeMode: 'contain'}} source={require("../assets/images/Error.jpg")}/>
          }
            
            </View>
            <View style={{flex: 3, backgroundColor: 'white'}}>
            <View style={{flexDirection: "row", paddingHorizontal: 16}}>
                <View style={{flex: 6}}>
                  <Text style={styles.title}>{item.data.title}</Text>
                  <Text style={styles.subTitle}>Posted {this.convertDateMS(item.data.dateAddedToDBMS)} by u/{item.data.author}</Text>
                </View>
                <View style={{display: 'flex', flex: 1, alignItems: 'center'}}>
                  <TouchableOpacity onPress={() => this.toggleFavorite(item)} activeOpacity={0.8}>
                      <View style={styles.Favcircle}>
                      <Ionicons name={favoriteIDs.includes(item.id) ?"ios-heart" : "ios-heart-empty"} size={26} color="red" />
                      </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.onShare(item)} activeOpacity={0.8}>
                      <View style={styles.circle}>
                      <Ionicons name={Platform.OS == 'ios' ? "ios-share-alt" : "md-share-alt"} size={24} />
                      </View>
                  </TouchableOpacity>
                  </View>
            </View>
            </View>
            <View style={{flex: 3, backgroundColor: 'white', paddingHorizontal: 16}}>
            {this.state.recommendedPost ?
       
       // <Text style={styles.otherText}>You May Also Like...</Text>
       <View style={{display: 'flex', flex: 1}}>
       <RecommendedPostComponent 
         post={this.state.recommendedPost}
         // image={this.state.recommendedPost.data.images.thumbnail.uri}
         icon={favoriteIDs.includes(this.state.recommendedPost.id) ?"ios-heart" : "ios-heart-empty"}
         // title={this.state.recommendedPost.data.title}
         onPress={() => {
           this.toggleFavorite(this.state.recommendedPost)}
         }
       />
       </View>
       : null
   }
        </View>
    
              
              </View>
            : null}

          </FavoritesModal>


        <View style={{display: 'flex', paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
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

          <TouchableOpacity onPress={() => {this.setState({profileModalVisible: true})}} style={{backgroundColor: Colors.tintColor, height: 40, display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: Dimensions.get("window").width/2}}>
       
            
              <Ionicons name="md-create"  size={26} color="white" />
           
 
          </TouchableOpacity>
        </View>

        {favorites.length == 0 ? 
        <View style={{display: 'flex', flex: 1}}>
          
           <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent : 'center', alignItems: 'center'}}>
            <RefreshControl
                  refreshing={this.state.isRefresh}
                  onRefresh={() => this.RefreshFunction()}
                  colors={[Colors.tintColor, 'orange']}
                  tintColor={Colors.tintColor}
                />
            <Text style={styles.emptyResults}>No Buns Favorited... Yet</Text>
           </ScrollView>
           </View>
        :
            <View style={{display: 'flex', flex: 1}}>
                <FlatList 
                style={{paddingTop: 6}}
                contentContainerStyle={{flexGrow: 1, alignSelf: 'flex-start'}}
                data={this.state.favoritesData}
                ref={(ref) => { this.flatListRef = ref; }}
                extraData={this.state.reRender}
                keyExtractor={(item) => item.id}
                removeClippedSubviews={false}
                renderItem={this.renderFavorites}
                numColumns={3}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.isRefresh}
                    onRefresh={() => this.RefreshFunction()}
                    colors={[Colors.tintColor, 'orange']}
                    tintColor={Colors.tintColor}
                  />
                }
              />
            </View>
        } 
      </View>
    )

  //  if(favorites.length == 0){
  //    return(
  //      <View style={{display: "flex", flex: 1, paddingHorizontal: 9 }}>
  //        <View style={{display: 'flex', paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        
  //       <View style={{display: "flex", flexDirection: 'row', alignItems: 'center', flex: 4}}>
  //           {UserStore.photo ? 
  //             <ProfilePicture style={{marginRight: 16}} source={{uri: UserStore.photo}} width={60} height={60}/>
  //           : 
  //           <ProfilePicture style={{marginRight: 16}} width={60} height={60}/>
  //           }
  //         <View>
  //           <Text numberOfLines={1} ellipsizeMode="tail" style={styles.fullName}>{UserStore.fullname}</Text>
  //           <Text numberOfLines={1} ellipsizeMode="tail" style={styles.email}>Joined {monthJoined} {dayJoined} {yearJoined}</Text>
  //         </View>
  //         </View>

  //         <TouchableOpacity onPress={() => console.log(this.state.favoritesData.length)} style={{backgroundColor: Colors.tintColor, height: 40, display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: Dimensions.get("window").width/2}}>
       
            
  //             <Ionicons name="md-create"  size={26} color="white" />
           
 
  //         </TouchableOpacity>
  //       </View>
  //        <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent : 'center', alignItems: 'center'}}>
  //         <RefreshControl
  //               refreshing={this.state.isRefresh}
  //               onRefresh={() => this.RefreshFunction()}
  //               colors={[Colors.tintColor, 'orange']}
  //               tintColor={Colors.tintColor}
  //             />
  //         <Text style={styles.emptyResults}>No Buns Favorited... Yet</Text>
  //        </ScrollView>
  //      </View>
  //    )
  //  }else{

   
  
   
  //   return (
  //     <View style={{flex: 1, paddingHorizontal: 9}}>
  //         <Modal
  //           animationType="slide"
  //           title="Edit Account"
  //           visible={this.state.profileModalVisible}
  //           transparent={false}
  //         >
  //           <Text>Shiiit.</Text>
  //         </Modal>
  //         <FavoritesModal
  //           item={item}
  //           onRequestClose={() =>  this.setState({bunnyModalVisible: false})}
  //           transparent={false}
  //           visible={this.state.bunnyModalVisible}
  //           closeAction = {() =>  this.setState({bunnyModalVisible: false})}
  //           title={item ? item.data.title : 'Loading...'}
            
  //         >
  //           {item ? 
  //           <View>
  //           <Lightbox 
  //                     activeProps = {{ style:{ width: Dimensions.get('window').width, height: (Dimensions.get('window').width/item.data.images.fullSize.width) * item.data.images.fullSize.height, resizeMode: 'contain'}}}
  //                     underlayColor="white"
                    
  //                   >
  //             <Image  style={{height: 350, marginTop: -48}} source={{uri: item.data.isGif && item.data.gifs.resolutions.length > 2 ? item.data.gifs.resolutions[item.data.gifs.resolutions.length - 2].uri : item.data.isGif && item.data.gifs.resolutions.length <= 2 ? item.data.gifs.fullSize.uri : !item.data.isGif && item.data.images.resolutions.length > 3 ? item.data.images.resolutions[item.data.images.resolutions.length - 3].uri : !item.data.isGif && item.data.images.resolutions.length > 2 ? item.data.images.resolutions[item.data.images.resolutions.length - 2].uri : item.data.images.fullSize.uri}}/>
  //             </Lightbox>
  //             <View style={{paddingHorizontal: 16}}>
  //             <View style={{display: 'flex', flexDirection: "row"}}>
  //               <View style={{flex: 6}}>
  //                 <Text style={styles.title}>{item.data.title}</Text>
  //                 <Text style={styles.subTitle}>Posted {this.convertDateMS(item.data.dateAddedToDBMS)} by u/{item.data.author}</Text>
  //               </View>
  //               <View style={{display: 'flex', flex: 1, alignItems: 'center'}}>
  //                 <TouchableOpacity onPress={() => this.toggleFavorite(item)} activeOpacity={0.8}>
  //                     <View style={styles.Favcircle}>
  //                     <Ionicons name={favoriteIDs.includes(item.id) ?"ios-heart" : "ios-heart-empty"} size={26} color="red" />
  //                     </View>
  //                 </TouchableOpacity>
  //                 <TouchableOpacity onPress={() => this.onShare(item)} activeOpacity={0.8}>
  //                     <View style={styles.circle}>
  //                     <Ionicons name={Platform.OS == 'ios' ? "ios-share-alt" : "md-share-alt"} size={24} />
  //                     </View>
  //                 </TouchableOpacity>
  //                 {/* <TouchableOpacity onPress={() => this.onDownload(item)} activeOpacity={0.8}>
  //                     <View style={styles.circle}>
  //                     <Ionicons name={Platform.OS == 'ios' ? "ios-download" : "md-download"} size={24}/>
  //                     </View>
  //                 </TouchableOpacity> */}
  //               </View>
  //             </View>
  //             {this.state.recommendedPost ?
       
  //                 // <Text style={styles.otherText}>You May Also Like...</Text>
  //                 <RecommendedPostComponent 
  //                   post={this.state.recommendedPost}
  //                   // image={this.state.recommendedPost.data.images.thumbnail.uri}
  //                   icon={favoriteIDs.includes(this.state.recommendedPost.id) ?"ios-heart" : "ios-heart-empty"}
  //                   // title={this.state.recommendedPost.data.title}
  //                   onPress={() => {
  //                     this.toggleFavorite(this.state.recommendedPost)}
  //                   }
  //                 />
  //                 : null
  //             }
              
  //             {/* {console.log(this.state.recommendedPosts)} */}
  //             </View>
  //             </View>
  //           : <Text>Loading...</Text>}

  //         </FavoritesModal>
  //         <View style={{display: 'flex', paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        
  //       <View style={{display: "flex", flexDirection: 'row', alignItems: 'center', flex: 4}}>
  //           {UserStore.photo ? 
  //             <ProfilePicture style={{marginRight: 16}} source={{uri: UserStore.photo}} width={60} height={60}/>
  //           : 
  //           <ProfilePicture style={{marginRight: 16}} width={60} height={60}/>
  //           }
  //         <View>
  //           <Text numberOfLines={1} ellipsizeMode="tail" style={styles.fullName}>{UserStore.fullname}</Text>
  //           <Text numberOfLines={1} ellipsizeMode="tail" style={styles.email}>Joined {monthJoined} {dayJoined} {yearJoined}</Text>
  //         </View>
  //         </View>

  //         <TouchableOpacity onPress={() => console.log(`State is: ${this.state.favoritesData.length}, Userstore is: ${this.props.UserStore.favorites.length}`)} style={{backgroundColor: Colors.tintColor, height: 40, display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: Dimensions.get("window").width/2}}>
       
            
  //             <Ionicons name="md-create"  size={26} color="white" />
           
 
  //         </TouchableOpacity>
  //       </View>

  //         <FlatList 
  //           style={{paddingTop: 6}}
  //           contentContainerStyle={{flexGrow: 1, alignSelf: 'flex-start'}}
  //           data={this.state.favoritesData}
  //           ref={(ref) => { this.flatListRef = ref; }}
  //           extraData={this.state.reRender}
  //           keyExtractor={(item) => item.id}
  //           removeClippedSubviews={false}
  //           renderItem={this.renderFavorites}
  //           numColumns={3}
  //           refreshControl={
  //             <RefreshControl
  //               refreshing={this.state.isRefresh}
  //               onRefresh={() => this.RefreshFunction()}
  //               colors={[Colors.tintColor, 'orange']}
  //               tintColor={Colors.tintColor}
  //             />
  //           }
  //         />





         
            
    

  //     </View>
  //   );
  //   }
  }
}





const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyResults:{
    fontSize: 16,
    color: 'rgb(162, 162, 162)'
  },
  pageHead:{
    fontSize: 24,
    fontWeight: "200"
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 8,
    marginRight: 8,
  },
  subTitle: {
    fontSize: 12,
    color: '#b0b0b0',
    marginTop: 4,
    marginBottom: 60,
  },
  fullName:{
    fontSize: 20,
    width: (Dimensions.get("window").width * (4/5)) - 110,
  },
  email:{
    fontSize: 14,
    color: '#aaa',
    width: (Dimensions.get("window").width * (4/5)) - 110,
  },
  otherText: {
    fontSize: 16,
    marginTop: 8,
    marginRight: 8,
  },
  Favcircle: {
    width: 60, 
    height: 60, 
    backgroundColor: 'white', 
    borderRadius: Dimensions.get("window").width/2,
    marginTop: -20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,  
    display: "flex",
    alignItems: "center",
    justifyContent: 'center',
  },
  circle: {
    width: 40, 
    height: 40, 
    backgroundColor: 'white', 
    borderRadius: Dimensions.get("window").width/2,
    marginTop: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,  
    display: "flex",
    alignItems: "center",
    justifyContent: 'center',
  }
});


export default withNavigation(FavoritesScreen);


