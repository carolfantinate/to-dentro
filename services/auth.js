import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { auth } from '../config/firebase.js';

function requireAuth() {
  if (!auth) {
    const error = new Error('Preencha o firebaseConfig em config/firebase.js antes de usar a autenticação.');
    error.code = 'auth/firebase-not-configured';
    throw error;
  }
  return auth;
}

export function createAccount(email, password) {
  return createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export function login(email, password) {
  return signInWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export function logout() {
  return signOut(requireAuth());
}

export function resetPassword(email) {
  return sendPasswordResetEmail(requireAuth(), email.trim());
}

export function observeAuth(callback, onError) {
  return onAuthStateChanged(requireAuth(), callback, onError);
}

export function getCurrentUser() {
  return requireAuth().currentUser;
}

export function authReady() {
  return requireAuth().authStateReady();
}

export function setDisplayName(displayName) {
  const user = requireAuth().currentUser;
  if (!user) throw Object.assign(new Error('Entre para atualizar seu nome.'), {code:'profile/not-authenticated'});
  return updateProfile(user, {displayName: displayName.trim()});
}
