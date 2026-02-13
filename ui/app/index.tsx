import React from 'react';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import "../global.css";
import { HomeConfig } from 'resourceViews/home/HomeConfig';
import { ContainerResourceView, DataBrowser, ProfileResourceView, RawCodeResourceView, Text, RdfResourceCreator } from 'linked-data-browser';
import { NemalineCsvResourceCreator } from '../resourceCreators/NemalineCsvResourceCreator';


export function Screen() {

  return (
    <SafeAreaProvider>
      <StatusBar />
      <DataBrowser
        resourceViews={[HomeConfig, ProfileResourceView, ContainerResourceView, RawCodeResourceView]}
        resourceCreators={[RdfResourceCreator, NemalineCsvResourceCreator]}
        mode={'server-ui'}
        renderLogo={() => <Text>Logo</Text>}
      />
    </SafeAreaProvider>
  );
}
