import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import Authentication from '../navigation/SignInUpNavigator'

export default createAppContainer(
  createSwitchNavigator({
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Authentication: Authentication,
    Main: MainTabNavigator,
    
  },{
    initialRouteName: "Authentication",
    
     
    
  })
);


