import express from 'express';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import cors from 'cors';

const app = express();

// Konfigurasi CORS jika diperlukan
app.use(cors());
app.use(bodyParser.json());

// Periksa apakah semua variabel lingkungan ada
const {
  FIREBASE_TYPE,
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  FIREBASE_CLIENT_X509_CERT_URL
} = process.env;

if (!FIREBASE_TYPE || !FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY_ID || !FIREBASE_PRIVATE_KEY || 
    !FIREBASE_CLIENT_EMAIL || !FIREBASE_CLIENT_ID || !FIREBASE_AUTH_URI || !FIREBASE_TOKEN_URI || 
    !FIREBASE_AUTH_PROVIDER_X509_CERT_URL || !FIREBASE_CLIENT_X509_CERT_URL) {
  console.error('Missing environment variables for Firebase Admin SDK');
  process.exit(1);
}

// Inisialisasi Firebase Admin SDK menggunakan environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    type: FIREBASE_TYPE,
    project_id: FIREBASE_PROJECT_ID,
    private_key_id: FIREBASE_PRIVATE_KEY_ID,
    private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: FIREBASE_CLIENT_EMAIL,
    client_id: FIREBASE_CLIENT_ID,
    auth_uri: FIREBASE_AUTH_URI,
    token_uri: FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: FIREBASE_CLIENT_X509_CERT_URL
  }),
  databaseURL: 'https://skripsi-tiket-ece21-default-rtdb.asia-southeast1.firebasedatabase.app'
});

// Rute root untuk memastikan server berjalan
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Endpoint untuk menerima notifikasi Midtrans
app.post('/notification', async (req, res) => {
  const notification = req.body;

  try {
    // Simpan data ke Firebase Realtime Database
    const db = admin.database();
    const ref = db.ref('transaksi');
    await ref.push(notification);

    // Kirim response ke Midtrans
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error saving notification to Firebase:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Atur port sesuai dengan lingkungan Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
