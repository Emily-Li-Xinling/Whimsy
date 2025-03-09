import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// 登录函数
export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: userCredential.user,
      error: null
    };
  } catch (error: any) {
    return {
      user: null,
      error: error.message
    };
  }
};

// 注册函数
export const register = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      user: userCredential.user,
      error: null
    };
  } catch (error: any) {
    return {
      user: null,
      error: error.message
    };
  }
};

// 登出函数
export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 监听用户状态变化
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Google 登录
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return {
      user: result.user,
      error: null
    };
  } catch (error: any) {
    return {
      user: null,
      error: error.message
    };
  }
}; 