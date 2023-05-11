import { StatusBar } from 'expo-status-bar';
import React,{ useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Button, Image } from 'react-native';
import ChatList from '../components/ChatList'
import { auth, database } from '../config/firebase'


const HomeScreen = ({navigation}) => {
  
  const [chats, setChats] = useState([])
  const [privateChatsId, setPrivateChatsId] = useState([])


  //updates the chat list with all changes
  useEffect(() =>{
    //querys the firebase database for all documents related to chats
    const collectionRef = database.collection('chats');
    const query = collectionRef.orderBy('timestamp', 'desc');
    //listens for changes in documents while home page is open
    const unsubscribe = query.onSnapshot(querySnapshot => {
      //sets the refrence to chat documents that reloads elements upon change
      setChats(querySnapshot.docs);
      //sets the refrence to private chat documents that reloads elements upon change
      getListOfPrivateChats();
      //corrects image file address stored in firebase to user profile 
      updateUserProfile();
    });
    return () => unsubscribe();
  }, []);

  //querys the firebase database for all documents related to privateChats
  const getListOfPrivateChats= async () => {
    let temp1 = []
    const collectionRef1 = await database.collection('users').doc(auth?.currentUser?.uid).collection('privateChats')
    const query1 = await collectionRef1.get().then(snapshot=>{
      snapshot.forEach(doc=>{temp1.push(doc.data().chatId)})
    })
    setPrivateChatsId(temp1)
  }

  //sets the header of the page to the users profile image, name, and signout button
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chats",
      headerStyle: { backgroundColor: 'lightblue'},
      headerLeft: () => (
        <View style={styles.leftHeader}>
          <View style= {styles.profileImageContainer}>
            <TouchableOpacity onPress={()=>{navigation.navigate('Profile')}}>
              <Image style={styles.profileImage} source={{uri: auth?.currentUser?.photoURL}}/>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={styles.signoutButton} onPress={() => auth.signOut()}>
              <Text>Sign Out!</Text>            
            </TouchableOpacity>
          </View>
        </View>
      ),
      headerRight: () => (
        <View style={styles.rightHeader}>
          <View style={styles.newChatButtonContainer}>
            <Button title="New💬" style={styles.button} onPress={() => navigation.navigate('NewChatGroup')} />
          </View>
          <View>
            <Text>Welcome {auth?.currentUser?.displayName}!</Text>
          </View>
        </View>
      )
    })
  })

  //checks if the address of the image file was refrenced correctly and fixes it if not
  const updateUserProfile= async ()=>{
    try{
      const userRef = database.collection('users')
      const query = userRef.where('id','==',auth?.currentUser?.uid)
      await query.get().then(querySnapshot => {
        querySnapshot.forEach((doc)=>{
          if(auth.currentUser.photoURL != doc.data().file){
            //console.log("updating the users profile data")
            auth.currentUser.updateProfile({
              diplayName: doc.data().firstname,
              photoURL: doc.data().file 
            })
          }
        })
      })
    }
    catch(err){console.log(err)}
  }

  //this function is triggered when a user clicks on a chat room
  const enterChat = (id, chatName, displayImage) => {
    navigation.navigate("SelectedChatGroup", {id, chatName, displayImage})
  }

  //using a turnary switch creates buttons for private and public chat rooms 
  //by calling the custom chatlist component
    return (
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" />
          <ScrollView>
            {
                chats.map((doc) => (privateChatsId.includes(doc.id,0)?(
                    <ChatList
                    key= {doc.id}
                    id = {doc.id}
                    chat = {doc.data()}
                    user = {auth?.currentUser}
                    enterChat = {enterChat}
                    />) : doc.data().chatType === 'GroupChat'? (
                      <ChatList
                      key= {doc.id}
                      id = {doc.id}
                      chat = {doc.data()}
                      user = {auth?.currentUser?.displayName}
                      enterChat = {enterChat}
                      />
                    ):(
                      <View key={doc.id}></View>
                    )
                ))
            }
 
          </ScrollView>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      marginTop: 10
    },
    newChatButtonContainer:{
      marginRight:20
    },
    profileImageContainer:{
      paddingRight:5
    },
    profileImage:{
      width: 50, 
      height: 50, 
      borderRadius: 40
    },
    signoutButton:{
      backgroundColor:'grey', 
      borderRadius: 10, 
      padding:2
    },
    leftHeader:{
      flexDirection:'row', 
      alignItems:"center", 
      margin:2
    },
    rightHeader: {
      flexDirection:'row', 
      alignItems:"center", 
      margin:2
    }
  });
export default HomeScreen