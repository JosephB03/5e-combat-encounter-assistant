import { initializeApp } from 'firebase/app';
import { getDownloadURL, getStorage } from 'firebase/storage'; 

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDf7zmMzyAB-suvlQvh_LVZAVRzfScW7FA",

    authDomain: "encounter-assistant-46d1e.firebaseapp.com",
  
    projectId: "encounter-assistant-46d1e",
  
    storageBucket: "encounter-assistant-46d1e.appspot.com",
  
    messagingSenderId: "499994889989",
  
    appId: "1:499994889989:web:8ebc8570b711832e36b16c",
  
    measurementId: "G-4NC38YBRX6"
  
};

const app = initializeApp(firebaseConfig); // Initialize the Firebase app
const storage = getStorage(app); // Get the storage instance

export { storage, app as default };