import React from 'react'
import {View, StyleSheet, Text} from 'react-native'


const statBox = ({size, top, main, foot, color, textColor, gutter, ...props}) => {
    const style = [styles.text,  props.style || {}]
    const allProps = Object.assign({}, props,{style:style})  

    return(
        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, backgroundColor: color, marginBottom: gutter}}>
            <Text {...allProps}>{top}</Text>
            <Text {...allProps}>{main}</Text>
            <Text {...allProps}>{foot}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text:{
        fontSize: 16,
    }
})

export default statBox
