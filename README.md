# React Native Chat application

The project is a social messaging app that where users can create group messaging rooms, or select another user from a list to start a private chat.

# How the app works with EXPO Snacks
**NOTE: **
The Web emulator throws an error and will not run this application!!!

in order to run this application you need to run:
        Android emulator
        Apple emulator
        Connect your personal android/apple phone using EXPO Go Application  

# Testing accounts
    login: test@test.com password: bobbob
    login: test1@test.com password: bobbob
    login: test2@test.com password: bobbob
    login: test3@test.com password: bobbob

**Note ** feel free to create a new account 

# The flow of the app is as follows:
  
  To access the application the user must login to the app. If a user does not already have an account they must first sign up
 
    #  signup:
        the user must enter a name, email, and password of atleast 6 charaicters or an error is thrown
        the user has the option of choosing an image from their picture library or taking a new photo that will become their avatar for the application
              The application will ask for permission before allowing access to the media storage and camera and if access is denied the user will need to
              change permission in their phone settings
        if the user does not select a photo a placeholder ninja will be used
        once signup button is clicked the user will be created, image stored, and the user will be given access to the application
    
    # Login:
        if the user has already created an account the user only has to enter their email and password to login. If the user did not previously log out the app
        remembers this and as soon as the application is started the user will be given access to the application. (This is true when run on EXPO Go and a local machine not on the web hosted emulator)
    
    # logged in user:        
        the user will be shown a list of all created public group chats on the homescreen and, any private chats that have been created with that user. At the top of the screen they will be shown their
        avaitar image which is a clickable button, a signout button the title of the page they are on, a creatnew chat button and a welcome message.
        
        All chats in the list show
              
              A chat Name: 
                    in regards to private chats, that will be the name of the other user the chat is with. This is true for both users 
              
              A chat image: 
                    in regards to public chats this can be selected and changed or will be a random avaitar
                    in regards to private chats this will be the avaitar of the other user the chat is with. This is true for both users
              
              The last message sent, and who sent it 
        
    # Entering a Chat:
        if the user clicks on any of the chats in the list they will be taken into the chat room were all messages will be shown. The Current users messages are shown on the right and all other user
        messages are shown on the left.
              when the user clicks in the message box a keyboard is opened and they can begin typing a new message the user sends the message by pressing the send button that looks like a paper airplane

    # clicking the User Avaitar:
        If the user clicks their avaitar at the top of the chats screen they will be taken to a user profile settings page where they can update their user image, name, email, and password.

    # Clicking the Create New Chat button:
        if the user clicks the create new chat button they will be taken to a page where
              They can create a new group chat
              search all available user
              create a new private chat with a selected user

      Create Group Chat
        the user can enter the name of a new group chat and pick its image. Finally when they click the create button they will be
        redirected to the main page where the chat is now created.

      Create Private Chat/Search
        To create a private chat the user will select the name of the user they would like to chat with by clicking on it. once this happens they will be redirected back to the main chats screen where
        the new chat will now exsist. 
        if the user can not find the person in the list of user there is a search function where all users that match the entered values will be found and displayed.
    
    # Clicking the SignOut button:
        If the user clicks this button they will be signed out of the application and will need to re login to access their information