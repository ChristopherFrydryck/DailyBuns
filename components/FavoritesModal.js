import React from 'react'
import {  SafeAreaView, View, ScrollView, Modal, Platform, StyleSheet, Text, Linking, TouchableOpacity, Dimensions, Share, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FavoritesModal = ({item, closeAction, title, ...props}) => {
    const style = [styles.container,  props.style || {}]
    const allProps = Object.assign({}, props,{style:style})  
    return(
    <Modal 
        animationType="slide"
        title={title}
        {...allProps}
        >
        <View style={{flex: 1}}>
          <SafeAreaView />         
                <View style={{display: 'flex', alignSelf: 'flex-end', zIndex: 99, top: 18, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: Dimensions.get('window').width}}>
                   
                    <TouchableOpacity onPress={closeAction}>
                    <Ionicons size={48} style={{color: 'white'}} name={Platform.OS = 'ios' ? 'ios-close-circle-outline' : 'md-close-circle-outline'} />
                    </TouchableOpacity>
                 </View>
           
                {props.children}

        </View>
    </Modal>
)}

const styles = StyleSheet.create({
    container: {
        fontSize: 20,
    }, 
    title: {
        fontSize: 20,
        flex: 4
    },

})

export default FavoritesModal