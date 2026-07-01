import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  useEffect(() => { axios.get('/api/kyc/admin/pending').then(res => setUsers(res.data)); }, []);

  const verify = (id, status) => {
    axios.post('/api/kyc/admin/verify', { userId: id, status }).then(() => window.location.reload());
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-8">Pending Verifications</h1>
      {users.map(u => (
        <div key={u._id} className="border p-6 rounded-2xl mb-4 flex gap-6 items-center">
          <video src={`http://localhost:5000/${u.kycVideoUrl}`} controls className="w-48 rounded-xl bg-black" />
          <div className="flex-1">
            <p className="font-bold">{u.firstName} {u.lastName}</p>
            <p className="text-sm text-slate-500">A/C: {u.bankDetails.accountNumber}</p>
          </div>
          <button onClick={() => verify(u._id, 'verified')} className="bg-green-600 text-white px-6 py-2 rounded-lg">Approve</button>
          <button onClick={() => verify(u._id, 'rejected')} className="bg-red-600 text-white px-6 py-2 rounded-lg">Reject</button>
        </div>
      ))}
    </div>
  );
}