import { StatusBar } from 'expo-status-bar';
import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, 
         Text, 
         View, 
         TextInput, 
         Button, 
         Image,
         ImageBackground, 
         KeyboardAvoidingView,
         ScrollView, 
         Platform } from 'react-native';
import { auth, storage, database, firebase } from '../config/firebase'
import * as ImagePicker from "expo-image-picker";
import { TouchableOpacity } from 'react-native-gesture-handler';

const SignUpScreen = ({navigation}) => {
  const [storagePermission, setStoragePermission] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);

  const [value, setValue] = useState({
    id: '',
    email: '',
    password: '',
    firstname: '',
    file: null,
    error: ''
  })

  //sets the style of the header to a custom styling
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "SignUp",
      headerStyle: { backgroundColor: 'lightblue'},
      headerShadowVisible:false,
    })
  })

  // This function is triggered when the "Open camera" button pressed
  const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setCameraPermission(status === "granted")
    
    //alerts the user if permissions have not been granted
    if (cameraPermission === false) {
      alert("Sorry camera access has not been granted by the phone. This can be changed in the app settings menu of your phone");
      return;
    }

    //Launches the camera if permissions has been given
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowEditing: true,
      aspect: [4,3],
      quality:0.5
    });

    if (!result.canceled) {
      await setValue({...value, file:result.assets[0].uri})
    }
  }

  //this function is triggered when the user clicks on the profile imagebutton
  const pickImage = async () => {
    //ask for permission to access file storage
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setStoragePermission(status === "granted")
    //alerts the user if permissions have not been granted
    if(storagePermission === false)
    {
      alert("Sorry image storage access has not been granted by the phone. This can be changed in the app settings menu of your phone");
      return;
    }
    //launches file explorer if permissions have been given
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4,3],
      quality: 0.5,
    });

    if(!result.canceled){
       setValue({...value, file:result.assets[0].uri})
    }
  }

  //this function is triggered when the signup button is pressed but only after the correct
  //information has been added
  const storeImage = async () => {
    let temp = null;
    if(value.file == null) return null;

    const img = await fetch(value.file) 
    let blob = await img.blob()
    
    const metadata = {
      contentType: 'image/jpeg'
    };
    
    //creates a query refrence for storing the file to the media storage
    const storageRef = storage.ref(`profile/${auth.currentUser.uid}`)
    var uploadTask = storageRef.child('image').put(blob, metadata);

    //begins the upload task and waits till it is compleate before moving on
    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
      }
    }, 
    (error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break;
        case 'storage/canceled':
          // User canceled the upload
          break;

        // ...

        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          break;
      }
    }, 
    () => {
      // Upload completed successfully, now we can get the download URL
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log('File available at', downloadURL);
        temp = downloadURL;
        value.file = temp;
        createUserRef();
      });
    }
    )
  }
 
  //creates a user refrence for building a complete list of users
  const createUserRef = async () =>{
    try{
      const userRef = await database.collection('users').doc(value.id).set(value)
    }
    catch(err){console.log("somthing went wrong storing the user: ",err)}
  }

  //triggers when the signup button is pressed creates a user in the firebase auth file,
  //stores the image and logs the user in
  async function signUp() {
    if (value.email === '' || value.password === '' || value.firstname === '') {
      setValue({
        ...value,
        error: 'Email and password and name are mandatory.'
      })
      return;
    }
    try{
      await auth.createUserWithEmailAndPassword(value.email, value.password)
      .then(() =>{
        value.id=(auth?.currentUser?.uid)
        storeImage()
      })
      .then(async ()=>{
        await auth.currentUser.updateProfile({
          displayName: value.firstname,
          photoURL: value.file || 'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Image-HD.png'
        })
        navigation.navigate('Login');
      })
      .catch((error) => {
        setValue({
          ...value,
          error: error.message,
        })
      })
    }
    catch (err) {console.log(err)}
  }

  return (
    <KeyboardAvoidingView  
                          behavior={Platform.OS === 'android' ? 'padding' : 'height'}
                          keyboardVerticalOffset={-500} 
                          style={styles.container}>
    <StatusBar style="dark" />
    <ImageBackground source={require('../assets/signup.jpg')} resizeMode="cover" style={styles.image}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Welcome to the SignUp page!</Text> 
          <Text style={styles.greetingText}>Please Create A User Account</Text>
          <Text style={styles.profileImageText}>Click image to change profile pic</Text>
        </View>
        <View style={styles.profileImageSelectorContainer}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageButton}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.5} >
                <View >
                  <Image style={styles.profileImage} source={{uri: value.file || 'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Image-HD.png'}}/>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.cameraContainer}>
              <TouchableOpacity onPress={openCamera} activeOpacity={0.5}>
                <View style={styles.cameraImageContainer}>
                  <Image style={styles.cameraImage} source={require("../assets/camera.png")}/>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {!!value.error && <View style={styles.error}><Text>{value.error}</Text></View>}

        <View style={styles.controls}>
          <View style={styles.textFields}>
            <TextInput placeholder='First Name'
                       containerStyle={styles.control}
                       value={value.firstname}
                       onChangeText={(text) => setValue({ ...value, firstname: text })}
            />
          </View>
          <View style={styles.textFields}>
            <TextInput placeholder='Email'
                       containerStyle={styles.control}
                       value={value.email}
                       onChangeText={(text) => setValue({ ...value, email: text })}
            />
          </View>
          <View style={styles.textFields}>
            <TextInput placeholder='Password'
                       containerStyle={styles.control}
                       value={value.password}
                       onChangeText={(text) => setValue({ ...value, password: text })}
                       secureTextEntry={true}
            />
          </View>
          <View style={styles.signUpButtonContainer}>
            <Button raised
                    title={"SignUp"}
                    color={"#2C69D1"} 
                    onPress={signUp}
                    style={styles.control} 
            />
          </View>
        </View>
      </ScrollView>
      <View style={{alignItems:'flex-end'}}>
      </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flex: 1,
    alignItems:'center'
  },
  control: {
    flex:1,
    marginTop: 10
  },
  signUpButtonContainer:{
    width:125, 
    margin:'5%'
  },
  greetingContainer:{
    alignItems:'center',
    margin:'2.5%'
  },
  greetingText:{
    fontSize:20,
    fontWeight:'600',
    color:'black',
    textShadowColor:'#FEC868',
    textShadowOffset:{width:1,height:1},
    textShadowRadius:20
  },
  profileImageText:{
    fontSize:13,
    fontWeight:'600',
    color:'#FFFBAC',
    textShadowColor:'black',
    textShadowOffset:{width:0,height:0},
    textShadowRadius:20
  },
  profileImageSelectorContainer:{
    alignItems:'center'
  },
  profileImageContainer:{
    flex:1,
    width:250,
    height:250,
    justifyContent:'center',
    borderWidth:3,
    borderRadius:125,
    margin:'2.5%'
  },
  profileImageButton:{
    alignItems: 'center',
    justifyContent:'center'
  },
  profileImage:{
    width: 250, 
    height: 250, 
    borderWidth:3,
    borderRadius:125
  },
  cameraContainer:{
    position:'absolute',
    right:30,
    bottom:0
  },
  cameraImageContainer:{
    width:45,
    height:45,
    borderRadius:25 ,
    backgroundColor:'lightgray',
    alignItems:'center',
    justifyContent:'center'
  },
  cameraImage:{
    width: 40, 
    height: 40
  },
  textFields:{
    height:50,
    width:200,
    margin:'1%',
    borderWidth:1,
    backgroundColor:'lightgray',
    borderRadius:10,
    justifyContent:'center',
    paddingLeft:6,
    paddingRight:6,
    flexDirection:'row'
  },
  image: {
    flex: 1,
    justifyContent: "center",
    width: '100%',
    height: '100%',
  },
  scrollContainer:{
    flex:1,
    width:'100%', 
    height:'100%',
    marginTop:"10%"
  },
  error: {
    marginTop: 10,
    padding: 10,
    color: '#fff',
    backgroundColor: '#D54826FF',
  }
});

export default SignUpScreen