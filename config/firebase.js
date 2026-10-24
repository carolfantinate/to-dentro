import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

// Cole aqui SOMENTE o objeto firebaseConfig fornecido pelo console do Firebase.
// Não cole as tags <script>, os imports ou a chamada initializeApp do console.
// Esta é a configuração pública do app Web; não use chaves de conta de serviço.
const firebaseConfig = {
  apiKey: "AIzaSyAbkfhnu27Njx0pWWXIkjW8yvSNoPLq9p0",
  authDomain: "to-dentro-webapp.firebaseapp.com",
  projectId: "to-dentro-webapp",
  storageBucket: "to-dentro-webapp.firebasestorage.app",
  messagingSenderId: "1021562554352",
  appId: "1:1021562554352:web:72f5739bfd7a640da43f35"
};

export const isFirebaseConfigured = ['apiKey', 'authDomain', 'projectId', 'appId']
  .every(key => Boolean(firebaseConfig[key]?.trim()));

// Aguarda o preenchimento da configuração antes de inicializar.
export const app = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
