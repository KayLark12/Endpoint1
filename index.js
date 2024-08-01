import express from 'express';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import cors from 'cors';

const app = express();

// Konfigurasi CORS jika diperlukan
app.use(cors());
app.use(bodyParser.json());

// Inisialisasi Firebase Admin SDK menggunakan environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    "type": process.env.FIREBASE_TYPE,
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
  }),
  databaseURL: 'https://skripsi-tiket-ece21-default-rtdb.asia-southeast1.firebasedatabase.app'
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
