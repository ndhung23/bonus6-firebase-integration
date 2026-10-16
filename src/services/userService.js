import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  verifyBeforeUpdateEmail,
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from './firebaseConfig';

export const formatFirebaseError = (error) => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Địa chỉ email không hợp lệ.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị vô hiệu hóa.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không chính xác.';
    case 'auth/wrong-password':
      return 'Mật khẩu hiện tại không chính xác.';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng bởi tài khoản khác.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu (cần tối thiểu 6 ký tự).';
    case 'auth/requires-recent-login':
      return 'Vui lòng nhập mật khẩu hiện tại để xác thực lại trước khi đổi Email hoặc Mật khẩu.';
    case 'auth/operation-not-allowed':
      return 'Phương thức Email/Password chưa được bật trong Firebase Console -> Authentication -> Sign-in method.';
    default:
      return error?.message || 'Đã xảy ra lỗi khi xử lý với Firebase.';
  }
};

export const subscribeToUserSession = (onUserChanged) => {
  let firestoreUnsubscribe = null;

  const authUnsubscribe = onAuthStateChanged(
    firebaseAuth,
    async (firebaseUser) => {
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }

      if (!firebaseUser) {
        onUserChanged(null);
        return;
      }

      const userDocRef = doc(firebaseDb, 'users', firebaseUser.uid);

      // Lắng nghe dữ liệu người dùng realtime từ Firestore
      firestoreUnsubscribe = onSnapshot(
        userDocRef,
        async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            onUserChanged({
              uid: firebaseUser.uid,
              email: data.email || firebaseUser.email || '',
              fullName: data.fullName || firebaseUser.displayName || '',
              phone: data.phone || '',
              address: data.address || '',
              fcmToken: data.fcmToken || '',
              expoPushToken: data.expoPushToken || '',
              updatedAt: data.updatedAt || '',
            });
          } else {
            const now = new Date().toISOString();
            const initialDoc = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || '',
              phone: '',
              address: '',
              fcmToken: '',
              expoPushToken: '',
              createdAt: now,
              updatedAt: now,
            };
            try {
              await setDoc(userDocRef, initialDoc, { merge: true });
            } catch (err) {
              console.warn('Error creating initial user document:', err?.message);
            }
            onUserChanged(initialDoc);
          }
        },
        (err) => {
          console.warn('Firestore snapshot error:', err?.message);
          onUserChanged({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || '',
            phone: '',
            address: '',
            fcmToken: '',
            expoPushToken: '',
            updatedAt: '',
          });
        }
      );
    }
  );

  return () => {
    if (firestoreUnsubscribe) firestoreUnsubscribe();
    authUnsubscribe();
  };
};

export const registerUserWithFirebase = async ({
  email,
  password,
  fullName,
  phone,
  address,
}) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(fullName || '').trim();
  const cleanPhone = String(phone || '').trim();
  const cleanAddress = String(address || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Vui lòng nhập địa chỉ email hợp lệ.');
  }
  if (!password || password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
  }

  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    cleanEmail,
    password
  );
  const user = credential.user;

  if (cleanName) {
    await updateProfile(user, { displayName: cleanName });
  }

  const now = new Date().toISOString();
  const userProfile = {
    uid: user.uid,
    email: cleanEmail,
    fullName: cleanName,
    phone: cleanPhone,
    address: cleanAddress,
    fcmToken: '',
    expoPushToken: '',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(firebaseDb, 'users', user.uid), userProfile, { merge: true });
  return userProfile;
};

export const loginUserWithFirebase = async ({ email, password }) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !password) {
    throw new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
  }

  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    cleanEmail,
    password
  );
  const user = credential.user;
  const userDocRef = doc(firebaseDb, 'users', user.uid);
  const snapshot = await getDoc(userDocRef);

  if (!snapshot.exists()) {
    const now = new Date().toISOString();
    const profile = {
      uid: user.uid,
      email: user.email || cleanEmail,
      fullName: user.displayName || '',
      phone: '',
      address: '',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(userDocRef, profile, { merge: true });
    return profile;
  }

  return { uid: user.uid, ...snapshot.data() };
};

export const logoutUserFromFirebase = async () => {
  await signOut(firebaseAuth);
};

export const updateUserProfileWithFirebase = async ({
  email,
  phone,
  address,
  fullName,
  currentPassword,
  newPassword,
}) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').trim();
  const cleanAddress = String(address || '').trim();
  const cleanName = String(fullName || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Email không hợp lệ.');
  }

  if (cleanPhone && !/^[0-9+\-\s()]{8,15}$/.test(cleanPhone)) {
    throw new Error('Số điện thoại không hợp lệ (cần từ 8-15 chữ số).');
  }

  if (newPassword && newPassword.length < 6) {
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
  }

  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  const statusMessages = [];
  const isEmailChanged =
    currentUser.email && currentUser.email.toLowerCase() !== cleanEmail;
  const isPasswordChanged = Boolean(
    newPassword && newPassword.trim().length > 0
  );

  // Xác thực lại nếu người dùng thay đổi Email hoặc Mật khẩu
  if ((isEmailChanged || isPasswordChanged) && currentPassword) {
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(currentUser, credential);
  }

  if (isEmailChanged) {
    try {
      await updateEmail(currentUser, cleanEmail);
      statusMessages.push('Đã cập nhật Email trên Firebase Auth.');
    } catch (emailErr) {
      if (emailErr?.code === 'auth/operation-not-allowed') {
        await verifyBeforeUpdateEmail(currentUser, cleanEmail);
        statusMessages.push(
          'Đã gửi email xác nhận đổi địa chỉ email mới qua Firebase Auth và cập nhật Firestore.'
        );
      } else {
        throw emailErr;
      }
    }
  }

  if (isPasswordChanged) {
    await updatePassword(currentUser, newPassword);
    statusMessages.push('Đã cập nhật mật khẩu mới trên Firebase Auth.');
  }

  if (cleanName !== (currentUser.displayName || '')) {
    await updateProfile(currentUser, { displayName: cleanName });
  }

  const now = new Date().toISOString();
  const updatedFields = {
    email: cleanEmail,
    phone: cleanPhone,
    address: cleanAddress,
    fullName: cleanName,
    updatedAt: now,
  };

  const userDocRef = doc(firebaseDb, 'users', currentUser.uid);
  await setDoc(userDocRef, updatedFields, { merge: true });
  statusMessages.push(
    'Đã lưu thông tin người dùng (Email, SĐT, Địa chỉ) lên Cloud Firestore.'
  );

  return {
    updatedFields,
    message: statusMessages.join('\n'),
  };
};

export const syncDeviceTokensToFirebase = async (
  uid,
  { fcmToken, expoPushToken, platform }
) => {
  if (!uid) return;
  const now = new Date().toISOString();
  const userDocRef = doc(firebaseDb, 'users', uid);

  try {
    await updateDoc(userDocRef, {
      fcmToken: fcmToken || '',
      expoPushToken: expoPushToken || '',
      devicePlatform: platform || '',
      tokenUpdatedAt: now,
    });
  } catch (_) {
    try {
      await setDoc(
        userDocRef,
        {
          fcmToken: fcmToken || '',
          expoPushToken: expoPushToken || '',
          devicePlatform: platform || '',
          tokenUpdatedAt: now,
        },
        { merge: true }
      );
    } catch (_) {}
  }
};
