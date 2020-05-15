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
  Dimensions,
  Share,
  RefreshControl,
  Linking
} from 'react-native';
import { Card, Title, Paragraph, Button} from 'react-native-paper'
import Lightbox from 'react-native-lightbox'
import {LinearGradient} from 'expo-linear-gradient'
import ClickChip from '../components/ClickChip'
import RabbitPost from '../components/RabbitPost'



import Colors from '../constants/Colors'

import { Ionicons } from '@expo/vector-icons';

import { inject, observer } from 'mobx-react';



//Firebase Imports
import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import firebaseConfig from '../firebaseConfig';



import SafeAreaView from 'react-native-safe-area-view';
import { FlatList } from 'react-native-gesture-handler';





// Initlialized FB Vars
if (!firebase.apps.length) {
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const firebaseAppAuth = firebaseApp.auth();
}


@inject("UserStore", "PostStore")
@observer
export default class HomeScreen extends React.Component {


  constructor(props){
    super(props);

    this.state = {
      rabbitPosts: [],
      isRefresh: false,
      reRender: false,
      lastPostShowing: {},
    }
   
    
    


  

    this.toggleFavorite = this.toggleFavorite.bind(this)
    this.addRabbits = this.addRabbits.bind(this)
    this.updateRabbits = this.updateRabbits.bind(this)
    this.updateRabbits = this.updateRabbits.bind(this)
    this.RefreshFunction = this.RefreshFunction.bind(this)
 

  }

  componentDidMount = () => {

    const {rabbitArray} = this.props.PostStore
    const db = firebase.firestore();
    const rabbits = db.collection('rabbits');
    let preArray = [];

    rabbitArray.clear();
    

    rabbits.orderBy("dateAddedToDB", "desc").limit(10).get().then((querySnapshot) => {
      querySnapshot.docs.map((doc, i) =>{
          rabbitArray.push({id: doc.id, data: doc.data()})
      })
    })
    this.setState({rabbitPosts: rabbitArray})

    this.updateRabbits()

    
    
    // console.log(this.props.PostStore.rabbitArray[0].data.isGif)
  
   
    
  }


  addRabbits = (isFullList) => {
    const {rabbitArray} = this.props.PostStore
    const db = firebase.firestore();
    const rabbits = db.collection('rabbits');
    

    var lastPost = null;

  
      
   

      if(isFullList){
        rabbitArray.clear()
        this.setState({rabbitPosts: []})

        // console.log(`Refreshing new rabbs. Pushing number of new rabbits: ${rabList.length}`)

        rabbits.orderBy("dateAddedToDB", "desc").limit(10).get().then((querySnapshot) => {
          querySnapshot.docs.map((doc, i) =>{
              rabbitArray.push({id: doc.id, data: doc.data()})
              // preArray.push({id: doc.id, data: doc.data()})
          })
        
        }).then(() => {
         
          lastPost = rabbitArray[rabbitArray.length - 1];
          this.setState({rabbitPosts: rabbitArray, lastPostShowing: lastPost})
        })
  
    
        
      }else{

        rabbits.orderBy("dateAddedToDB", "desc").startAfter(this.state.rabbitPosts[this.state.rabbitPosts.length -1 ].data.dateAddedToDB).limit(10).get().then((querySnapshot) => {
          querySnapshot.docs.map((doc, i) =>{
              rabbitArray.push({id: doc.id, data: doc.data()})
          })
        })

   
     
        lastPost = rabbitArray[rabbitArray.length - 1];
        this.setState({rabbitPosts: rabbitArray, lastPostShowing: lastPost}) 
      }
         

   
  }




  updateRabbits = () => {
    const {rabbitArray} = this.props.PostStore
    
    const db = firebase.firestore();
    const rabbits = db.collection('rabbits');
    let preArray = [];



    
    rabbits.orderBy("dateAddedToDB", "desc").limit(3).get().then((querySnapshot) => {
      querySnapshot.docs.map((doc, i) =>{
          preArray.push({id: doc.id, data: doc.data()})
      })



    
    }).then(async () => {
          if(rabbitArray.length > 0 && preArray[0].id == rabbitArray[0].id && preArray[1].id == rabbitArray[1].id && preArray[2].id == rabbitArray[2].id){
            console.log("List is valid")
            this.flatListRef.scrollToOffset({ offset: 0, animated: true });
            
            
          }else{
            console.log("needs updated")
            this.flatListRef.scrollToOffset({ offset: 0, animated: true });
            this.addRabbits(true)
          }
  
    }).then(() => {
          return new Promise(function(resolve, reject) { 
                    setTimeout(() => {
                        resolve();
                    }, 1500)
                });
    }).then(() => this.setState({isRefresh: false}))

  }




  onShare = async (post) => {
    var uri = "";

    if(post.data.isGif){
      if(post.data.gifs.fullSize.shortUri){
        console.log('short gif')
        uri = post.data.gifs.fullSize.shortUri;
      }else{
        console.log('long gif')
        uri = post.data.gifs.fullSize.uri;
      }
    }else{
      if(post.data.images.fullSize.shortUri){
        console.log('short img')
        uri = post.data.images.fullSize.shortUri;
      }else{
        console.log('long img')
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


  onViewableItemsChanged = ({ viewableItems, changed }) => {
    const db = firebase.firestore();
    const users = db.collection('users');
 
    if(viewableItems[0] && !this.props.UserStore.viewed.includes(viewableItems[0].item.id)){
      this.props.UserStore.viewed.push(viewableItems[0].item.id)
      users.doc(this.props.UserStore.userID).update({
        viewed: this.props.UserStore.viewed
      });
      // console.log("Added to view!")
    }

    // console.log("Visible items are", viewableItems[0].item.id)
    // console.log("Changed in this iteration", changed[0]);
  }

  RefreshFunction = () => {
    this.setState({isRefresh: true})
    try{
      this.updateRabbits()
    }catch(e){
      alert(e);
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
      // var index = postsFavoritedID.indexOf(ident);
      // if(index !== -1){
      //   postsFavorited.splice(index, 1)
      //   favorites.clear();
      //   for(let i = 0; i < postsFavorited.length; i++){
      //     favorites.push(postsFavorited[i])
      //   }
      //   users.doc(this.props.UserStore.userID).update({
      //     favorites: favorites
      //   })
      // }
    }else{
      
   
      
      console.log("favorited")
      // favorites.push({time: d, id: ident, data: post.data})
      
      // users.doc(this.props.UserStore.userID).update({
      //   favorites: favorites
      // })

      

      

    }

 


    // console.log(this.props.UserStore.favorites.includes(id))

    // console.log(this.props.UserStore.favorites[0].id)
    


  }

  








  render(){

    var { rabbitArray } = this.props.PostStore;

    
    
 

    // console.log(rabbitArray.length)  // I don't know why this line is needed and it doesn't work, but if I remove it it breaks the list...
    return (
      <SafeAreaView style={{ backgroundColor: "white" }}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          refreshControl={
            <RefreshControl
            refreshing={this.state.isRefresh}
              onRefresh={() => this.RefreshFunction()}
              colors={[Colors.tintColor, 'orange']}
              tintColor={Colors.tintColor}
            />
          }
          >
            
            <LinearGradient
        colors={['#cce8ce', Colors.tintColor]}
        style={{flex: 1}}>
            <View style={{flexGrow: 1}}>
            
      
         
          <View style={{flex: 1, backgroundColor: 'white', paddingBottom: 24, borderBottomRightRadius: 12, borderBottomLeftRadius: 12}}>
         
            <Text style={styles.pageHead}>Top recent posts from r/Rabbits</Text>
        

          <FlatList 
            style={{}}
            data={this.state.rabbitPosts}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            key={(item) => item.id}
            ref={(ref) => { this.flatListRef = ref; }}
            extraData={this.state.reRender}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment={"center"}
            snapToInterval={Dimensions.get("window").width * 0.80 + 24}
            decelerationRate={"fast"}
            pagingEnabled
            removeClippedSubviews={true}
            windowSize = {7}
            onViewableItemsChanged={this.onViewableItemsChanged }
            onEndReached={() => this.addRabbits(false)}
            // onEndReached={() => console.log('ended....')}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 40
            }}
            renderItem={({item}) => <RabbitPost item={item} />}
          />
        

</View>
  

         <View style={{flex: 1, paddingHorizontal: 8}}> 
            <Text style={styles.pageSubHead}>All Cute Animal Subreddits</Text>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', paddingBottom: 32}}>
            <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white',}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/animalsbeingbros/")}
              >r/animalsbeingbros</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/aww/")}
              >r/aww</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/babyelephantgifs/")}
              >r/babyelephantgifs</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/babygoats/")}
              >r/babygoats</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/birbs/")}
              >r/birbs</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/blep/")}
              >r/blep</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/buncomfortable/")}
              >r/buncomfortable</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/BunniesStandingUp/")}
              >r/bunniesstandingup</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/cats/")}
              >r/cats</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/corgi/")}
              >r/corgi</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/cows/")}
              >r/cows</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/cute/")}
              >r/cute</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/doggos/")}
              >r/doggos</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/eyebleach/")}
              >r/eyebleach</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/floofs/")}
              >r/floofs</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/goldenretrievers/")}
              >r/goldenretrievers</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/hedgehog/")}
              >r/hedgehog</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/jackrusselterrier/")}
              >r/jackrusselterrier</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/jellybeantoes/")}
              >r/jellybeantoes</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/otters/")}
              >r/otters</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/partyparrot/")}
              >r/partyparrot</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/puppysmiles/")}
              >r/puppysmiles</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/Rabbits/")}
              >r/rabbits</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/raccoons/")}
              >r/raccoons</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/rarepuppers/")}
              >r/rarepuppers</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/redpandas/")}
              >r/redpandas</ClickChip>   
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/seut/")}
              >r/SEUT</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/sleepinganimals/")}
              >r/sleepinganimals</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/sneks/")}
              >r/sneks</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/tippytaps/")}
              >r/tippytaps</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/toofers/")}
              >r/toofers</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/tuckedinkitties/")}
              >r/tuckedinkitties</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/tuckedinpuppies/")}
              >r/tuckedinpuppies</ClickChip>
              <ClickChip 
                fontColor = {Colors.darkTint}
                style={{backgroundColor: 'white'}} 
                onPress={() => Linking.openURL("https://www.reddit.com/r/zoomies/")}
              >r/zoomies</ClickChip>
              

              
        
              
            </View>
            
          </View> 
          
            
          </View>
          </LinearGradient>
          
           
          </ScrollView>
          </SafeAreaView>
          
    );
  }
}

HomeScreen.navigationOptions = {
  header: null,
};



const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
  },
  pageHead:{
    fontSize: 24,
    marginHorizontal: 16,
    marginVertical: 16,
    fontWeight: "200"
  },
  pageSubHead:{
    fontSize: 18,
    fontWeight: "400",
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 18,
    color: '#034008'
  },
  shareContainer:{
    display: "flex",
    width: Dimensions.get("window").width * 0.80,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute', 
    zIndex: 1,
  },
  shareContainerTO:{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(66, 66, 66, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginRight: 8,
    marginTop: 8,
    borderRadius: 50,
  },
  viewed: {
    backgroundColor: 'rgba(66, 66, 66, 0.6)',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 8,
    flex: 8,
    marginRight: 8,
  },
  subTitle: {
    fontSize: 12,
    color: '#b0b0b0',
    marginTop: 2,
    marginBottom: 60,
  },
  circle: {
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
  }
});
