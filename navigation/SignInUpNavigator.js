import { createMaterialTopTabNavigator } from 'react-navigation-tabs';

import { Platform } from 'react-native'

import Colors from '../constants/Colors'

import SignIn from '../screens/Authentication/SignIn'
import SignUp from '../screens/Authentication/SignUp'

const AuthToggleNavigator = createMaterialTopTabNavigator({
    SignIn: {
        screen: SignIn,
        navigationOptions:{
            tabBarLabel: 'Sign In'
        }
    },
    SignUp: {
        screen: SignUp,
        navigationOptions: {
            tabBarLabel: "Sign Up"
        }
    }
},
{
    initialRouteName: "SignIn",
    navigationOptions: {
        headerForceInset: {top: 'never'}
    },
    tabBarOptions: {
        labelStyle: {
          fontSize: 14,
          color: 'white',
          marginTop: Platform.OS === 'ios' ? 50 : 0,
        },
        indicatorStyle: {
            backgroundColor: '#2c6b32',
            height: 3,
            borderRadius: 50
        },
        tabStyle: {
         
        },
        style: {
          backgroundColor: Colors.tintColor,
          borderTop: 'transparent',
        }
      },
}
)

export default AuthToggleNavigator;