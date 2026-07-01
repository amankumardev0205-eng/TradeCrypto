import { useState, useRef } from 'react';
import axios from 'axios';

export default function KYCScreen({ userId }) {
  const [bank, setBank] = useState({ bankName: '', accountNumber: '', ifsc: '' });
  const [videoBlob, setVideoBlob] = useState(null);
  const mediaRecorderRef = useRef(null);

  const startRecord = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks = [];
    mediaRecorderRef.current.ondataavailable = e => chunks.push(e.data);
    mediaRecorderRef.current.onstop = () => setVideoBlob(new Blob(chunks, { type: 'video/mp4' }));
    mediaRecorderRef.current.start();
    setTimeout(() => mediaRecorderRef.current.stop(), 10000);
  };

  const submit = async () => {
    const fd = new FormData();
    fd.append('video', videoBlob);
    fd.append('userId', userId);
    fd.append('bankName', bank.bankName);
    fd.append('accountNumber', bank.accountNumber);
    fd.append('ifsc', bank.ifsc);
    await axios.post('/api/kyc/upload', fd);
    alert("KYC Submitted");
  };

  return (
    <div className="p-10 max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">KYC Verification</h2>
      <div className="bg-blue-50 p-4 rounded-xl text-blue-800 italic">
        "I confirm my identity and bank details for crypto trading on this platform."
      </div>
      <input className="w-full p-3 border rounded-xl" placeholder="Bank Name" onChange={e => setBank({...bank, bankName: e.target.value})} />
      <input className="w-full p-3 border rounded-xl" placeholder="Account Number" onChange={e => setBank({...bank, accountNumber: e.target.value})} />
      <input className="w-full p-3 border rounded-xl" placeholder="IFSC" onChange={e => setBank({...bank, ifsc: e.target.value})} />
      <button onClick={startRecord} className="w-full bg-slate-900 text-white py-3 rounded-xl">Record 10s Video</button>
      {videoBlob && <button onClick={submit} className="w-full bg-blue-600 text-white py-3 rounded-xl">Submit KYC</button>}
    </div>
  );
}